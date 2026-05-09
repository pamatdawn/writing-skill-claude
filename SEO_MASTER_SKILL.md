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

**Infrastructure:** `seo_assets/drive_helper.gs` is a Google Apps Script Web App that creates
files directly inside the "SEO copy writing" folder and appends rows to the tracker.
Set the deployed URL in the constant below before using.

```
DRIVE_WEBAPP_URL = https://script.google.com/macros/s/AKfycbzOxpH1Pgmse-_u2JYqpPpudb55tBvOhJyoAdzhJvPNYg638oWVUBKaJo0TdhD_q9WSVA/exec
TARGET_FOLDER   = "SEO copy writing" (ID: 1MwJgOscu-0-Pr4xA4cJGB8sfPoEo_Xu5)
```

### Step 5a — Create Google Doc via Web App

```bash
curl -s -X POST "DRIVE_WEBAPP_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"create_doc\",\"title\":\"YYYY-MM-DD Topic — keyword\",\"content\":\"ARTICLE_TEXT\"}"
```

Response: `{"success":true,"docId":"...","url":"https://docs.google.com/document/d/.../edit"}`

### Step 5b — Append row to tracker via Web App

```bash
curl -s -X POST "DRIVE_WEBAPP_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"append_tracker\",\"date\":\"YYYY-MM-DD\",\"topic\":\"...\",\"keyword\":\"...\",\"docUrl\":\"...\",\"status\":\"Draft\"}"
```

The script finds (or creates) `Content_Production_Tracker` inside the target folder and
appends one row. No read → recreate hack needed — it uses `SpreadsheetApp.appendRow()` directly.

| Column | Value |
|--------|-------|
| Date | `YYYY-MM-DD` (today) |
| Topic | Article topic |
| Primary Keyword | Target keyword |
| Google Docs Link | URL from Step 5a |
| Status | `Draft` |

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
| DRIVE_WEBAPP_URL not set | Deploy `seo_assets/drive_helper.gs` and paste URL into skill |
| Web App returns 401/403 | Redeploy script: Execute as Me, Access Anyone |
| Google Drive folder not found | Update `FOLDER_ID` in `drive_helper.gs` and redeploy |
| Sheet not found | Script auto-creates tracker on first `append_tracker` call |
| User skips keyword input | AI infers from topic; confirm before writing |
| Word count exceeds target | Trim FAQs and redundant sub-points first |
