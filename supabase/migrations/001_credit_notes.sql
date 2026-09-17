-- Additive migration: adds credit_notes to an existing C04 database.
-- Safe to run on a database that already holds the seeded records - it drops
-- nothing. A fresh project should run ../schema.sql instead, which already
-- includes this table.

create table if not exists credit_notes (
  id            text primary key,
  invoice_id    text not null references invoices(id),
  quantity      integer not null check (quantity >= 0),
  reason        text not null,
  -- true when injected by the demo's "simulate incoming event" button
  is_simulated  boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table credit_notes enable row level security;

drop policy if exists "demo read credit_notes" on credit_notes;
create policy "demo read credit_notes" on credit_notes for select using (true);
