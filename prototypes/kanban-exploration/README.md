# TaskFlow — exploratory Kanban prototypes

Status: **awaiting owner choice**, inside Phase 3. No design is approved.

Branch: `design/kanban-exploration`, based on the application foundation branch at
`cc76cf3`. This exploration is separate from PR #4. No merge or push is implied.

## Open and compare

Open `index.html` in a browser for the three directions. Use the named carousel to
choose Fluxo Sereno, Estúdio Editorial or Precisão Técnica. Comparison controls
change theme, the predetermined sample scenario and the mobile column only.

Open `gallery.html` to compare the real captured screenshots: desktop/mobile,
light/dark, hover/focus/selection and empty-column layouts. Images link to the
full-resolution files. The gallery works without Google Fonts or a network.

Optional local server, from the repository root:

```sh
python -m http.server 4180 --bind 127.0.0.1 --directory prototypes/kanban-exploration
```

Then visit `http://127.0.0.1:4180/` and `http://127.0.0.1:4180/gallery.html`.

## Files and production isolation

- `prototype.html`: editable, self-contained preview fragment; contains the single
  immutable sample fixture, product-specific palettes/layouts and presentation controls.
- `index.html`: standalone preview generated with the installed visualize renderer.
  Its generic preview shell is separate from TaskFlow; any shell preference handling
  is not task persistence or application functionality.
- `gallery.html`: local screenshot comparison, independently usable offline.
- `capture.mjs`: reproducible screenshot/verification script using the existing Playwright
  dependency; not part of application test discovery or the feature verification policy.
- `screenshots/`: design review deliverables, including `verification.json`.
- `README.md`: scope, operation, limitations and review gate.

Nothing here is imported by `src/`, copied into `public/`, or used by the Vite entry.
The only application configuration change is `@source not "../prototypes"` in
`src/styles.css`, excluding these review artifacts from Tailwind's automatic scan.
It adds no definitive UI or feature. Build entry, workflows, dependencies and
harness registry remain unchanged.

## Shared sample data and scenarios

All three directions render the same six records, in the same order, with identical
titles, column assignment and priorities. IDs EX-01 through EX-06 do not identify
features in the harness. Titles include two intentionally long examples.

- Complete board: 3 Todo, 2 In Progress, 1 Done; two records per priority.
- Empty column: the same predetermined subset, excluding EX-06, leaves Done empty.
- Empty board: no records and introductory empty text in all columns.
- No results: no records, with copy distinguishing this from a never-used board.

Scenarios are presentation fixtures, not an implemented filter or feature state
transition. The priority control changes its own appearance only. Search is read-only.
The New Task button is illustrative. Card selection highlights a preview, including
`aria-pressed`, without changing task data. There is no create/edit/delete/move/filter
algorithm, use case, task storage adapter or backend integration.

On mobile, one column is shown at a time using a native labeled column selector;
desktop/tablet show three columns. All columns remain available in the sample.
The current single-column mobile approach is a proposal requiring owner review.

## Typography and interaction

- Fluxo Sereno: Manrope, green, restrained sidebar, 12px cards, moderate spacing.
- Estúdio Editorial: DM Sans, warm neutrals/violet, top navigation, 18px cards,
  larger type and more space.
- Precisão Técnica: IBM Plex Sans, blue, narrow navigation, 6px cards and denser layout.

The live preview requests suggested fonts from Google Fonts and provides system
fallbacks; no font package or component library is installed. Later self-hosting and
final font choices require design approval. Captured images are actual browser output.

Priorities use a label plus symbol and color. Selection uses a visible text marker
and border; hover and keyboard focus have different treatments. Focus rings have
3px thickness with offset. No hover-only task action is introduced.

## Reproduce the captures

With the existing project dependencies installed and a Chromium browser available:

```sh
node prototypes/kanban-exploration/capture.mjs
```

The Windows verification used:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:\Pessoal\taskflow-harness-lab\.playwright-browsers'
node prototypes\kanban-exploration\capture.mjs
```

Regenerate the standalone preview after editing the fragment, using the currently
installed visualize skill's `scripts/render.py` with `--force`. The skill path is
environment-specific; the generated preview is committed and can be opened without it.

The capture script validates shared IDs/titles/priorities; checks five viewport sizes
for each theme/direction; exercises hover, keyboard focus and selection; checks all
three empty scenarios; and measures rendered card-title, action-label and priority
contrast. `screenshots/verification.json` records results. These checks are scoped
to exploratory previews, not feature acceptance tests or complete WCAG validation.

Human review still covers identity, density, scan order, type quality, responsive
comfort and the usefulness of the interaction patterns. No direction, feature or
phase can be approved by these checks. Wait for the owner choice before defining
the Design System or implementing the definitive UI.
