// Config

const DUE = new Date("2026-04-18T18:00:00Z");

// Time-remaining helpers

function computeRemaining() {
  const diff = DUE - Date.now();
  const abs = Math.abs(diff);

  const totalMins = Math.floor(abs / 60000);
  const totalHrs = Math.floor(abs / 3600000);
  const totalDays = Math.floor(abs / 86400000);

  let label, mood; // mood: 'ok' | 'warn' | 'danger'

  if (abs < 60000) {
    label = "Due now!";
    mood = "danger";
  } else if (diff < 0) {
    // overdue
    if (totalMins < 60) {
      label = `Overdue by ${totalMins}m`;
    } else if (totalHrs < 24) {
      label = `Overdue by ${totalHrs}h`;
    } else {
      label = `Overdue by ${totalDays}d`;
    }
    mood = "danger";
  } else {
    // upcoming
    if (totalDays === 0) {
      label = "Due today";
      mood = "warn";
    } else if (totalDays === 1) {
      label = "Due tomorrow";
      mood = "warn";
    } else if (totalDays <= 3) {
      label = `Due in ${totalDays} days`;
      mood = "warn";
    } else {
      label = `Due in ${totalDays} days`;
      mood = "ok";
    }
  }

  return { label, mood };
}

const CHIP_STYLES = {
  ok: {
    background: "#e8f3de",
    color: "#2d6a10",
    borderColor: "#8fc95a",
  },
  warn: {
    background: "#fdf0dc",
    color: "#a05e10",
    borderColor: "#e6b96a",
  },
  danger: {
    background: "#faeae5",
    color: "#8b3318",
    borderColor: "#e8a088",
  },
};

function updateTimeRemaining() {
  const chip = document.getElementById("time-remaining");
  if (!chip) return;

  const { label, mood } = computeRemaining();
  const styles = CHIP_STYLES[mood];

  chip.textContent = label;
  chip.style.background = styles.background;
  chip.style.color = styles.color;
  chip.style.borderColor = styles.borderColor;
}

// Checkbox toggle

function initToggle() {
  const checkbox = document.getElementById("todo-complete");
  const title = document.getElementById("todo-title");
  const status = document.getElementById("todo-status");

  if (!checkbox || !title || !status) return;

  checkbox.addEventListener("change", () => {
    const done = checkbox.checked;

    /* Title */
    title.classList.toggle("is-done", done);

    /* Status badge */
    status.classList.remove("is-done", "is-pending");
    if (done) {
      status.textContent = "Done";
      status.classList.add("is-done");
      status.setAttribute("aria-label", "Status: Done");
    } else {
      status.textContent = "In Progress";
      status.setAttribute("aria-label", "Status: In Progress");
    }
  });
}

/* ─────────────────────────────────────────
   Init
───────────────────────────────────────── */
updateTimeRemaining();
setInterval(updateTimeRemaining, 60_000);
initToggle();
