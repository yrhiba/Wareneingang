import { eventFacts } from "@/lib/event-facts";
import { getLocale } from "@/lib/i18n/server";
import { docLocale, renderDocument, type DocumentKind } from "@/lib/pdf/documents";

export const dynamic = "force-dynamic";

/** The writer reads the font files off disk and deflates with zlib. */
export const runtime = "nodejs";

const KINDS = new Set<DocumentKind>(["invoice", "credit-note"]);

const isKind = (v: string): v is DocumentKind => KINDS.has(v as DocumentKind);

/**
 * The simulated supplier document, as a PDF.
 *
 * Built from the same facts the confirmation box states, so what a reviewer
 * downloads before confirming is the document the event goes on to record - the
 * ids and quantities cannot disagree.
 *
 * Served `inline`, so opening the URL shows the document in the browser's
 * viewer; the links that offer it carry a `download` attribute, which is what
 * turns the same response into a saved file with the right name.
 */
export async function GET(_request: Request, ctx: RouteContext<"/documents/[doc]">) {
  const { doc } = await ctx.params;
  if (!isKind(doc)) return new Response("Unknown document.", { status: 404 });

  const { body, filename } = renderDocument(
    doc,
    await eventFacts(),
    docLocale(await getLocale()),
  );

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      // The numbers move with the settings screen and with every simulated
      // event, so a cached copy would be a document that no longer matches.
      "Cache-Control": "no-store",
    },
  });
}
