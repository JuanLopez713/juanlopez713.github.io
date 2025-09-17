import { ids, fmt } from "../shared/shared-utils.js";

function computeTerms(a, b, c, rows) {
  const terms = [];
  for (let n = 1; n <= rows; n += 1) {
    terms.push(a * n * n + b * n + c);
  }
  return terms;
}

function computeFirstDiffs(terms) {
  const diffs = [];
  for (let i = 0; i < terms.length - 1; i += 1) {
    diffs.push(terms[i + 1] - terms[i]);
  }
  return diffs;
}

function computeSecondDiffs(firstDiffs) {
  const diffs2 = [];
  for (let i = 0; i < firstDiffs.length - 1; i += 1) {
    diffs2.push(firstDiffs[i + 1] - firstDiffs[i]);
  }
  return diffs2;
}

function renderTable(a, b, c, rows) {
  const table = ids("diffTable");
  const terms = computeTerms(a, b, c, rows);
  const d1 = computeFirstDiffs(terms);
  const d2 = computeSecondDiffs(d1);

  const header = `
    <thead>
      <tr>
        <th>n</th>
        <th>t(n)</th>
        <th>Δ</th>
        <th>Δ²</th>
      </tr>
    </thead>
  `;

  const bodyRows = [];
  for (let i = 0; i < rows; i += 1) {
    const n = i + 1;
    const t = terms[i];
    const d1Val = i < d1.length ? d1[i] : "";
    const d2Val = i < d2.length ? d2[i] : "";
    const d1Class = i < d1.length ? "" : "muted";
    const d2Class = i < d2.length ? "" : "muted";
    bodyRows.push(`
      <tr>
        <td>${n}</td>
        <td>${t}</td>
        <td class="${d1Class}">${d1Val}</td>
        <td class="${d2Class}">${d2Val}</td>
      </tr>
    `);
  }

  table.innerHTML = `${header}<tbody>${bodyRows.join("")}</tbody>`;

  // Summary
  ids("sa").textContent = a;
  ids("sb").textContent = b;
  ids("sc").textContent = c;
  ids("sdd").textContent = fmt(2 * a);

  // Stars for first four terms
  renderStars(terms.slice(0, 4));
}

function renderStars(firstFour) {
  const steps = ids("steps");
  const maxStarsToRender = 200; // clip to keep DOM light
  const items = firstFour.map((val, idx) => {
    const k = idx + 1;
    const count = Math.max(0, Math.floor(val));
    const clipped = Math.min(count, maxStarsToRender);
    const extra = count > maxStarsToRender ? count - maxStarsToRender : 0;
    const stars = new Array(clipped).fill("★").map(s => `<span class="star">${s}</span>`).join("");
    const plus = extra > 0 ? `<span class="star dim">+${extra} more</span>` : "";
    return `
      <div class="step">
        <h4>
          <span>Step ${k}</span>
          <span class="value">t(${k}) = ${val}</span>
        </h4>
        <div class="stars">${stars}${plus}</div>
      </div>
    `;
  });
  steps.innerHTML = items.join("");
}

function init() {
  const aRange = ids("aRange");
  const bRange = ids("bRange");
  const cRange = ids("cRange");
  const rowsRange = ids("rowsRange");

  const aVal = ids("aVal");
  const bVal = ids("bVal");
  const cVal = ids("cVal");
  const rowsVal = ids("rowsVal");

  function parse() {
    return {
      a: parseInt(aRange.value, 10),
      b: parseInt(bRange.value, 10),
      c: parseInt(cRange.value, 10),
      rows: parseInt(rowsRange.value, 10),
    };
  }

  function update() {
    const { a, b, c, rows } = parse();
    aVal.textContent = a;
    bVal.textContent = b;
    cVal.textContent = c;
    rowsVal.textContent = rows;
    renderTable(a, b, c, rows);
  }

  [aRange, bRange, cRange, rowsRange].forEach((el) => {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  update();
}

document.addEventListener("DOMContentLoaded", init);



