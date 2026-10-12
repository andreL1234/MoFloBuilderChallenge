# LLM Enrichment Prompts for MoKnowledge

These example prompts demonstrate how MoKnowledge data would be fed to Claude (or another LLM) to generate enriched content and refined knowledge base fields.

---

## Prompt 1: Generate Compelling Company Pitch

**Purpose:** Take raw website content and synthesize a compelling pitch (2-3 sentences that make a prospect *want* to learn more)

**Input Data from MoKnowledge:**
- `foundation.overview` - Company description
- `thinkBigger.uniqueSellingPropositions` - Extracted USPs
- `thinkBigger.contentThemes` - Recurring messaging themes
- `marketAndCustomers.customerNeeds` - Pain points they solve

**Prompt:**

```
You are a marketing copywriter. Based on the following company information, 
write a compelling 2-3 sentence pitch that would appear on their homepage. 
The pitch should grab attention, state unique value, and make the reader want 
to take action.

Company: {companyName}
Industry: {foundation.industry}
Business Model: {foundation.businessModel}

What they do (raw): {foundation.overview}

Key themes they emphasize: {thinkBigger.contentThemes.join(", ")}

Their unique advantages: {thinkBigger.uniqueSellingPropositions.join("; ")}

Customer pain points they solve:
{marketAndCustomers.customerNeeds.map(n => "- " + n).join("\n")}

Guidelines:
- Use active voice and power words
- Avoid jargon and generic phrases
- Start with an insight or problem statement, not the company name
- Include at least one concrete benefit
- End with a clear action or promise

Pitch:
```

**Example Output for Account-it Consulting:**
```
Overwhelmed by tax complexity? Account-it Consulting leverages 14+ years of 
CFO expertise to transform tax season from a source of stress into strategic 
advantage—turning your financial chaos into confidence and real tax savings. 
Your business deserves better than generic accounting advice.
```

---

## Prompt 2: Classify and Refine Industry Category

**Purpose:** Take raw industry data and classify into standardized categories for better content matching

**Input Data:**
- `foundation.industry` - What they provided
- `thinkBigger.contentThemes` - Topics they discuss
- `offerings[*].category` - Service categories
- Raw website content snippet

**Prompt:**

```
You are a business classification expert. Based on the company information below, 
classify the primary industry and sub-industries they operate in. This helps us 
generate content that resonates with their actual market context.

Company: {companyName}
Raw Industry: {foundation.industry}
Services: {offerings.map(o => o.name).join(", ")}
Topics they discuss: {thinkBigger.contentThemes.slice(0, 8).join(", ")}

Website excerpt (first 300 chars of content):
{websiteContent.substring(0, 300)}...

Classify as JSON:
{{
  "primary_industry": "string (e.g., 'Accounting & Tax Services')",
  "sub_industries": ["array of 2-3 specific sectors"],
  "business_type": "B2B | B2C | B2B2C",
  "maturity_stage": "early_stage | growth | established | mature",
  "target_company_size": "solo | small (1-10) | mid (11-100) | enterprise",
  "confidence": 0-1
}}

Classification:
```

**Example Output:**
```json
{
  "primary_industry": "Accounting & Tax Services",
  "sub_industries": ["Tax Preparation", "Business Consulting", "Payroll Management"],
  "business_type": "B2B",
  "maturity_stage": "established",
  "target_company_size": "small (1-10)",
  "confidence": 0.92
}
```

---

## Prompt 3: Extract Target Customer Personas

**Purpose:** Transform raw market/customer data into detailed buyer personas for segment-specific content

**Input Data:**
- `marketAndCustomers.targetBuyers` - Who buys
- `marketAndCustomers.customerNeeds` - What they need
- `marketAndCustomers.idealPersona` - Persona description
- `offerings[*]` - What's being sold

**Prompt:**

```
You are a customer research analyst. Based on the company's target market data, 
define 2-3 distinct customer personas that MoMail and MoSocial should target 
separately. Each persona drives different messaging.

Company: {companyName}

Target Buyers: {marketAndCustomers.targetBuyers.join("; ")}

Services they offer:
{offerings.map(o => `- ${o.name}: ${o.description}`).join("\n")}

Customer needs they solve:
{marketAndCustomers.customerNeeds.join("\n")}

Ideal persona description: {marketAndCustomers.idealPersona}

For each persona, provide:
{{
  "persona_name": "string",
  "job_title": "string",
  "company_size": "string",
  "pain_point": "string (1-2 sentences)",
  "buying_trigger": "what event makes them search for this service",
  "messaging_angle": "how this persona should be addressed",
  "content_preference": "email | social | video | long-form"
}}

Personas (return as JSON array):
```

**Example Output for Account-it:**
```json
[
  {
    "persona_name": "Sarah, the Stressed Startup Founder",
    "job_title": "CEO/Founder",
    "company_size": "1-5 employees",
    "pain_point": "Just incorporated and drowning in compliance/tax questions with zero time to figure it out",
    "buying_trigger": "Incorporated business or significant revenue growth",
    "messaging_angle": "Friendly, approachable, 'we handle the boring stuff so you can focus on your business'",
    "content_preference": "short-form social + email workflows"
  },
  {
    "persona_name": "Marcus, the Retirement-Ready Owner",
    "job_title": "Business Owner",
    "company_size": "10-50 employees",
    "pain_point": "Running a profitable business but unsure about tax strategy, exit planning, or wealth preservation",
    "buying_trigger": "Market shift, succession questions, or major business event",
    "messaging_angle": "Strategic, confident, 'unlock your financial potential in the next chapter'",
    "content_preference": "long-form articles + LinkedIn thought leadership"
  }
]
```

---

## Prompt 4: Generate Social Media Themes

**Purpose:** Suggest specific social media angles and themes aligned with the company's content strategy

**Input Data:**
- `thinkBigger.contentThemes` - What they talk about
- `thinkBigger.uniqueSellingPropositions` - What makes them different
- `positioning.foundingStory` - Their origin/mission
- `marketAndCustomers.channels` - How they communicate

**Prompt:**

```
You are a social media strategist for {companyName}. Based on their content 
themes and unique positioning, suggest 6-8 specific social media content pillars 
and themes. These guide topic selection for LinkedIn, Twitter, and Instagram posts.

Company: {companyName}
Industry: {foundation.industry}

Content themes they emphasize: {thinkBigger.contentThemes.slice(0, 8).join(", ")}

Key differentiators/USPs:
{thinkBigger.uniqueSellingPropositions.map(u => `- ${u}`).join("\n")}

Founding story: {positioning.foundingStory}

For each theme, provide:
{{
  "theme": "string (e.g., 'Founder wisdom & lessons learned')",
  "description": "string (why this theme resonates)",
  "post_types": ["Educational tip", "Behind-the-scenes", "Customer story", etc.],
  "frequency": "2-3 per week | 1 per week | biweekly",
  "platforms": ["LinkedIn", "Twitter", "Instagram"]
}}

Suggested themes (return as JSON array):
```

**Example Output for Bee Cave Drilling:**
```json
[
  {
    "theme": "Well Water Science 101",
    "description": "Educational content demystifying water well systems for homeowners",
    "post_types": ["Quick tips", "Before/after photos", "FAQ answers"],
    "frequency": "2-3 per week",
    "platforms": ["Instagram", "Facebook"]
  },
  {
    "theme": "Texas Hill Country Living",
    "description": "Lifestyle content celebrating the region and homeowner community",
    "post_types": ["Local spotlight", "Seasonal tips", "Customer stories"],
    "frequency": "2-3 per week",
    "platforms": ["Instagram", "Facebook"]
  },
  {
    "theme": "Transparent Pricing & Fair Dealing",
    "description": "Content reinforcing their competitive advantage (honest pricing, no surprises)",
    "post_types": ["Cost breakdown", "Myth-busting", "Customer testimonial"],
    "frequency": "1 per week",
    "platforms": ["LinkedIn", "Facebook"]
  }
]
```

---

## Prompt 5: Identify Content Gaps & Opportunities

**Purpose:** Highlight what the company *should* be talking about but currently isn't

**Input Data:**
- All extracted fields from knowledge base
- Content themes extracted
- Industry groupings
- Competitor signals (if available)

**Prompt:**

```
You are a content strategist. Analyze this company's current message positioning 
and identify content gaps—topics they should be discussing but currently aren't.

Company: {companyName}
Industry: {foundation.industry}
Key offerings: {offerings.map(o => o.name).join(", ")}

What they currently emphasize:
{thinkBigger.contentThemes.join(", ")}

Industry norms (things {industryType} companies typically discuss):
{industryGroupings.map(g => `- ${g}`).join("\n")}

Identify 3-4 content gap opportunities as JSON:
{{
  "gap": "string (the topic/message)",
  "why_important": "string (why audience cares)",
  "current_status": "not mentioned | mentioned once | partially addressed",
  "content_idea": "string (a specific post/article idea)",
  "priority": "high | medium | low"
}}

Content gaps (return as JSON array):
```

**Example Output:**
```json
[
  {
    "gap": "Well maintenance & longevity (preventing expensive repairs)",
    "why_important": "Homeowners fear future costs; preventive messaging builds trust",
    "current_status": "mentioned once",
    "content_idea": "'5-year well maintenance checklist' email series for past customers",
    "priority": "high"
  },
  {
    "gap": "Permitting process demystification",
    "why_important": "Regulatory fear is a barrier to action; transparency = competitive advantage",
    "current_status": "not mentioned",
    "content_idea": "'What the county really cares about' article addressing common concerns",
    "priority": "high"
  }
]
```

---

## Implementation Notes

### When to Use These Prompts

1. **Pitch Generation** → Used when creating knowledge base, not per-post
2. **Classification** → Runs once during knowledge base creation, enables segmentation
3. **Personas** → Reference for all downstream content (MoSocial/MoMail)
4. **Social Themes** → Monthly strategic planning, not per-post
5. **Content Gaps** → Quarterly planning meetings, informs editorial calendar

### Cost Optimization

These are batch operations (not per-post):
- Pitch generation: 1x per company
- Personas: 1x per company
- Social themes: 1x per quarter
- Total: ~$0.10-0.30 per company for full enrichment

### Quality Expectations

Add confidence indicators:
- "This persona is suggested by AI based on market data—should be validated with actual customer interviews"
- "Content gaps identified by analyzing industry trends—test before committing editorial time"

### Integration with MoKnowledge Schema

These prompts output can be stored back into the schema:
```typescript
thinkBigger: {
  personas?: Persona[],
  socialThemes?: SocialTheme[],
  contentGaps?: ContentGap[],
  pitch_ai_generated?: string,
  confidence_notes?: string
}
```

---

## Tips for Effective Prompting

1. **Be Specific** - Pass exact extracted data, not summaries
2. **Give Context** - Include industry, size, stage so LLM understands constraints
3. **Request Structure** - JSON output enables programmatic use
4. **Include Examples** - Show the expected format in the prompt
5. **Add Guardrails** - "Avoid jargon," "Be specific, not generic," confidence scores
6. **Validate Always** - LLM output is suggestions, not truth—surface for human review
