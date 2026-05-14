"use strict";

const salaryTables = {
  facultativo: {
    enabled: true,
    label: "Facultativo en formación",
    source: "IB-Salut tabla oficial 2025; importes 2026 revisables cuando se publique tabla completa.",
    baseSalary: {
      R1: 1366.74,
      R2: 1366.74,
      R3: 1366.74,
      R4: 1366.74,
      R5: 1366.74
    },
    trainingComplement: {
      R1: 136.67,
      R2: 273.35,
      R3: 410.02,
      R4: 546.69,
      R5: 683.37
    }
  },
  eir: {
    enabled: false,
    label: "Enfermería en formación",
    message: "EIR pendiente de datos oficiales 2026."
  }
};

const islandAllowance = {
  Mallorca: 205.30,
  Menorca: 410.60,
  Ibiza: 410.60,
  Formentera: 615.90
};

const guardRates = {
  facultativo: {
    R1: { weekday: 19.25, holiday: 21.63, special: 43.26 },
    R2: { weekday: 22.12, holiday: 24.86, special: 49.72 },
    R3: { weekday: 24.96, holiday: 28.05, special: 56.10 },
    R4: { weekday: 28.06, holiday: 31.52, special: 63.04 },
    R5: { weekday: 28.06, holiday: 31.52, special: 63.04 }
  }
};

const extraPayRules = {
  months: [6, 12],
  baseExtraAmount: 822.83,
  includeTrainingComplement: true
};

const specialDays = {
  "2026-01-01": "Año Nuevo",
  "2026-12-24": "Especial IB-Salut",
  "2026-12-25": "Navidad",
  "2026-12-31": "Especial IB-Salut"
};

const publicHolidays = {
  "2026-01-01": "Año Nuevo",
  "2026-01-06": "Epifanía",
  "2026-03-02": "Día siguiente Illes Balears",
  "2026-04-02": "Jueves Santo",
  "2026-04-03": "Viernes Santo",
  "2026-04-06": "Lunes de Pascua",
  "2026-05-01": "Día del Trabajador",
  "2026-08-15": "Asunción",
  "2026-10-12": "Fiesta Nacional",
  "2026-12-08": "Inmaculada",
  "2026-12-25": "Navidad",
  "2026-12-26": "Segunda fiesta de Navidad"
};

const irpfSuggestions = {
  0: 21,
  1: 18,
  2: 17,
  3: 15
};

const socialSecurityDefaults = {
  rate: 6.4
};

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

const typeLabels = {
  weekday: "Laborable",
  holiday: "Sábado/festivo",
  special: "Especial"
};

const state = {
  guards: new Map(),
  extraTouched: false,
  irpfTouched: false
};

const el = {
  form: document.querySelector("#payrollForm"),
  residencyYear: document.querySelector("#residencyYear"),
  profile: document.querySelector("#profile"),
  island: document.querySelector("#island"),
  children: document.querySelector("#children"),
  year: document.querySelector("#year"),
  month: document.querySelector("#month"),
  includeExtra: document.querySelector("#includeExtra"),
  irpf: document.querySelector("#irpf"),
  triennials: document.querySelector("#triennials"),
  socialSecurity: document.querySelector("#socialSecurity"),
  usualGuards: document.querySelector("#usualGuards"),
  calendarLabel: document.querySelector("#calendarLabel"),
  calendar: document.querySelector("#calendar"),
  guardList: document.querySelector("#guardList"),
  hasVacation: document.querySelector("#hasVacation"),
  vacationOptions: document.querySelector("#vacationOptions"),
  includeVacationProration: document.querySelector("#includeVacationProration"),
  prorationMode: document.querySelector("#prorationMode"),
  manualProration: document.querySelector("#manualProration"),
  usualWeekdayGuards: document.querySelector("#usualWeekdayGuards"),
  usualHolidayGuards: document.querySelector("#usualHolidayGuards"),
  usualSpecialGuards: document.querySelector("#usualSpecialGuards"),
  warning: document.querySelector("#warning"),
  resultsGrid: document.querySelector("#resultsGrid"),
  netTotal: document.querySelector("#netTotal"),
  summaryText: document.querySelector("#summaryText"),
  copyBtn: document.querySelector("#copyBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  calculateBtn: document.querySelector("#calculateBtn"),
  suggestIrpfBtn: document.querySelector("#suggestIrpfBtn")
};

function init() {
  monthNames.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1);
    option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    if (index === 4) option.selected = true;
    el.month.append(option);
  });

  wireEvents();
  syncExtraPay(true);
  renderCalendar();
  calculate();
}

function wireEvents() {
  el.form.addEventListener("input", handleInput);
  el.form.addEventListener("change", handleChange);
  el.includeExtra.addEventListener("change", () => {
    state.extraTouched = true;
    calculate();
  });
  el.irpf.addEventListener("input", () => {
    state.irpfTouched = true;
  });
  el.suggestIrpfBtn.addEventListener("click", () => {
    el.irpf.value = getSuggestedIrpf();
    state.irpfTouched = false;
    calculate();
  });
  el.calculateBtn.addEventListener("click", calculate);
  el.resetBtn.addEventListener("click", resetAll);
  el.copyBtn.addEventListener("click", copySummary);
}

function handleInput(event) {
  if (event.target.matches("[data-guard-hours]")) {
    updateGuard(event.target.dataset.guardHours, { hours: toNumber(event.target.value) });
    return;
  }
  calculate();
}

function handleChange(event) {
  const target = event.target;

  if (target.id === "month" || target.id === "year") {
    syncExtraPay(false);
    renderCalendar();
  }

  if (target.id === "children" && !state.irpfTouched) {
    el.irpf.value = getSuggestedIrpf();
  }

  if (target.id === "hasVacation") {
    el.vacationOptions.classList.toggle("hidden", !target.checked);
  }

  if (target.matches("[data-guard-type]")) {
    updateGuard(target.dataset.guardType, { type: target.value, manualType: true });
    return;
  }

  calculate();
}

function resetAll() {
  state.guards.clear();
  state.extraTouched = false;
  state.irpfTouched = false;
  el.form.reset();
  el.residencyYear.value = "R4";
  el.profile.value = "facultativo";
  el.island.value = "Ibiza";
  el.children.value = "2";
  el.year.value = "2026";
  el.month.value = "5";
  el.irpf.value = "17";
  el.socialSecurity.value = String(socialSecurityDefaults.rate);
  el.vacationOptions.classList.add("hidden");
  syncExtraPay(true);
  renderCalendar();
  calculate();
}

function syncExtraPay(force) {
  const month = toNumber(el.month.value);
  if (force || !state.extraTouched) {
    el.includeExtra.checked = extraPayRules.months.includes(month);
  }
}

function renderCalendar() {
  const year = toNumber(el.year.value);
  const month = toNumber(el.month.value);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const validKeys = new Set();

  el.calendarLabel.textContent = `${monthNames[month - 1]} ${year}`;
  el.calendar.innerHTML = "";

  for (let index = 0; index < startOffset; index += 1) {
    const empty = document.createElement("button");
    empty.type = "button";
    empty.className = "day empty";
    empty.tabIndex = -1;
    el.calendar.append(empty);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(year, month, day);
    validKeys.add(key);
    const type = classifyDate(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day ${type}`;
    if (state.guards.has(key)) button.classList.add("selected");
    button.innerHTML = `<span>${day}</span><span class="badge">${shortType(type)}</span>`;
    button.setAttribute("aria-pressed", state.guards.has(key) ? "true" : "false");
    button.addEventListener("click", () => toggleGuard(key));
    el.calendar.append(button);
  }

  [...state.guards.keys()].forEach((key) => {
    if (!validKeys.has(key)) state.guards.delete(key);
  });

  renderGuardList();
}

function toggleGuard(key) {
  if (state.guards.has(key)) {
    state.guards.delete(key);
  } else {
    state.guards.set(key, {
      date: key,
      hours: 17,
      type: classifyDate(key),
      manualType: false
    });
  }
  renderCalendar();
  calculate();
}

function updateGuard(key, patch) {
  const guard = state.guards.get(key);
  if (!guard) return;
  state.guards.set(key, { ...guard, ...patch });
  renderGuardList();
  calculate();
}

function renderGuardList() {
  const guards = sortedGuards();
  el.guardList.innerHTML = "";

  if (guards.length === 0) {
    const empty = document.createElement("div");
    empty.className = "summary-box";
    empty.textContent = "Sin guardias seleccionadas.";
    el.guardList.append(empty);
    return;
  }

  guards.forEach((guard) => {
    const rates = currentRates();
    const rate = rates[guard.type] || 0;
    const amount = rate * safePositive(guard.hours);
    const row = document.createElement("div");
    row.className = "guard-row";
    row.innerHTML = `
      <div class="guard-date">${formatDateShort(guard.date)}<span>${typeLabels[guard.type]}</span></div>
      <label>Tipo
        <select data-guard-type="${guard.date}">
          <option value="weekday"${guard.type === "weekday" ? " selected" : ""}>Laborable</option>
          <option value="holiday"${guard.type === "holiday" ? " selected" : ""}>Sábado/festivo</option>
          <option value="special"${guard.type === "special" ? " selected" : ""}>Especial</option>
        </select>
      </label>
      <label>Horas
        <input data-guard-hours="${guard.date}" type="number" min="0" max="24" step="0.5" value="${guard.hours}">
      </label>
      <div class="rate">${formatCurrency(rate)}/h<br><strong>${formatCurrency(amount)}</strong></div>
      <button type="button" class="icon-btn" aria-label="Eliminar guardia">×</button>
    `;
    row.querySelector(".icon-btn").addEventListener("click", () => {
      state.guards.delete(guard.date);
      renderCalendar();
      calculate();
    });
    el.guardList.append(row);
  });
}

function calculate() {
  const validation = validateInputs();
  if (!validation.ok) {
    showWarning(validation.message, true);
    return;
  }

  hideWarning();

  const profile = el.profile.value;
  const resident = el.residencyYear.value;
  const table = salaryTables[profile];

  if (!table.enabled) {
    showWarning(table.message, true);
    return;
  }

  const base = table.baseSalary[resident];
  const training = table.trainingComplement[resident];
  const island = islandAllowance[el.island.value];
  const triennials = safePositive(toNumber(el.triennials.value));
  const fixed = base + training + island + triennials;
  const guardTotals = calculateGuardTotals();
  const vacationProration = calculateVacationProration();
  const extraPay = el.includeExtra.checked ? extraPayRules.baseExtraAmount + training : 0;
  const gross = fixed + guardTotals.total + vacationProration + extraPay;
  const socialSecurity = gross * safePositive(toNumber(el.socialSecurity.value)) / 100;
  const irpfRate = safePositive(toNumber(el.irpf.value));
  const irpf = gross * irpfRate / 100;
  const net = gross - socialSecurity - irpf;

  const result = {
    fixed,
    guards: guardTotals,
    vacationProration,
    extraPay,
    gross,
    socialSecurity,
    irpf,
    irpfRate,
    net
  };

  renderResults(result);
}

function calculateGuardTotals() {
  const rates = currentRates();
  const totals = {
    count: 0,
    weekdayHours: 0,
    holidayHours: 0,
    specialHours: 0,
    total: 0
  };

  sortedGuards().forEach((guard) => {
    const hours = safePositive(guard.hours);
    const type = guard.type;
    totals.count += 1;
    totals.total += hours * (rates[type] || 0);
    if (type === "weekday") totals.weekdayHours += hours;
    if (type === "holiday") totals.holidayHours += hours;
    if (type === "special") totals.specialHours += hours;
  });

  return totals;
}

function calculateVacationProration() {
  if (!el.hasVacation.checked || !el.includeVacationProration.checked) return 0;
  if (el.prorationMode.value === "manual") return safePositive(toNumber(el.manualProration.value));

  const rates = currentRates();
  const hours = 17;
  const weekday = safePositive(toNumber(el.usualWeekdayGuards.value)) * hours * rates.weekday;
  const holiday = safePositive(toNumber(el.usualHolidayGuards.value)) * hours * rates.holiday;
  const special = safePositive(toNumber(el.usualSpecialGuards.value)) * hours * rates.special;
  return weekday + holiday + special;
}

function renderResults(result) {
  el.netTotal.textContent = formatCurrency(result.net);

  const metrics = [
    ["Fijo mensual", formatCurrency(result.fixed)],
    ["Guardias reales", formatCurrency(result.guards.total)],
    ["Guardias", String(result.guards.count)],
    ["Horas laborables", formatHours(result.guards.weekdayHours)],
    ["Horas sábado/festivo", formatHours(result.guards.holidayHours)],
    ["Horas especiales", formatHours(result.guards.specialHours)]
  ];

  if (result.vacationProration > 0) metrics.push(["Prorrateo vacaciones", formatCurrency(result.vacationProration)]);
  if (result.extraPay > 0) metrics.push(["Paga extra", formatCurrency(result.extraPay)]);

  metrics.push(
    ["Bruto total", formatCurrency(result.gross), "total"],
    ["Seguridad Social", `-${formatCurrency(result.socialSecurity)}`],
    [`IRPF aplicado ${formatPercent(result.irpfRate)}`, `-${formatCurrency(result.irpf)}`],
    ["Neto estimado", formatCurrency(result.net), "total"]
  );

  el.resultsGrid.innerHTML = "";
  metrics.forEach(([label, value, variant]) => {
    const item = document.createElement("div");
    item.className = `metric ${variant || ""}`;
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    el.resultsGrid.append(item);
  });

  el.summaryText.textContent = buildSummary(result);
}

function buildSummary(result) {
  const resident = el.residencyYear.value;
  const island = el.island.value;
  const month = monthNames[toNumber(el.month.value) - 1];
  const year = el.year.value;
  const guards = result.guards.count === 1 ? "1 guardia" : `${result.guards.count} guardias`;
  return `${resident} en ${island} · ${month} ${year} · ${guards} · IRPF ${formatPercent(result.irpfRate)} · bruto estimado ${formatCurrency(result.gross)} · neto estimado ${formatCurrency(result.net)}.`;
}

async function copySummary() {
  const text = el.summaryText.textContent.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showWarning("Resumen copiado.", false);
  } catch {
    showWarning("No se pudo copiar automáticamente.", true);
  }
}

function validateInputs() {
  const numericFields = [
    [el.irpf, "IRPF"],
    [el.socialSecurity, "Seguridad Social"],
    [el.triennials, "Trienios"],
    [el.usualGuards, "Guardias habituales"],
    [el.manualProration, "Prorrateo manual"]
  ];

  for (const [field, label] of numericFields) {
    if (toNumber(field.value) < 0) return { ok: false, message: `${label}: no puede ser negativo.` };
  }

  for (const guard of state.guards.values()) {
    if (toNumber(guard.hours) < 0) return { ok: false, message: "Las horas no pueden ser negativas." };
  }

  if (toNumber(el.irpf.value) > 60) return { ok: false, message: "IRPF superior al 60%. Revísalo antes de calcular." };
  return { ok: true };
}

function currentRates() {
  const profile = el.profile.value;
  const resident = el.residencyYear.value;
  return guardRates[profile]?.[resident] || { weekday: 0, holiday: 0, special: 0 };
}

function classifyDate(key) {
  if (specialDays[key]) return "special";
  if (publicHolidays[key]) return "holiday";
  const date = parseDateKey(key);
  const weekday = date.getDay();
  if (weekday === 0 || weekday === 6) return "holiday";
  return "weekday";
}

function shortType(type) {
  if (type === "special") return "ESP";
  if (type === "holiday") return "FES";
  return "";
}

function sortedGuards() {
  return [...state.guards.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function getSuggestedIrpf() {
  const key = Math.min(toNumber(el.children.value), 3);
  return irpfSuggestions[key];
}

function showWarning(message, isError) {
  el.warning.textContent = message;
  el.warning.classList.toggle("error", Boolean(isError));
  el.warning.classList.remove("hidden");
}

function hideWarning() {
  el.warning.classList.add("hidden");
  el.warning.classList.remove("error");
}

function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateShort(key) {
  const date = parseDateKey(key);
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(date);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value || 0);
}

function formatHours(value) {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value || 0)} h`;
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value || 0)}%`;
}

function toNumber(value) {
  const number = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function safePositive(value) {
  return Math.max(0, value || 0);
}

init();
