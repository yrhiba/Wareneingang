-- C04 schema. Source of truth: run in Supabase SQL editor, keep this file in git.
-- Rule: received / damaged / accepted stay separate at every layer.
-- Rule: no stock or accounting write without review.

drop table if exists review_decisions cascade;
drop table if exists credit_notes cascade;
drop table if exists proposals cascade;
drop table if exists invoice_lines cascade;
drop table if exists invoices cascade;
drop table if exists receipts cascade;
drop table if exists delivery_notes cascade;
drop table if exists orders cascade;

create table orders (
  id          text primary key,
  part        text not null,
  quantity    integer not null check (quantity >= 0),
  created_at  timestamptz not null default now()
);

-- Two notes against one order = one order delivered in parts, not two deliveries.
create table delivery_notes (
  id              text primary key,
  order_id        text not null references orders(id),
  part            text not null,
  listed_quantity integer not null check (listed_quantity >= 0),
  -- set when a scan is judged a duplicate of another note; never silent, always reviewable
  duplicate_of    text references delivery_notes(id),
  created_at      timestamptz not null default now()
);

create table receipts (
  id              text primary key,
  delivery_note   text not null references delivery_notes(id),
  received        integer not null check (received  >= 0),
  damaged         integer not null check (damaged   >= 0),
  accepted        integer not null check (accepted  >= 0),
  -- the three quantities must reconcile; never collapse into one net number
  constraint receipts_quantities_balance check (accepted = received - damaged),
  -- one receipt per note: a second physical delivery brings its own note, so a
  -- second receipt against the same one is a double submit
  constraint receipts_one_per_note unique (delivery_note),
  created_at      timestamptz not null default now()
);

create table invoices (
  id          text primary key,
  part        text not null,
  quantity    integer not null check (quantity >= 0),
  created_at  timestamptz not null default now()
);

-- An invoice may bill against several delivery notes (INV-1 covers DN-1 and DN-2).
create table invoice_lines (
  invoice_id    text not null references invoices(id),
  delivery_note text not null references delivery_notes(id),
  primary key (invoice_id, delivery_note)
);

-- A supplier correction arrives as its OWN record, never as an edit to INV-1.
-- The supplied records stay verbatim; the credit is a separate, labelled row.
create table credit_notes (
  id            text primary key,
  invoice_id    text not null references invoices(id),
  quantity      integer not null check (quantity >= 0),
  reason        text not null,
  -- true when injected by the demo's "simulate incoming event" button
  is_simulated  boolean not null default true,
  created_at    timestamptz not null default now()
);

-- The review loop: trigger -> evidence-backed proposal -> person approves/corrects -> state.
create table proposals (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null,        -- e.g. flag_damage, merge_scan, query_supplier
  summary       text not null,
  -- candidate causes: shortage | damage | duplicate_scan | second_delivery | unknown
  cause         text not null default 'unknown',
  confidence    text not null default 'uncertain',
  -- record ids backing the claim, so a reader can trace evidence -> conclusion
  evidence      jsonb not null default '[]'::jsonb,
  proposed_state jsonb,
  status        text not null default 'pending'
                check (status in ('pending','approved','corrected','rejected')),
  is_simulated  boolean not null default true,
  created_at    timestamptz not null default now()
);

-- The reviewed outcome becomes the state. Nothing external is executed.
create table review_decisions (
  id           uuid primary key default gen_random_uuid(),
  proposal_id  uuid not null references proposals(id) on delete cascade,
  decision     text not null check (decision in ('approved','corrected','rejected')),
  reviewer     text not null,
  note         text,
  final_state  jsonb,
  decided_at   timestamptz not null default now()
);

-- Demo-open RLS. Not production posture; documented as a limitation in the README.
alter table orders            enable row level security;
alter table delivery_notes    enable row level security;
alter table receipts          enable row level security;
alter table invoices          enable row level security;
alter table invoice_lines     enable row level security;
alter table proposals         enable row level security;
alter table credit_notes      enable row level security;
alter table review_decisions  enable row level security;

create policy "demo read orders"         on orders           for select using (true);
create policy "demo read delivery_notes" on delivery_notes   for select using (true);
create policy "demo read receipts"       on receipts         for select using (true);
create policy "demo read invoices"       on invoices         for select using (true);
create policy "demo read invoice_lines"  on invoice_lines    for select using (true);
create policy "demo read proposals"      on proposals        for select using (true);
create policy "demo read credit_notes"   on credit_notes     for select using (true);
create policy "demo read decisions"      on review_decisions for select using (true);
