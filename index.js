/* ── Collapse threshold ── */
const COLLAPSE_THRESHOLD = 80; /* chars */

/* ── Mutable card state ── */
const state = {
  title: "Redesign the onboarding flow",
  description:
    "Map out the new user journey, update Figma wireframes, and align with the product team on key drop-off points before next week's review.",
  priority: "High",
  status: "In Progress",
  due: new Date("2026-04-18T18:00:00Z"),
  isDone: false,
};

/* Snapshot for cancel */
let _snapshot = null;

/* ── DOM refs ── */
const card = document.getElementById("todo-card");
const titleEl = document.getElementById("todo-title");
const descEl = document.getElementById("todo-description");
const priorityBadge = document.getElementById("priority-badge");
const statusSelect = document.getElementById("status-control");
const statusDisplay = document.getElementById("todo-status");
const checkbox = document.getElementById("todo-complete");
const timeChip = document.getElementById("time-remaining");
const overdueEl = document.getElementById("overdue-indicator");
const dueDateDisp = document.getElementById("due-date-display");
const editForm = document.getElementById("edit-form");
const editBtn = document.getElementById("edit-btn");
const expandToggle = document.getElementById("expand-toggle");
const collapsible = document.getElementById("collapsible-section");
const expandLabel = expandToggle.querySelector(".expand-label");

/* edit form inputs */
const inTitle = document.getElementById("edit-title-input");
const inDesc = document.getElementById("edit-description-input");
const inPriority = document.getElementById("edit-priority-select");
const inDueDate = document.getElementById("edit-due-date-input");

const PRIORITY_CLASSES = {
  High: "badge--high",
  Medium: "badge--medium",
  Low: "badge--low",
};

const CHIP_STYLES = {
  ok: { background: "#e8f3de", color: "#2d6a10", borderColor: "#8fc95a" },
  warn: { background: "#fdf0dc", color: "#a05e10", borderColor: "#e6b96a" },
  danger: { background: "#faeae5", color: "#8b3318", borderColor: "#e8a088" },
};

// UI helpers

function applyPriorityUI(priority) {
  /* Badge */
  priorityBadge.textContent = priority;
  priorityBadge.className =
    "badge " + (PRIORITY_CLASSES[priority] || "badge--low");
  priorityBadge.setAttribute("aria-label", `Priority: ${priority}`);

  /* Card indicator strip */
  card.classList.remove("priority--high", "priority--medium", "priority--low");
  card.classList.add("priority--" + priority.toLowerCase());
}

function applyStatusUI(status) {
  /* Select appearance */
  statusSelect.classList.remove(
    "status--pending",
    "status--in-progress",
    "status--done",
  );
  if (status === "Pending") statusSelect.classList.add("status--pending");
  if (status === "In Progress")
    statusSelect.classList.add("status--in-progress");
  if (status === "Done") statusSelect.classList.add("status--done");

  /* Sync select value */
  statusSelect.value = status;
  statusDisplay.textContent = status;

  /* Sync checkbox */
  const done = status === "Done";
  state.isDone = done;
  checkbox.checked = done;

  /* Card state classes */
  card.classList.toggle("is-done", done);
  card.classList.toggle("is-in-progress", status === "In Progress");
  titleEl.classList.toggle("is-done", done);

  if (done) {
    applyOverdueUI(false);
    timeChip.textContent = "Completed";
    timeChip.style.background = CHIP_STYLES.ok.background;
    timeChip.style.color = CHIP_STYLES.ok.color;
    timeChip.style.borderColor = CHIP_STYLES.ok.borderColor;
  }
}

function applyOverdueUI(isOverdue) {
  card.classList.toggle("is-overdue", isOverdue);
  if (isOverdue) {
    overdueEl.removeAttribute("hidden");
  } else {
    overdueEl.setAttribute("hidden", "");
  }
}

function formatDueDate(dateObj) {
  return (
    "Due " +
    dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
}

function computeRemaining(due) {
  const diff = due - Date.now();
  const abs = Math.abs(diff);
  const totalMins = Math.floor(abs / 60000);
  const totalHrs = Math.floor(abs / 3600000);
  const totalDays = Math.floor(abs / 86400000);

  let label, mood;

  if (abs < 60000) {
    label = "Due now!";
    mood = "danger";
  } else if (diff < 0) {
    /* Overdue — granular messages per Stage 1a */
    if (totalMins < 60) label = `Overdue by ${totalMins}m`;
    else if (totalHrs < 24) label = `Overdue by ${totalHrs}h`;
    else label = `Overdue by ${totalDays}d`;
    mood = "danger";
  } else {
    if (totalDays === 0) {
      label = "Due today";
      mood = "warn";
    } else if (totalDays === 1) {
      label = "Due tomorrow";
      mood = "warn";
    } else if (totalHrs < 72) {
      label = `Due in ${totalHrs}h`;
      mood = "warn";
    } else {
      label = `Due in ${totalDays} days`;
      mood = "ok";
    }
  }

  return { label, mood, isOverdue: diff < 0 };
}

function updateTimeRemaining() {
  if (state.isDone) return; /* frozen when done */

  const { label, mood, isOverdue } = computeRemaining(state.due);
  const s = CHIP_STYLES[mood];

  timeChip.textContent = label;
  timeChip.style.background = s.background;
  timeChip.style.color = s.color;
  timeChip.style.borderColor = s.borderColor;

  applyOverdueUI(isOverdue);
}

function handleExpandClick() {
  const expanded = expandToggle.getAttribute("aria-expanded") === "true";
  const next = !expanded;
  expandToggle.setAttribute("aria-expanded", String(next));
  collapsible.classList.toggle("is-expanded", next);
  expandLabel.textContent = next ? "Show less" : "Show more";
}

function initExpandToggle() {
  const isLong = state.description.length > COLLAPSE_THRESHOLD;

  expandToggle.removeEventListener("click", handleExpandClick);

  if (!isLong) {
    collapsible.classList.add("is-expanded");
    expandToggle.style.display = "none";
    return;
  }

  expandToggle.style.display = "";
  expandToggle.setAttribute("aria-expanded", "false");
  expandLabel.textContent = "Show more";
  collapsible.classList.remove("is-expanded");

  expandToggle.addEventListener("click", handleExpandClick);
}

// status control — NEW

function initStatusControl() {
  statusSelect.addEventListener("change", () => {
    const val = statusSelect.value;
    state.status = val;
    applyStatusUI(val);

    /* After done, stop time updates */
    if (val !== "Done") {
      /* Re-enable time updates and clear overdue if manually de-doned */
      updateTimeRemaining();
    }
  });
}

// checkbox — CHANGED from Stage 0

function initCheckbox() {
  checkbox.addEventListener("change", () => {
    const done = checkbox.checked;
    const newStatus = done ? "Done" : "Pending";

    state.status = newStatus;
    state.isDone = done;

    /* Update select + full UI */
    applyStatusUI(newStatus);

    if (!done) {
      /* Resume time updates */
      updateTimeRemaining();
    }
  });
}

// edit mode

function openEdit() {
  /* Snapshot current state for cancel */
  _snapshot = { ...state, due: new Date(state.due) };

  /* Populate form */
  inTitle.value = state.title;
  inDesc.value = state.description;
  inPriority.value = state.priority;

  /* Format date as YYYY-MM-DD for date input */
  const d = state.due;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  inDueDate.value = `${yyyy}-${mm}-${dd}`;

  /* Show form, hide footer */
  editForm.classList.remove("hidden");
  card.classList.add("in-edit-mode");

  /* Move focus to first field */
  inTitle.focus();
  inTitle.select();
}

function saveEdit() {
  /* Read new values */
  const newTitle = inTitle.value.trim();
  const newDesc = inDesc.value.trim();
  const newPriority = inPriority.value;
  const newDueStr = inDueDate.value; /* YYYY-MM-DD */

  /* Basic validation — title required */
  if (!newTitle) {
    inTitle.focus();
    return;
  }

  const [y, mo, dy] = newDueStr.split("-").map(Number);
  const newDue = new Date(Date.UTC(y, mo - 1, dy, 18, 0, 0));

  /* Commit to state */
  state.title = newTitle;
  state.description = newDesc;
  state.priority = newPriority;
  state.due = newDue;

  /* Update DOM */
  titleEl.textContent = newTitle;
  descEl.textContent = newDesc;

  /* Update due date display */
  dueDateDisp.setAttribute("datetime", newDue.toISOString());
  dueDateDisp.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1.5" y="2" width="9" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
      <path d="M1.5 5h9M4 1v2.5M8 1v2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
    ${formatDueDate(newDue)}`;

  applyPriorityUI(newPriority);

  /* Re-evaluate expand toggle with new description */
  expandToggle.style.display = "";
  collapsible.classList.remove("is-expanded");
  expandToggle.setAttribute("aria-expanded", "false");
  expandLabel.textContent = "Show more";
  initExpandToggle();

  /* Refresh time chip */
  updateTimeRemaining();

  closeEditForm();
}

function cancelEdit() {
  if (!_snapshot) {
    closeEditForm();
    return;
  }

  /* Restore state */
  state.title = _snapshot.title;
  state.description = _snapshot.description;
  state.priority = _snapshot.priority;
  state.status = _snapshot.status;
  state.due = _snapshot.due;
  state.isDone = _snapshot.isDone;

  titleEl.textContent = state.title;
  descEl.textContent = state.description;

  dueDateDisp.setAttribute("datetime", state.due.toISOString());
  dueDateDisp.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1.5" y="2" width="9" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
      <path d="M1.5 5h9M4 1v2.5M8 1v2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
    ${formatDueDate(state.due)}`;

  applyPriorityUI(state.priority);
  applyStatusUI(state.status);

  /* Re-init expand toggle for restored description */
  initExpandToggle();

  /* Restore time chip if not done */
  if (!state.isDone) updateTimeRemaining();

  closeEditForm();
}

function closeEditForm() {
  editForm.classList.add("hidden");
  card.classList.remove("in-edit-mode");
  _snapshot = null;

  /* Return focus to edit button */
  editBtn.focus();
}

// init

applyPriorityUI(state.priority);

applyStatusUI(state.status);

updateTimeRemaining();

setInterval(updateTimeRemaining, 30_000);

initCheckbox();
initStatusControl();
initExpandToggle();
