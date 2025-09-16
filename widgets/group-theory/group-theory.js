import { ids } from '../shared/shared-utils.js';

// --- DOM ---
const svg = ids('gtSvg');
const gridG = svg.querySelector('#grid');
const rectOuter = ids('rectOuter');
const rectInner = ids('rectInner');
const rectEl = ids('rect');
const labelA = ids('labelA');
const labelB = ids('labelB');
const labelC = ids('labelC');
const labelD = ids('labelD');
const currentOpEl = ids('currentOp');

// Letter -> color mapping so colors follow letters even when labels are remapped
const LETTER_COLORS = {
  'A': '#E60000', // red
  'B': '#007bff', // blue
  'C': '#00B800', // green
  'D': '#F0B800'  // yellow
};

const btnIdentity = ids('btnIdentity');
const btnRotate = ids('btnRotate');
const btnFlipV = ids('btnFlipV');
const btnFlipH = ids('btnFlipH');

const tableEl = ids('cayley');
const btnCheck = ids('btnCheck');
const btnClear = ids('btnClear');
const btnShow = ids('btnShow');
const checkMsg = ids('checkMsg');

// --- Grid ---
(function drawGrid(){
  const w = 600, h = 300, step = 20;
  for (let x = 0; x <= w; x += step) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x); l.setAttribute('y1', 0);
    l.setAttribute('x2', x); l.setAttribute('y2', h);
    l.setAttribute('class', 'grid-line');
    gridG.appendChild(l);
  }
  for (let y = 0; y <= h; y += step) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 0); l.setAttribute('y1', y);
    l.setAttribute('x2', 600); l.setAttribute('y2', y);
    l.setAttribute('class', 'grid-line');
    gridG.appendChild(l);
  }
})();

// --- Animated orientation using nested groups ---
let currentOp = 'e';
let currentAngle = 0; // degrees
let isAnimating = false;
let pendingOps = [];
let currentSx = 1;
let currentSy = 1;

function getScaleForOp(op){
  // Canonical scales for each element (using 0° rotation):
  // e: (1, 1), r: (-1, -1), v: (1, -1), h: (-1, 1)
  if (op === 'e') return [1, 1];
  if (op === 'r') return [-1, -1];
  if (op === 'v') return [1, -1];
  if (op === 'h') return [-1, 1];
  return [1, 1];
}

// Update corner label texts according to the current symmetry element
function updateLabelsForOp(op) {
  // Keep letters fixed; positions change via transforms only.
  labelA.textContent = 'A'; labelA.style.fill = LETTER_COLORS['A'];
  labelB.textContent = 'B'; labelB.style.fill = LETTER_COLORS['B'];
  labelC.textContent = 'C'; labelC.style.fill = LETTER_COLORS['C'];
  labelD.textContent = 'D'; labelD.style.fill = LETTER_COLORS['D'];
}

function setTransforms(angleDeg, sx, sy){
  // Rotation on outer group - rotates around the center of the SVG
  rectOuter.style.transform = `rotate(${angleDeg}deg)`;
  // Scale on inner group - flips around its own center
  rectInner.style.transform = `scale(${sx}, ${sy})`;
}

function setOrientation(op){
  currentOp = op;
  currentOpEl.textContent = op;
  const [sx, sy] = getScaleForOp(op);
  currentSx = sx; currentSy = sy;
  currentAngle = 0;
  setTransforms(0, sx, sy);
  updateLabelsForOp(op);
}

function applyOperation(op){
  setOrientation(compose(currentOp, op));
}

function animateToState(targetOp, requestedOp) {
  if (isAnimating) return;
  isAnimating = true;
  
  const startAngle = 0;
  const isRotationOp = requestedOp === 'r';
  
  const startSx = currentSx;
  const startSy = currentSy;
  
  // Compute animation end scale for the requested op (apply flip axis to current scale)
  let animEndSx = startSx, animEndSy = startSy;
  if (!isRotationOp) {
    if (requestedOp === 'v') { // vertical flip => scaleY sign toggle
      animEndSy = -startSy;
    } else if (requestedOp === 'h') { // horizontal flip => scaleX sign toggle
      animEndSx = -startSx;
    } else if (requestedOp === 'e') {
      animEndSx = startSx; animEndSy = startSy;
    }
  }
  
  const duration = 300;
  const t0 = performance.now();
  
  function step(t) {
    const p = Math.min(1, (t - t0) / duration);
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * p); // ease-in-out
    
    if (isRotationOp) {
      const angle = startAngle + 180 * eased;
      rectOuter.style.transform = `rotate(${angle}deg)`;
      rectInner.style.transform = `scale(${startSx}, ${startSy})`;
    } else {
      // Interpolate only the relevant axis toward the toggled end value
      const sx = startSx + (animEndSx - startSx) * eased;
      const sy = startSy + (animEndSy - startSy) * eased;
      rectInner.style.transform = `scale(${sx}, ${sy})`;
      rectOuter.style.transform = `rotate(${startAngle}deg)`;
    }
    
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      currentOp = targetOp;
      currentOpEl.textContent = targetOp;
      if (isRotationOp) {
        // Absorb the 180° into the scale (since R(π)=-I): toggle both signs
        currentSx = -startSx;
        currentSy = -startSy;
        currentAngle = 0;
        setTransforms(0, currentSx, currentSy);
      } else {
        currentAngle = 0;
        currentSx = animEndSx;
        currentSy = animEndSy;
        setTransforms(0, currentSx, currentSy);
      }
      updateLabelsForOp(currentOp);
      isAnimating = false;
      if (pendingOps.length > 0) {
        const nextOp = pendingOps.shift();
        const nextTarget = compose(currentOp, nextOp);
        animateToState(nextTarget, nextOp);
      }
    }
  }
  requestAnimationFrame(step);
}

function requestOp(op) {
  if (isAnimating) { pendingOps.push(op); return; }
  const target = compose(currentOp, op);
  animateToState(target, op);
}

btnIdentity.addEventListener('click', () => requestOp('e'));
btnRotate.addEventListener('click', () => requestOp('r'));
btnFlipV.addEventListener('click', () => requestOp('v'));
btnFlipH.addEventListener('click', () => requestOp('h'));

setOrientation('e');

// --- Cayley table for D2 ({e, r, v, h}) ---
const elems = ['e','r','v','h'];
// Composition rule (row ∘ column): apply row then column
const compose = (a, b) => {
  if (a === 'e') return b;
  if (b === 'e') return a;
  if (a === 'r' && b === 'r') return 'e';
  if (a === 'v' && b === 'v') return 'e';
  if (a === 'h' && b === 'h') return 'e';
  // remaining pairs produce the third non-identity
  const S = new Set([a,b]);
  if (S.has('r') && S.has('v')) return 'h';
  if (S.has('r') && S.has('h')) return 'v';
  if (S.has('v') && S.has('h')) return 'r';
  return 'e';
};

function buildTable() {
  tableEl.innerHTML = '';
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  trh.appendChild(document.createElement('th')); // corner empty
  elems.forEach(e => { const th = document.createElement('th'); th.textContent = e; trh.appendChild(th); });
  thead.appendChild(trh);

  const tbody = document.createElement('tbody');
  elems.forEach((rowOp) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th'); th.textContent = rowOp; tr.appendChild(th);
    elems.forEach((colOp) => {
      const td = document.createElement('td');
      td.dataset.row = rowOp;
      td.dataset.col = colOp;
      td.textContent = '·';
      td.style.cursor = 'pointer';
      td.addEventListener('click', () => {
        const options = ['e','r','v','h'];
        const cur = td.textContent;
        const next = options[(options.indexOf(cur) + 1) % options.length] || 'e';
        td.textContent = next;
        td.classList.remove('ok','bad');
      });
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  tableEl.appendChild(thead);
  tableEl.appendChild(tbody);
}

function clearTable() {
  tableEl.querySelectorAll('td').forEach(td => { td.textContent = '·'; td.classList.remove('ok','bad'); });
  checkMsg.textContent = '';
}

function showAnswer() {
  tableEl.querySelectorAll('td').forEach(td => {
    const ans = compose(td.dataset.row, td.dataset.col);
    td.textContent = ans;
    td.classList.remove('ok','bad');
  });
  checkMsg.textContent = 'Answer shown.';
}

function checkTable() {
  let correct = 0, total = 0;
  tableEl.querySelectorAll('td').forEach(td => {
    const ans = compose(td.dataset.row, td.dataset.col);
    const val = td.textContent;
    total++;
    if (val === ans) { td.classList.add('ok'); td.classList.remove('bad'); correct++; }
    else { td.classList.add('bad'); td.classList.remove('ok'); }
  });
  if (correct === total) checkMsg.textContent = 'Perfect! This is the Cayley table for D2.';
  else checkMsg.textContent = `Correct ${correct}/${total}. Keep going!`;
}

buildTable();
btnClear.addEventListener('click', clearTable);
btnShow.addEventListener('click', showAnswer);
btnCheck.addEventListener('click', checkTable);
