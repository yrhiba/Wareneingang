import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Nav } from "@/components/nav";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Goods receipt — C04",
  description:
    "What to record at receipt so the next person can resolve the difference.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before first paint. Absent a stored choice this does nothing and
          the page stays light, so the OS preference never gets a vote.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('c04-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Never off-screen: the exercise requires synthetic data to be labelled. */}
        <p className="bg-foreground px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-background">
          Synthetic exercise data · Trast-style goods receipt · not a real supplier
        </p>
        <Nav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
