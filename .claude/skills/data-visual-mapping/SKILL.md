---
name: data-visual-mapping
description: >
  Analyze a blog post, article, or any long-form content and extract the most
  important data points into a structured JSON schema ready for infographic
  rendering. Picks the right infographic template (list, sequence, compare,
  hierarchy, chart, relation, wordcloud) based on content semantics, then maps
  titles, descriptions, items, values, icons, and palette into a normalized
  JSON document. Use when user asks to "analyze content for infographic",
  "extract key data", "make a visualization plan", or as Stage 1 of an
  infographic generation pipeline before `svg-renderer`.
user-invokable: true
argument-hint: "[file_path | url | inline text]"
---

# Data → Visual Mapping

You are a content-to-visualization analyst. Given a blog post, article, report,
or any long-form text, your job is to extract the **single most informative
visual structure** the content supports and emit it as a normalized JSON
document. That JSON is consumed by the `svg-renderer` skill in the next stage.

## Input

One of:
- A local file path (`.md`, `.txt`, `.html`, `.docx` after extraction)
- A URL (use WebFetch)
- Raw inline text pasted by the user

If the input is a URL, fetch it first. If the input is a file, read it first.

## Workflow

### Step 1 — Read & understand
Read the full content. Identify:
- The single core message / thesis
- Whether the content is: a process, a comparison, a hierarchy, a set of
  statistics, a list of items, a network of relationships, a timeline, or a
  set of recurring keywords.
- Numeric facts and where they appear
- Repeated structural cues (numbered lists, headings of the form "Step N",
  comparison words like "vs", "before/after", "pros/cons", quadrant labels,
  parent → child phrasing)

### Step 2 — Pick exactly one template

Choose the template that best matches the **dominant** structure in the
content. Do not try to cram secondary structures in. If multiple visualizations
would help, ask the user which to prioritize, or recommend running this skill
twice with different framings.

| Content shape | Template | When to use |
|---|---|---|
| Ordered steps, stages, phases | `sequence` | "Step 1 / Step 2 / Step 3", roadmap, funnel |
| Multi-actor flow / handshake | `sequence-interaction` | Two or more parties exchanging messages |
| Parallel items, no order | `list` | Features, benefits, tips, key takeaways |
| Two-sided comparison | `compare-binary` | "X vs Y", "before vs after", "free vs paid" |
| SWOT analysis | `compare-swot` | Strengths/Weaknesses/Opportunities/Threats |
| 2x2 matrix | `compare-quadrant` | Priority matrix, Eisenhower, BCG |
| Tree / parent-child | `hierarchy` | Org chart, taxonomy, category tree, mind map |
| Single-series numbers over a dimension | `chart-line` or `chart-bar` | Time trends, single metric across categories |
| Parts of a whole | `chart-pie` | Market share, budget allocation |
| Connected graph | `relation` | System diagram, dependencies, knowledge graph |
| Frequency of terms | `wordcloud` | Theme extraction, keyword density |

### Step 3 — Extract content into the unified schema

```json
{
  "title": "Concise visual title in the source language (<= 60 chars)",
  "desc": "One-sentence subtitle that frames the visual (<= 120 chars)",
  "template": "list | sequence | sequence-interaction | compare-binary | compare-swot | compare-quadrant | hierarchy | chart-line | chart-bar | chart-pie | relation | wordcloud",
  "palette": ["#hex", "#hex", "#hex"],
  "language": "en | vi | zh | ...",
  "source": "url or file path the data came from",
  "data": { ... template-specific ... }
}
```

### Step 4 — Template-specific `data` shapes

**`list`**
```json
"data": {
  "items": [
    { "label": "Item name", "desc": "Optional one-line explanation",
      "value": 12.5, "icon": "rocket" }
  ]
}
```

**`sequence`**
```json
"data": {
  "order": "asc",
  "steps": [
    { "label": "Step name", "desc": "Optional", "icon": "clipboard check" }
  ]
}
```

**`sequence-interaction`**
```json
"data": {
  "lanes": [
    { "label": "Actor A", "icon": "user",
      "nodes": [
        { "id": "a1", "label": "Sends request", "step": 0, "icon": "send" }
      ]
    }
  ],
  "relations": [
    { "from": "a1", "label": "request", "to": "b1" }
  ]
}
```

**`compare-binary`**
```json
"data": {
  "sides": [
    { "label": "Option A", "icon": "tag",
      "items": [{ "label": "Cost", "value": 500, "icon": "wallet" }] },
    { "label": "Option B", "icon": "check bold",
      "items": [{ "label": "Cost", "value": 450, "icon": "wallet" }] }
  ]
}
```

**`compare-swot`**
```json
"data": {
  "quadrants": [
    { "label": "Strengths",    "items": [{ "label": "...", "icon": "star" }] },
    { "label": "Weaknesses",   "items": [{ "label": "...", "icon": "alert circle" }] },
    { "label": "Opportunities","items": [{ "label": "...", "icon": "trend up" }] },
    { "label": "Threats",      "items": [{ "label": "...", "icon": "shield" }] }
  ]
}
```

**`compare-quadrant`**
```json
"data": {
  "axes": { "x": "Cost", "y": "Value" },
  "quadrants": [
    { "label": "High value, low cost" },
    { "label": "High value, high cost" },
    { "label": "Low value, low cost" },
    { "label": "Low value, high cost" }
  ]
}
```

**`hierarchy`**
```json
"data": {
  "root": {
    "label": "Root",
    "children": [
      { "label": "Child A",
        "children": [{ "label": "Leaf A1" }] }
    ]
  }
}
```

**`chart-line` / `chart-bar`**
```json
"data": {
  "x_label": "Week",
  "y_label": "Accuracy %",
  "values": [
    { "label": "Week 1", "value": 86.5 },
    { "label": "Week 2", "value": 87.3 }
  ]
}
```

**`chart-pie`**
```json
"data": {
  "values": [
    { "label": "Segment A", "value": 45 },
    { "label": "Segment B", "value": 30 },
    { "label": "Segment C", "value": 25 }
  ]
}
```

**`relation`**
```json
"data": {
  "nodes": [
    { "id": "api", "label": "API", "icon": "server" },
    { "id": "db",  "label": "Database", "icon": "database" }
  ],
  "relations": [
    { "from": "api", "to": "db", "label": "reads/writes" }
  ]
}
```

**`wordcloud`**
```json
"data": {
  "words": [
    { "text": "growth", "weight": 12 },
    { "text": "retention", "weight": 9 }
  ]
}
```

## Rules

- **Output strictly one fenced JSON block.** No prose around it unless the user
  asked for an explanation, in which case prose comes *after* the JSON.
- **Preserve the source language.** If the content is Vietnamese, all
  `label`/`desc`/`title` text must be Vietnamese. Do not auto-translate.
- **Pick a palette of 3–5 hex colors** that reads well together. Default to
  `["#3b82f6","#8b5cf6","#f97316"]` if you have no strong reason to deviate;
  shift hue for medical/finance/eco/tech themes when the content signals it.
- **Always populate `icon`** for semantic list/step/node/comparison items,
  using either a precise ID (`mingcute/server-line`) or short semantic
  keywords (`rocket launch`, `shield check`, `chart line`). Keywords are
  space-separated, never hyphenated.
- **Values are bare numbers.** Put units in the `label` or `desc`, never in
  `value`.
- **Limit items to what the visual can absorb:** lists ≤ 8 items, sequence ≤ 7
  steps, hierarchy depth ≤ 4, chart ≤ 12 points, wordcloud ≤ 40 words. If the
  source has more, pick the most important and note the trim in `desc`.
- **Do not invent data.** If the source does not state a number, leave `value`
  off rather than guessing.

## Self-check before output

- [ ] Exactly one fenced ```json block
- [ ] `template` is one of the allowed values
- [ ] `data` shape matches the chosen template
- [ ] Language of all text matches the source
- [ ] Item counts within visual limits
- [ ] No fabricated numbers
- [ ] Palette is 3–5 hex strings

## Handoff

The downstream `svg-renderer` skill expects this exact schema. After emitting
the JSON, optionally suggest: "Run `svg-renderer` on this JSON to produce the
SVG."
