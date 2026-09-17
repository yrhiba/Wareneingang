import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

import { LocaleProvider } from "@/components/locale-provider";
import { Nav } from "@/components/nav";
import { isSupplied } from "@/lib/case-config";
import { getCaseConfig } from "@/lib/case-config/server";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Geist has no Arabic glyphs, so Arabic would fall back to whatever the machine
// happens to have. Plex Arabic is loaded for the same reason the Latin face is.
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return { title: t.chrome.metaTitle, description: t.chrome.metaDescription };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = getDict(locale);
  // The exercise forbids passing changed records off as the supplied ones, so
  // the banner that labels the data as synthetic also labels it as edited.
  const modified = !isSupplied(await getCaseConfig());

  return (
    <html
      lang={locale}
      dir={t.dir}
      className={`${geistSans.variable} ${geistMono.variable} ${arabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before first paint. Absent a stored choice this does nothing and
          the page stays light, so the OS preference never gets a vote.

          Language needs no equivalent: it arrives in a cookie the server reads,
          so lang and dir are already correct in this very response.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('c04-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>
          {/* Never off-screen: the exercise requires synthetic data to be labelled. */}
          <p className="bg-foreground px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-background">
            {t.chrome.banner}
            {modified && (
              <span className="ms-2 rounded-full bg-background/25 px-2 py-0.5">
                {t.chrome.bannerModified}
              </span>
            )}
          </p>
          <Nav />
          <div className="flex-1">{children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
