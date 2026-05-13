const inputs = {
  length: document.querySelector("#lengthInput"),
  width: document.querySelector("#widthInput"),
  height: document.querySelector("#heightInput"),
  unit: document.querySelector("#unitSelect"),
};

const elements = {
  tabs: document.querySelectorAll(".shape-tab"),
  presets: document.querySelectorAll(".preset"),
  prism: document.querySelector("#prism"),
  dimensions: document.querySelector("#dimensionText"),
  formula: document.querySelector("#formulaText"),
  cm3: document.querySelector("#cm3Text"),
  dm3: document.querySelector("#dm3Text"),
  liter: document.querySelector("#literText"),
  milkShelf: document.querySelector("#milkShelf"),
  milkSummary: document.querySelector("#milkSummary"),
  milkNote: document.querySelector("#milkNote"),
};

const unitToCm = {
  mm: 0.1,
  cm: 1,
  dm: 10,
  m: 100,
};

const presets = {
  milk: { length: 1, width: 1, height: 1, unit: "dm" },
  shoebox: { length: 32, width: 20, height: 12, unit: "cm" },
  pool: { length: 4, width: 3, height: 1.5, unit: "m" },
};

let shape = "box";

function numberValue(input) {
  const value = Number(input.value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatNumber(value, decimals = 3) {
  if (value === 0) return "0";
  if (value >= 1000) {
    return Math.round(value).toLocaleString("no-NO");
  }
  if (value >= 10) {
    return Number(value.toFixed(1)).toLocaleString("no-NO");
  }
  return Number(value.toFixed(decimals)).toLocaleString("no-NO");
}

function setShape(nextShape) {
  shape = nextShape;
  elements.tabs.forEach((tab) => {
    const selected = tab.dataset.shape === shape;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });

  inputs.width.disabled = shape === "cube";
  inputs.height.disabled = shape === "cube";
  if (shape === "cube") {
    inputs.width.value = inputs.length.value;
    inputs.height.value = inputs.length.value;
  }
  update();
}

function setPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  inputs.length.value = preset.length;
  inputs.width.value = preset.width;
  inputs.height.value = preset.height;
  inputs.unit.value = preset.unit;
  setShape(name === "milk" ? "cube" : "box");
}

function updatePrism(length, width, height) {
  const biggest = Math.max(length, width, height, 1);
  const displayWidth = 110 + (length / biggest) * 150;
  const displayHeight = 90 + (height / biggest) * 125;
  const displayDepth = 55 + (width / biggest) * 105;

  elements.prism.style.setProperty("--w", `${displayWidth}px`);
  elements.prism.style.setProperty("--h", `${displayHeight}px`);
  elements.prism.style.setProperty("--d", `${displayDepth}px`);
}

function renderMilk(liters) {
  elements.milkShelf.innerHTML = "";

  if (liters <= 0) {
    elements.milkShelf.textContent = "Skriv inn mål større enn 0.";
    elements.milkSummary.textContent = "Volumet er 0 liter akkurat nå.";
    return;
  }

  const fullCartons = Math.floor(liters);
  const remainder = liters - fullCartons;
  const visibleFull = Math.min(fullCartons, 18);
  const hasRemainder = remainder > 0.01 && visibleFull < 18;
  const totalVisible = visibleFull + (hasRemainder ? 1 : 0);

  for (let index = 0; index < totalVisible; index += 1) {
    const fill = index < visibleFull ? 1 : remainder;
    const carton = document.createElement("div");
    carton.className = "carton";
    carton.style.setProperty("--fill", `${Math.max(fill * 100, 8)}%`);
    carton.setAttribute("aria-label", `${formatNumber(fill)} liter melk`);

    const fillLayer = document.createElement("div");
    fillLayer.className = "carton-fill";
    fillLayer.style.setProperty("--fill", `${Math.max(fill * 100, 8)}%`);

    const label = document.createElement("div");
    label.className = "carton-label";
    label.textContent = `${formatNumber(fill)} L`;

    carton.append(fillLayer, label);
    elements.milkShelf.appendChild(carton);
  }

  if (fullCartons > 18) {
    const extra = document.createElement("div");
    extra.className = "milk-note";
    extra.textContent = `+ ${formatNumber(fullCartons - 18, 0)} flere fulle kartonger`;
    elements.milkShelf.appendChild(extra);
  }

  elements.milkSummary.textContent = `Det tilsvarer ${formatNumber(liters)} melkekartonger på 1 liter.`;
  elements.milkNote.textContent =
    liters < 1
      ? "Under 1 liter vises som en delvis fylt melkekartong."
      : "Hver full kartong viser 1 liter. Delvis fylt kartong viser resten.";
}

function update() {
  if (shape === "cube") {
    inputs.width.value = inputs.length.value;
    inputs.height.value = inputs.length.value;
  }

  const unit = inputs.unit.value;
  const length = numberValue(inputs.length);
  const width = numberValue(inputs.width);
  const height = numberValue(inputs.height);
  const volumeInChosenUnit = length * width * height;
  const cm3 = volumeInChosenUnit * unitToCm[unit] ** 3;
  const dm3 = cm3 / 1000;
  const liters = dm3;

  elements.dimensions.textContent = `${formatNumber(length)} ${unit} x ${formatNumber(width)} ${unit} x ${formatNumber(height)} ${unit}`;
  elements.formula.textContent = `${formatNumber(length)} x ${formatNumber(width)} x ${formatNumber(height)} = ${formatNumber(volumeInChosenUnit)} ${unit}³`;
  elements.cm3.textContent = `${formatNumber(cm3)} cm³`;
  elements.dm3.textContent = `${formatNumber(dm3)} dm³`;
  elements.liter.textContent = `${formatNumber(liters)} L`;

  updatePrism(length, width, height);
  renderMilk(liters);
}

Object.values(inputs).forEach((input) => {
  input.addEventListener("input", update);
  input.addEventListener("change", update);
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setShape(tab.dataset.shape));
});

elements.presets.forEach((button) => {
  button.addEventListener("click", () => setPreset(button.dataset.preset));
});

update();
