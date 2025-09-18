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

  const withSign = (val) => `${val >= 0 ? "+" : "-"}${Math.abs(val)}`;
  const bodyRows = [];
  for (let i = 0; i < rows; i += 1) {
    const n = i + 1;
    const t = terms[i];

    // t-row: shows n and t(n); Δ² appears centered at this middle t-row (from i>=1)
    const showD2Here = i >= 1 && (i - 1) < d2.length;
    const d2ValHere = showD2Here ? withSign(d2[i - 1]) : "";
    const d2ClassHere = showD2Here ? "offset-d2" : "blank";

    bodyRows.push(`
      <tr class="t-row">
        <td class="t-cell" data-kind="t-n" data-n="${n}">${n}</td>
        <td class="t-cell" data-kind="t" data-n="${n}">${t}</td>
        <td class="blank"></td>
        <td class="${d2ClassHere} d2-cell" data-kind="d2" data-idx="${i - 1}">${d2ValHere}</td>
      </tr>
    `);

    // diff-row between this t-row and the next one: show Δ for interval [i -> i+1]
    if (i < rows - 1) {
      const d1ValBetween = withSign(d1[i]);
      bodyRows.push(`
        <tr class="diff-row">
          <td class="blank"></td>
          <td class="blank"></td>
          <td class="offset-d1 d1-cell" data-kind="d1" data-idx="${i}">${d1ValBetween}</td>
          <td class="blank"></td>
        </tr>
      `);
    }
  }

  table.innerHTML = `${header}<tbody>${bodyRows.join("")}</tbody>`;

  // Summary
  ids("sa").textContent = a;
  ids("sb").textContent = b;
  ids("sc").textContent = c;
  ids("sdd").textContent = fmt(2 * a);

  // Initialize recursion panel default (based on t(2))
  renderRecursionForT(terms, d1, d2, 2);

  // Wire interactions
  wireInteractions(rows);
}

function renderRecursion(text) {
  const panel = ids('recursionPanel');
  panel.innerHTML = `<div class="step"><h4><span>Recursive Step</span></h4><div>${text}</div></div>`;
}

function renderRecursionForT(terms, d1, d2, n) {
  if (n <= 1 || n > terms.length) {
    renderRecursion(`Pick a term t(n) with n ≥ 2.`);
    return;
  }
  const tn = terms[n - 1];
  const tn1 = terms[n - 2];
  const deltaIdx = n - 2;
  const d = d1[deltaIdx];
  const sign = d >= 0 ? '+' : '−';
  const mag = Math.abs(d);
  renderRecursion(`t(${n}) = t(${n - 1}) ${sign} ${mag} ⇒ ${tn} = ${tn1} ${sign} ${mag}`);
}

function renderRecursionForD1(d1Idx, terms, d1, d2) {
  // For Δ at index i (between t(i+1) and t(i+2)):
  // Show as: t(i+2) = t(i+1) + ( Δ(1) + (i)·Δ² ) with numeric substitution
  if (d1Idx < 0 || d1Idx >= d1.length) {
    renderRecursion(`Pick a first difference Δ.`);
    return;
  }
  const nRight = d1Idx + 2; // t index on the right side
  const tRight = terms[nRight - 1];
  const tPrev = terms[nRight - 2];
  const deltaOne = d1[0];
  const d2const = d2.length > 0 ? d2[0] : 0;
  const count = nRight - 1; // use (n-1) multiple per requested display

  const baseStr = `${deltaOne < 0 ? '−' : ''}${Math.abs(deltaOne)}`;
  let inside;
  if (count <= 0) {
    inside = baseStr;
  } else {
    const op = d2const >= 0 ? ' + ' : ' − ';
    const prod = `(${Math.abs(d2const)})(${count})`;
    inside = `${baseStr}${op}${prod}`;
  }
  const eq = `t(${nRight}) = t(${nRight - 1}) + (${inside}) ⇒ ${tRight} = ${tPrev} + (${inside})`;
  renderRecursion(eq);
}

function withSigned(v) { return `${v >= 0 ? '+' : '−'}${Math.abs(v)}`; }

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

  const btnRandom = ids('btnRandom');
  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      // Random but reasonable classroom-friendly ranges
      let a = 0;
      while (a === 0) a = Math.trunc(Math.random() * 7) - 3; // -3..3 excluding 0
      const b = Math.trunc(Math.random() * 21) - 10; // -10..10
      const c = Math.trunc(Math.random() * 21) - 10; // -10..10
      const rows = Math.trunc(Math.random() * 7) + 6; // 6..12

      aRange.value = String(a);
      bRange.value = String(b);
      cRange.value = String(c);
      rowsRange.value = String(rows);
      update();
    });
  }

  update();
}

document.addEventListener("DOMContentLoaded", init);

function clearHighlights() {
  document.querySelectorAll('.hl-t, .hl-d1, .hl-d2, .hl-selected').forEach(el => {
    el.classList.remove('hl-t', 'hl-d1', 'hl-d2', 'hl-selected');
  });
}

function wireInteractions(rows) {
  const tbody = document.querySelector('#diffTable tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if (!cell) return;
    const kind = cell.getAttribute('data-kind');
    if (!kind) return;
    clearHighlights();

    if (kind === 't') {
      cell.classList.add('hl-selected');
      // Clicking t(n): highlight t(n) (self), t(n-1), and the Δ between them
      const n = parseInt(cell.getAttribute('data-n'), 10);
      const tnCell = document.querySelector(`td[data-kind="t"][data-n="${n}"]`);
      if (tnCell) tnCell.classList.add('hl-t');
      if (n > 1) {
        const prevCell = document.querySelector(`td[data-kind="t"][data-n="${n - 1}"]`);
        if (prevCell) prevCell.classList.add('hl-t');
        const dIdx = n - 2; // Δ between t(n-1) and t(n) is index n-2
        const d1Cell = document.querySelector(`td[data-kind="d1"][data-idx="${dIdx}"]`);
        if (d1Cell) d1Cell.classList.add('hl-d1');
      }
      // Update recursion panel for this term
      // Recompute arrays from current sliders to make sure we have values
      const a = parseInt(ids('aRange').value, 10);
      const b = parseInt(ids('bRange').value, 10);
      const c = parseInt(ids('cRange').value, 10);
      const rows = parseInt(ids('rowsRange').value, 10);
      const termsNow = computeTerms(a, b, c, rows);
      const d1Now = computeFirstDiffs(termsNow);
      const d2Now = computeSecondDiffs(d1Now);
      renderRecursionForT(termsNow, d1Now, d2Now, n);
    } else if (kind === 'd1') {
      cell.classList.add('hl-selected');
      // Clicking Δ at index i (between t(i+1) and t(i+2)):
      // highlight the first Δ (index 0) and all needed Δ²s to sum to this Δ
      const iIdx = parseInt(cell.getAttribute('data-idx'), 10);
      // First Δ
      const firstD1 = document.querySelector('td[data-kind="d1"][data-idx="0"][class*="d1-cell"]') || document.querySelector('td[data-kind="d1"][data-idx="0"]');
      if (firstD1) firstD1.classList.add('hl-d1');
      // Required Δ²: indices 0..iIdx-1
      for (let k = 0; k < iIdx; k += 1) {
        const d2Cell = document.querySelector(`td[data-kind="d2"][data-idx="${k}"]`);
        if (d2Cell) d2Cell.classList.add('hl-d2');
      }
      // Also highlight the clicked Δ for clarity
      cell.classList.add('hl-d1');

      // Update recursion panel expressing Δ(i) via Δ(1) and Δ²'s
      const a = parseInt(ids('aRange').value, 10);
      const b = parseInt(ids('bRange').value, 10);
      const c = parseInt(ids('cRange').value, 10);
      const rows = parseInt(ids('rowsRange').value, 10);
      const termsNow = computeTerms(a, b, c, rows);
      const d1Now = computeFirstDiffs(termsNow);
      const d2Now = computeSecondDiffs(d1Now);
      renderRecursionForD1(iIdx, termsNow, d1Now, d2Now);
    } else if (kind === 'd2') {
      cell.classList.add('hl-selected');
      // Clicking Δ²: just highlight it and the adjacent Δs (optional enrichment)
      cell.classList.add('hl-d2');
    }
  });
}



