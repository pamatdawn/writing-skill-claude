# writing-skill-claude

A Claude Code workspace for SEO blog writing, content reviewing, and
infographic generation. Two sub-agents (`seo_reviewers`,
`infographic_generator`) orchestrate five composable skills and run in
parallel on any article you provide.

## What's inside

```
.claude/
├── agents/
│   ├── seo_reviewers.md             — Combines seo-geo + seo-content into one review
│   └── infographic_generator.md     — Runs data-visual-mapping → svg-renderer
├── commands/seo-write.md            — /seo-write slash command (publish a Google Doc)
└── skills/
    ├── seo-write/                   — End-to-end blog writing + Drive publish pipeline
    │   ├── SKILL.md
    │   ├── SEO_MASTER_SKILL.md      — Master playbook followed by /seo-write
    │   ├── drive_helper.gs          — Apps Script Web App for Drive publishing
    │   └── templates/eeat_framework.md
    ├── seo-geo/                     — Generative Engine Optimization (AI Overviews, ChatGPT, Perplexity)
    ├── seo-content/                 — E-E-A-T scoring + classical content quality
    ├── data-visual-mapping/         — Article → normalized JSON infographic spec
    └── svg-renderer/                — JSON → standalone, self-contained SVG
examples/
├── v1-lantern-festival-cad-branding/  — First pass: 46/100 baseline
└── v2-yi-peng-rebrand/                — After fixes: 72/100 (+26)
docs/
└── conversations/                   — Build-history transcripts
```

## Pipelines at a glance

### 1. SEO writing (single agent)

```
topic ──▶ /seo-write ──▶ Phase 0–4 (outline, draft, E-E-A-T pass)
                  ──▶ Phase 5 (Apps Script POST → Google Doc + tracker row)
```

### 2. Review + infographic (two agents in parallel)

```
article (URL | file | pasted text)
        │
        ├──▶ seo_reviewers ──▶ seo-content + seo-geo ──▶ <slug>-seo-review.md
        │
        └──▶ infographic_generator ──▶ data-visual-mapping ──▶ <slug>-infographic.json
                                  ──▶ svg-renderer        ──▶ <slug>-infographic.svg
```

The two agents share no state, so launch them concurrently in a single
Agent tool call.

## Quick start

1. **Clone the repo into your working directory:**
   ```bash
   git clone https://github.com/pamatdawn/writing-skill-claude.git
   cd writing-skill-claude
   ```
2. **Open it in Claude Code.** The `.claude/agents/` and `.claude/skills/`
   trees are auto-loaded as sub-agents and skills for that project.
3. **(Optional) Deploy the Apps Script** if you want `/seo-write` to publish
   directly to Google Drive — see "Apps Script setup" below.
4. **Ask Claude to review and visualize an article:**
   > "Review and build an infographic for this article: <URL or paste text>"

   Claude will spawn `seo_reviewers` and `infographic_generator` in parallel
   and write the deliverables alongside the article.

## The five skills

| Skill | Output | Adapted from |
|---|---|---|
| `seo-write` | Full SEO blog (1,500–2,500 words), Google Doc, tracker row | This repo |
| `seo-geo` | `GEO-ANALYSIS.md` with platform-specific scores (Google AIO, ChatGPT, Perplexity) | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) (MIT) |
| `seo-content` | Content Quality Score + E-E-A-T breakdown + recommendations | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) (MIT) |
| `data-visual-mapping` | Normalized JSON (template + data + palette) | New here, schema inspired by [antvis/Infographic](https://github.com/antvis/Infographic) |
| `svg-renderer` | Self-contained `.svg` (no scripts, no external fonts/images) | New here |

`svg-renderer` supports `list`, `sequence`, `sequence-interaction`,
`compare-binary`, `compare-swot`, `compare-quadrant`, `hierarchy`,
`chart-line`, `chart-bar`, `chart-pie`, `relation`, and `wordcloud`.

## The two agents

### `seo_reviewers`
Accepts a URL, a local file, or pasted text. Runs `seo-content` and
`seo-geo` over the same source, then consolidates them into one report with
a Combined Score, E-E-A-T breakdown, GEO breakdown, platform readiness, top
five fixes, and concrete passage rewrites.

### `infographic_generator`
Accepts the same inputs. Picks the single most informative template via
`data-visual-mapping`, then renders it via `svg-renderer`. Writes both the
intermediate JSON (so the visual is reproducible) and a standalone SVG.

## Worked example

`examples/v1-lantern-festival-cad-branding/` and
`examples/v2-yi-peng-rebrand/` show a complete review cycle on one real
article. The v1 review found that the article was being optimized for the
zero-volume brand term "CAD Lantern Festival" instead of the search-aligned
"Yi Peng". After a rebrand and an expansion from ~720 to ~1,750 words with
added E-E-A-T signals (first-hand operator schedule attribution, author
bio, FAQ block, FX disclaimer), the combined score rose from **46/100 to
72/100**. v2 also includes a `sequence`-template day-of timeline
infographic alongside the original venue-comparison `list` visual.

## Apps Script setup (optional — only for `/seo-write` publishing)

`.claude/skills/seo-write/drive_helper.gs` is a Google Apps Script Web App
that creates Google Docs in a configured folder and appends rows to a
tracker spreadsheet.

1. Open [script.google.com](https://script.google.com), create a new
   project, and paste the contents of `drive_helper.gs`.
2. Set `FOLDER_ID` to your target Drive folder ID.
3. **Deploy → New deployment → Type: Web App → Execute as: Me →
   Access: Anyone**. Copy the resulting Web App URL.
4. Paste the URL into `.claude/skills/seo-write/SEO_MASTER_SKILL.md` as
   `DRIVE_WEBAPP_URL`.

Note: "Access: Anyone" creates an open endpoint that anyone with the URL
can POST to. Treat the URL like a low-sensitivity credential; rotate
deployments if it leaks.

## Output naming convention

| File | Producer |
|---|---|
| `<slug>-seo-review.md` | `seo_reviewers` |
| `<slug>-infographic.json` | `infographic_generator` (stage 1) |
| `<slug>-infographic.svg` | `infographic_generator` (stage 2) |

## Credits

- **seo-geo** and **seo-content** skills are adapted under MIT from
  [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo).
- **data-visual-mapping** and **svg-renderer** are new to this repo. The
  schema design is loosely inspired by
  [antvis/Infographic](https://github.com/antvis/Infographic), but the IR
  is JSON and the renderer emits raw SVG (no browser/JS runtime required).

## License

The two adapted skills (`seo-geo`, `seo-content`) retain their upstream MIT
license. Other content in this repo follows the same MIT terms unless
noted otherwise in the file's frontmatter.
