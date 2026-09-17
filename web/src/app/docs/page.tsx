import Link from "next/link";
import type { Metadata } from "next";

import { getDict, type Dict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return { title: t.docs.metaTitle, description: t.docs.metaDescription };
}

/**
 * Static briefing page. Deliberately does NOT touch the database: if Supabase is
 * down mid-presentation this page still opens and still explains the demo.
 * Keep it honest - every "not built" below is a claim the demo cannot back.
 *
 * It follows the language switch like every other screen. The prose lives in
 * the dictionaries; what stays here is the structure and the badges, because a
 * badge is a claim about the build rather than a piece of language - the
 * feature list and its statuses are the same in both, and only read differently.
 */
export default async function DocsPage() {
  const t = getDict(await getLocale()).docs;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {t.subtitle}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm underline underline-offset-4 hover:no-underline"
        >
          {t.back}
        </Link>
      </header>

      <Section n="1" title={t.sayFirstHeading}>
        <blockquote className="border-s-2 border-amber-600 ps-4 text-base">
          {rich(t.pitch)}
        </blockquote>
      </Section>

      <Section n="2" title={t.demoHeading}>
        <ol className="list-decimal space-y-3 ps-5">
          {t.beats.map((beat, i) => (
            <li key={i}>{rich(beat)}</li>
          ))}
        </ol>
        <Callout label={t.thirtyLabel}>{rich(t.thirtyBody)}</Callout>
      </Section>

      <Section n="3" title={t.runHeading}>
        <ol className="list-decimal space-y-2 ps-5">
          {t.runSteps.map((s, i) => (
            <li key={i}>{rich(s)}</li>
          ))}
        </ol>
        <Callout label={t.resetLabel}>{rich(t.resetBody)}</Callout>
      </Section>

      <Section n="4" title={t.whoHeading}>
        <dl className="space-y-4">
          {ROLES.map((key) => (
            <Role key={key} {...t.roles[key]} />
          ))}
        </dl>
        <Callout label={t.noLoginLabel}>{rich(t.noLoginBody)}</Callout>
      </Section>

      <Section n="5" title={t.existsHeading}>
        <ul className="space-y-3">
          {FEATURES.map(([key, status]) => (
            <Feature key={key} status={status} name={t.features[key].name} t={t}>
              {rich(t.features[key].body)}
            </Feature>
          ))}
        </ul>
      </Section>

      <Section n="6" title={t.pathsHeading}>
        <div className="space-y-4">
          {PATHS.map(([key, status]) => (
            <Path
              key={key}
              status={status}
              name={t.paths[key].name}
              body={t.paths[key].body}
              t={t}
            />
          ))}
        </div>
      </Section>

      <Section n="7" title={t.decisionHeading}>
        <p>{rich(t.decisionLead)}</p>
        <p className="mt-3">{rich(t.decisionBody)}</p>
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">
          {rich(t.decisionAside)}
        </p>
      </Section>

      <Section n="8" title={t.realHeading}>
        <div className="overflow-x-auto border border-black/10 dark:border-white/15">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-black/10 text-xs text-black/50 dark:border-white/15 dark:text-white/50">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t.thComponent}</th>
                <th className="px-3 py-2 text-start font-medium">{t.thStatus}</th>
                <th className="px-3 py-2 text-start font-medium">{t.thEvidence}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {ROWS.map((key) => (
                <Row key={key} {...t.rows[key]} />
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="9" title={t.limitsHeading}>
        <ul className="list-disc space-y-2 ps-5">
          {t.limits.map((limit, i) => (
            <li key={i}>{rich(limit)}</li>
          ))}
        </ul>
        <Callout label={t.nextTestLabel}>{rich(t.nextTestBody)}</Callout>
        <p className="mt-4 text-sm text-black/60 dark:text-white/60">
          {rich(t.close)}
        </p>
      </Section>
    </main>
  );
}

type Docs = Dict["docs"];
type Status = keyof Docs["status"];

// The order of the briefing, and the claim each line makes. Kept out of the
// dictionaries on purpose: a translator changes wording, never what is built.
const ROLES = ["receiver", "reconciler"] as const;

const FEATURES: [keyof Docs["features"], Status][] = [
  ["flow", "built"],
  ["quantities", "built"],
  ["proposal", "built"],
  ["review", "built"],
  ["events", "built"],
  ["states", "built"],
  ["languages", "built"],
  ["settings", "built"],
  ["rls", "built"],
  ["external", "pending"],
];

const PATHS: [keyof Docs["paths"], Status][] = [
  ["ordinary", "built"],
  ["changed", "built"],
  ["failure", "built"],
];

const ROWS = [
  "capture",
  "records",
  "engine",
  "review",
  "events",
  "scans",
  "external",
] as const;

/**
 * `*bold*`, `_italic_` and `` `mono` `` inside a sentence.
 *
 * Emphasis has to travel with the words: Arabic re-orders the sentence, so
 * wrapping the English fragment in JSX out here would put the bold on whatever
 * happened to land in that position. Three markers, no nesting - anything more
 * wants a real markdown renderer, and a briefing page does not.
 */
function rich(s: string) {
  return s.split(/(\*[^*]+\*|_[^_]+_|`[^`]+`)/g).map((part, i) => {
    const inner = part.slice(1, -1);
    if (part.length < 3) return part;
    if (part.startsWith("*") && part.endsWith("*"))
      return <strong key={i}>{inner}</strong>;
    if (part.startsWith("_") && part.endsWith("_"))
      return <em key={i}>{inner}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <Mono key={i}>{inner}</Mono>;
    return part;
  });
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
      <h2 className="mb-4 text-sm font-semibold text-black/50 dark:text-white/50">
        <span className="me-2 font-mono">{n}</span>
        {title}
      </h2>
      <div className="text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  // dir is pinned: a command like `cd web && npm install` must not be re-ordered
  // by the surrounding right-to-left paragraph.
  return (
    <code
      dir="ltr"
      className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[13px] dark:bg-white/10"
    >
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
    <div className="mt-4 border border-amber-600/30 bg-amber-50/60 p-4 text-sm dark:bg-amber-500/10">
      <p className="mb-1 text-xs font-semibold text-amber-800 dark:text-amber-500">
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

const STATUS_STYLE: Record<Status, string> = {
  built: "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
  partial: "border-amber-600/40 text-amber-700 dark:text-amber-500",
  pending:
    "border-black/20 text-black/50 dark:border-white/25 dark:text-white/50",
};

function Badge({ status, t }: { status: Status; t: Docs }) {
  return (
    <span
      className={`lc shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status]}`}
    >
      {t.status[status]}
    </span>
  );
}

function Feature({
  status,
  name,
  t,
  children,
}: {
  status: Status;
  name: string;
  t: Docs;
  children: React.ReactNode;
}) {
  return (
    <li>
      <div className="flex items-baseline gap-2">
        <Badge status={status} t={t} />
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
  t,
}: {
  name: string;
  status: Status;
  body: string;
  t: Docs;
}) {
  return (
    <div className="border border-black/10 p-4 dark:border-white/15">
      <div className="flex items-baseline gap-2">
        <Badge status={status} t={t} />
        <span className="font-medium">{name}</span>
      </div>
      <p className="mt-2 text-sm text-black/70 dark:text-white/70">{rich(body)}</p>
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
