import { SettingsForm } from "@/components/settings-form";
import { SUPPLIED } from "@/lib/case-config";
import { getCaseConfig } from "@/lib/case-config/server";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

/**
 * Not one of the three screens: it sits off the flow, linked from the header
 * next to the briefing.
 *
 * It is deliberately framed as scaffolding rather than a feature. The colour
 * convention is left alone - coral means simulated, and these are real records
 * being rebuilt, so this page is neutral grey with a written label instead.
 */
export default async function SettingsPage() {
  const t = await getT();
  const config = await getCaseConfig();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{t.settings.title}</h1>
          <span className="lc rounded-full border border-dashed border-faint px-2 py-0.5 text-[11px] font-semibold text-muted">
            {t.settings.tag}
          </span>
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">{t.settings.intro}</p>
      </header>

      <section className="mb-8 space-y-3 border border-dashed border-line bg-background p-5">
        <p className="max-w-2xl text-sm text-muted">{t.settings.notAFeature}</p>
        <p className="max-w-2xl text-sm text-muted">{t.settings.suppliedSafe}</p>
      </section>

      <SettingsForm config={config} supplied={SUPPLIED} />

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="mb-3 text-xs font-semibold text-faint">
          {t.settings.limitsHeading}
        </h2>
        <ul className="max-w-2xl space-y-2 text-sm text-muted">
          {t.settings.limits.map((limit) => (
            <li key={limit} className="flex gap-2">
              <span aria-hidden className="text-faint">
                —
              </span>
              <span>{limit}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
