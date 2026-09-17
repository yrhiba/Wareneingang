import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presenter briefing — C04",
  description: "How to run the prototype, what it does today, and what is still a hypothesis.",
};

/**
 * Static briefing page. Deliberately does NOT touch the database: if Supabase is
 * down mid-presentation this page still opens and still explains the demo.
 * Keep it honest - every "not built" below is a claim the demo cannot back.
 */
export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Presenter briefing — C04
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          How to run it, the demo script, and an honest account of what is real.
          Five minutes to read.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm underline underline-offset-4 hover:no-underline"
        >
          ← Back to the prototype
        </Link>
      </header>

      <Section n="1" title="Say this first">
        <blockquote className="border-l-2 border-amber-600 pl-4 text-base">
          Ten filters were ordered, ten arrived, ten were invoiced — but only{" "}
          <strong>nine</strong> went into stock. Today nobody can tell whether the
          missing one was a shortage, a damaged item, a duplicate scan or a second
          delivery, so the invoice gets paid or argued about on a hunch. We changed
          what the receiving lead records at the bay, so the difference resolves to
          a cause with evidence behind it.
        </blockquote>
      </Section>

      <Section n="2" title="The demo — six beats, about two minutes">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Reset — start of shift.</strong> Two delivery notes are at the
            bay. Nothing counted in, no invoice. Screen 3 shows{" "}
            <em>nothing to review</em> — that is the empty state, and it is honest.
          </li>
          <li>
            <strong>Count in DN-1.</strong> Counted in 8, damaged 1. Accepted shows{" "}
            <Mono>7</Mono> and cannot be typed over — it is derived, and the
            database refuses a receipt where the three do not balance.{" "}
            <em>This is the answer to the challenge question.</em>
          </li>
          <li>
            <strong>Count in DN-2.</strong> 2 and 0. You land on the evidence screen
            automatically: 10 ordered, 10 listed, 10 counted, 9 accepted. Nothing is
            wrong yet — the goods reconcile against the notes.
          </li>
          <li>
            <strong>Press “Supplier invoice arrives”</strong> (purple — a
            simulation). The invoice bills 10. The difference appears, a proposal is
            raised, and you are taken to review. One click, no second prompt.
          </li>
          <li>
            <strong>Read the proposal aloud.</strong> Leading cause{" "}
            <em>Damage</em>, marked <em>likely</em>, with Shortage, Duplicate scan
            and Second delivery still listed as open. Evidence:{" "}
            <Mono>INV-1 · DN-1 · DN-2 · RC-1</Mono>. Proposed action: request a
            credit note. Then say the important line: <em>it proposes, it does not
            decide.</em>
          </li>
          <li>
            <strong>Approve it</strong> — or press <em>Correct it</em>, pick a
            different cause and type a reason. Either way the decision, the reviewer
            and the final cause are recorded, and the history shows which. Then
            press “Supplier issues a credit note” to watch the gap close to
            reconciled.
          </li>
        </ol>
        <Callout label="If you only have 30 seconds">
          Reset — invoice arrived. That drops you straight into the proposal on
          screen 3. Read it, approve it, done.
        </Callout>
      </Section>

      <Section n="3" title="Run it">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <Mono>cd web &amp;&amp; npm install</Mono> — once, if{" "}
            <Mono>node_modules</Mono> is missing.
          </li>
          <li>
            <Mono>web/.env.local</Mono> must hold the Supabase URL, publishable key
            and secret key. It is gitignored, so after a fresh clone — and only then
            — copy <Mono>web/.env.example</Mono> over and fill it in.{" "}
            <strong>If the file already exists, leave it alone:</strong> copying the
            example over a filled-in file replaces the keys with placeholders and
            every screen 500s.
          </li>
          <li>
            <Mono>npm run dev</Mono> → <Mono>http://localhost:3000</Mono>.
          </li>
        </ol>
        <Callout label="Reset to a known start state">
          Use the two reset buttons at the bottom of any screen — they rebuild the
          database from the supplied records in one click. Pasting{" "}
          <Mono>supabase/seed.sql</Mono> into the Supabase SQL editor does the same
          thing. Run <Mono>npm run check:seed</Mono> to prove the app still reseeds
          the supplied values unaltered.
        </Callout>
      </Section>

      <Section n="4" title="Who is in the story">
        <dl className="space-y-4">
          <Role
            who="Receiving lead (screen 1)"
            does="Unloads the delivery and records the goods receipt: counted in, damaged, accepted. Two numbers typed, the third derived."
            why="The person the challenge question is about. Everything downstream depends on the thirty seconds they have at the bay."
          />
          <Role
            who="Reconciler / reviewer (screen 3)"
            does="Gets the invoice weeks later, reads the proposal and its evidence, and approves, corrects or rejects it."
            why="The victim of the current process, and the only actor who can settle a difference. Their answer becomes the record — not the system's."
          />
        </dl>
        <Callout label="There is no login">
          No accounts, no authentication. The reviewer is a name typed into a field.
          Say this rather than let the demo imply an identity model it does not have.
        </Callout>
      </Section>

      <Section n="5" title="What exists today">
        <ul className="space-y-3">
          <Feature status="built" name="Three-screen receiving flow">
            Goods receipt → linked evidence → discrepancy review, with working
            buttons on every step.
          </Feature>
          <Feature status="built" name="Three quantities kept separate">
            Accepted is derived from counted-in minus damaged and stored separately.
            A database check constraint makes an unbalanced receipt impossible to
            write, so the rule holds even if the app is wrong.
          </Feature>
          <Feature status="built" name="Ranked proposal, decision left open">
            The system names the most likely cause with a confidence, keeps the
            other candidates visible, and states what would settle it. It never
            closes the gap itself.
          </Feature>
          <Feature status="built" name="Human review that sets the state">
            Approve, correct or reject. A correction overrides the proposed cause,
            and the reviewer, the note and the final cause are all recorded.
          </Feature>
          <Feature status="built" name="Two labelled simulated events">
            The invoice arriving and the supplier issuing a credit note. Each
            updates the evidence and the outstanding proposal in one press.
          </Feature>
          <Feature status="built" name="Empty and uncertain states">
            Nothing at the bay, no evidence yet, nothing to review — each is a
            designed screen. The uncertain state is the default on screen 3.
          </Feature>
          <Feature status="built" name="No write without review, enforced">
            The browser key can read and nothing else; a write from it fails with
            Postgres <Mono>42501</Mono>. Every state change goes through a server
            action.
          </Feature>
          <Feature status="pending" name="Anything leaving the building">
            No supplier email, no stock posting, no accounting entry. An approved
            action is recorded and labelled “Not sent”. This is deliberate — the
            exercise forbids it — but it is the boundary of the demo.
          </Feature>
        </ul>
      </Section>

      <Section n="6" title="The three paths">
        <div className="space-y-4">
          <Path
            name="Ordinary"
            status="built"
            body="Reset to start of shift, count in both notes. Ten listed, ten counted, the goods reconcile against the notes and there is nothing to review. The boring case — show it for ten seconds so the exception has contrast."
          />
          <Path
            name="Changed information"
            status="built"
            body="Press “Supplier invoice arrives”, then later “Supplier issues a credit note”. Each is a labelled simulation that injects one record and lets the reconciliation and the proposal update on their own. The credit note is a new record; INV-1 is never edited."
          />
          <Path
            name="Failure / uncertainty"
            status="built"
            body="The default state of screen 3. Damage is flagged as likely because it matches the gap exactly, but shortage, duplicate scan and second delivery stay on the card, and the proposal says plainly that these records alone do not settle it. Press “Correct it” to show the reviewer overriding the system."
          />
        </div>
      </Section>

      <Section n="7" title="The one design decision to defend">
        <p>
          The engine could assert “damage” and close the gap: one unit damaged, one
          unit of difference, the arithmetic works. It proposes it instead.
        </p>
        <p className="mt-3">
          Damage explaining the gap arithmetically is not the supplier agreeing to
          credit it, and nothing in these records proves that. A system that quietly
          picks the convenient cause produces a number somebody later has to defend
          to a supplier without knowing where it came from — which is the pain the
          client described. So it ranks, shows the alternatives, says what would
          settle it, and hands the decision to a person.
        </p>
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">
          If someone argues it should just answer: that is a product choice, not a
          technical limit. Ask them who signs the credit note.
        </p>
      </Section>

      <Section n="8" title="Real vs simulated">
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/50 dark:border-white/15 dark:text-white/50">
              <tr>
                <th className="px-3 py-2 font-medium">Component</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Evidence and limitation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              <Row
                c="Receipt capture"
                s="Real"
                l="Writes a row through a server action. The DB check constraint rejects an unbalanced receipt."
              />
              <Row
                c="Records and persistence"
                s="Real"
                l="Live Supabase Postgres, 8 tables. Reseeded from the supplied records; npm run check:seed proves they are unaltered."
              />
              <Row
                c="Reconciliation and proposal"
                s="Real"
                l="Pure TypeScript, no model call. Deterministic — the same records always give the same proposal."
              />
              <Row
                c="Human review"
                s="Real"
                l="Approve / correct / reject writes a review_decisions row. RLS blocks the browser key from writing at all."
              />
              <Row
                c="Event trigger"
                s="Simulated, labelled"
                l="Two buttons inject the invoice and the credit note. Marked purple and tagged Simulated wherever they appear."
              />
              <Row
                c="Scanned documents"
                s="Simulated"
                l="No OCR. Notes and invoices are structured rows, as the exercise permits."
              />
              <Row
                c="External action"
                s="None, by design"
                l="No supplier message, stock update or accounting entry is executed. Approved actions are recorded and labelled Not sent."
              />
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="9" title="Limitations, and what you would test next">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            One order, one part, one invoice. No catalogue, partial invoices or
            price lines.
          </li>
          <li>
            Row-level security is demo-open: anyone with the URL can read, and the
            demo buttons let anyone reset it. Deliberate for the exercise, not a
            production posture.
          </li>
          <li>
            No authentication, so “who approved this” is a text field, not an
            identity.
          </li>
          <li>
            The four candidate causes are the ones the client named, hand-written. A
            real receiving bay will have more.
          </li>
          <li>The screens read live from Supabase; without network they will not load.</li>
        </ul>
        <Callout label="Next validation test">
          Take one week of real delivery notes and invoices from one supplier, run
          them through the reconciliation, and count how many differences resolve to
          a single cause with evidence versus how many still need a phone call.
          Success is a fall in those calls, judged by the reconciler — not by us.
        </Callout>
        <p className="mt-4 text-sm text-black/60 dark:text-white/60">
          Close on the split: what is <strong>demonstrated</strong> is that the right
          receipt record makes a difference resolvable with evidence, and that a
          person stays in the loop. What remains a <strong>hypothesis</strong> is
          that this reduces reconciliation effort at real volume.
        </p>
      </Section>
    </main>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 border-t border-black/10 pt-6 dark:border-white/15">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
        <span className="mr-2 font-mono">{n}</span>
        {title}
      </h2>
      <div className="text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[13px] dark:bg-white/10">
      {children}
    </code>
  );
}

function Callout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-lg border border-amber-600/30 bg-amber-50/60 p-4 text-sm dark:bg-amber-500/10">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function Role({ who, does, why }: { who: string; does: string; why: string }) {
  return (
    <div>
      <dt className="font-medium">{who}</dt>
      <dd className="mt-1 text-black/70 dark:text-white/70">{does}</dd>
      <dd className="mt-1 text-sm text-black/50 dark:text-white/50">{why}</dd>
    </div>
  );
}

const STATUS: Record<string, { text: string; className: string }> = {
  built: {
    text: "Built",
    className:
      "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
  },
  partial: {
    text: "Partial",
    className: "border-amber-600/40 text-amber-700 dark:text-amber-500",
  },
  pending: {
    text: "Not built",
    className: "border-black/20 text-black/50 dark:border-white/25 dark:text-white/50",
  },
};

function Badge({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${s.className}`}
    >
      {s.text}
    </span>
  );
}

function Feature({
  status,
  name,
  children,
}: {
  status: keyof typeof STATUS;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <div className="flex items-baseline gap-2">
        <Badge status={status} />
        <span className="font-medium">{name}</span>
      </div>
      <p className="mt-1 text-sm text-black/65 dark:text-white/65">{children}</p>
    </li>
  );
}

function Path({
  name,
  status,
  body,
}: {
  name: string;
  status: keyof typeof STATUS;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="flex items-baseline gap-2">
        <Badge status={status} />
        <span className="font-medium">{name}</span>
      </div>
      <p className="mt-2 text-sm text-black/70 dark:text-white/70">{body}</p>
    </div>
  );
}

function Row({ c, s, l }: { c: string; s: string; l: string }) {
  return (
    <tr>
      <td className="px-3 py-2 font-medium">{c}</td>
      <td className="whitespace-nowrap px-3 py-2">{s}</td>
      <td className="px-3 py-2 text-black/60 dark:text-white/60">{l}</td>
    </tr>
  );
}
