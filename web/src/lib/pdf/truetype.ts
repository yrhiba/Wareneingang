import { readFileSync } from "node:fs";

/**
 * Just enough TrueType to embed a face in a PDF.
 *
 * The document this produces has to be in Montserrat, because Montserrat is the
 * client's face and the point of the document is that it looks like the rest of
 * the prototype. A PDF written in Helvetica would read as a different product.
 *
 * Embedding a font means telling the PDF two things the file itself does not
 * carry: which glyph each character maps to (`cmap`) and how wide each glyph is
 * (`hmtx`). That is all this parser reads, plus the descriptor metrics a viewer
 * needs when it has to substitute. No subsetting: the whole face goes in, which
 * costs ~110 KB compressed and saves a glyf/loca rewrite that could go subtly
 * wrong on a document nobody would think to check.
 */

type Table = { off: number; len: number };

export type Font = {
  /** The raw file, for /FontFile2. */
  readonly data: Buffer;
  readonly name: string;
  readonly unitsPerEm: number;
  readonly bbox: readonly [number, number, number, number];
  readonly ascent: number;
  readonly descent: number;
  readonly capHeight: number;
  readonly italicAngle: number;
  /** Glyph id for a code point, or 0 (.notdef) when the face has none. */
  glyph(codePoint: number): number;
  /** Advance width in 1000-unit text space, which is what PDF counts in. */
  advance(gid: number): number;
};

function readTables(buf: Buffer): Map<string, Table> {
  const count = buf.readUInt16BE(4);
  const out = new Map<string, Table>();
  for (let i = 0; i < count; i++) {
    const p = 12 + i * 16;
    out.set(buf.toString("latin1", p, p + 4), {
      off: buf.readUInt32BE(p + 8),
      len: buf.readUInt32BE(p + 12),
    });
  }
  return out;
}

/** The format every Latin face ships: 16-bit segments with a delta per segment. */
function parseCmap4(buf: Buffer, off: number): Map<number, number> {
  const segX2 = buf.readUInt16BE(off + 6);
  const segs = segX2 / 2;
  const endO = off + 14;
  const startO = endO + segX2 + 2; // +2 for reservedPad
  const deltaO = startO + segX2;
  const rangeO = deltaO + segX2;

  const map = new Map<number, number>();
  for (let i = 0; i < segs; i++) {
    const end = buf.readUInt16BE(endO + i * 2);
    const start = buf.readUInt16BE(startO + i * 2);
    if (start > end || start === 0xffff) continue;
    const delta = buf.readInt16BE(deltaO + i * 2);
    const range = buf.readUInt16BE(rangeO + i * 2);
    for (let c = start; c <= end; c++) {
      let g: number;
      if (range === 0) {
        g = (c + delta) & 0xffff;
      } else {
        const at = rangeO + i * 2 + range + (c - start) * 2;
        if (at + 1 >= buf.length) continue;
        g = buf.readUInt16BE(at);
        if (g !== 0) g = (g + delta) & 0xffff;
      }
      if (g !== 0) map.set(c, g);
    }
  }
  return map;
}

/** 32-bit groups, for faces that reach past the BMP. */
function parseCmap12(buf: Buffer, off: number): Map<number, number> {
  const groups = buf.readUInt32BE(off + 12);
  const map = new Map<number, number>();
  for (let i = 0; i < groups; i++) {
    const p = off + 16 + i * 12;
    const start = buf.readUInt32BE(p);
    const end = buf.readUInt32BE(p + 4);
    const gid = buf.readUInt32BE(p + 8);
    // A malformed group could claim millions of code points; this document
    // never needs one, so cap rather than hang.
    for (let c = start; c <= end && c - start < 0x10000; c++) {
      map.set(c, gid + (c - start));
    }
  }
  return map;
}

function parseCmap(buf: Buffer, table: Table): Map<number, number> {
  const count = buf.readUInt16BE(table.off + 2);
  let best: { off: number; score: number } | null = null;
  for (let i = 0; i < count; i++) {
    const p = table.off + 4 + i * 8;
    const platform = buf.readUInt16BE(p);
    const encoding = buf.readUInt16BE(p + 2);
    const sub = table.off + buf.readUInt32BE(p + 4);
    // Windows full-repertoire, then Windows BMP, then anything Unicode.
    const score =
      platform === 3 && encoding === 10
        ? 3
        : platform === 3 && encoding === 1
          ? 2
          : platform === 0
            ? 1
            : 0;
    if (score > 0 && (!best || score > best.score)) best = { off: sub, score };
  }
  if (!best) throw new Error("font has no Unicode cmap");

  const format = buf.readUInt16BE(best.off);
  if (format === 4) return parseCmap4(buf, best.off);
  if (format === 12) return parseCmap12(buf, best.off);
  throw new Error(`unsupported cmap format ${format}`);
}

export function loadFont(path: string, name: string): Font {
  const data = readFileSync(path);
  const tables = readTables(data);

  const need = (tag: string) => {
    const t = tables.get(tag);
    if (!t) throw new Error(`font ${name} is missing the ${tag} table`);
    return t;
  };

  const head = need("head").off;
  const hhea = need("hhea").off;
  const hmtx = need("hmtx").off;
  const unitsPerEm = data.readUInt16BE(head + 18);
  const scale = 1000 / unitsPerEm;

  const longMetrics = data.readUInt16BE(hhea + 34);
  const cmap = parseCmap(data, need("cmap"));

  // OS/2 carries the typographic metrics a PDF descriptor wants; hhea is the
  // fallback for the rare face that ships without it.
  const os2 = tables.get("OS/2")?.off;
  const version = os2 !== undefined ? data.readUInt16BE(os2) : 0;
  const ascent = os2 !== undefined ? data.readInt16BE(os2 + 68) : data.readInt16BE(hhea + 4);
  const descent =
    os2 !== undefined ? data.readInt16BE(os2 + 70) : data.readInt16BE(hhea + 6);
  const capHeight =
    os2 !== undefined && version >= 2 ? data.readInt16BE(os2 + 88) : Math.round(ascent * 0.7);

  const post = tables.get("post")?.off;
  const italicAngle = post !== undefined ? data.readInt32BE(post + 4) / 65536 : 0;

  return {
    data,
    name,
    unitsPerEm,
    bbox: [
      Math.round(data.readInt16BE(head + 36) * scale),
      Math.round(data.readInt16BE(head + 38) * scale),
      Math.round(data.readInt16BE(head + 40) * scale),
      Math.round(data.readInt16BE(head + 42) * scale),
    ] as const,
    ascent: Math.round(ascent * scale),
    descent: Math.round(descent * scale),
    capHeight: Math.round(capHeight * scale),
    italicAngle,
    glyph: (cp) => cmap.get(cp) ?? 0,
    advance(gid) {
      // Past the last long metric every glyph repeats the final advance; that
      // is how monospaced tails are stored.
      const i = Math.min(gid, longMetrics - 1);
      return Math.round(data.readUInt16BE(hmtx + i * 4) * scale);
    },
  };
}
