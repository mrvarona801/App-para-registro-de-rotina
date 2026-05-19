const START_DATE = "2026-05-19";
const END_DATE = "2026-12-31";
const STORAGE_KEY = "ano-util-2026:v1";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const FULL_WEEKDAYS = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const defaultSchedule = {
  0: "",
  1: "Peito e triceps",
  2: "Costas e biceps",
  3: "Pernas",
  4: "Ombro e abdomen",
  5: "Cardio e mobilidade",
  6: "",
};

const defaultKungFuSchedule = {
  3: { active: true, optional: false, label: "Kung fu" },
  5: { active: true, optional: false, label: "Kung fu" },
  6: { active: true, optional: true, label: "Kung fu opcional" },
};

const defaultState = {
  schedule: defaultSchedule,
  kungFuSchedule: defaultKungFuSchedule,
  fields: [],
  days: {},
  filter: "all",
  theme: "light",
};

let state = loadState();
let selectedDate = null;
let deferredInstallPrompt = null;

const el = {
  businessRemaining: document.querySelector("#businessRemaining"),
  businessDone: document.querySelector("#businessDone"),
  workoutsRemaining: document.querySelector("#workoutsRemaining"),
  workoutsDone: document.querySelector("#workoutsDone"),
  kungFuRemaining: document.querySelector("#kungFuRemaining"),
  kungFuDone: document.querySelector("#kungFuDone"),
  schoolRemaining: document.querySelector("#schoolRemaining"),
  schoolDone: document.querySelector("#schoolDone"),
  progressPercent: document.querySelector("#progressPercent"),
  calendar: document.querySelector("#calendar"),
  weekdayEditor: document.querySelector("#weekdayEditor"),
  workoutStats: document.querySelector("#workoutStats"),
  kungFuStats: document.querySelector("#kungFuStats"),
  customFields: document.querySelector("#customFields"),
  fieldForm: document.querySelector("#fieldForm"),
  fieldName: document.querySelector("#fieldName"),
  fieldType: document.querySelector("#fieldType"),
  searchInput: document.querySelector("#searchInput"),
  themeToggle: document.querySelector("#themeToggle"),
  installBtn: document.querySelector("#installBtn"),
  dayDialog: document.querySelector("#dayDialog"),
  dayForm: document.querySelector("#dayForm"),
  dialogWeekday: document.querySelector("#dialogWeekday"),
  dialogTitle: document.querySelector("#dialogTitle"),
  gymCheck: document.querySelector("#gymCheck"),
  kungFuCheck: document.querySelector("#kungFuCheck"),
  schoolCheck: document.querySelector("#schoolCheck"),
  workoutInput: document.querySelector("#workoutInput"),
  notesInput: document.querySelector("#notesInput"),
  dynamicFields: document.querySelector("#dynamicFields"),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    return {
      ...structuredClone(defaultState),
      ...saved,
      schedule: { ...defaultSchedule, ...(saved.schedule || {}) },
      kungFuSchedule: normalizeKungFuSchedule(saved.kungFuSchedule),
      fields: Array.isArray(saved.fields) ? saved.fields : [],
      days: saved.days || {},
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyTheme() {
  const isDark = state.theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  el.themeToggle.textContent = isDark ? "Modo claro" : "Modo escuro";
  el.themeToggle.setAttribute("aria-pressed", String(isDark));
}

function normalizeKungFuSchedule(saved = {}) {
  const schedule = structuredClone(defaultKungFuSchedule);
  Object.entries(saved || {}).forEach(([day, value]) => {
    if (typeof value === "boolean") {
      schedule[day] = { ...(schedule[day] || { label: "Kung fu", optional: false }), active: value };
      return;
    }
    schedule[day] = { ...(schedule[day] || { label: "Kung fu", optional: false }), ...value };
  });
  return schedule;
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value) {
  const date = parseDate(value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getDates() {
  const dates = [];
  const current = parseDate(START_DATE);
  const end = parseDate(END_DATE);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function isBusinessDay(date) {
  return date.getDay() !== 0 && date.getDay() !== 6;
}

function dayRecord(dateKey) {
  return state.days[dateKey] || {};
}

function workoutFor(date) {
  const key = formatDate(date);
  const record = dayRecord(key);
  return record.workout ?? state.schedule[date.getDay()] ?? "";
}

function kungFuFor(date) {
  const item = state.kungFuSchedule?.[date.getDay()];
  return item?.active ? item : null;
}

function isGymDone(key) {
  return Boolean(dayRecord(key).gym);
}

function isKungFuDone(key) {
  return Boolean(dayRecord(key).kungFu);
}

function isSchoolDone(key) {
  return Boolean(dayRecord(key).school);
}

function isDayComplete(date) {
  const key = formatDate(date);
  const hasWorkout = Boolean(workoutFor(date));
  const kungFu = kungFuFor(date);
  const needsKungFu = Boolean(kungFu && !kungFu.optional);
  const needsSchool = isBusinessDay(date);
  return (!hasWorkout || isGymDone(key)) && (!needsKungFu || isKungFuDone(key)) && (!needsSchool || isSchoolDone(key));
}

function render() {
  applyTheme();
  renderWeekdayEditor();
  renderCustomFields();
  renderSummary();
  renderWorkoutStats();
  renderKungFuStats();
  renderCalendar();
}

function renderWeekdayEditor() {
  el.weekdayEditor.innerHTML = "";
  for (let day = 1; day <= 5; day += 1) {
    const row = document.createElement("label");
    row.className = "weekday-row";
    row.innerHTML = `<span>${FULL_WEEKDAYS[day]}</span>`;
    const input = document.createElement("input");
    input.value = state.schedule[day] || "";
    input.placeholder = "Sem treino";
    input.addEventListener("input", () => {
      state.schedule[day] = input.value.trim();
      saveState();
      renderSummary();
      renderWorkoutStats();
      renderCalendar();
    });
    row.append(input);
    el.weekdayEditor.append(row);
  }
}

function renderCustomFields() {
  el.customFields.innerHTML = "";
  if (!state.fields.length) {
    el.customFields.innerHTML = `<div class="empty-state">Adicione campos extras para acompanhar sua rotina.</div>`;
    return;
  }

  state.fields.forEach((field) => {
    const row = document.createElement("div");
    row.className = "custom-field-row";
    row.innerHTML = `<div><strong>${field.name}</strong><br><span>${field.typeLabel}</span></div>`;
    const remove = document.createElement("button");
    remove.className = "ghost-button";
    remove.type = "button";
    remove.textContent = "Remover";
    remove.addEventListener("click", () => {
      state.fields = state.fields.filter((item) => item.id !== field.id);
      Object.values(state.days).forEach((record) => {
        if (record.extra) delete record.extra[field.id];
      });
      saveState();
      render();
    });
    row.append(remove);
    el.customFields.append(row);
  });
}

function renderSummary() {
  const dates = getDates();
  const businessDates = dates.filter(isBusinessDay);
  const businessRemaining = businessDates.filter((date) => !isDayComplete(date)).length;
  const businessDone = businessDates.length - businessRemaining;
  const workoutDates = dates.filter((date) => Boolean(workoutFor(date)));
  const workoutRemaining = workoutDates.filter((date) => !isGymDone(formatDate(date))).length;
  const workoutDone = workoutDates.length - workoutRemaining;
  const kungFuDates = dates.filter((date) => Boolean(kungFuFor(date)));
  const requiredKungFuDates = kungFuDates.filter((date) => !kungFuFor(date).optional);
  const optionalKungFuDates = kungFuDates.filter((date) => kungFuFor(date).optional);
  const kungFuRemaining = requiredKungFuDates.filter((date) => !isKungFuDone(formatDate(date))).length;
  const optionalKungFuRemaining = optionalKungFuDates.filter((date) => !isKungFuDone(formatDate(date))).length;
  const kungFuDone = kungFuDates.filter((date) => isKungFuDone(formatDate(date))).length;
  const schoolRemaining = businessDates.filter((date) => !isSchoolDone(formatDate(date))).length;
  const schoolDone = businessDates.length - schoolRemaining;
  const progress = businessDates.length ? Math.round((businessDone / businessDates.length) * 100) : 0;

  el.businessRemaining.textContent = businessDates.length;
  el.businessDone.textContent = `${businessRemaining} ainda sem registro completo`;
  el.workoutsRemaining.textContent = workoutRemaining;
  el.workoutsDone.textContent = `${workoutDone} feitos de ${workoutDates.length}`;
  el.kungFuRemaining.textContent = kungFuRemaining;
  el.kungFuDone.textContent = `${kungFuDone} feitos, ${optionalKungFuRemaining} sabados opcionais`;
  el.schoolRemaining.textContent = schoolRemaining;
  el.schoolDone.textContent = `${schoolDone} presencas de ${businessDates.length}`;
  el.progressPercent.textContent = `${progress}%`;
}

function renderWorkoutStats() {
  const totals = new Map();
  getDates().forEach((date) => {
    const name = workoutFor(date).trim();
    if (!name) return;
    const key = formatDate(date);
    const current = totals.get(name) || { total: 0, remaining: 0 };
    current.total += 1;
    if (!isGymDone(key)) current.remaining += 1;
    totals.set(name, current);
  });

  el.workoutStats.innerHTML = "";
  if (!totals.size) {
    el.workoutStats.innerHTML = `<div class="empty-state">Defina pelo menos um treino nos dias da semana.</div>`;
    return;
  }

  [...totals.entries()].forEach(([name, count]) => {
    const item = document.createElement("div");
    item.className = "workout-stat";
    item.innerHTML = `<div><strong>${name}</strong><br><span>${count.total - count.remaining} feitos de ${count.total}</span></div><strong>${count.remaining}</strong>`;
    el.workoutStats.append(item);
  });
}

function renderKungFuStats() {
  const totals = {
    required: { total: 0, remaining: 0 },
    optional: { total: 0, remaining: 0 },
  };

  getDates().forEach((date) => {
    const kungFu = kungFuFor(date);
    if (!kungFu) return;
    const bucket = kungFu.optional ? totals.optional : totals.required;
    bucket.total += 1;
    if (!isKungFuDone(formatDate(date))) bucket.remaining += 1;
  });

  el.kungFuStats.innerHTML = "";
  [
    ["Quarta e sexta", totals.required, "compromisso"],
    ["Sabado", totals.optional, "opcional"],
  ].forEach(([name, count, label]) => {
    const item = document.createElement("div");
    item.className = "workout-stat";
    item.innerHTML = `<div><strong>${name}</strong><br><span>${count.total - count.remaining} feitos de ${count.total} (${label})</span></div><strong>${count.remaining}</strong>`;
    el.kungFuStats.append(item);
  });
}

function renderCalendar() {
  const query = el.searchInput.value.trim().toLowerCase();
  const grouped = new Map();

  getDates().forEach((date) => {
    const key = formatDate(date);
    const record = dayRecord(key);
    const workout = workoutFor(date);
    const kungFu = kungFuFor(date);
    const text = `${workout} ${kungFu?.label || ""} ${record.notes || ""}`.toLowerCase();
    const done = isDayComplete(date);

    if (state.filter === "pending" && done) return;
    if (state.filter === "done" && !done) return;
    if (query && !text.includes(query)) return;

    const month = date.getMonth();
    if (!grouped.has(month)) grouped.set(month, []);
    grouped.get(month).push(date);
  });

  el.calendar.innerHTML = "";
  if (!grouped.size) {
    el.calendar.innerHTML = `<div class="empty-state">Nenhum dia encontrado para esse filtro.</div>`;
    return;
  }

  grouped.forEach((dates, month) => {
    const section = document.createElement("section");
    section.className = "month";
    section.innerHTML = `<h2>${MONTHS[month]}</h2><div class="days-grid"></div>`;
    const grid = section.querySelector(".days-grid");
    dates.forEach((date) => grid.append(createDayCard(date)));
    el.calendar.append(section);
  });
}

function createDayCard(date) {
  const key = formatDate(date);
  const record = dayRecord(key);
  const workout = workoutFor(date);
  const kungFu = kungFuFor(date);
  const business = isBusinessDay(date);
  const card = document.createElement("button");
  card.type = "button";
  card.className = ["day-card", key === START_DATE ? "today" : "", !business ? "weekend" : "", isDayComplete(date) ? "done" : ""]
    .filter(Boolean)
    .join(" ");
  card.dataset.date = key;

  const badges = [];
  if (business) badges.push(`<span class="badge">Dia util</span>`);
  if (record.gym) badges.push(`<span class="badge good">Academia</span>`);
  if (record.kungFu) badges.push(`<span class="badge good">Kung fu</span>`);
  if (record.school) badges.push(`<span class="badge good">Escola</span>`);
  if (business && !record.school) badges.push(`<span class="badge warn">Escola pendente</span>`);
  if (workout && !record.gym) badges.push(`<span class="badge warn">Treino pendente</span>`);
  if (kungFu && !record.kungFu) {
    badges.push(`<span class="badge ${kungFu.optional ? "" : "warn"}">${kungFu.optional ? "Kung fu opcional" : "Kung fu pendente"}</span>`);
  }

  card.innerHTML = `
    <div class="day-top">
      <div>
        <div class="day-number">${String(date.getDate()).padStart(2, "0")}</div>
        <div class="day-weekday">${WEEKDAYS[date.getDay()]} · ${displayDate(key)}</div>
      </div>
    </div>
    <div class="workout-name">${[workout, kungFu?.label].filter(Boolean).join(" + ") || "Sem treino"}</div>
    <div class="badges">${badges.join("")}</div>
    <div class="note-preview">${record.notes || ""}</div>
  `;
  card.addEventListener("click", () => openDay(key));
  return card;
}

function openDay(key) {
  selectedDate = key;
  const date = parseDate(key);
  const record = dayRecord(key);
  el.dialogWeekday.textContent = FULL_WEEKDAYS[date.getDay()];
  el.dialogTitle.textContent = displayDate(key);
  el.gymCheck.checked = Boolean(record.gym);
  el.kungFuCheck.checked = Boolean(record.kungFu);
  el.schoolCheck.checked = Boolean(record.school);
  el.workoutInput.value = workoutFor(date);
  el.notesInput.value = record.notes || "";
  renderDynamicFields(record);
  el.dayDialog.showModal();
}

function renderDynamicFields(record) {
  el.dynamicFields.innerHTML = "";
  state.fields.forEach((field) => {
    const label = document.createElement("label");
    label.className = "dynamic-label";
    label.textContent = field.name;
    const input = document.createElement("input");
    input.dataset.fieldId = field.id;
    input.type = field.type === "number" ? "number" : field.type === "checkbox" ? "checkbox" : "text";
    if (field.type === "checkbox") {
      input.checked = Boolean(record.extra?.[field.id]);
      label.classList.add("switch-row");
      label.textContent = "";
      label.append(input, document.createElement("span"));
      label.querySelector("span").textContent = field.name;
    } else {
      input.value = record.extra?.[field.id] || "";
      label.append(input);
    }
    el.dynamicFields.append(label);
  });
}

function saveSelectedDay() {
  if (!selectedDate) return;
  const extras = {};
  state.fields.forEach((field) => {
    const input = el.dynamicFields.querySelector(`[data-field-id="${field.id}"]`);
    if (!input) return;
    extras[field.id] = field.type === "checkbox" ? input.checked : input.value;
  });

  state.days[selectedDate] = {
    gym: el.gymCheck.checked,
    kungFu: el.kungFuCheck.checked,
    school: el.schoolCheck.checked,
    workout: el.workoutInput.value.trim(),
    notes: el.notesInput.value.trim(),
    extra: extras,
  };
  saveState();
  render();
}

function clearSelectedDay() {
  if (!selectedDate) return;
  delete state.days[selectedDate];
  saveState();
  el.dayDialog.close();
  render();
}

function addField(event) {
  event.preventDefault();
  const name = el.fieldName.value.trim();
  if (!name) return;
  const type = el.fieldType.value;
  const labels = { checkbox: "Sim/nao", text: "Texto", number: "Numero" };
  state.fields.push({
    id: crypto.randomUUID(),
    name,
    type,
    typeLabel: labels[type],
  });
  el.fieldName.value = "";
  saveState();
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "meu-ano-util-2026.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(reader.result);
      state = {
        ...structuredClone(defaultState),
        ...imported,
        schedule: { ...defaultSchedule, ...(imported.schedule || {}) },
        kungFuSchedule: normalizeKungFuSchedule(imported.kungFuSchedule),
        fields: Array.isArray(imported.fields) ? imported.fields : [],
        days: imported.days || {},
      };
      saveState();
      render();
    } catch {
      alert("Nao consegui importar esse arquivo.");
    }
  });
  reader.readAsText(file);
}

document.querySelector("#todayBtn").addEventListener("click", () => {
  const todayCard = document.querySelector(`[data-date="${START_DATE}"]`);
  todayCard?.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#resetScheduleBtn").addEventListener("click", () => {
  state.schedule = { ...defaultSchedule };
  saveState();
  render();
});

el.themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState();
  applyTheme();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  el.installBtn.hidden = false;
});

el.installBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  el.installBtn.hidden = true;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  el.installBtn.hidden = true;
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderCalendar();
  });
});

el.searchInput.addEventListener("input", renderCalendar);
el.fieldForm.addEventListener("submit", addField);
document.querySelector("#exportBtn").addEventListener("click", exportData);
document.querySelector("#importInput").addEventListener("change", (event) => importData(event.target.files[0]));
document.querySelector("#clearDayBtn").addEventListener("click", clearSelectedDay);

el.dayForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  saveSelectedDay();
  el.dayDialog.close();
});

render();

if ("serviceWorker" in navigator && ["http:", "https:"].includes(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
