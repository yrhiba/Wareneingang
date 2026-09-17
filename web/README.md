# web — the C04 prototype

The Next.js app. **The deliverable README is one level up, at
[`../README.md`](../README.md)**: result first, run instructions, what is real
versus simulated, limitations and the next validation test.

```bash
npm install                    # first time only
cp -n .env.example .env.local  # ONLY if .env.local is missing; -n never overwrites
npm run dev                    # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | The demo. Presenter briefing at `/docs`, case settings at `/settings` |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck — this is what catches an untranslated Arabic key |
| `npm run check:seed` | Asserts `src/lib/seed-data.ts` still matches `initial.json` field for field |
| `npm run e2e` | Two suites over real HTTP against a running dev server and the live database |

`.env.local` holds the Supabase URL, publishable key and secret key, and is
gitignored. The secret key must never take a `NEXT_PUBLIC_` prefix.

Deployed on Vercel with **Root Directory `web`** and those same three variables.
