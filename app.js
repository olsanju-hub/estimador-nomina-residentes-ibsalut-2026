"use strict";

const salaryTables = {
  facultativo: {
    enabled: true,
    label: "Facultativo en formación",
    source: "Tablas retributivas_2026_ESP.pdf, Tabla VI (01-01-2026).",
    baseSalary: {
      R1: 1387.24,
      R2: 1387.24,
      R3: 1387.24,
      R4: 1387.24,
      R5: 1387.24
    },
    trainingComplement: {
      R1: 138.72,
      R2: 277.45,
      R3: 416.17,
      R4: 554.90,
      R5: 693.62
    },
    monthlyBaseTotal: {
      R1: 1525.96,
      R2: 1664.69,
      R3: 1803.41,
      R4: 1942.14,
      R5: 2080.86
    },
    extraPay: {
      R1: 994.77,
      R2: 1133.50,
      R3: 1272.22,
      R4: 1410.95,
      R5: 1549.67
    },
    annualTotal: {
      R1: 20301.12,
      R2: 22243.25,
      R3: 24185.39,
      R4: 26127.52,
      R5: 28069.66
    }
  },
  eir: {
    enabled: false,
    label: "Enfermería en formación",
    message: "EIR pendiente de datos oficiales 2026."
  }
};

const islandAllowance = {
  Mallorca: 147.09,
  Menorca: 226.72,
  Ibiza: 226.72
};

const guardRates = {
  facultyResident: {
    R1: {
      normal: { weekday: 19.29, holiday: 21.21 },
      fifthAndFollowing: { weekday: 24.12, holiday: 26.51 },
      special: 42.43
    },
    R2: {
      normal: { weekday: 21.07, holiday: 23.18 },
      fifthAndFollowing: { weekday: 26.34, holiday: 28.99 },
      special: 46.36
    },
    R3: {
      normal: { weekday: 23.49, holiday: 25.84 },
      fifthAndFollowing: { weekday: 29.37, holiday: 32.31 },
      special: 51.67
    },
    R4: {
      normal: { weekday: 25.90, holiday: 28.48 },
      fifthAndFollowing: { weekday: 32.38, holiday: 35.61 },
      special: 56.99
    },
    R5: {
      normal: { weekday: 25.90, holiday: 28.48 },
      fifthAndFollowing: { weekday: 32.38, holiday: 35.61 },
      special: 56.99
    }
  }
};

const payrollDataMeta = {
  source: "Tablas retributivas_2026_ESP.pdf",
  tableDate: "01-01-2026",
  tables: ["IV", "VI", "VIII"],
  fifthGuardRule: "Las guardias 5.ª y siguientes usan el tramo oficial si el día no es especial. En días especiales se prioriza la tarifa especial."
};

const extraPayRules = {
  months: [6, 12],
  source: "Tabla VI: paga extraordinaria por año de residencia."
};

const specialDays = {
  "2025-12-24": "Especial IB-Salut",
  "2025-12-25": "Navidad",
  "2025-12-31": "Revisar 31/12",
  "2026-01-01": "Año Nuevo",
  "2026-12-24": "Especial IB-Salut",
  "2026-12-25": "Navidad",
  "2026-12-31": "Revisar 31/12"
};

const publicHolidays = {
  "2025-12-06": "Constitución",
  "2025-12-08": "Inmaculada",
  "2025-12-25": "Navidad",
  "2025-12-26": "Segunda fiesta de Navidad",
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

const scopeLabels = {
  hospital: "Hospital",
  primary: "Centro de salud",
  manual: "Manual"
};

const state = {
  guards: new Map(),
  extraTouched: false,
  irpfTouched: false,
  currentStep: "data"
};

const el = {
  form: document.querySelector("#payrollForm"),
  residencyYear: document.querySelector("#residencyYear"),
  profile: document.querySelector("#profile"),
  island: document.querySelector("#island"),
  children: document.querySelector("#children"),
  year: document.querySelector("#year"),
  month: document.querySelector("#month"),
  guardYear: document.querySelector("#guardYear"),
  guardMonth: document.querySelector("#guardMonth"),
  customGuardMonth: document.querySelector("#customGuardMonth"),
  guardMonthControls: document.querySelector("#guardMonthControls"),
  use2026RatesWrap: document.querySelector("#use2026RatesWrap"),
  use2026RatesForPastGuards: document.querySelector("#use2026RatesForPastGuards"),
  payrollMonthLabel: document.querySelector("#payrollMonthLabel"),
  paidGuardsLabel: document.querySelector("#paidGuardsLabel"),
  guardPayrollLabel: document.querySelector("#guardPayrollLabel"),
  guardPaidLabel: document.querySelector("#guardPaidLabel"),
  includeExtra: document.querySelector("#includeExtra"),
  irpf: document.querySelector("#irpf"),
  socialSecurity: document.querySelector("#socialSecurity"),
  usualGuards: document.querySelector("#usualGuards"),
  scope: document.querySelector("#scope"),
  recalculateHoursBtn: document.querySelector("#recalculateHoursBtn"),
  calendarLabel: document.querySelector("#calendarLabel"),
  calendarHint: document.querySelector("#calendarHint"),
  calendar: document.querySelector("#calendar"),
  guardList: document.querySelector("#guardList"),
  hasVacation: document.querySelector("#hasVacation"),
  vacationOptions: document.querySelector("#vacationOptions"),
  includeVacationProration: document.querySelector("#includeVacationProration"),
  prorationMode: document.querySelector("#prorationMode"),
  manualProration: document.querySelector("#manualProration"),
  vacationDays: document.querySelector("#vacationDays"),
  averageGuardAmount: document.querySelector("#averageGuardAmount"),
  warning: document.querySelector("#warning"),
  resultsGrid: document.querySelector("#resultsGrid"),
  netTotal: document.querySelector("#netTotal"),
  summaryText: document.querySelector("#summaryText"),
  copyBtn: document.querySelector("#copyBtn"),
  printBtn: document.querySelector("#printBtn"),
  printSummary: document.querySelector("#printSummary"),
  resetBtn: document.querySelector("#resetBtn"),
  calculateBtn: document.querySelector("#calculateBtn"),
  suggestIrpfBtn: document.querySelector("#suggestIrpfBtn"),
  stepTabs: document.querySelectorAll("[data-go-step]"),
  stepPanels: document.querySelectorAll("[data-step]")
};

function init() {
  monthNames.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1);
    option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    if (index === 4) option.selected = true;
    el.month.append(option);

    const guardOption = option.cloneNode(true);
    guardOption.selected = false;
    el.guardMonth.append(guardOption);
  });

  wireEvents();
  syncGuardMonth(true);
  syncExtraPay(true);
  updateMonthLabels();
  setStep("data");
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
  el.recalculateHoursBtn.addEventListener("click", recalculateAllHours);
  el.calculateBtn.addEventListener("click", calculate);
  el.resetBtn.addEventListener("click", resetAll);
  el.copyBtn.addEventListener("click", copySummary);
  el.printBtn.addEventListener("click", () => {
    calculate();
    window.print();
  });
  el.stepTabs.forEach((button) => {
    button.addEventListener("click", () => setStep(button.dataset.goStep));
  });
}

function handleInput(event) {
  const target = event.target;

  if (target.matches("[data-guard-hours]")) {
    updateGuard(target.dataset.guardHours, {
      hours: safePositive(toNumber(target.value)),
      hoursEdited: true,
      hoursMode: "direct"
    });
    return;
  }

  if (target.matches("[data-guard-time]")) {
    const key = target.dataset.guardTime;
    const field = target.dataset.timeField;
    const guard = state.guards.get(key);
    if (!guard) return;
    const patch = { [field]: target.value, hoursMode: "schedule", hoursEdited: true };
    const start = field === "startTime" ? target.value : guard.startTime;
    const end = field === "endTime" ? target.value : guard.endTime;
    const hours = calculateScheduleHours(start, end);
    if (hours !== null) patch.hours = hours;
    updateGuard(key, patch);
    return;
  }

  if (target.matches("[data-guard-money]")) {
    const key = target.dataset.guardMoney;
    const field = target.dataset.moneyField;
    updateGuard(key, { [field]: target.value });
    return;
  }

  calculate();
}

function handleChange(event) {
  const target = event.target;

  if (target.id === "month" || target.id === "year") {
    syncGuardMonth(false);
    syncExtraPay(false);
    updateMonthLabels();
    renderCalendar();
  }

  if (target.id === "residencyYear" || target.id === "profile") {
    renderGuardList();
  }

  if (target.id === "customGuardMonth") {
    el.guardMonthControls.classList.toggle("hidden", !target.checked);
    if (!target.checked) syncGuardMonth(true);
    updateMonthLabels();
    renderCalendar();
  }

  if (target.id === "guardMonth" || target.id === "guardYear" || target.id === "use2026RatesForPastGuards") {
    updateMonthLabels();
    renderCalendar();
  }

  if (target.id === "children" && !state.irpfTouched) {
    el.irpf.value = getSuggestedIrpf();
  }

  if (target.id === "hasVacation") {
    el.vacationOptions.classList.toggle("hidden", !target.checked);
  }

  if (target.id === "scope") {
    updateCalendarHint();
  }

  if (target.matches("[data-guard-scope]")) {
    const key = target.dataset.guardScope;
    const guard = state.guards.get(key);
    if (!guard) return;
    const patch = { scope: target.value };
    if (!guard.hoursEdited && !isDec31(key)) patch.hours = defaultHoursForGuard(key, target.value);
    updateGuard(key, patch);
    return;
  }

  if (target.matches("[data-guard-type]")) {
    updateGuard(target.dataset.guardType, { dayType: target.value, dayTypeEdited: true });
    return;
  }

  if (target.matches("[data-hours-mode]")) {
    updateGuard(target.dataset.hoursMode, { hoursMode: target.value });
    return;
  }

  if (target.matches("[data-payment-type]")) {
    updateGuard(target.dataset.paymentType, { paymentType: target.value });
    return;
  }

  if (target.matches("[data-payment-override]")) {
    updateGuard(target.dataset.paymentOverride, { paymentOverride: target.value });
    return;
  }

  if (target.matches("[data-dec31-mode]")) {
    applyDec31Mode(target.dataset.dec31Mode, target.value);
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
  el.customGuardMonth.checked = false;
  el.guardMonthControls.classList.add("hidden");
  el.use2026RatesForPastGuards.checked = false;
  el.scope.value = "hospital";
  el.irpf.value = "17";
  el.socialSecurity.value = String(socialSecurityDefaults.rate);
  el.vacationDays.value = "0";
  el.averageGuardAmount.value = "1200";
  el.vacationOptions.classList.add("hidden");
  syncGuardMonth(true);
  syncExtraPay(true);
  updateMonthLabels();
  renderCalendar();
  calculate();
}

function syncGuardMonth(force) {
  if (!force && el.customGuardMonth.checked) return;
  const payrollYear = toNumber(el.year.value);
  const payrollMonth = toNumber(el.month.value);
  const previous = previousMonth(payrollYear, payrollMonth);
  el.guardYear.value = String(previous.year);
  el.guardMonth.value = String(previous.month);
}

function syncExtraPay(force) {
  const month = toNumber(el.month.value);
  if (force || !state.extraTouched) {
    el.includeExtra.checked = extraPayRules.months.includes(month);
  }
}

function renderCalendar() {
  const year = getGuardPeriod().year;
  const month = getGuardPeriod().month;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const validKeys = new Set();

  el.calendarLabel.textContent = `Guardias realizadas en ${periodLabel(year, month)}`;
  updateCalendarHint();
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
    const visualType = getCalendarVisualType(key);
    const accessibleType = getCalendarAccessibleType(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day ${type} ${visualType} ${isDec31(key) ? "review" : ""}`;
    if (state.guards.has(key)) button.classList.add("selected");
    button.innerHTML = `<span class="day-number">${day}</span><span class="day-marker" aria-hidden="true"></span>`;
    button.setAttribute("aria-pressed", state.guards.has(key) ? "true" : "false");
    button.setAttribute("aria-label", `${day} de ${periodLabel(year, month)}. ${accessibleType}. ${state.guards.has(key) ? "Guardia seleccionada" : "Sin guardia seleccionada"}.`);
    button.title = accessibleType;
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
    state.guards.set(key, createGuard(key));
  }
  renderCalendar();
  calculate();
}

function createGuard(key) {
  const scope = el.scope.value;
  const dayType = classifyDate(key);
  const dec31 = isDec31(key);
  return {
    date: key,
    scope,
    dayType,
    dayTypeEdited: false,
    hoursMode: "direct",
    startTime: "",
    endTime: "",
    hours: dec31 ? 0 : defaultHoursForGuard(key, scope),
    hoursEdited: false,
    paymentType: "guard",
    paymentOverride: "auto",
    manualHourlyRate: "",
    manualTotalAmount: "",
    ordinaryHourlyRate: "",
    partialManualAmount: "",
    dec31Mode: dec31 ? "" : "normal"
  };
}

function updateGuard(key, patch) {
  const guard = state.guards.get(key);
  if (!guard) return;
  state.guards.set(key, { ...guard, ...patch });
  renderGuardList();
  calculate();
}

function recalculateAllHours() {
  state.guards.forEach((guard, key) => {
    if (isDec31(key)) return;
    state.guards.set(key, {
      ...guard,
      scope: el.scope.value,
      hours: defaultHoursForGuard(key, el.scope.value),
      hoursMode: "direct",
      hoursEdited: false
    });
  });
  renderGuardList();
  calculate();
  showWarning("Horas recalculadas según ámbito.", false);
}

function applyDec31Mode(key, mode) {
  const guard = state.guards.get(key);
  if (!guard) return;
  const patch = { dec31Mode: mode, hoursMode: "direct" };

  if (mode === "guard17") {
    patch.hours = 17;
    patch.paymentType = "guard";
    patch.paymentOverride = "auto";
  }
  if (mode === "guard24") {
    patch.hours = 24;
    patch.paymentType = "guard";
    patch.paymentOverride = "auto";
  }
  if (mode === "special17") {
    patch.hours = 17;
    patch.dayType = "special";
    patch.dayTypeEdited = true;
    patch.paymentType = "guard";
    patch.paymentOverride = "auto";
  }
  if (mode === "special24") {
    patch.hours = 24;
    patch.dayType = "special";
    patch.dayTypeEdited = true;
    patch.paymentType = "guard";
    patch.paymentOverride = "auto";
  }
  if (mode === "manual") {
    patch.paymentType = "manual";
    patch.paymentOverride = "manualAmount";
  }

  patch.hoursEdited = mode !== "";
  updateGuard(key, patch);
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
    const guardIndex = getGuardIndex(guard.date);
    const calc = getGuardAmount(guard, el.residencyYear.value, guardIndex);
    const partial = guard.hours > 0 && guard.hours < 14.5;
    const row = document.createElement("div");
    row.className = `guard-row ${partial ? "is-partial" : ""}`;
    row.innerHTML = `
      <div class="guard-top">
        <div class="guard-date">
          ${formatDateShort(guard.date)}
          <span>${guardIndex ? `${guardIndex}.ª guardia · ` : ""}${scopeLabels[guard.scope]} · ${typeLabels[guard.dayType]}</span>
          ${calc.isFifthRate ? '<em>5.ª y sig.</em>' : ""}
          ${guard.hoursEdited || guard.dayTypeEdited ? '<em>Editada</em>' : ""}
        </div>
        <label>Ámbito
          <select data-guard-scope="${guard.date}">
            <option value="hospital"${guard.scope === "hospital" ? " selected" : ""}>Hospital</option>
            <option value="primary"${guard.scope === "primary" ? " selected" : ""}>Centro salud</option>
            <option value="manual"${guard.scope === "manual" ? " selected" : ""}>Manual</option>
          </select>
        </label>
        <label>Tipo día
          <select data-guard-type="${guard.date}">
            <option value="weekday"${guard.dayType === "weekday" ? " selected" : ""}>Laborable</option>
            <option value="holiday"${guard.dayType === "holiday" ? " selected" : ""}>Festivo</option>
            <option value="special"${guard.dayType === "special" ? " selected" : ""}>Especial</option>
          </select>
        </label>
        <label>Horas
          <input data-guard-hours="${guard.date}" type="number" min="0" max="24" step="0.5" value="${formatInputNumber(guard.hours)}">
        </label>
        <div class="rate">${calc.rateLabel}<br><strong>${formatCurrency(calc.amount)}</strong></div>
        <button type="button" class="icon-btn" aria-label="Eliminar guardia">×</button>
      </div>

      ${isDec31(guard.date) ? renderDec31Controls(guard) : ""}
      ${partial ? renderPartialControls(guard) : ""}

      <details class="guard-details"${guard.hoursMode === "schedule" || guard.paymentOverride !== "auto" ? " open" : ""}>
        <summary>Editar pago</summary>
        <div class="guard-extra-grid">
          <label>Horas
            <select data-hours-mode="${guard.date}">
              <option value="direct"${guard.hoursMode === "direct" ? " selected" : ""}>Horas directas</option>
              <option value="schedule"${guard.hoursMode === "schedule" ? " selected" : ""}>Calcular por horario</option>
            </select>
          </label>
          ${guard.hoursMode === "schedule" ? renderTimeControls(guard) : ""}
          <label>Pago
            <select data-payment-override="${guard.date}">
              <option value="auto"${guard.paymentOverride === "auto" ? " selected" : ""}>Tarifa automática</option>
              <option value="manualRate"${guard.paymentOverride === "manualRate" ? " selected" : ""}>Precio/h manual</option>
              <option value="manualAmount"${guard.paymentOverride === "manualAmount" ? " selected" : ""}>Importe manual</option>
            </select>
          </label>
          ${guard.paymentOverride === "manualRate" ? renderMoneyInput(guard, "manualHourlyRate", "Precio/h manual (€)") : ""}
          ${guard.paymentOverride === "manualAmount" ? renderMoneyInput(guard, "manualTotalAmount", "Importe total (€)") : ""}
        </div>
      </details>
    `;

    row.querySelector(".icon-btn").addEventListener("click", () => {
      state.guards.delete(guard.date);
      renderCalendar();
      calculate();
    });
    el.guardList.append(row);
  });
}

function renderDec31Controls(guard) {
  return `
    <div class="guard-alert">31/12: confirma horas y tarifa.</div>
    <label class="wide-label">31 de diciembre
      <select data-dec31-mode="${guard.date}">
        <option value=""${guard.dec31Mode === "" ? " selected" : ""}>Revisar</option>
        <option value="guard17"${guard.dec31Mode === "guard17" ? " selected" : ""}>Guardia 17 h</option>
        <option value="guard24"${guard.dec31Mode === "guard24" ? " selected" : ""}>Guardia 24 h</option>
        <option value="special17"${guard.dec31Mode === "special17" ? " selected" : ""}>Especial 17 h</option>
        <option value="special24"${guard.dec31Mode === "special24" ? " selected" : ""}>Especial 24 h</option>
        <option value="manual"${guard.dec31Mode === "manual" ? " selected" : ""}>Manual</option>
      </select>
    </label>
  `;
}

function renderPartialControls(guard) {
  return `
    <div class="guard-alert">Este turno es menor de 14,5 h. Indica cómo se paga.</div>
    <div class="guard-extra-grid">
      <label>Tipo de pago
        <select data-payment-type="${guard.date}">
          <option value="guard"${guard.paymentType === "guard" ? " selected" : ""}>Hora de guardia</option>
          <option value="ordinary"${guard.paymentType === "ordinary" ? " selected" : ""}>Hora ordinaria</option>
          <option value="manual"${guard.paymentType === "manual" ? " selected" : ""}>Manual</option>
        </select>
      </label>
      ${guard.paymentType === "ordinary" ? renderMoneyInput(guard, "ordinaryHourlyRate", "Precio/hora ordinaria (€)") : ""}
      ${guard.paymentType === "manual" ? renderMoneyInput(guard, "partialManualAmount", "Importe del turno (€)") : ""}
    </div>
  `;
}

function renderTimeControls(guard) {
  return `
    <label>Inicio
      <input data-guard-time="${guard.date}" data-time-field="startTime" type="time" value="${guard.startTime}">
    </label>
    <label>Fin
      <input data-guard-time="${guard.date}" data-time-field="endTime" type="time" value="${guard.endTime}">
    </label>
  `;
}

function renderMoneyInput(guard, field, label) {
  const value = guard[field] ?? "";
  return `
    <label>${label}
      <input data-guard-money="${guard.date}" data-money-field="${field}" type="number" min="0" step="0.01" value="${value}">
    </label>
  `;
}

function calculate() {
  const validation = validateInputs();
  if (!validation.ok) {
    showWarning(validation.message, true);
    return;
  }

  const softWarning = getSoftWarning();
  if (softWarning) showWarning(softWarning, false);
  else hideWarning();

  const table = salaryTables[el.profile.value];
  if (!table.enabled) {
    showWarning(table.message, true);
    return;
  }

  renderResults(computePayroll());
}

function computePayroll() {
  const profile = el.profile.value;
  const resident = el.residencyYear.value;
  const fixedParts = {
    base: getBaseSalary(profile, resident),
    training: getTrainingSupplement(profile, resident),
    island: getIslandAllowance(el.island.value)
  };
  const fixed = getFixedMonthlySalary(profile, resident, el.island.value);
  const guardTotals = getGuardsTotal(sortedGuards(), resident);
  const vacationProration = getVacationProrationAmount();
  const extraPay = getExtraPay(profile, resident, el.includeExtra.checked);
  const gross = getGrossTotal(fixed, guardTotals.total, vacationProration, extraPay);
  const socialSecurityRate = safePositive(toNumber(el.socialSecurity.value));
  const socialSecurity = getSocialSecurityAmount(gross, socialSecurityRate);
  const irpfRate = safePositive(toNumber(el.irpf.value));
  const irpf = getIrpfAmount(gross, irpfRate);
  const net = getNetTotal(gross, socialSecurity, irpf);

  return {
    fixedParts,
    fixed,
    guards: guardTotals,
    vacationProration,
    extraPay,
    gross,
    socialSecurity,
    socialSecurityRate,
    irpf,
    irpfRate,
    net
  };
}

function getBaseSalary(profile, residencyYear) {
  return salaryTables[profile]?.baseSalary?.[residencyYear] || 0;
}

function getTrainingSupplement(profile, residencyYear) {
  return salaryTables[profile]?.trainingComplement?.[residencyYear] || 0;
}

function getIslandAllowance(island) {
  return islandAllowance[island] || 0;
}

function getFixedMonthlySalary(profile, residencyYear, island) {
  return getBaseSalary(profile, residencyYear) + getTrainingSupplement(profile, residencyYear) + getIslandAllowance(island);
}

function getExtraPay(profile, residencyYear, includeExtraPay) {
  if (!includeExtraPay) return 0;
  return salaryTables[profile]?.extraPay?.[residencyYear] || 0;
}

function getGrossTotal(fixed, guards, vacationProration, extraPay) {
  return fixed + guards + vacationProration + extraPay;
}

function getSocialSecurityAmount(gross, rate) {
  return gross * rate / 100;
}

function getIrpfAmount(gross, rate) {
  return gross * rate / 100;
}

function getNetTotal(gross, socialSecurity, irpf) {
  return gross - socialSecurity - irpf;
}

function getGuardsTotal(guards, residencyYear) {
  const totals = {
    count: 0,
    automaticGuardCount: 0,
    normalGuardCount: 0,
    fifthGuardCount: 0,
    weekdayHours: 0,
    holidayHours: 0,
    specialHours: 0,
    ordinaryManualHours: 0,
    ordinaryManualAmount: 0,
    partialManualCount: 0,
    total: 0
  };

  guards.forEach((guard) => {
    const hours = safePositive(guard.hours);
    const guardIndex = getGuardIndex(guard.date);
    const calc = getGuardAmount(guard, residencyYear, guardIndex);
    totals.count += 1;
    totals.total += calc.amount;
    if (guardIndex) totals.automaticGuardCount += 1;
    if (guardIndex && calc.isFifthRate) totals.fifthGuardCount += 1;
    if (guardIndex && calc.isNormalRate) totals.normalGuardCount += 1;

    if (guard.dayType === "weekday") totals.weekdayHours += hours;
    if (guard.dayType === "holiday") totals.holidayHours += hours;
    if (guard.dayType === "special") totals.specialHours += hours;
    if (calc.isManualOrOrdinary) {
      totals.ordinaryManualHours += hours;
      totals.ordinaryManualAmount += calc.amount;
      totals.partialManualCount += 1;
    }
  });

  return totals;
}

function getGuardIndex(dateKeyValue) {
  let index = 0;
  for (const guard of sortedGuards()) {
    if (countsAsAutomaticGuard(guard)) index += 1;
    if (guard.date === dateKeyValue) return countsAsAutomaticGuard(guard) ? index : 0;
  }
  return 0;
}

function countsAsAutomaticGuard(guard) {
  if ((guard.paymentType || "guard") !== "guard") return false;
  return guard.paymentOverride !== "manualAmount";
}

function getGuardRate(residencyYear, dayType, guardIndex, paymentType) {
  const rates = guardRates.facultyResident[residencyYear];
  if (!rates || paymentType !== "guard") return 0;
  if (dayType === "special") return rates.special;
  const rateGroup = guardIndex >= 5 ? rates.fifthAndFollowing : rates.normal;
  return rateGroup[dayType] || 0;
}

function getGuardAmount(guard, residencyYear, guardIndex) {
  const hours = safePositive(guard.hours);
  const canUseAutomaticRates = canUseRatesForGuard(guard);
  const paymentType = guard.paymentType || "guard";
  const automaticRate = canUseAutomaticRates ? getGuardRate(residencyYear, guard.dayType, guardIndex, paymentType) : 0;
  const partial = hours > 0 && hours < 14.5;

  if (guard.paymentOverride === "manualAmount") {
    return {
      amount: safePositive(toNumber(guard.manualTotalAmount)),
      rate: 0,
      rateLabel: "Manual",
      isFifthRate: false,
      isNormalRate: false,
      isManualOrOrdinary: true
    };
  }

  if (guard.paymentOverride === "manualRate") {
    const rate = safePositive(toNumber(guard.manualHourlyRate));
    return {
      amount: hours * rate,
      rate,
      rateLabel: `${formatCurrency(rate)}/h`,
      isFifthRate: false,
      isNormalRate: false,
      isManualOrOrdinary: true
    };
  }

  if (partial && guard.paymentType === "ordinary") {
    const rate = safePositive(toNumber(guard.ordinaryHourlyRate));
    return {
      amount: hours * rate,
      rate,
      rateLabel: rate > 0 ? `${formatCurrency(rate)}/h` : "Ordinaria",
      isFifthRate: false,
      isNormalRate: false,
      isManualOrOrdinary: true
    };
  }

  if (partial && guard.paymentType === "manual") {
    return {
      amount: safePositive(toNumber(guard.partialManualAmount)),
      rate: 0,
      rateLabel: "Manual",
      isFifthRate: false,
      isNormalRate: false,
      isManualOrOrdinary: true
    };
  }

  return {
    amount: hours * automaticRate,
    rate: automaticRate,
    rateLabel: canUseAutomaticRates ? `${formatCurrency(automaticRate)}/h` : "Tarifa manual",
    isFifthRate: paymentType === "guard" && guard.dayType !== "special" && guardIndex >= 5,
    isNormalRate: paymentType === "guard" && guard.dayType !== "special" && guardIndex > 0 && guardIndex < 5,
    isManualOrOrdinary: false
  };
}

function getVacationProrationAmount() {
  if (!el.hasVacation.checked || !el.includeVacationProration.checked) return 0;
  if (el.prorationMode.value === "manual") return safePositive(toNumber(el.manualProration.value));
  const days = safePositive(toNumber(el.vacationDays.value));
  const daysInMonth = new Date(toNumber(el.year.value), toNumber(el.month.value), 0).getDate();
  return safePositive(toNumber(el.averageGuardAmount.value)) * days / daysInMonth;
}

function renderResults(result) {
  el.netTotal.textContent = formatCurrency(result.net);

  const metrics = [
    ["Mes nómina", periodLabel(toNumber(el.year.value), toNumber(el.month.value))],
    ["Mes guardias", periodLabel(getGuardPeriod().year, getGuardPeriod().month)],
    ["Fijo mensual", formatCurrency(result.fixed)],
    ["Guardias cobradas", formatCurrency(result.guards.total)],
    ["Guardias/turnos", String(result.guards.count)],
    ["Guardias tramo normal", String(result.guards.normalGuardCount)],
    ["Guardias 5.ª y sig.", String(result.guards.fifthGuardCount)],
    ["Horas laborables", formatHours(result.guards.weekdayHours)],
    ["Horas festivas", formatHours(result.guards.holidayHours)],
    ["Horas especiales", formatHours(result.guards.specialHours)]
  ];

  if (result.guards.ordinaryManualAmount > 0) {
    metrics.push(["Turnos manuales/ordinarios", formatCurrency(result.guards.ordinaryManualAmount)]);
    metrics.push(["Horas ordinarias/manuales", formatHours(result.guards.ordinaryManualHours)]);
  }
  if (result.vacationProration > 0) metrics.push(["Prorrateo vacaciones", formatCurrency(result.vacationProration)]);
  if (result.extraPay > 0) metrics.push(["Paga extra", formatCurrency(result.extraPay)]);

  metrics.push(
    ["Bruto total", formatCurrency(result.gross), "total"],
    [`Seguridad Social ${formatPercent(result.socialSecurityRate)}`, `-${formatCurrency(result.socialSecurity)}`],
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
  renderPrintSummary(result);
}

function buildSummary(result) {
  const resident = el.residencyYear.value;
  const island = el.island.value;
  const payroll = periodLabel(toNumber(el.year.value), toNumber(el.month.value));
  const guards = periodLabel(getGuardPeriod().year, getGuardPeriod().month);
  const guardCount = result.guards.count - result.guards.partialManualCount;
  const guardText = guardCount === 1 ? "1 guardia" : `${Math.max(0, guardCount)} guardias`;
  const partialText = result.guards.partialManualCount > 0
    ? ` + ${result.guards.partialManualCount} turno${result.guards.partialManualCount === 1 ? " parcial" : "s parciales"}`
    : "";
  return `${resident} ${island} · nómina ${payroll} · guardias ${guards} · ${guardText}${partialText} · IRPF ${formatPercent(result.irpfRate)} · bruto estimado ${formatCurrency(result.gross)} · neto estimado ${formatCurrency(result.net)}.`;
}

function renderPrintSummary(result) {
  const payroll = periodLabel(toNumber(el.year.value), toNumber(el.month.value));
  const guardPeriod = periodLabel(getGuardPeriod().year, getGuardPeriod().month);
  const generatedAt = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date());
  const profileLabel = salaryTables[el.profile.value].label;
  const resident = el.residencyYear.value;
  const devengos = [
    ["Sueldo base", resident, result.fixedParts.base],
    ["Complemento de formación", resident, result.fixedParts.training],
    ["Plus de insularidad", el.island.value, result.fixedParts.island],
    ["Guardias cobradas", `${result.guards.count} guardias/turnos`, result.guards.total],
    ["Guardias tramo normal", `${result.guards.normalGuardCount}`, 0],
    ["Guardias 5.ª y siguientes", `${result.guards.fifthGuardCount}`, 0],
    ["Horas laborables", formatHours(result.guards.weekdayHours), 0],
    ["Horas festivas", formatHours(result.guards.holidayHours), 0],
    ["Horas especiales", formatHours(result.guards.specialHours), 0]
  ];
  if (result.guards.ordinaryManualAmount > 0) devengos.push(["Turnos manuales/ordinarios", formatHours(result.guards.ordinaryManualHours), result.guards.ordinaryManualAmount]);
  if (result.vacationProration > 0) devengos.push(["Prorrateo vacaciones", `${formatInputNumber(toNumber(el.vacationDays.value))} días`, result.vacationProration]);
  if (result.extraPay > 0) devengos.push(["Paga extra", `Tabla VI ${resident}`, result.extraPay]);
  devengos.push(["Total devengado", "Bruto total", result.gross]);

  el.printSummary.innerHTML = `
    <div class="print-header">
      <img class="print-logo" src="assets/favicon.svg" alt="">
      <div>
        <h1>Resumen estimativo de nómina</h1>
        <p>Residentes IB-Salut 2026</p>
      </div>
      <div class="print-meta">
        <span>${generatedAt}</span>
        <span>GuiYo (estimación orientativa, no vinculante)</span>
      </div>
    </div>

    <h2>Datos del cálculo</h2>
    <table>
      <tbody>
        <tr><th>Mes de nómina</th><td>${payroll}</td><th>Guardias cobradas</th><td>${guardPeriod}</td></tr>
        <tr><th>Año residencia</th><td>${resident}</td><th>Perfil</th><td>${profileLabel}</td></tr>
        <tr><th>Isla</th><td>${el.island.value}</td><th>Ámbito</th><td>${scopeLabels[el.scope.value]}</td></tr>
        <tr><th>IRPF</th><td>${formatPercent(result.irpfRate)}</td><th>Seguridad Social</th><td>${formatPercent(result.socialSecurityRate)}</td></tr>
      </tbody>
    </table>

    <h2>Devengos</h2>
    <table>
      <thead><tr><th>Concepto</th><th>Detalle</th><th>Importe</th></tr></thead>
      <tbody>
        ${devengos.map(([concept, detail, amount]) => `<tr><td>${concept}</td><td>${detail}</td><td>${amount ? formatCurrency(amount) : ""}</td></tr>`).join("")}
      </tbody>
    </table>

    <h2>Deducciones</h2>
    <table>
      <thead><tr><th>Concepto</th><th>Base o porcentaje</th><th>Importe</th></tr></thead>
      <tbody>
        <tr><td>Seguridad Social</td><td>${formatPercent(result.socialSecurityRate)}</td><td>${formatCurrency(result.socialSecurity)}</td></tr>
        <tr><td>IRPF</td><td>${formatPercent(result.irpfRate)}</td><td>${formatCurrency(result.irpf)}</td></tr>
        <tr><td>Total deducciones</td><td></td><td>${formatCurrency(result.socialSecurity + result.irpf)}</td></tr>
      </tbody>
    </table>

    <div class="print-net">
      <span>Neto estimado / líquido estimado a percibir</span>
      <strong>${formatCurrency(result.net)}</strong>
    </div>
    <p class="print-legal">Documento orientativo y no vinculante. No sustituye la nómina oficial ni tiene validez administrativa.</p>
  `;
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
    [el.usualGuards, "Guardias habituales"],
    [el.manualProration, "Prorrateo manual"],
    [el.vacationDays, "Días vacaciones"],
    [el.averageGuardAmount, "Media guardias"]
  ];

  for (const [field, label] of numericFields) {
    if (toNumber(field.value) < 0) return { ok: false, message: `${label}: no puede ser negativo.` };
  }

  for (const guard of state.guards.values()) {
    if (toNumber(guard.hours) < 0) return { ok: false, message: "Las horas no pueden ser negativas." };
    const moneyFields = ["manualHourlyRate", "manualTotalAmount", "ordinaryHourlyRate", "partialManualAmount"];
    for (const field of moneyFields) {
      if (toNumber(guard[field]) < 0) return { ok: false, message: "Los importes no pueden ser negativos." };
    }
  }

  if (toNumber(el.irpf.value) > 60) return { ok: false, message: "IRPF superior al 60%. Revísalo antes de calcular." };
  return { ok: true };
}

function getSoftWarning() {
  const guardPeriod = getGuardPeriod();
  if (guardPeriod.year !== 2026 && !el.use2026RatesForPastGuards.checked) {
    return "Tarifas 2025 no cargadas. Usa importes manuales o confirma tarifas 2026.";
  }
  for (const guard of state.guards.values()) {
    if (isDec31(guard.date) && !guard.dec31Mode) return "31/12: confirma horas y tarifa.";
    if (guard.hours > 0 && guard.hours < 14.5 && guard.paymentType === "ordinary" && !toNumber(guard.ordinaryHourlyRate)) {
      return "Introduce precio/hora ordinaria.";
    }
    if (guard.hours > 0 && guard.hours < 14.5 && guard.paymentType === "manual" && !toNumber(guard.partialManualAmount)) {
      return "Introduce importe del turno.";
    }
  }
  return "";
}

function canUseRatesForGuard(guard) {
  const year = parseDateKey(guard.date).getFullYear();
  return year === 2026 || el.use2026RatesForPastGuards.checked || guard.paymentOverride !== "auto";
}

function defaultHoursForGuard(key, scope) {
  if (scope === "manual") return 17;
  const type = classifyDate(key);
  if (type === "special" || type === "holiday") return 24;
  const day = parseDateKey(key).getDay();
  if (scope === "primary") return day >= 1 && day <= 4 ? 14.5 : 17;
  return 17;
}

function classifyDate(key) {
  if (specialDays[key]) return "special";
  if (publicHolidays[key]) return "holiday";
  const date = parseDateKey(key);
  const weekday = date.getDay();
  if (weekday === 0 || weekday === 6) return "holiday";
  return "weekday";
}

function getCalendarVisualType(key) {
  if (specialDays[key]) return "special-day";
  const date = parseDateKey(key);
  const weekday = date.getDay();
  if (publicHolidays[key] && weekday !== 0 && weekday !== 6) return "official-holiday";
  if (weekday === 6) return "saturday";
  if (weekday === 0) return "sunday";
  return "workday";
}

function getCalendarAccessibleType(key) {
  if (specialDays[key]) return `Día especial: ${specialDays[key]}`;
  const date = parseDateKey(key);
  const weekday = date.getDay();
  if (publicHolidays[key] && weekday !== 0 && weekday !== 6) return `Festivo oficial: ${publicHolidays[key]}`;
  if (weekday === 6) return publicHolidays[key] ? `Sábado y festivo oficial: ${publicHolidays[key]}` : "Sábado";
  if (weekday === 0) return publicHolidays[key] ? `Domingo y festivo oficial: ${publicHolidays[key]}` : "Domingo";
  return "Laborable";
}

function calculateScheduleHours(start, end) {
  if (!start || !end) return null;
  const startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;
}

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function updateCalendarHint() {
  const text = el.scope.value === "primary" ? "CS: 14,5 h L-J; 17 h V" : el.scope.value === "hospital" ? "Hospital: 17 h laborable" : "Manual editable";
  el.calendarHint.textContent = text;
}

function updateMonthLabels() {
  const payrollYear = toNumber(el.year.value);
  const payrollMonth = toNumber(el.month.value);
  const guardPeriod = getGuardPeriod();
  const payrollText = periodLabel(payrollYear, payrollMonth);
  const guardText = periodLabel(guardPeriod.year, guardPeriod.month);
  el.payrollMonthLabel.textContent = payrollText;
  el.paidGuardsLabel.textContent = guardText;
  el.guardPayrollLabel.textContent = payrollText;
  el.guardPaidLabel.textContent = guardText;
  el.use2026RatesWrap.classList.toggle("hidden", guardPeriod.year === 2026);
}

function getGuardPeriod() {
  return {
    year: toNumber(el.guardYear.value),
    month: toNumber(el.guardMonth.value)
  };
}

function previousMonth(year, month) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function periodLabel(year, month) {
  return `${monthNames[month - 1]} ${year}`;
}

function setStep(step) {
  state.currentStep = step;
  el.stepPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.step === step));
  document.querySelectorAll(".step-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.goStep === step);
  });
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

function isDec31(key) {
  return key.endsWith("-12-31");
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

function formatInputNumber(value) {
  return String(value || 0);
}

function toNumber(value) {
  const number = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function safePositive(value) {
  return Math.max(0, value || 0);
}

init();
