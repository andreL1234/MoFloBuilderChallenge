# Database Schema (Supabase / Postgres)

MoKnowledge currently stores knowledge bases in the browser (`localStorage`) so it runs with no setup. This is the schema it would move to in production on Supabase.

## Design goals

1. **Multi-tenant.** A MoFlo customer account (an *organization*) can own several companies — a franchise with multiple locations, or an agency managing clients. Every row carries `organization_id`, and row-level security (RLS) keys off it.
2. **Versioned, never overwritten.** Every save creates a new immutable version. A company points at its *current* version; rolling back means pointing at an older one. MoSocial/MoMail/MoBlogs can record which version a piece of content was generated from.
3. **The document is the source of truth.** The full knowledge base is stored as `jsonb` in exactly the shape of `src/types/knowledge.ts`, so the schema doesn't need a migration every time a field is added. A few hot fields are exposed as generated columns for filtering.
4. **Provenance is first-class.** Where each field came from (extracted / derived / AI / user) and the evidence behind it is queryable, so content apps can choose to repeat only verified facts.
5. **Raw scrapes are kept.** Page text is stored per scrape run, so the extractor can be improved and re-run without re-crawling, and every value can be traced to a page.

## Entity relationships

```
auth.users ─┐
            │ (role)
organizations ──< organization_members
      │
      └──< companies ──< scrape_runs ──< scraped_pages
               │              │
               │              └──────────────┐
               ├──< knowledge_base_versions >┘ (created from a run, or by a manual edit)
               │        │
               │        └──< field_provenance
               │
               └── current_version_id ──> knowledge_base_versions
```

## Tables

```sql
-- Enums -------------------------------------------------------------------
create type member_role as enum ('owner', 'admin', 'editor', 'viewer');
create type scrape_status as enum ('queued', 'running', 'succeeded', 'failed');
create type version_status as enum ('draft', 'published', 'archived');
create type field_source as enum ('extracted', 'derived', 'ai', 'user');

-- Tenancy -----------------------------------------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            member_role not null default 'editor',
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- Companies ---------------------------------------------------------------
create table companies (
  id                 uuid primary key default gen_random_uuid(),
  organization_id    uuid not null references organizations(id) on delete cascade,
  name               text not null,
  primary_domain     text not null,               -- normalized, e.g. "beecavedrilling.com"
  current_version_id uuid,                        -- FK added below (circular reference)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (organization_id, primary_domain)
);

-- Scraping ----------------------------------------------------------------
create table scrape_runs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company_id      uuid not null references companies(id) on delete cascade,
  requested_by    uuid references auth.users(id),
  source_url      text not null,
  status          scrape_status not null default 'queued',
  error           text,
  started_at      timestamptz,
  finished_at     timestamptz,
  created_at      timestamptz not null default now()
);

create table scraped_pages (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  scrape_run_id   uuid not null references scrape_runs(id) on delete cascade,
  url             text not null,
  page_kind       text not null,                  -- home | about | services | contact | team | faq | reviews | other
  http_status     int,
  content_hash    text not null,                  -- skip re-parsing unchanged pages
  html_path       text,                           -- raw HTML in Supabase Storage (bucket: scraped-html)
  visible_text    text,                           -- cleaned text used by extractors and LLM prompts
  fetched_at      timestamptz not null default now(),
  unique (scrape_run_id, url)
);

-- Knowledge base versions -------------------------------------------------
create table knowledge_base_versions (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  company_id        uuid not null references companies(id) on delete cascade,
  version           int not null,
  status            version_status not null default 'draft',
  data              jsonb not null,               -- full Knowledge document (src/types/knowledge.ts)
  completeness      numeric(3,2),                 -- share of baseline fields filled, 0-1
  scrape_run_id     uuid references scrape_runs(id) on delete set null,  -- null for manual edits
  parent_version_id uuid references knowledge_base_versions(id),          -- what this edit started from
  change_summary    text,                         -- e.g. "Edited employee count, added 2 FAQs"
  created_by        uuid references auth.users(id),
  created_at        timestamptz not null default now(),

  -- Generated columns for filtering/sorting without digging into jsonb
  industry          text generated always as (data -> 'foundation' ->> 'industry') stored,
  business_model    text generated always as (data -> 'foundation' ->> 'businessModel') stored,
  company_name      text generated always as (data ->> 'companyName') stored,

  unique (company_id, version)
);

alter table companies
  add constraint companies_current_version_fk
  foreign key (current_version_id) references knowledge_base_versions(id) on delete set null;

-- Where each field's value came from, with evidence for anything not stated verbatim
create table field_provenance (
  version_id      uuid not null references knowledge_base_versions(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  field_path      text not null,                  -- e.g. "marketAndCustomers.idealPersona"
  source          field_source not null,
  evidence        text,                           -- verbatim quote supporting the value
  source_url      text,                           -- page the evidence came from
  confidence      numeric(3,2),
  primary key (version_id, field_path)
);

-- Indexes -----------------------------------------------------------------
create index on companies (organization_id);
create index on scrape_runs (company_id, created_at desc);
create index on scraped_pages (scrape_run_id);
create index on knowledge_base_versions (company_id, version desc);
create index on knowledge_base_versions (organization_id, industry);
create index on knowledge_base_versions using gin (data jsonb_path_ops);  -- e.g. data @> '{"thinkBigger":{"contentThemes":["solar"]}}'
create index on field_provenance (organization_id, source);
```

## Versioning

- **Every save inserts a row** into `knowledge_base_versions` with `version = previous + 1`. Rows are never updated (RLS below allows no `UPDATE` on `data`), so history is complete and auditable.
- **`companies.current_version_id`** points at the version apps should use. Publishing or rolling back is a single update to that pointer.
- **`parent_version_id`** records which version an edit started from, so the UI can show a diff (`jsonb` comparison) and detect two people editing the same version.
- **`scrape_run_id`** is set for scraper-created versions and null for manual edits, so you can tell "the website changed" apart from "a person corrected it".
- Content generated by MoSocial/MoMail/MoBlogs stores the `version_id` it used, so when a fact is corrected you can find content that repeated the old value.

```sql
-- Create the next version atomically (called from the app or an edge function)
create or replace function save_knowledge_version(
  p_company_id uuid, p_data jsonb, p_scrape_run_id uuid default null,
  p_parent_version_id uuid default null, p_summary text default null, p_publish boolean default true
) returns uuid
language plpgsql security invoker as $$
declare
  v_org uuid;
  v_id uuid;
  v_next int;
begin
  select organization_id into v_org from companies where id = p_company_id for update;  -- serialize per company
  select coalesce(max(version), 0) + 1 into v_next from knowledge_base_versions where company_id = p_company_id;

  insert into knowledge_base_versions
    (organization_id, company_id, version, status, data, completeness, scrape_run_id, parent_version_id, change_summary, created_by)
  values
    (v_org, p_company_id, v_next, case when p_publish then 'published' else 'draft' end,
     p_data, (p_data ->> 'confidenceScore')::numeric, p_scrape_run_id, p_parent_version_id, p_summary, auth.uid())
  returning id into v_id;

  if p_publish then
    update companies set current_version_id = v_id, updated_at = now() where id = p_company_id;
  end if;
  return v_id;
end $$;

-- What the content apps read
create view current_knowledge with (security_invoker = true) as
select c.id as company_id, c.organization_id, c.name, c.primary_domain,
       v.id as version_id, v.version, v.data, v.completeness, v.created_at as version_created_at
from companies c
join knowledge_base_versions v on v.id = c.current_version_id;
```

## Row Level Security

Every table has RLS enabled. Membership is checked through one helper so policies stay short and consistent. It is `security definer` so it can read `organization_members` without recursive RLS checks.

```sql
create or replace function has_org_role(p_org uuid, p_roles member_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organization_members
    where organization_id = p_org and user_id = auth.uid() and role = any(p_roles)
  );
$$;

alter table organizations           enable row level security;
alter table organization_members    enable row level security;
alter table companies               enable row level security;
alter table scrape_runs             enable row level security;
alter table scraped_pages           enable row level security;
alter table knowledge_base_versions enable row level security;
alter table field_provenance        enable row level security;

-- Any member can read their organization's data
create policy "members read orgs" on organizations for select
  using (has_org_role(id, array['owner','admin','editor','viewer']::member_role[]));
create policy "members read members" on organization_members for select
  using (has_org_role(organization_id, array['owner','admin','editor','viewer']::member_role[]));
create policy "members read companies" on companies for select
  using (has_org_role(organization_id, array['owner','admin','editor','viewer']::member_role[]));
create policy "members read runs" on scrape_runs for select
  using (has_org_role(organization_id, array['owner','admin','editor','viewer']::member_role[]));
create policy "members read pages" on scraped_pages for select
  using (has_org_role(organization_id, array['owner','admin','editor','viewer']::member_role[]));
create policy "members read versions" on knowledge_base_versions for select
  using (has_org_role(organization_id, array['owner','admin','editor','viewer']::member_role[]));
create policy "members read provenance" on field_provenance for select
  using (has_org_role(organization_id, array['owner','admin','editor','viewer']::member_role[]));

-- Editors and above create companies, request scrapes, and save versions
create policy "editors add companies" on companies for insert
  with check (has_org_role(organization_id, array['owner','admin','editor']::member_role[]));
create policy "editors update companies" on companies for update
  using (has_org_role(organization_id, array['owner','admin','editor']::member_role[]));
create policy "editors request scrapes" on scrape_runs for insert
  with check (has_org_role(organization_id, array['owner','admin','editor']::member_role[]) and requested_by = auth.uid());
create policy "editors save versions" on knowledge_base_versions for insert
  with check (has_org_role(organization_id, array['owner','admin','editor']::member_role[]) and created_by = auth.uid());
create policy "editors write provenance" on field_provenance for insert
  with check (has_org_role(organization_id, array['owner','admin','editor']::member_role[]));

-- Only owners/admins delete companies or manage membership
create policy "admins delete companies" on companies for delete
  using (has_org_role(organization_id, array['owner','admin']::member_role[]));
create policy "admins manage members" on organization_members for all
  using (has_org_role(organization_id, array['owner','admin']::member_role[]));

-- No UPDATE/DELETE policies on knowledge_base_versions or field_provenance: versions are immutable.
-- scraped_pages and scrape_runs status updates are written by the scraping edge function using the
-- service role key, which bypasses RLS; clients can't forge scrape results.
```

**RLS considerations**

- **Denormalized `organization_id`** on every table lets each policy be a single indexed check. The alternative, joining up through company → organization in every policy, is slower and easy to get wrong.
- **Scraping runs server-side** (Supabase Edge Function or the Next.js API route with the service key). The browser only inserts a `scrape_runs` request; it can't write pages or mark runs succeeded.
- **The helper is `security definer`** with a fixed `search_path`, which avoids infinite recursion when policies on `organization_members` need to read `organization_members`.
- **Viewers are read-only.** That fits a client approving their own knowledge base without editing it.
- **Raw HTML lives in Storage**, in a private bucket whose path starts with `organization_id/`, with a matching storage policy.
- **MoFlo's internal tooling** (support, re-running extraction across all customers) uses the service role from trusted backends only.

## How the current app maps to this schema

| App today (`localStorage`) | Production |
|---|---|
| `Knowledge` object in `knowledgeList` | `knowledge_base_versions.data` (published version via `companies.current_version_id`) |
| `knowledge.id` | `companies.id` (stable) + `knowledge_base_versions.id` (per save) |
| `provenance` map | `field_provenance` rows (plus evidence/confidence for AI values) |
| `pagesScraped` | `scraped_pages` rows for the run |
| `confidenceScore` (completeness) | `knowledge_base_versions.completeness` |
| Save in the editor | `save_knowledge_version(...)` |
| Duplicate | New `companies` row whose first version copies `data` |
| Library filters (industry, model) | Generated columns `industry`, `business_model` |
