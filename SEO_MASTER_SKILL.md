# SEO Master Skill — Professional Blog Writing System

## Overview

This skill defines the complete workflow for producing SEO-optimized blog content in US English. Every article follows E-E-A-T principles, on-page SEO best practices, and a structured publishing pipeline that writes content to Google Docs and logs it in a Google Sheet tracker.

---

## Trigger

Invoke this skill when the user says any of:
- `/seo-write <topic>`
- "Write a blog post about …"
- "Create SEO content for …"

---

## Phase 0 — Intake & Keyword Research

**Inputs required from user (or AI-inferred if not given):**
| Field | Description |
|-------|-------------|
| `topic` | The subject of the article |
| `primary_keyword` | Main target keyword (exact match) |
| `secondary_keywords` | 3–5 supporting LSI or related terms |
| `target_audience` | Who is reading this |
| `intent` | Informational / Navigational / Commercial / Transactional |
| `word_count` | Default: 1,500–2,500 words |

**AI tasks:**
1. Confirm or suggest a primary keyword with estimated search intent.
2. Propose a title using the formula: `[Primary Keyword]: [Benefit/Hook] (+ Year if evergreen)`.
3. Identify 3 competitor content gaps to address.

---

## Phase 1 — Article Architecture (Outline)

Produce a hierarchical outline before writing:

```
H1: [Title]
  H2: Introduction
  H2: [Section A]
    H3: [Sub-point 1]
    H3: [Sub-point 2]
  H2: [Section B]
    H3: ...
  H2: [Section C]
  H2: Conclusion
  H2: FAQs (3–5 questions — targets People Also Ask)
```

**Rules:**
- Every H2 targets a secondary keyword or related query.
- Limit H2 sections to 5–7 per article.
- FAQs use question-format headers (starts with How/What/Why/Can).

---

## Phase 2 — Writing Standards

### Voice & Tone
- **Language:** US English (American spelling — "optimize" not "optimise").
- **Tone:** Authoritative yet conversational; avoid passive voice >20% of sentences.
- **Reading level:** Flesch-Kincaid Grade 8–10.
- **Person:** Second person ("you", "your") for engagement.

### On-Page SEO Rules
| Element | Requirement |
|---------|-------------|
| Title tag | 50–60 chars, primary keyword in first 60% |
| Meta description | 140–160 chars, primary keyword + CTA |
| H1 | Exact or close variant of primary keyword |
| Keyword density | Primary keyword: 0.8–1.5% of total words |
| First 100 words | Primary keyword must appear naturally |
| Internal links | Minimum 2 per article (use `[INTERNAL LINK: topic]` placeholder) |
| External links | 1–2 authoritative sources (.gov, .edu, top-tier publications) |
| Image alt text | Describe image + include keyword where natural |

### Readability
- Sentences: average <20 words.
- Paragraphs: maximum 3–4 sentences.
- Use numbered lists and bullet points for scannable content.
- Use bold for key terms on first mention.

---

## Phase 3 — E-E-A-T Integration

Load and apply `seo_assets/templates/eeat_framework.md` for every article.

Quick checklist:
- [ ] Author bio or "written by expert" signal included
- [ ] At least one first-person experience anecdote or data point
- [ ] Statistics cited from primary sources (with year)
- [ ] Trust signals: HTTPS note, disclaimer, or publication date visible
- [ ] Authoritative outbound link included

---

## Phase 4 — Final Review Checklist

Before publishing, verify:
- [ ] Title: 50–60 chars with primary keyword
- [ ] Meta description: 140–160 chars with CTA
- [ ] H1 contains primary keyword
- [ ] Intro paragraph: keyword in first 100 words
- [ ] Word count within target range
- [ ] All H2/H3 headers use sentence case
- [ ] No keyword stuffing (density check)
- [ ] 2+ internal link placeholders
- [ ] 1–2 external authoritative links
- [ ] FAQs section with 3–5 questions
- [ ] E-E-A-T signals present (see Phase 3)

---

## Phase 5 — Publishing Pipeline (Google Drive Automation)

After the article passes the Phase 4 checklist:

> **Drive Note:** The Google Drive MCP places files at the Drive root level.
> The "SEO copy writing" folder (ID: `1MwJgOscu-0-Pr4xA4cJGB8sfPoEo_Xu5`) is on a
> Shared Drive; the MCP does not pass `supportsAllDrives=true`, so direct-folder
> creation is blocked. Files land at Drive root — move them into the folder manually
> if needed, or use a Google Apps Script integration for fully automated placement.

### Step 5a — Create Google Doc
1. Create a new Google Doc at Drive root named: `[YYYY-MM-DD] [Topic] — [Primary Keyword]`
2. Write the full article content (heading hierarchy preserved as plain text headings).
3. Return the Google Docs URL to the user.

### Step 5b — Update Content Tracker
**Tracker:** Content_Production_Tracker (ID: `1sqpK2mHqtfgqatbqzMybv355k4f8bP5hmwpbaqb1oR4`)
URL: https://docs.google.com/spreadsheets/d/1sqpK2mHqtfgqatbqzMybv355k4f8bP5hmwpbaqb1oR4/edit

**Append procedure** (Drive MCP has no update API — use read → recreate):
1. Read current tracker with `read_file_content` (file ID above).
2. Parse existing rows from the returned table.
3. Create a new `Content_Production_Tracker` file (CSV → auto-converts to Sheet) with all
   existing rows **plus** one new row:

| Column | Value |
|--------|-------|
| Date | `YYYY-MM-DD` (today) |
| Topic | Article topic |
| Primary Keyword | Target keyword |
| Google Docs Link | URL from Step 5a |
| Status | `Draft` |

4. The newly created sheet becomes the active tracker — note its file ID for the next run.

---

## Output Format (per article)

```
=== SEO ARTICLE COMPLETE ===

Title:           [Title]
Primary Keyword: [Keyword]
Word Count:      [N] words
Meta Description:[Meta]

Google Doc URL:  [URL]
Tracker Updated: ✓ Row appended to Content_Production_Tracker

=== END ===
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Google Drive folder not found | Create "SEO copy writing" folder, then proceed |
| Sheet not found | Create "Content_Production_Tracker" sheet in target folder |
| User skips keyword input | AI infers from topic; confirm before writing |
| Word count exceeds target | Trim FAQs and redundant sub-points first |
