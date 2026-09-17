import { deflateSync } from "node:zlib";

import type { Font } from "./truetype";

/**
 * A one-page PDF writer, hand-rolled because the alternative was a dependency.
 *
 * It draws what this design system is made of and nothing else: filled
 * rectangles (the blocks), rounded rectangles (the pills), hairlines and text
 * in an embedded face. That is the whole vocabulary of trast's look, so it is
 * the whole vocabulary of this file.
 *
 * Two conventions worth knowing before reading further:
 *
 * - **Coordinates are top-left, like CSS.** PDF counts from the bottom-left,
 *   which inverts every y in every layout calculation and is exactly the sort
 *   of thing that produces an upside-down document at 3am. `flip()` is the only
 *   place that conversion happens.
 * - **Text is positioned by its baseline**, not its box. `lineTop()` turns a
 *   box top into a baseline when a caller would rather think in boxes.
 */

const A4 = { width: 595.28, height: 841.89 } as const;

type Rgb = readonly [number, number, number];

/** "#4520d1" -> PDF's 0..1 triple. The palette is written as hex everywhere
 *  else in this app, so it is written as hex here too. */
export function rgb(hex: string): Rgb {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const num = (v: number) => (Math.round(v * 100) / 100).toString();
const col = (c: Rgb) => c.map((v) => (Math.round(v * 1000) / 1000).toString()).join(" ");

export type TextOptions = {
  font: Font;
  size: number;
  color: Rgb;
  /** Extra space per character, in points. PDF's Tc. */
  tracking?: number;
  align?: "start" | "end" | "center";
};

type Embedded = {
  font: Font;
  resource: string;
  /** Only the glyphs actually drawn get a width and a ToUnicode entry. */
  used: Map<number, number>;
};

export class Page {
  readonly width = A4.width;
  readonly height = A4.height;

  private ops: string[] = [];
  private fonts: Embedded[] = [];

  // -------------------------------------------------------------------------
  // Geometry
  // -------------------------------------------------------------------------

  private flip(y: number) {
    return this.height - y;
  }

  /** A block. Square corners, because on trast.de every container is. */
  rect(x: number, y: number, w: number, h: number, fill: Rgb) {
    this.ops.push(
      `${col(fill)} rg`,
      `${num(x)} ${num(this.flip(y + h))} ${num(w)} ${num(h)} re f`,
    );
  }

  /** A control. Fully round, because on trast.de every one of those is. */
  pill(x: number, y: number, w: number, h: number, fill: Rgb) {
    const r = Math.min(h / 2, w / 2);
    const k = r * 0.5523;
    const bottom = this.flip(y + h);
    const top = this.flip(y);
    const l = x;
    const rt = x + w;
    this.ops.push(
      `${col(fill)} rg`,
      `${num(l + r)} ${num(bottom)} m`,
      `${num(rt - r)} ${num(bottom)} l`,
      `${num(rt - r + k)} ${num(bottom)} ${num(rt)} ${num(bottom + r - k)} ${num(rt)} ${num(bottom + r)} c`,
      `${num(rt)} ${num(top - r)} l`,
      `${num(rt)} ${num(top - r + k)} ${num(rt - r + k)} ${num(top)} ${num(rt - r)} ${num(top)} c`,
      `${num(l + r)} ${num(top)} l`,
      `${num(l + r - k)} ${num(top)} ${num(l)} ${num(top - r + k)} ${num(l)} ${num(top - r)} c`,
      `${num(l)} ${num(bottom + r)} l`,
      `${num(l)} ${num(bottom + r - k)} ${num(l + r - k)} ${num(bottom)} ${num(l + r)} ${num(bottom)} c`,
      "f",
    );
  }

  line(x1: number, y1: number, x2: number, y2: number, color: Rgb, width = 0.75) {
    this.ops.push(
      `${col(color)} RG`,
      `${num(width)} w`,
      `${num(x1)} ${num(this.flip(y1))} m ${num(x2)} ${num(this.flip(y2))} l S`,
    );
  }

  /** The ◆ that carries "simulated" wherever colour cannot: drawn rather than
   *  set, so it does not depend on the face having U+25C6. */
  diamond(cx: number, cy: number, r: number, fill: Rgb) {
    const y = this.flip(cy);
    this.ops.push(
      `${col(fill)} rg`,
      `${num(cx)} ${num(y + r)} m`,
      `${num(cx + r)} ${num(y)} l`,
      `${num(cx)} ${num(y - r)} l`,
      `${num(cx - r)} ${num(y)} l`,
      "f",
    );
  }

  // -------------------------------------------------------------------------
  // Text
  // -------------------------------------------------------------------------

  private embed(font: Font): Embedded {
    const found = this.fonts.find((f) => f.font === font);
    if (found) return found;
    const next: Embedded = {
      font,
      resource: `F${this.fonts.length + 1}`,
      used: new Map(),
    };
    this.fonts.push(next);
    return next;
  }

  measure(text: string, o: Pick<TextOptions, "font" | "size" | "tracking">) {
    let width = 0;
    let count = 0;
    for (const ch of text) {
      width += o.font.advance(o.font.glyph(ch.codePointAt(0)!)) * o.size;
      count++;
    }
    return width / 1000 + (o.tracking ?? 0) * Math.max(0, count - 1);
  }

  /** Baseline for a line of text whose box starts at `top`. */
  lineTop(top: number, size: number, font: Font) {
    return top + (font.ascent / 1000) * size;
  }

  /** Draws one line. `y` is the baseline; `x` is the start, end or centre
   *  depending on `align`. Returns the width drawn. */
  text(text: string, x: number, y: number, o: TextOptions) {
    if (!text) return 0;
    const embedded = this.embed(o.font);
    const width = this.measure(text, o);
    const start =
      o.align === "end" ? x - width : o.align === "center" ? x - width / 2 : x;

    let hex = "";
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      const gid = o.font.glyph(cp);
      embedded.used.set(gid, cp);
      hex += gid.toString(16).padStart(4, "0");
    }

    this.ops.push(
      `${col(o.color)} rg`,
      "BT",
      `/${embedded.resource} ${num(o.size)} Tf`,
      `${num(o.tracking ?? 0)} Tc`,
      `1 0 0 1 ${num(start)} ${num(this.flip(y))} Tm`,
      `<${hex}> Tj`,
      "ET",
    );
    return width;
  }

  /** Greedy wrap. Returns the lines; the caller decides where they go. */
  wrap(text: string, maxWidth: number, o: Pick<TextOptions, "font" | "size" | "tracking">) {
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && this.measure(candidate, o) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  /** Wraps and draws, top-down. Returns the y below the last line. */
  paragraph(
    text: string,
    x: number,
    top: number,
    maxWidth: number,
    o: TextOptions & { leading: number },
  ) {
    let y = this.lineTop(top, o.size, o.font);
    for (const line of this.wrap(text, maxWidth, o)) {
      this.text(line, x, y, o);
      y += o.leading;
    }
    return y - o.leading + (Math.abs(o.font.descent) / 1000) * o.size;
  }

  // -------------------------------------------------------------------------
  // Output
  // -------------------------------------------------------------------------

  render(title: string): Buffer {
    const objects: Buffer[] = [];
    const add = (body: string | Buffer) => {
      objects.push(Buffer.isBuffer(body) ? body : Buffer.from(body, "latin1"));
      return objects.length; // object numbers are 1-based
    };
    const stream = (dict: string, data: Buffer) => {
      const packed = deflateSync(data);
      return add(
        Buffer.concat([
          Buffer.from(`<<${dict}/Length ${packed.length}/Filter/FlateDecode>>\nstream\n`, "latin1"),
          packed,
          Buffer.from("\nendstream", "latin1"),
        ]),
      );
    };

    const content = stream("", Buffer.from(this.ops.join("\n"), "latin1"));

    const resources = this.fonts.map((f) => {
      const file = stream(`/Length1 ${f.font.data.length}`, f.font.data);
      const descriptor = add(
        `<</Type/FontDescriptor/FontName/${f.font.name}` +
          `/Flags 32/FontBBox[${f.font.bbox.join(" ")}]` +
          `/ItalicAngle ${num(f.font.italicAngle)}/Ascent ${f.font.ascent}` +
          `/Descent ${f.font.descent}/CapHeight ${f.font.capHeight}` +
          `/StemV 80/FontFile2 ${file} 0 R>>`,
      );

      const gids = [...f.used.keys()].sort((a, b) => a - b);
      const widths = gids.map((g) => `${g}[${f.font.advance(g)}]`).join(" ");
      const cid = add(
        `<</Type/Font/Subtype/CIDFontType2/BaseFont/${f.font.name}` +
          "/CIDSystemInfo<</Registry(Adobe)/Ordering(Identity)/Supplement 0>>" +
          `/FontDescriptor ${descriptor} 0 R/DW 1000/W[${widths}]/CIDToGIDMap/Identity>>`,
      );

      // Without this the numbers in the document cannot be selected or
      // searched, which would make it a picture of evidence rather than
      // evidence.
      const toUnicode = stream("", Buffer.from(cmap(f), "latin1"));

      const type0 = add(
        `<</Type/Font/Subtype/Type0/BaseFont/${f.font.name}` +
          `/Encoding/Identity-H/DescendantFonts[${cid} 0 R]/ToUnicode ${toUnicode} 0 R>>`,
      );
      return `/${f.resource} ${type0} 0 R`;
    });

    const pages = objects.length + 2; // page, then pages
    const page = add(
      `<</Type/Page/Parent ${pages} 0 R/MediaBox[0 0 ${num(this.width)} ${num(this.height)}]` +
        `/Resources<</Font<<${resources.join("")}>>>>/Contents ${content} 0 R>>`,
    );
    add(`<</Type/Pages/Kids[${page} 0 R]/Count 1>>`);
    const info = add(
      `<</Title(${pdfString(title)})/Producer(${pdfString("C04 prototype")})>>`,
    );
    const catalog = add(`<</Type/Catalog/Pages ${pages} 0 R>>`);

    const header = Buffer.from("%PDF-1.7\n%\xe2\xe3\xcf\xd3\n", "latin1");
    const parts: Buffer[] = [header];
    const offsets: number[] = [];
    let at = header.length;
    objects.forEach((body, i) => {
      const chunk = Buffer.concat([
        Buffer.from(`${i + 1} 0 obj\n`, "latin1"),
        body,
        Buffer.from("\nendobj\n", "latin1"),
      ]);
      offsets.push(at);
      at += chunk.length;
      parts.push(chunk);
    });

    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) xref += `${off.toString().padStart(10, "0")} 00000 n \n`;
    xref += `trailer\n<</Size ${objects.length + 1}/Root ${catalog} 0 R/Info ${info} 0 R>>\nstartxref\n${at}\n%%EOF\n`;
    parts.push(Buffer.from(xref, "latin1"));

    return Buffer.concat(parts);
  }
}

/** Escapes a literal PDF string. Only the three characters that can end one. */
function pdfString(s: string) {
  return s.replace(/[\\()]/g, (c) => `\\${c}`);
}

function cmap(f: Embedded) {
  const entries = [...f.used.entries()].sort((a, b) => a[0] - b[0]);
  let body = "";
  // bfchar blocks are capped at 100 entries by the spec.
  for (let i = 0; i < entries.length; i += 100) {
    const block = entries.slice(i, i + 100);
    body += `${block.length} beginbfchar\n`;
    for (const [gid, cp] of block) {
      // The value is UTF-16BE, so anything past the BMP is a surrogate pair.
      const s = String.fromCodePoint(cp);
      let utf16 = "";
      for (let k = 0; k < s.length; k++) {
        utf16 += s.charCodeAt(k).toString(16).padStart(4, "0");
      }
      body += `<${gid.toString(16).padStart(4, "0")}> <${utf16}>\n`;
    }
    body += "endbfchar\n";
  }
  return (
    "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n" +
    "/CIDSystemInfo <</Registry (Adobe) /Ordering (UCS) /Supplement 0>> def\n" +
    "/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n" +
    "1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
    body +
    "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n"
  );
}
