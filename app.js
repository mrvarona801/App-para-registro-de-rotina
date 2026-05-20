const START_DATE = "2026-05-19";
const END_DATE = "2026-12-31";
const STORAGE_KEY = "ano-util-2026:v1";
const APP_VERSION = "1.5";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const FULL_WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
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
  appVersion: APP_VERSION,
  schedule: defaultSchedule,
  kungFuSchedule: defaultKungFuSchedule,
  fields: [],
  days: {},
  filter: "all",
  theme: "light",
  failureMode: "all",
  includeOptionalKungFu: false,
  autoOpenToday: true,
  reminderEnabled: false,
  reminderHour: 20,
  lastAutoOpenedDate: "",
  lastReminderDate: "",
};

let state = loadState();
let selectedDate = null;
let deferredInstallPrompt = null;

const el = {
  elapsedDays: document.querySelector("#elapsedDays"),
  currentDayLabel: document.querySelector("#currentDayLabel"),
  completeDays: document.querySelector("#completeDays"),
  completeDaysDetail: document.querySelector("#completeDaysDetail"),
  failedDays: document.querySelector("#failedDays"),
  failedDaysDetail: document.querySelector("#failedDaysDetail"),
  workoutsRemaining: document.querySelector("#workoutsRemaining"),
  workoutsDone: document.querySelector("#workoutsDone"),
  kungFuRemaining: document.querySelector("#kungFuRemaining"),
  kungFuDone: document.querySelector("#kungFuDone"),
  schoolRemaining: document.querySelector("#schoolRemaining"),
  schoolDone: document.querySelector("#schoolDone"),
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
  failureMode: document.querySelector("#failureMode"),
  includeOptionalCheck: document.querySelector("#includeOptionalCheck"),
  autoOpenTodayCheck: document.querySelector("#autoOpenTodayCheck"),
  reminderCheck: document.querySelector("#reminderCheck"),
  notificationBtn: document.querySelector("#notificationBtn"),
  notificationStatus: document.querySelector("#notificationStatus"),
  chartCompleteLabel: document.querySelector("#chartCompleteLabel"),
  chartFailedLabel: document.querySelector("#chartFailedLabel"),
  chartPendingLabel: document.querySelector("#chartPendingLabel"),
  chartCompleteBar: document.querySelector("#chartCompleteBar"),
  chartFailedBar: document.querySelector("#chartFailedBar"),
  chartPendingBar: document.querySelector("#chartPendingBar"),
  failureList: document.querySelector("#failureList"),
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
    if (!saved) return migrateState();
    return migrateState(saved);
  } catch {
    return migrateState();
  }
}

function saveState() {
  state.appVersion = APP_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function migrateState(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    ...structuredClone(defaultState),
    ...source,
    appVersion: APP_VERSION,
    schedule: normalizeSchedule(source.schedule),
    kungFuSchedule: normalizeKungFuSchedule(source.kungFuSchedule),
    fields: normalizeFields(source.fields),
    days: normalizeDays(source.days),
    failureMode: source.failureMode === "any" ? "any" : "all",
    includeOptionalKungFu: Boolean(source.includeOptionalKungFu),
    autoOpenToday: source.autoOpenToday !== false,
    reminderEnabled: Boolean(source.reminderEnabled),
    reminderHour: Number.isFinite(Number(source.reminderHour)) ? Number(source.reminderHour) : 20,
  };
}

function normalizeSchedule(saved = {}) {
  return { ...defaultSchedule, ...(saved && typeof saved === "object" ? saved : {}) };
}

function normalizeFields(saved = []) {
  if (!Array.isArray(saved)) return [];
  const labels = { checkbox: "Sim/não", text: "Texto", number: "Número" };
  return saved
    .filter((field) => field && typeof field === "object" && field.name)
    .map((field) => {
      const type = ["checkbox", "text", "number"].includes(field.type) ? field.type : "checkbox";
      return {
        ...field,
        id: field.id || crypto.randomUUID(),
        name: String(field.name),
        type,
        typeLabel: field.typeLabel || labels[type],
      };
    });
}

function normalizeDays(saved = {}) {
  if (!saved || typeof saved !== "object") return {};
  return Object.fromEntries(
    Object.entries(saved)
      .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
      .map(([key, record]) => [key, normalizeDayRecord(record)])
  );
}

function normalizeDayRecord(record = {}) {
  const source = record && typeof record === "object" ? record : {};
  return {
    ...source,
    gym: Boolean(source.gym),
    kungFu: Boolean(source.kungFu),
    school: Boolean(source.school),
    workout: typeof source.workout === "string" ? source.workout : "",
    notes: typeof source.notes === "string" ? source.notes : "",
    extra: source.extra && typeof source.extra === "object" ? { ...source.extra } : {},
  };
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

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function diffDays(start, end) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / 86400000);
}

function todayKey() {
  const today = new Date();
  const start = parseDate(START_DATE);
  const end = parseDate(END_DATE);
  if (today < start) return START_DATE;
  if (today > end) return END_DATE;
  return formatDate(today);
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
  return state.days[dateKey] || normalizeDayRecord();
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
  return dayStatus(date).complete;
}

function plannedGoals(date) {
  const goals = [];
  const kungFu = kungFuFor(date);
  if (workoutFor(date)) goals.push({ id: "gym", done: isGymDone(formatDate(date)) });
  if (isBusinessDay(date)) goals.push({ id: "school", done: isSchoolDone(formatDate(date)) });
  if (kungFu && (!kungFu.optional || state.includeOptionalKungFu)) {
    goals.push({ id: "kungFu", done: isKungFuDone(formatDate(date)) });
  }
  return goals;
}

function dayStatus(date) {
  const goals = plannedGoals(date);
  const doneCount = goals.filter((goal) => goal.done).length;
  const hasGoals = goals.length > 0;
  const complete = hasGoals && (state.failureMode === "any" ? doneCount > 0 : doneCount === goals.length);
  const failed = hasGoals && !complete;
  return { complete, failed, total: goals.length, done: doneCount };
}

function render() {
  applyTheme();
  renderSettings();
  renderWeekdayEditor();
  renderCustomFields();
  renderSummary();
  renderFailurePanel();
  renderWorkoutStats();
  renderKungFuStats();
  renderCalendar();
  updateNotificationStatus();
}

function renderSettings() {
  el.failureMode.value = state.failureMode;
  el.includeOptionalCheck.checked = Boolean(state.includeOptionalKungFu);
  el.autoOpenTodayCheck.checked = Boolean(state.autoOpenToday);
  el.reminderCheck.checked = Boolean(state.reminderEnabled);
}

function renderWeekdayEditor() {
  el.weekdayEditor.innerHTML = "";
  for (let day = 1; day <= 6; day += 1) {
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
  const today = parseDate(todayKey());
  const elapsed = Math.max(0, diffDays(parseDate(START_DATE), today));
  const evaluatedDates = dates.filter((date) => date < today);
  const evaluatedWithGoals = evaluatedDates.filter((date) => plannedGoals(date).length > 0);
  const completeCount = evaluatedWithGoals.filter((date) => dayStatus(date).complete).length;
  const failedCount = evaluatedWithGoals.filter((date) => dayStatus(date).failed).length;
  const businessDates = dates.filter(isBusinessDay);
  const businessRemaining = businessDates.filter((date) => !isDayComplete(date)).length;
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
  el.elapsedDays.textContent = elapsed;
  el.currentDayLabel.textContent = `Hoje: ${displayDate(todayKey())}`;
  el.completeDays.textContent = completeCount;
  el.completeDaysDetail.textContent = `${evaluatedWithGoals.length} dias avaliados`;
  el.failedDays.textContent = failedCount;
  el.failedDaysDetail.textContent = `${businessRemaining} dias úteis ainda incompletos`;
  el.workoutsRemaining.textContent = workoutRemaining;
  el.workoutsDone.textContent = `${workoutDone} feitos de ${workoutDates.length}`;
  el.kungFuRemaining.textContent = kungFuRemaining;
  el.kungFuDone.textContent = `${kungFuDone} feitos, ${optionalKungFuRemaining} sábados opcionais`;
  el.schoolRemaining.textContent = schoolRemaining;
  el.schoolDone.textContent = `${schoolDone} presenças de ${businessDates.length}`;
}

function evaluatedGoalDates() {
  const today = parseDate(todayKey());
  return getDates().filter((date) => date < today && plannedGoals(date).length > 0);
}

function renderFailurePanel() {
  const evaluated = evaluatedGoalDates();
  const complete = evaluated.filter((date) => dayStatus(date).complete);
  const failed = evaluated.filter((date) => dayStatus(date).failed);
  const pending = getDates().filter((date) => date >= parseDate(todayKey()) && plannedGoals(date).length > 0);
  const max = Math.max(1, evaluated.length, pending.length);

  el.chartCompleteLabel.textContent = complete.length;
  el.chartFailedLabel.textContent = failed.length;
  el.chartPendingLabel.textContent = pending.length;
  el.chartCompleteBar.style.width = `${Math.round((complete.length / max) * 100)}%`;
  el.chartFailedBar.style.width = `${Math.round((failed.length / max) * 100)}%`;
  el.chartPendingBar.style.width = `${Math.round((pending.length / max) * 100)}%`;

  if (!failed.length) {
    el.failureList.innerHTML = `<div class="empty-state compact-empty">Nenhum fracasso registrado até agora.</div>`;
    return;
  }

  el.failureList.innerHTML = failed
    .slice(-8)
    .reverse()
    .map((date) => {
      const key = formatDate(date);
      const status = dayStatus(date);
      return `<button class="failure-item" type="button" data-failure-date="${key}">
        <span>${displayDate(key)}</span>
        <strong>${status.done}/${status.total}</strong>
      </button>`;
    })
    .join("");

  el.failureList.querySelectorAll("[data-failure-date]").forEach((button) => {
    button.addEventListener("click", () => openDay(button.dataset.failureDate));
  });
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
  const currentToday = todayKey();
  const record = dayRecord(key);
  const workout = workoutFor(date);
  const kungFu = kungFuFor(date);
  const business = isBusinessDay(date);
  const card = document.createElement("button");
  card.type = "button";
  card.className = ["day-card", key === currentToday ? "today" : "", !business ? "weekend" : "", isDayComplete(date) ? "done" : ""]
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
  const labels = { checkbox: "Sim/não", text: "Texto", number: "Número" };
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
  const exportState = migrateState(state);
  const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: "application/json" });
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
      state = migrateState(imported);
      saveState();
      render();
    } catch {
      alert("Não consegui importar esse arquivo.");
    }
  });
  reader.readAsText(file);
}

document.querySelector("#todayBtn").addEventListener("click", () => {
  const currentToday = todayKey();
  const todayCard = document.querySelector(`[data-date="${currentToday}"]`);
  todayCard?.scrollIntoView({ behavior: "smooth", block: "center" });
  openDay(currentToday);
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

el.failureMode.addEventListener("change", () => {
  state.failureMode = el.failureMode.value;
  saveState();
  render();
});

el.includeOptionalCheck.addEventListener("change", () => {
  state.includeOptionalKungFu = el.includeOptionalCheck.checked;
  saveState();
  render();
});

el.autoOpenTodayCheck.addEventListener("change", () => {
  state.autoOpenToday = el.autoOpenTodayCheck.checked;
  saveState();
  render();
});

el.reminderCheck.addEventListener("change", () => {
  state.reminderEnabled = el.reminderCheck.checked;
  saveState();
  updateNotificationStatus();
  if (state.reminderEnabled) requestNotificationPermission();
});

el.notificationBtn.addEventListener("click", requestNotificationPermission);

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
focusTodayOnStart();
startReminderLoop();

if ("serviceWorker" in navigator && ["http:", "https:"].includes(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

function focusTodayOnStart() {
  const currentToday = todayKey();
  requestAnimationFrame(() => {
    document.querySelector(`[data-date="${currentToday}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (state.autoOpenToday && state.lastAutoOpenedDate !== currentToday) {
      state.lastAutoOpenedDate = currentToday;
      saveState();
      openDay(currentToday);
    }
  });
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    updateNotificationStatus("Este navegador não liberou notificações.");
    return;
  }
  const permission = await Notification.requestPermission();
  updateNotificationStatus(permission === "granted" ? "Lembrete liberado para as 20h." : "Permissão de notificação negada.");
}

function updateNotificationStatus(message) {
  if (message) {
    el.notificationStatus.textContent = message;
    return;
  }
  if (!state.reminderEnabled) {
    el.notificationStatus.textContent = "Notificações desativadas.";
    return;
  }
  if (!("Notification" in window)) {
    el.notificationStatus.textContent = "Notificações indisponíveis neste navegador.";
    return;
  }
  el.notificationStatus.textContent =
    Notification.permission === "granted" ? "Lembrete ativo para as 20h." : "Ative a permissao para receber lembretes.";
}

function startReminderLoop() {
  checkReminder();
  setInterval(checkReminder, 60000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkReminder();
  });
}

async function checkReminder() {
  if (!state.reminderEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
  const now = new Date();
  const currentToday = todayKey();
  if (now.getHours() < state.reminderHour || state.lastReminderDate === currentToday) return;
  if (isDayComplete(parseDate(currentToday))) return;

  state.lastReminderDate = currentToday;
  saveState();
  const title = "Preencher rotina de hoje";
  const options = {
    body: "Registre academia, escola, kung fu e observações do dia.",
    tag: `rotina-${currentToday}`,
    icon: "icons/icon-192.png",
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.showNotification) {
      registration.showNotification(title, options);
      return;
    }
  }
  new Notification(title, options);
}
