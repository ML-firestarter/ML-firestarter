/**
 * The badges readers can show on their GitHub profile once they have a chapter's certificate
 * (lib/certificates.ts), linked to its page: the site's name, then the chapter with a tick, in
 * the flat style of shields.io that GitHub profiles are full of.
 */

/**
 * Roughly how wide `text` is in 11px Verdana, the badges' font, in pixels. The texts are drawn
 * exactly this wide (`textLength`), so the estimate only has to be close.
 */
function textWidth(text: string): number {
  let width = 0;
  // Letters like ą and ó are as wide as a and o.
  for (const char of text.normalize('NFD').replace(/\p{M}/gu, '')) {
    width += /[ijlłI.,:;'!|]/.test(char) ? 3.4 : /[ frt()/-]/.test(char) ? 4.4 : /[mwMW]/.test(char) ? 10 : /[A-ZŁ]/.test(char) ? 7.8 : 6.7;
  }
  return Math.round(width);
}

/** A badge's SVG: `label` on grey, then `message` on green after a tick. */
export function badge(label: string, message: string): string {
  const labelWidth = textWidth(label);
  const messageWidth = textWidth(message);
  const left = labelWidth + 12;
  const right = messageWidth + 26;
  const width = left + right;
  const title = escapeXml(`${label}: ${message}`);
  // Each text twice, the first a faint shadow a pixel lower, as shields.io draws it.
  const text = (x: number, length: number, value: string) =>
    `<text x="${x}" y="15" fill="#010101" fill-opacity=".3" textLength="${length}">${escapeXml(value)}</text>` +
    `<text x="${x}" y="14" textLength="${length}">${escapeXml(value)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${title}">
<title>${title}</title>
<linearGradient id="shine" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="round"><rect width="${width}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#round)"><rect width="${left}" height="20" fill="#44403c"/><rect x="${left}" width="${right}" height="20" fill="#1f8a4c"/><rect width="${width}" height="20" fill="url(#shine)"/></g>
<path d="M${left + 7} 10.4l2.4 2.4 4.6-4.8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#fff" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-rendering="geometricPrecision">${text(6, labelWidth, label)}${text(left + 20, messageWidth, message)}</g>
</svg>
`;
}

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
