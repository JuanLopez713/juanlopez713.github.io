import { ids } from '../shared/shared-utils.js';

// --- DOM ---
const svg = ids('hexSvg');
const gridG = svg.querySelector('#grid');
const hexOuter = ids('hexOuter');
const hexInner = ids('hexInner');
const angleReadout = ids('angleReadout');

const btn60 = ids('btn60');
const btn120 = ids('btn120');
const btn180 = ids('btn180');
const btn240 = ids('btn240');
const btn300 = ids('btn300');
const btnReset = ids('btnReset');

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

// --- Rotation state ---
let currentAngle = 0; // CSS transform angle in degrees, CW positive
let isAnimating = false;
let pending = 0; // queued additional degrees

function updateReadout() {
  // Display CCW angle to emulate unit circle, even though CSS rotates CW for positive angles
  const ccw = ((-currentAngle % 360) + 360) % 360;
  angleReadout.textContent = `${ccw}°`;
}

function setRotation(angleDeg) {
  hexOuter.style.transform = `rotate(${angleDeg}deg)`;
}

// deltaDeg is intended CCW amount
function animateBy(deltaDeg) {
  if (isAnimating) { pending += deltaDeg; return; }
  isAnimating = true;

  const startAngle = currentAngle;
  // Apply negative because CSS positive rotation is clockwise; we want CCW visually
  const endAngle = startAngle - deltaDeg;
  const duration = 300; // ms
  const t0 = performance.now();

  function step(t) {
    const p = Math.min(1, (t - t0) / duration);
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * p);
    const a = startAngle + (endAngle - startAngle) * eased;
    setRotation(a);
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      currentAngle = endAngle;
      setRotation(currentAngle);
      updateReadout();
      isAnimating = false;
      if (pending !== 0) {
        const toGo = pending; pending = 0;
        animateBy(toGo);
      }
    }
  }
  requestAnimationFrame(step);
}

function rotateBy60(mult = 1) {
  animateBy(60 * Math.max(1, Math.floor(mult)));
}

function resetRotation() {
  // Rotate CCW back to 0° display
  const ccw = ((-currentAngle % 360) + 360) % 360;
  if (ccw !== 0) animateBy(ccw);
}

// Controls: CCW-only increments
btn60.addEventListener('click', () => rotateBy60(1));
btn120.addEventListener('click', () => rotateBy60(2));
btn180.addEventListener('click', () => rotateBy60(3));
btn240.addEventListener('click', () => rotateBy60(4));
btn300.addEventListener('click', () => rotateBy60(5));
btnReset.addEventListener('click', resetRotation);

// Initialize
setRotation(0);
updateReadout();


