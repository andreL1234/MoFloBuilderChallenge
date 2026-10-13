import { elementText, Page, prioritize, truncateAtSentence, uniqueBy } from "./text";

export function extractTestimonials(pages: Page[], fromStructuredData: string[]): string[] {
  const quotes: string[] = [...fromStructuredData];
  for (const page of prioritize(pages, "reviews", "home", "about")) {
    page.doc
      .querySelectorAll('[class*="testimonial" i], [class*="review" i], [class*="quote" i], blockquote')
      .forEach((el) => {
        if (el.closest("nav, header, footer")) return;
        // Prefer the quote paragraph itself over the whole card (which includes name, stars, date)
        const text = elementText(el.querySelector("p, blockquote, [class*='text' i], [class*='content' i]") ?? el);
        if (text.length >= 40 && text.length <= 600 && !/cookie|privacy|©/i.test(text)) quotes.push(text);
      });
  }
  return uniqueBy(quotes.map((q) => truncateAtSentence(q, 320)), (q) => q.slice(0, 50)).slice(0, 6);
}

export function extractFaqs(
  pages: Page[],
  fromStructuredData: { question: string; answer: string }[]
): { question: string; answer: string }[] {
  const faqs = [...fromStructuredData];
  for (const page of prioritize(pages, "faq", "home", "services")) {
    // Native accordions
    page.doc.querySelectorAll("details").forEach((details) => {
      const question = elementText(details.querySelector("summary"));
      const answer = elementText(details).replace(question, "").trim();
      if (question.endsWith("?") && answer.length >= 15) faqs.push({ question, answer });
    });
    // Any heading/button/term that ends in "?" followed by its answer - only on FAQ pages or inside
    // FAQ/accordion sections, otherwise marketing headlines like "Ready to get started?" sneak in
    page.doc.querySelectorAll("h2, h3, h4, h5, dt, button, strong, [class*='question' i]").forEach((el) => {
      const inFaqContext = page.kind === "faq" || el.closest("[class*='faq' i], [id*='faq' i], [class*='accordion' i], [class*='toggle' i]") !== null;
      if (!inFaqContext) return;
      const question = elementText(el);
      if (!question.endsWith("?") || question.length < 10 || question.length > 160) return;
      const answerEl = el.nextElementSibling ?? el.parentElement?.nextElementSibling;
      const answer = elementText(answerEl);
      if (answer.length >= 15 && !answer.endsWith("?")) faqs.push({ question, answer: truncateAtSentence(answer, 400) });
    });
  }
  return uniqueBy(faqs, (f) => f.question).slice(0, 10);
}

// "4.9 stars from 213 reviews" when there's no structured rating
export function extractRating(pages: Page[], fromStructuredData?: string): string | undefined {
  if (fromStructuredData) return fromStructuredData;
  for (const page of prioritize(pages, "home", "reviews")) {
    const match = page.text.match(/\b([1-5]\.\d)\s*(?:\/\s*5|out of 5|stars?)\b[^.]{0,40}?\b(\d[\d,]*)\+?\s*(?:reviews|ratings|customers)/i);
    if (match) return `${match[1]} / 5 from ${match[2]} reviews`;
  }
  return undefined;
}
