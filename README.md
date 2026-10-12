# MoKnowledge - Company Knowledge Base Builder

A web-based tool that scrapes company websites and transforms extracted data into structured, comprehensive knowledge bases for AI-powered content generation.

## Overview

MoKnowledge is a critical part of the MoFlo Cloud platform. It automates the initial data collection when new customers sign up, building the foundation that powers all downstream applications (MoSocial, MoMail, MoBlogs).

**Key Features:**
- Real website scraping with intelligent HTML parsing
- Structured data extraction across multiple business dimensions
- Interactive UI for review, editing, and enhancement
- JSON export for integration with backend systems
- localStorage persistence for current session
- Multiple view modes (cards, table, detail)
- Search and filter functionality

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** React Context + Hooks
- **Storage:** localStorage (JSON serialized)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Home/landing page
│   ├── globals.css             # Global styles
│   └── knowledge/
│       ├── page.tsx            # Build/Scrape page
│       └── view/
│           └── page.tsx        # View/Manage page
├── components/
│   ├── KnowledgeForm.tsx       # URL input & scrape trigger
│   ├── KnowledgeDisplay.tsx    # Structured results display
│   ├── KnowledgeEditor.tsx     # Edit interface with JSON preview
│   └── KnowledgeList.tsx       # Browse/manage saved bases
├── types/
│   └── knowledge.ts            # Complete TypeScript schema
├── utils/
│   ├── scraper.ts             # HTML fetch with error handling
│   ├── parser.ts              # HTML parsing & data extraction
│   └── storage.ts             # localStorage persistence & export
└── context/
    └── KnowledgeContext.tsx    # State management provider
```

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone and install dependencies
git clone <repo-url>
cd MoFloBuilderChallenge
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

## Usage

### Building a Knowledge Base

1. Navigate to `/knowledge` (or click "Build" in navigation)
2. Enter a company website URL
3. Click "Scrape" to extract data
4. Review the extracted information
5. Click "Edit & Save" to modify and finalize
6. Download JSON or save to knowledge base

### Viewing & Managing

1. Navigate to `/knowledge/view` (or click "View" in navigation)
2. Use search/filter to find knowledge bases
3. Switch between view modes: Cards, Table, or Detail
4. Edit, export, or delete knowledge bases

## Knowledge Base Schema

### Core Categories (Baseline)

**Company Foundation**
- Overview/description
- Website, industry, business model, company role
- Year founded, legal entity type, employee count
- Addresses and service locations
- Alternative company names

**Positioning**
- Company pitch (compelling summary)
- Founding story

**Market & Customers**
- Target buyer personas
- Customer needs and pain points
- Ideal customer description
- Industry groupings
- Channels, funnels, CTAs
- Suppliers/partners

**Branding & Style**
- Writing style (tone, voice, language patterns)
- Art style description
- Font families
- Brand colors (hex values)
- Logo URLs

**Online Presence**
- Social media links (LinkedIn, Facebook, Twitter/X, Instagram, YouTube, TikTok)

**Key People**
- Names, titles, roles, gender
- Background descriptions
- LinkedIn profiles

**Offerings**
- Products/services with descriptions
- Features and pricing
- Service categorization

### "Think Bigger" Extensions

These fields add value across all downstream applications:

**Content Themes & Topics**
- Recurring keywords and topics from website content
- Helps MoSocial/MoMail/MoBlogs align with company messaging

**Unique Selling Propositions**
- Competitive differentiators extracted from positioning
- Key benefits and value drivers
- Supports messaging consistency

*(Future enhancements: Testimonials/reviews, Awards/certifications, FAQs, Community values)*

## Scraping Approach

### Extraction Strategy

The scraper extracts data using multiple signals:

1. **Metadata Extraction** - Title, descriptions, OG tags
2. **Social Media Detection** - Identifies links to social platforms
3. **Logo Extraction** - Finds company logos from image alt text
4. **Color Extraction** - Parses CSS for brand colors
5. **Content Analysis** - Text parsing for themes and USPs
6. **Phone Number Extraction** - Regex-based contact detection

### Fallback Strategies

When specific information isn't available:
- Confidence scores indicate data quality
- "Unknown" values for missing fields
- Empty arrays for multi-item fields
- Original website URL preserved for reference
- Timestamp for data freshness tracking

### Data Quality

- **Confidence Score:** Estimate of extraction reliability (0-1)
- **Source Tracking:** Original URL stored with every knowledge base
- **Timestamp:** Both scrape time and last update time recorded

## Prompting Strategy for LLM Enrichment

The schema is designed to feed into LLM prompts for content generation. Example prompts:

### Prompt 1: Generate Company Pitch

```
Based on the company's website content and values, generate a compelling 
2-3 sentence pitch that a potential customer would find persuasive.

Company Overview: {foundation.overview}
Content Themes: {thinkBigger.contentThemes}
USPs: {thinkBigger.uniqueSellingPropositions}

Pitch should be professional, highlight unique value, and avoid generic language.
```

### Prompt 2: Extract Writing Style Profile

```
Analyze the following website content and describe the company's brand voice.
Identify: tone, language formality, key phrases, personality traits.

Website Content: {extracted_text}

Output should be 2-3 sentences describing the writing style for consistency 
across social media and email content.
```

### Prompt 3: Identify Target Persona Messaging

```
Based on the company information, describe the ideal customer persona 
and what messaging resonates with them.

Market Data: {marketAndCustomers}
Offerings: {offerings}
Pitch: {positioning.pitch}

Focus on pain points, values, and motivations that should drive content creation.
```

## Data Quality Thinking

### Handling Incomplete Data

1. **Partial Extraction:** Confidence score reflects what was found
2. **Manual Enhancement:** Editor allows adding missing data
3. **Validation:** Key fields have sensible defaults
4. **Transparency:** Timestamps and source URLs help track data origin

### Validation Rules

- Company name: Required (from title tag or domain)
- Website URL: Required and validated before scraping
- Overview: Filled with description or first content
- Foundation fields: Default to "Unknown" if not found
- Arrays: Default to empty `[]` if not found

## Knowledge Enrichment Ideas (Future Work)

Beyond the baseline schema, consider adding:

1. **Competitor Analysis**
   - Direct competitors identified from website
   - Market positioning relative to competitors

2. **Customer Success Metrics**
   - ROI/results mentioned in case studies
   - Key performance indicators tracked

3. **Industry Benchmarks**
   - Industry standards for pricing/service levels
   - Growth trends and market outlook

4. **Content Calendar Signals**
   - Blog frequency and topics
   - Seasonal patterns in messaging
   - Launch/campaign announcements

5. **Compliance & Trust Signals**
   - Certifications and awards
   - Privacy policies and data handling
   - Industry compliance mentions

6. **Financial Indicators**
   - Funding information if public
   - Pricing model (freemium, subscription, one-time)
   - Package tiers and upgrade paths

## Assumptions & Limitations

### Assumptions

1. **Websites are publicly accessible** - No authentication required
2. **Content is in English** - Text analysis optimized for English
3. **Data extraction is best-effort** - Websites vary in structure
4. **Single-session storage** - localStorage for MVP, not production persistence
5. **No external API calls** - All processing client-side or via simple fetch

### Limitations

1. **Timeout of 15 seconds** - Very large or slow websites may timeout
2. **JavaScript-rendered content** - Only fetches HTML, no client-side JS execution
3. **Rate limiting** - No built-in rate limiting for production use
4. **Authentication-required content** - Cannot scrape behind login
5. **CORS restrictions** - Limited by browser security policies
6. **Single-pass parsing** - No multi-depth crawling across site
7. **Storage capacity** - localStorage has ~5-10MB limit per domain

## How This Schema Improves Downstream Applications

### MoSocial (Social Content Generation)

- **Content Themes:** Identifies topics the company discusses → relevant social posts
- **USPs:** Extracts key benefits → compelling social claims
- **Branding:** Colors/fonts → visual consistency
- **CTAs:** Discovers action prompts → native social calls-to-action

### MoMail (Email Content Generation)

- **Pitch:** Foundation for email subject lines and hooks
- **Market & Customers:** Identifies ideal audience and pain points
- **Offerings:** Generates product-focused email flows
- **Online Presence:** Links for email footer/social proof

### MoBlogs (Blog Content Generation)

- **Content Themes:** Suggests blog topics aligned with company voice
- **Industry Groupings:** Identifies relevant industry trends
- **Key People:** Sources for expert bio sections
- **Founding Story:** Long-form content opportunity

## Future Improvements (If More Time)

1. **Supabase Integration**
   - Persistent database for multi-session use
   - Row-level security for multi-tenant access
   - Version control for knowledge base updates

2. **Advanced Scraping**
   - JavaScript rendering for dynamic content
   - Multi-page crawling
   - Media extraction (images, videos)

3. **AI Enrichment**
   - Live LLM API integration for enhanced extraction
   - Automatic field completion and classification
   - Content summarization

4. **Import/Export**
   - Bulk upload from CSV/spreadsheet
   - Sync with CRM systems
   - API endpoint for programmatic access

5. **Collaboration**
   - Multi-user editing with version history
   - Comments and annotations on fields
   - Approval workflows

6. **Analytics**
   - Track which fields are most commonly edited
   - Identify patterns in data quality
   - Performance metrics on scraping accuracy

## Testing

The application has been tested with:
- Form validation (URL format, empty input)
- Error handling (network timeouts, invalid URLs)
- localStorage persistence (reload page)
- Multiple view modes and search/filter
- TypeScript strict mode compliance
- Responsive design on mobile/tablet/desktop

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

ISC

---

**Questions Answered:** See `QUESTIONS.md` for responses to assignment requirements.
