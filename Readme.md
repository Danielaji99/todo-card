# ROMINO-TODO — Stage 1a

Extends the Stage 0 card with editing, status transitions, expand/collapse,
priority indicators, and richer time logic. All Stage 0 `data-testid` values
are preserved unchanged.

---

## What changed from Stage 0

### Structure
- Card shell is now `display:flex` (row) to accommodate a 4px priority
  indicator strip on the left edge.
- A `.card-inner` wrapper groups all previous card children.

### Priority indicator
- New `data-testid="test-todo-priority-indicator"` left-border strip.
- Color switches automatically: red (High), amber (Medium), green (Low).
- JS applies `.priority--high/medium/low` on the card element.

### Status control
- The plain status `<span>` is replaced by a `<select>` carrying
  `data-testid="test-todo-status-control"`.
- Allowed values: `Pending`, `In Progress`, `Done`.
- Changing status syncs the checkbox, card classes, and time chip.
- Checking the checkbox sets status to `Done`; unchecking reverts to `Pending`.

### Expand / collapse
- Description is collapsed by default when it exceeds 80 characters.
- `data-testid="test-todo-expand-toggle"` button toggles
  `data-testid="test-todo-collapsible-section"` via a `max-height` transition.

### Edit mode
- Edit button opens an inline form with fields for title, description,
  priority, and due date.
- **Save** commits changes and re-evaluates the expand toggle and time chip.
- **Cancel** restores the previous state from a snapshot.
- Footer (Edit / Delete) is hidden while the form is open; restored on close.

### Overdue indicator
- `data-testid="test-todo-overdue-indicator"` appears automatically when
  `Date.now()` passes the due date.
- Card border turns red; the indicator is removed when status is set to Done.

### Time logic
- Interval reduced from 60 s → 30 s.
- Granular labels: `Overdue by 45m`, `Due in 3h`, `Due in 5 days`.
- Chip shows **Completed** (green) and stops ticking when status is Done.
- Due date updates live after a save.

---

## New design decisions

- Priority strip (not a badge) keeps the top bar uncluttered while still
  giving a strong at-a-glance signal.
- Status uses a styled `<select>` rather than a segmented control — simpler
  HTML, accessible out of the box, works across all screen sizes.
- Edit form slides in below the card body as an inline panel rather than a
  modal, so the context of the card remains visible while editing.
- Save button is filled accent-blue; Cancel is a ghost button — clear
  visual hierarchy for a destructive-vs-safe choice.

---
## Known limitations

- **Focus trap in edit form** — not implemented (spec lists it as optional).
  Tab naturally lands on Save then Cancel as the last focusable elements.
- **`max-height` collapse animation** — uses a 500 px ceiling. Extremely
  long descriptions still animate correctly but slightly slower than ideal.
- **Date input timezone** — due date is parsed as UTC 18:00 to prevent
  midnight-rollback issues with date-only `<input type="date">` values.
  Display is reformatted to `"Due MMM D, YYYY"` after save.

---

## Accessibility notes

- `aria-expanded` + `aria-controls` on the expand toggle link directly to
  `id="collapsible-section"`.
- `aria-live="polite"` on both `#time-remaining` and `#overdue-indicator`.
- Status `<select>` has `aria-label="Task status"` and a visually-hidden
  `<label>` for screen readers.
- All edit form inputs have explicit `<label for="">` associations.
- Focus returns to the Edit button on both Save and Cancel.
- Keyboard tab order: **checkbox → status-control → expand-toggle →
  edit → delete**. In edit mode: **title → description → priority →
  due date → save → cancel**.
- Color is never the only signal — priority is shown as both a colored
  strip and a text badge; overdue is shown as both a border and a text chip.
