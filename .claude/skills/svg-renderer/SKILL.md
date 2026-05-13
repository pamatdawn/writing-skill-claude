---
name: svg-renderer
description: >
  Render a normalized infographic JSON document (as produced by
  `data-visual-mapping`) into a standalone, self-contained SVG file. Supports
  list, sequence, sequence-interaction, compare-binary, compare-swot,
  compare-quadrant, hierarchy, chart-line, chart-bar, chart-pie, relation, and
  wordcloud templates. Output is pure inline SVG (no external scripts, no
  network fonts) so it can be opened directly in a browser, embedded in a CMS,
  or attached to a Google Doc. Use when the user says "render the infographic",
  "draw the SVG", "make the chart", or as Stage 2 of the infographic pipeline
  after `data-visual-mapping`.
user-invokable: true
argument-hint: "[json_path | inline_json]"
---

# JSON → SVG Renderer

You are an SVG generator. Given a JSON document that conforms to the
`data-visual-mapping` schema, produce a single `.svg` file that visualizes the
content faithfully and elegantly.

## Input

One of:
- A path to a `.json` file produced by `data-visual-mapping`
- A fenced JSON block pasted by the user
- A JSON object passed inline by the calling agent

If you receive raw blog text instead of JSON, stop and tell the caller to run
`data-visual-mapping` first.

## Output contract

Produce **one self-contained SVG file** with these properties:

- Root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H">`
- Default canvas: `1200 × 800` for list/compare/hierarchy/relation/sequence,
  `1200 × 600` for chart-*, `1200 × 700` for wordcloud. Scale up if item count
  warrants it.
- No `<script>`, no `<foreignObject>`, no external font / image fetches.
- All text uses generic CSS font stacks
  (`'Inter','Segoe UI',Helvetica,Arial,sans-serif`) so it renders without
  network access.
- Use the `palette` from the JSON for primary fills and accents. If the
  palette has fewer than 3 colors, generate harmonious neighbors.
- Background `#ffffff` (or a soft tint of `palette[0]` at 4% opacity).
- A title block at the top: `title` (bold, 32–40px) + `desc` (regular, 16–18px,
  muted color `#475569`).
- A footer line on the bottom-right with the source domain or filename if
  provided in `source`, at 11px, color `#94a3b8`.

Write the file with the Write tool to a path derived from the title, e.g.
`<slug-of-title>-infographic.svg` in the current working directory unless the
user specified a destination.

## Template-specific layout playbooks

### `list`
Grid or row of cards. For ≤4 items, a single row. For 5–8 items, a 2-row grid
or vertical stack. Each card:
- 8px rounded rectangle, fill = card tint of `palette[i % palette.length]` at
  12% opacity, stroke 1.5px of the same palette color at 100%.
- Icon area (48×48) in the top-left of the card.
- Label (bold 18px) and desc (regular 14px, color `#475569`).
- Optional `value` rendered as a large 28px number to the right.

### `sequence`
Horizontal arrow chain (≤5 steps) or vertical timeline (>5 steps). Each step:
- Numbered circle (32px) in palette color.
- Connector line in palette color at 40% opacity.
- Label (bold 16px) below/right of the circle, desc (14px muted) underneath.
- Honor `order: asc | desc` for arrow direction.

### `sequence-interaction`
Swimlanes. Each `lane` is a horizontal band with the lane `label` and `icon` in
a left gutter (width 160px). Inside each lane, nodes are positioned by `step`
(left → right). Render `relations` as labeled arrows between nodes:
- Same-lane: straight horizontal arrow.
- Cross-lane: curved Bézier arrow.
- Arrow stroke 2px, color `palette[0]`, with a small arrowhead marker.
- Relation label sits in a white rounded pill on the arrow midpoint.

### `compare-binary`
Split the canvas in two equal columns separated by a 2px divider in `#cbd5e1`.
Each side gets its `label` as a header (bold 22px) with `icon`. Stack the
`items` vertically as labeled value bars (or simple labeled rows if there are
no `value`s). Use `palette[0]` for the left side, `palette[1]` for the right.

### `compare-swot`
2×2 grid, equal cells. Top-left = Strengths (green tint), top-right =
Weaknesses (red tint), bottom-left = Opportunities (blue tint), bottom-right =
Threats (amber tint). Inside each cell: header (bold 20px), bulleted list of
item labels (14px each), small icon next to each bullet if provided.

### `compare-quadrant`
2×2 grid with axis labels. The `axes.x` label appears centered along the
bottom; `axes.y` label appears rotated -90° along the left edge. Each
`quadrants[i]` `label` is centered inside its cell (bold 18px).

### `hierarchy`
Tidy tree layout, top-down. Compute x-positions by recursively summing leaf
counts (Reingold-Tilford-style). Each node is a 8px rounded rect sized to its
label (min 120×40). Connect parent→child with 1.5px curves in palette color at
70% opacity. Depth ≤ 4.

### `chart-line`
Cartesian axes inside a padded plot area (left padding 80, bottom padding 60).
Plot `values[i].value` evenly spaced along x. Smooth line via cubic Bézier
through the points, 3px stroke in `palette[0]`. Dots at each point (5px). Y
axis: 4–5 grid lines in `#e2e8f0` with labels. X axis: tick labels rotated
-30° if any label > 8 chars.

### `chart-bar`
Vertical bars, 24–48px wide with 12px gaps, filled with
`palette[i % palette.length]`. Value labels above each bar (bold 12px). Y
gridlines as in chart-line.

### `chart-pie`
Donut chart (inner radius = 60% of outer). Center the donut in the top 60% of
canvas, legend below with a colored square + `label`: value (and % of total).
Use the palette in order, generating evenly-spaced HSL variations if there are
more slices than colors.

### `relation`
Force-directed-ish placement on a grid: lay nodes out in a circle if ≤8
nodes, in a rectangular grid otherwise. Render nodes as rounded rectangles
with `label` (and `icon` if any) sized to content. Render `relations` as
arrows with optional labels. If a relation forms a self-loop, draw a small
arc above the node.

### `wordcloud`
Place words greedily from largest to smallest weight, spiral packing around
center. Font size = `12 + sqrt(weight) * 6` (clamp 12..72). Color =
`palette[i % palette.length]`. Rotate every other word -30° for visual
rhythm. Avoid overlaps using simple bounding-box rejection.

## Icon strategy

This skill ships no external icon font. For icons referenced in the JSON:
- Map a small set of common semantic keywords to inline SVG paths embedded in
  a `<defs>` block at the top of the SVG: `rocket`, `shield`, `star`, `check`,
  `alert`, `chart`, `user`, `server`, `database`, `clipboard`, `clock`,
  `flag`, `send`, `wallet`, `trend up`, `trend down`, `lightbulb`, `lock`.
- For any keyword you don't have a path for, render a 24px rounded square
  placeholder filled with the palette color and the first letter of the
  keyword in white.
- Never emit a broken `<image href=...>` reference to an external icon.

## Rendering rules

- Keep total file size under ~400 KB. Round numeric coordinates to 1 decimal.
- Group related elements with `<g>` and add `aria-label` for accessibility.
- Use `text-anchor` (start/middle/end) instead of manual centering math.
- For long labels, wrap at word boundaries; do not let text overflow card
  bounds. Truncate with `…` only as a last resort.
- Honor source language: do not transliterate.

## Workflow

1. Parse the JSON. Validate that `template` and `data` shape match the
   `data-visual-mapping` schema. If they don't, report which field is wrong.
2. Compute the layout in your head (or on scratch) before writing.
3. Emit the full SVG to disk via Write at `<slug>-infographic.svg`.
4. Reply with: the file path, the canvas dimensions, and a one-line
   description of what was rendered. Example:
   `Rendered list infographic to product-growth-points-infographic.svg (1200x800).`

## Self-check before saving

- [ ] Root `<svg>` has `xmlns` and a `viewBox`.
- [ ] No `<script>`, `<foreignObject>`, or external URLs.
- [ ] Title and desc rendered at the top.
- [ ] Palette colors used consistently.
- [ ] All text within bounds, no overlapping critical elements.
- [ ] File saved with `.svg` extension.

## When to stop and ask

Ask the user instead of guessing if:
- The JSON `template` is unknown or `data` is missing required fields.
- An item count vastly exceeds the limits in `data-visual-mapping` (e.g. 50+
  items in a list).
- The user wants a specific aspect ratio or brand palette that differs from
  the JSON.
