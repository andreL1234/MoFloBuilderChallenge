import { KeyPerson } from "@/types/knowledge";
import { cleanText, elementText, Page, prioritize, truncateAtSentence, uniqueBy } from "./text";

const NOT_A_NAME = /\b(team|our|meet|contact|about|services?|company|group|call|email|home|staff|welcome|the|and|llc|inc|co|admin|leadership|testimonials?|reviews?)\b/i;

// "Jane Doe", "Mary-Kate O'Neil", "John A. Smith" - 2-4 capitalized words, no digits
export function looksLikePersonName(text: string): boolean {
  const name = cleanText(text);
  if (name.length < 5 || name.length > 40 || /\d/.test(name) || NOT_A_NAME.test(name)) return false;
  const words = name.split(" ");
  return words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Z][a-zA-Z'’.-]*$/.test(w));
}

const LEADERSHIP = /owner|founder|ceo|president|principal|partner|director|chief|head|vp|manager/i;

function roleFor(title?: string): string | undefined {
  if (!title) return undefined;
  return LEADERSHIP.test(title) ? "Leadership" : "Team member";
}

const TITLE_WORDS = /owner|founder|ceo|cfo|coo|cto|president|principal|partner|director|manager|lead|head|chief|vp|cpa|engineer|technician|specialist|coordinator|consultant|advisor|agent|broker|attorney|dentist|doctor|dr\.|chef|brewer|designer|developer|accountant|bookkeeper|assistant|associate|officer/i;

// Team pages: a card per person with the name in a heading/strong tag and the title next to it
function fromTeamCards(page: Page): KeyPerson[] {
  const people: KeyPerson[] = [];
  page.doc
    .querySelectorAll('[class*="team" i], [class*="staff" i], [class*="member" i], [class*="person" i], [class*="bio" i], [class*="leader" i], [class*="profile" i]')
    .forEach((card) => {
      if (card.closest("nav, header, footer")) return;
      const nameEl = Array.from(card.querySelectorAll("h2, h3, h4, h5, strong, [class*='name' i]")).find((el) =>
        looksLikePersonName(elementText(el))
      );
      if (!nameEl) return;
      const name = elementText(nameEl);
      const titleEl =
        card.querySelector("[class*='title' i], [class*='position' i], [class*='role' i], [class*='job' i]") ??
        nameEl.nextElementSibling;
      const title = elementText(titleEl);
      const bio = Array.from(card.querySelectorAll("p"))
        .map((p) => elementText(p))
        .find((t) => t.length >= 40);
      people.push({
        name,
        title: title && title !== name && title.length <= 60 && TITLE_WORDS.test(title) ? title : undefined,
        description: bio ? truncateAtSentence(bio, 240) : undefined,
      });
    });
  return people;
}

// Prose like "Jane Doe, Owner" or "founded by John Smith"
function fromText(page: Page): KeyPerson[] {
  const people: KeyPerson[] = [];
  const nameThenTitle = /\b([A-Z][a-z]+(?:\s[A-Z]\.)?\s[A-Z][a-zA-Z'’-]+)\s*[,–—-]\s*((?:Co-)?(?:Owner|Founder|CEO|President|Principal|Managing Partner|Partner|Director|General Manager|CPA|Broker|Head Brewer))\b/g;
  for (const match of page.text.matchAll(nameThenTitle)) {
    if (looksLikePersonName(match[1])) people.push({ name: match[1], title: match[2] });
  }
  const foundedBy = /\b(?:founded|owned|started|established|led|run) by\s+([A-Z][a-z]+(?:\s[A-Z]\.)?\s[A-Z][a-zA-Z'’-]+)/g;
  for (const match of page.text.matchAll(foundedBy)) {
    if (looksLikePersonName(match[1])) people.push({ name: match[1], title: /owned/.test(match[0]) ? "Owner" : "Founder" });
  }
  return people;
}

// Gender is intentionally not inferred: guessing it from a name is unreliable and not ours to assume.
export function extractKeyPeople(pages: Page[], fromStructuredData: KeyPerson[]): KeyPerson[] {
  const ordered = prioritize(pages, "team", "about", "home");
  const all = [
    ...fromStructuredData.filter((p) => looksLikePersonName(p.name)),
    ...ordered.flatMap(fromTeamCards),
    ...ordered.flatMap(fromText),
  ];

  const merged = new Map<string, KeyPerson>();
  for (const person of all) {
    const key = person.name.toLowerCase();
    const existing = merged.get(key);
    merged.set(key, {
      name: existing?.name ?? person.name,
      title: existing?.title ?? person.title,
      description: existing?.description ?? person.description,
    });
  }
  return uniqueBy([...merged.values()], (p) => p.name)
    .slice(0, 10)
    .map((p) => ({ ...p, role: roleFor(p.title) }));
}
