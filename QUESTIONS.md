# MoKnowledge: Answers to the Required Questions

## 1. What approach did you take to scraping and structuring the knowledge base data?

I built a rule-based scraper in four steps: **fetch, extract, classify, assemble**.

- **Fetch.** A Next.js API route downloads pages on the server, since browsers block cross-site requests. I read the homepage, then follow its links to up to five pages that usually hold the important details: About, Services, Contact, Team, FAQ, and Reviews. Reading only the homepage missed most of the address, staff, and story information.
- **Extract.** Each page is parsed once, and small functions each pull one kind of data: contact info, offerings, people, testimonials, brand colors, and so on. The most reliable source turned out to be schema.org structured data, which many small-business sites already include for Google. It gives clean address, phone, founding date, FAQs, and reviews.
- **Classify.** Industry and business model are chosen by counting keyword matches, with the title, description, headings, and CTA buttons weighted higher. The confidence score reflects how clearly one category won.
- **Assemble.** Everything goes into one typed `Knowledge` object that follows the assignment's categories.

I also tag **where every value came from**: read from the site, derived by a rule, a mock AI placeholder, or edited by a person. When a knowledge base feeds AI content generation, knowing which facts are verified matters as much as the facts themselves.

## 2. What information beyond the baseline did you include, and why?

I picked additions that make generated content more specific and believable:

- **Content themes.** Repeated two-word phrases like "water well" or "craft beer". These tell MoBlogs and MoSocial what the business actually talks about.
- **Key headlines and CTAs.** The site's own headlines and button text ("Request Estimate", "Book a Private Event"), so generated content uses the same calls to action.
- **Unique selling points and trust signals.** "Since 1980", "licensed and insured", warranties. These are proof points for emails and posts.
- **Testimonials, rating, and FAQs.** Real customer language, and the questions customers actually ask. FAQs become blog topics.
- **Writing style and art style, measured rather than guessed.** Average sentence length, "you" vs "we" voice, palette mood, serif vs sans-serif fonts, how photo-heavy the site is. This keeps generated text and images on-brand.
- **Funnels and channels.** Quote request, booking, phone, newsletter, so each app knows which conversion action to push.
- **Provenance and completeness.** Where each value came from and how complete the record is, so apps can avoid repeating unverified claims.

## 3. How would this improve MoSocial, MoMail, and MoBlogs?

- **MoSocial:** writes about the company's real themes and proof points instead of generic industry filler, and links to the right social profiles. Colors, fonts, and art style guide the images.
  *Example:* Bee Cave Drilling posts can mention "serving the Texas Hill Country since 1980" and use their actual services (well drilling, permitting, water well service).
- **MoMail:** knows the audience and the main conversion action (e.g. "Request Estimate"), so emails end with the CTA the business actually uses. Testimonials work as social proof, and the measured writing style keeps the tone consistent.
- **MoBlogs:** turns FAQs, offerings, and the founding story into articles.
  *Example:* Bee Cave's story (started in 1980 in the back room of the founders' house) is a ready-made "About us" post. Vista Brewing's FAQs ("Is Vista dog-friendly?") are ready-made blog topics.

Because every field is tagged with its source, all three apps can repeat stated facts confidently and treat inferred ones more carefully.

## 4. What would you improve with more time?

1. **Real AI enrichment.** Use Prompt 0 in `prompts/EXAMPLE_PROMPTS.md` to fill the gaps rules can't, with an evidence quote for every value, and replace the mock placeholders.
2. **A database.** Move from browser storage to the Supabase design in `docs/DATABASE_SCHEMA.md`: accounts, version history, rollback.
3. **JavaScript-rendered sites.** Use a headless browser for sites that build their content after loading.
4. **More sources.** Google Business Profile, review sites, and social accounts.
5. **Accuracy testing.** A set of known websites with expected values, to measure extraction accuracy and catch regressions when rules change.
6. **Background scraping** with retries and rate limits, so big batches don't block the page.

## 5. What was the most challenging part?

**Telling real business information apart from everything else on a web page.**

Websites are full of text that isn't about the business: menus, cookie banners, hidden terms-of-service popups, code, and theme defaults. Early versions got fooled constantly:
- Almost every site was labeled "Accounting & Tax" because the word "tax" appears inside WordPress code ("taxonomy").
- A brewery's link was read as an X/Twitter profile because its domain ends in "x.com".
- An accountant's site showed its *website vendor's* address and emails, which came from a hidden legal popup.
- A drilling company's brand colors were actually WordPress's default color palette.

The fix was to strip out non-content parts first, match whole words only, and check results against several real sites after each change. The other challenge was being honest about uncertainty. Rather than filling every field with a guess, the app leaves fields empty when nothing was found, and labels anything that's derived or a mock AI placeholder.
