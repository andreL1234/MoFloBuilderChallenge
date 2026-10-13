import { Page, sentences } from "./text";

// Writing style measured from the copy itself, so MoSocial/MoMail can match the brand's voice
export function describeWritingStyle(blocks: string[]): string | undefined {
  const text = blocks.join(" ");
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  const allSentences = sentences(text).filter((s) => s.split(" ").length >= 3);
  if (words.length < 80 || allSentences.length < 5) return undefined;

  const per100 = (pattern: RegExp) => ((text.match(pattern) || []).length / words.length) * 100;
  const avgSentence = Math.round(words.length / allSentences.length);
  const youRate = per100(/\b(you|your|you're|yours)\b/gi);
  const weRate = per100(/\b(we|our|we're|us)\b/gi);
  const exclaimShare = allSentences.filter((s) => s.endsWith("!")).length / allSentences.length;
  const questionShare = allSentences.filter((s) => s.endsWith("?")).length / allSentences.length;

  const traits: string[] = [];
  traits.push(
    avgSentence <= 12 ? "Punchy, short sentences" : avgSentence <= 20 ? "Clear, medium-length sentences" : "Long, detailed sentences"
  );
  if (youRate >= 2) traits.push("speaks directly to the reader (“you”)");
  if (weRate >= 2) traits.push("personal first-person voice (“we”)");
  if (exclaimShare >= 0.1) traits.push("energetic, uses exclamation points");
  if (questionShare >= 0.08) traits.push("asks the reader questions");
  if (youRate < 1 && weRate < 1) traits.push("formal, third-person tone");

  return `${traits.join("; ")}. Avg ${avgSentence} words per sentence.`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s, l };
}

const SERIF_FONTS = /serif|georgia|times|garamond|playfair|merriweather|lora|baskerville|didot|bodoni|cormorant|libre caslon|crimson|prata/i;

// Art direction summary for image generation: palette mood, typography, and how visual the site is
export function describeArtStyle(home: Page, colors: string[], fonts: string[]): string | undefined {
  const traits: string[] = [];

  const brandColors = colors.map(hexToHsl).filter((c) => c.l > 0.08 && c.l < 0.92); // skip near-black/white
  if (brandColors.length > 0) {
    const avgSat = brandColors.reduce((sum, c) => sum + c.s, 0) / brandColors.length;
    const avgLight = brandColors.reduce((sum, c) => sum + c.l, 0) / brandColors.length;
    const warm = brandColors.filter((c) => c.h < 60 || c.h > 300).length >= brandColors.length / 2;
    traits.push(
      `${avgSat > 0.55 ? "bold, saturated" : avgSat > 0.25 ? "balanced" : "muted, understated"} ${warm ? "warm" : "cool"}-toned palette${avgLight < 0.35 ? " with dark accents" : ""}`
    );
  }

  if (fonts.length > 0) {
    const serif = fonts.some((f) => SERIF_FONTS.test(f) && !/sans/i.test(f));
    traits.push(serif ? `classic serif typography (${fonts[0]})` : `clean sans-serif typography (${fonts[0]})`);
  }

  const images = home.doc.querySelectorAll("img").length;
  const hasVideo = home.doc.querySelector("video, iframe[src*='youtube'], iframe[src*='vimeo']") !== null;
  traits.push(images >= 15 ? "photo-heavy layouts" : images >= 5 ? "moderate use of photography" : "minimal imagery");
  if (hasVideo) traits.push("uses video");

  if (traits.length === 0) return undefined;
  const sentence = traits.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}
