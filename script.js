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
  frontFace: document.querySelector("#frontFace"),
  topFace: document.querySelector("#topFace"),
  sideFace: document.querySelector("#sideFace"),
  prismEdges: document.querySelector("#prismEdges"),
  lengthLabel: document.querySelector("#lengthLabel"),
  widthLabel: document.querySelector("#widthLabel"),
  heightLabel: document.querySelector("#heightLabel"),
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
  const prismWidth = 150 + (length / biggest) * 190;
  const prismHeight = 95 + (height / biggest) * 150;
  const depth = 48 + (width / biggest) * 100;
  const depthX = depth;
  const depthY = depth * 0.42;
  const left = 92;
  const top = 72 + (245 - prismHeight) * 0.2;

  const a = { x: left, y: top + depthY };
  const b = { x: left + prismWidth, y: top + depthY };
  const c = { x: left + prismWidth, y: top + depthY + prismHeight };
  const d = { x: left, y: top + depthY + prismHeight };
  const e = { x: left + depthX, y: top };
  const f = { x: left + prismWidth + depthX, y: top };
  const g = { x: left + prismWidth + depthX, y: top + prismHeight };
  const h = { x: left + depthX, y: top + prismHeight };

  const points = (...items) => items.map((point) => `${point.x},${point.y}`).join(" ");
  elements.frontFace.setAttribute("points", points(a, b, c, d));
  elements.topFace.setAttribute("points", points(a, b, f, e));
  elements.sideFace.setAttribute("points", points(b, f, g, c));

  const edges = [
    [a, b],
    [b, c],
    [c, d],
    [d, a],
    [a, e],
    [b, f],
    [c, g],
    [e, f],
    [f, g],
    [d, h, "hidden-edge"],
    [e, h, "hidden-edge"],
    [h, g, "hidden-edge"],
  ];

  elements.prismEdges.innerHTML = edges
    .map(([start, end, className = ""]) => `<line class="${className}" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}"></line>`)
    .join("");

  elements.lengthLabel.setAttribute("x", String((d.x + c.x) / 2 - 35));
  elements.lengthLabel.setAttribute("y", String(d.y + 30));
  elements.widthLabel.setAttribute("x", String((c.x + g.x) / 2 + 8));
  elements.widthLabel.setAttribute("y", String((c.y + g.y) / 2 + 20));
  elements.heightLabel.setAttribute("x", String(a.x - 58));
  elements.heightLabel.setAttribute("y", String((a.y + d.y) / 2));
}

function renderMilk(liters) {
  elements.milkShelf.innerHTML = "";
  elements.milkShelf.removeAttribute("data-density");

  if (liters <= 0) {
    elements.milkShelf.textContent = "Skriv inn mål større enn 0.";
    elements.milkSummary.textContent = "Volumet er 0 liter akkurat nå.";
    return;
  }

  const fullCartons = Math.floor(liters);
  const remainder = liters - fullCartons;
  const maxVisibleCartons = 1000;
  const hasRemainder = remainder > 0.01;
  const cartonCount = Math.min(fullCartons + (hasRemainder ? 1 : 0), maxVisibleCartons);

  if (cartonCount > 150) {
    elements.milkShelf.dataset.density = "small";
  } else if (cartonCount > 30) {
    elements.milkShelf.dataset.density = "medium";
  }

  for (let index = 0; index < cartonCount; index += 1) {
    const isRemainder = index === fullCartons && hasRemainder && cartonCount <= maxVisibleCartons;
    const fill = isRemainder ? remainder : 1;
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

  elements.milkSummary.textContent = `Det tilsvarer ${formatNumber(liters)} melkekartonger på 1 liter.`;
  if (liters > maxVisibleCartons) {
    elements.milkNote.textContent = `Her vises 1000 melkekartonger. Resten er ${formatNumber(liters - maxVisibleCartons)} liter til.`;
  } else if (liters < 1) {
    elements.milkNote.textContent = "Under 1 liter vises som en delvis fylt melkekartong.";
  } else {
    elements.milkNote.textContent = "Hver kartong viser 1 liter. Ved desimaltall viser siste kartong resten.";
  }
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
