---
description: Write a full SEO-optimized blog post in US English with E-E-A-T signals, then publish it as a Google Doc inside the "SEO copy writing" Drive folder and log it in Content_Production_Tracker.
---

Run the full SEO blog writing pipeline for the topic: $ARGUMENTS

Follow every phase in `SEO_MASTER_SKILL.md` (co-located with this skill) exactly:

**Phase 0** — Confirm or infer: topic, primary keyword, secondary keywords, target audience, search intent, target word count (default 1,500–2,500).

**Phase 1** — Build a hierarchical outline (H1 → H2 → H3) with FAQs section targeting People Also Ask.

**Phase 2** — Write the full article in US English following all on-page SEO rules: keyword in title/H1/first 100 words, density 0.8–1.5%, 2+ internal link placeholders ([INTERNAL LINK: topic]), 1–2 authoritative external links, FAQs with 3–5 questions.

**Phase 3** — Apply E-E-A-T signals from `templates/eeat_framework.md` (co-located with this skill): first-hand experience example, cited statistics with year+source, author bio block, disclaimer if YMYL topic.

**Phase 4** — Self-check the final review checklist before publishing.

**Phase 5** — Publish via Apps Script Web App:

DRIVE_WEBAPP_URL = https://script.google.com/macros/s/AKfycbzOxpH1Pgmse-_u2JYqpPpudb55tBvOhJyoAdzhJvPNYg638oWVUBKaJo0TdhD_q9WSVA/exec

Step 5a — POST to create_doc using PowerShell Invoke-WebRequest:
- action: "create_doc"
- title: "YYYY-MM-DD Topic — primary keyword"
- content: full article text

Step 5b — POST to append_tracker using the doc URL from Step 5a:
- action: "append_tracker"
- date, topic, keyword, docUrl, status: "Draft"

**Output format:**
=== SEO ARTICLE COMPLETE ===
Title:           [title]
Primary Keyword: [keyword]
Word Count:      [N] words
Meta Description:[meta]
Google Doc URL:  [url]
Tracker Updated: ✓
=== END ===
