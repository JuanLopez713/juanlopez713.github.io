// =========================
//  Square Completer JS
//  Geometric visualization of completing the square
// =========================

import { fmt, ids, setupEventListeners } from '../shared/transformations.js';

// ----- State (defaults) -----
const DEFAULTS = {
  a: 1,    // coefficient of x² (fixed)
  b: 4,    // coefficient of x
  c: -5    // constant term
};

let a = DEFAULTS.a,
    b = DEFAULTS.b,
    c = DEFAULTS.c;

// ----- Canvas setup -----
const canvas = document.getElementById("geometricCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size to match container
function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ----- Step management -----
const STEPS = [
  {
    description: "Start with the quadratic equation.",
    expression: (a, b, c) => `x² + ${fmt(b)}x + ${fmt(c)} = 0`,
    draw: (ctx, a, b, c) => drawInitialForm(ctx, a, b, c)
  },
  {
    description: "Move the constant term to the right side.",
    expression: (a, b, c) => `x² + ${fmt(b)}x = ${fmt(-c)}`,
    draw: (ctx, a, b, c) => drawMoveConstant(ctx, a, b, c)
  },
  {
    description: "Split bx into two rectangles of size bx/2.",
    expression: (a, b, c) => `x² + ${fmt(b/2)}x + ${fmt(b/2)}x = ${fmt(-c)}`,
    draw: (ctx, a, b, c) => drawSplitRectangles(ctx, a, b, c)
  },
  {
    description: "Add (b/2)² to both sides to complete the square.",
    expression: (a, b, c) => `x² + ${fmt(b)}x + ${fmt((b/2)*(b/2))} = ${fmt(-c)} + ${fmt((b/2)*(b/2))}`,
    draw: (ctx, a, b, c) => drawCompletingSquare(ctx, a, b, c)
  },
  {
    description: "The completed square has side length x + b/2.",
    expression: (a, b, c) => `(x + ${fmt(b/2)})² = ${fmt(-c + (b/2)*(b/2))}`,
    draw: (ctx, a, b, c) => drawCompletedSquare(ctx, a, b, c)
  }
];

let currentStep = 0;

// ----- Drawing functions -----
function drawInitialForm(ctx, a, b, c) {
  const width = canvas.width;
  const height = canvas.height;
  const scale = Math.min(width, height) / 12;
  const centerY = height / 2;
  const MARGIN  = 15;
  const SPACING = scale * 1.5;

  const squareSize = scale;
  const rectWidth  = scale * Math.abs(b);
  const constSize  = scale * Math.sqrt(Math.abs(c));

  const groupWidth = squareSize + SPACING + rectWidth + SPACING + constSize;
  const currentX   = (width - groupWidth) / 2;
  const squareTop  = centerY - squareSize / 2;

  ctx.font = "bold 16px 'Source Sans Pro'";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  // red square
  ctx.fillStyle = "#E60000";
  ctx.fillRect(currentX, squareTop, squareSize, squareSize);
  ctx.fillStyle = "#fff";
  ctx.fillText("x²", currentX + squareSize / 2, centerY);

  // plus after red
  ctx.fillStyle = "#000";
  ctx.fillText("+", currentX + squareSize + SPACING / 2, centerY);

  // yellow rectangle
  const yellowLeft = currentX + squareSize + SPACING;
  ctx.fillStyle = "#F0B800";
  ctx.fillRect(yellowLeft, squareTop, rectWidth, scale);
  ctx.fillStyle = "#000";
  ctx.fillText(`${fmt(b)}x`, yellowLeft + rectWidth / 2, centerY);

  // plus after yellow
  ctx.fillText("+", yellowLeft + rectWidth + SPACING / 2, centerY);

  // green square
  const greenLeft = yellowLeft + rectWidth + SPACING;
  ctx.fillStyle = "#00B800";
  ctx.fillRect(greenLeft, squareTop, constSize, constSize);
  ctx.fillStyle = "#000";
  ctx.fillText(`${fmt(c)}`, greenLeft + constSize / 2, centerY);
}

function drawMoveConstant(ctx, a, b, c) {
  const width = canvas.width;
  const height = canvas.height;
  const scale = Math.min(width, height) / 12;
  const centerY = height / 2;
  const MARGIN  = 15;
  const SPACING = scale * 1.5;

  const squareSize = scale;
  const rectWidth  = scale * Math.abs(b);
  const constSize  = scale * Math.sqrt(Math.abs(c));

  // Group: [RedSquare YellowRect] EQ GreenSquare
  const leftBlockWidth = squareSize + rectWidth;
  const groupWidth = leftBlockWidth + SPACING + constSize;
  const currentX   = (width - groupWidth) / 2;
  const squareTop  = centerY - squareSize / 2;

  ctx.font = "bold 16px 'Source Sans Pro'";
  ctx.textBaseline = "middle";

  // ----- red x² square -----
  ctx.fillStyle = "#E60000";
  ctx.fillRect(currentX, squareTop, squareSize, squareSize);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("x²", currentX + squareSize / 2, centerY);
  ctx.fillStyle = "#000";
  ctx.textAlign = "right";
  ctx.fillText("x", currentX - MARGIN, centerY);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("x", currentX + squareSize / 2, squareTop - MARGIN);
  ctx.textBaseline = "middle";

  // ----- yellow bx rectangle -----
  const yellowLeft = currentX + squareSize;
  ctx.fillStyle = "#F0B800";
  ctx.fillRect(yellowLeft, squareTop, rectWidth, scale);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(b)}x`, yellowLeft + rectWidth / 2, centerY);
  ctx.fillText(`${fmt(b)}`,  yellowLeft + rectWidth / 2, squareTop - MARGIN);
  labelXBelow(ctx, yellowLeft + rectWidth / 2, squareTop + scale, MARGIN);

  // ----- equal sign -----
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText("=", yellowLeft + rectWidth + SPACING / 2, centerY);

  // ----- green constant square -----
  const greenLeft = yellowLeft + rectWidth + SPACING;
  ctx.fillStyle = "#00B800";
  ctx.fillRect(greenLeft, squareTop, constSize, constSize);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(-c)}`, greenLeft + constSize / 2, squareTop + constSize/2 );
}

function drawSplitRectangles(ctx, a, b, c) {
  const width = canvas.width;
  const height = canvas.height;
  const scale = Math.min(width, height) / 12;
  const centerY = height / 2;
  const MARGIN  = 15;
  const SPACING = scale * 1.5;

  const squareSize = scale;
  const splitRectWidth  = scale * Math.abs(b / 2);
  const constSize  = scale * Math.sqrt(Math.abs(c));

  // Group: [RedSquare RightYellowRect] EQ GreenSquare (BottomYellowRect is part of RedSquare block visually for width calc)
  const leftBlockWidth = squareSize + splitRectWidth;
  const groupWidth = leftBlockWidth + SPACING + constSize;
  const currentX   = (width - groupWidth) / 2;
  const squareTop  = centerY - squareSize / 2;

  ctx.font = "bold 16px 'Source Sans Pro'";
  ctx.textBaseline = "middle";

  // red square
  ctx.fillStyle = "#E60000";
  ctx.fillRect(currentX, squareTop, squareSize, squareSize);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("x²", currentX + squareSize / 2, centerY);
  ctx.fillStyle = "#000";
  ctx.textAlign = "right";
  ctx.fillText("x", currentX - MARGIN, centerY);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("x", currentX + squareSize / 2, squareTop - MARGIN);
  ctx.textBaseline = "middle";

  // right yellow rectangle
  const rightRectLeft = currentX + squareSize;
  ctx.fillStyle = "#F0B800";
  ctx.fillRect(rightRectLeft, squareTop, splitRectWidth, scale);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(b/2)}x`, rightRectLeft + splitRectWidth/2, centerY);
  ctx.fillText(`${fmt(b/2)}`,  rightRectLeft + splitRectWidth/2, squareTop - MARGIN);
  labelXBelow(ctx, rightRectLeft + splitRectWidth / 2, squareTop + scale, MARGIN);

  // bottom yellow rectangle
  ctx.fillStyle = "#F0B800";
  ctx.fillRect(currentX, squareTop + squareSize, squareSize, splitRectWidth);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(b/2)}x`, currentX + squareSize/2, squareTop + squareSize + splitRectWidth/2);
  ctx.fillText("x", currentX + squareSize/2, squareTop + squareSize + splitRectWidth + MARGIN);
  ctx.textAlign = "right";
  ctx.fillText(`${fmt(b/2)}`, currentX - MARGIN, squareTop + squareSize + splitRectWidth/2);
  ctx.textAlign = "center";

  // equal sign
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText("=", rightRectLeft + splitRectWidth + SPACING / 2, centerY);

  // green square
  const greenLeft = rightRectLeft + splitRectWidth + SPACING;
  ctx.fillStyle = "#00B800";
  ctx.fillRect(greenLeft, squareTop, constSize, constSize);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(-c)}`, greenLeft + constSize / 2, squareTop + constSize/2);
}

function drawCompletingSquare(ctx, a, b, c) {
  const width = canvas.width;
  const height = canvas.height;
  const scale = Math.min(width, height) / 12;
  const centerY = height / 2;
  const MARGIN  = 15;
  const SPACING = scale * 1.5;

  const squareSize = scale;
  const splitRectWidth  = scale * Math.abs(b / 2);
  const completingSize = splitRectWidth;
  const rightConstSize = scale * Math.sqrt(Math.abs(-c + (b/2)*(b/2)));

  const leftBlockWidth = squareSize + splitRectWidth;
  const groupWidth = leftBlockWidth + SPACING + rightConstSize;
  const currentX   = (width - groupWidth) / 2;
  const squareTop  = centerY - squareSize / 2;

  ctx.font = "bold 16px 'Source Sans Pro'";
  ctx.textBaseline = "middle";

  // red square
  ctx.fillStyle = "#E60000";
  ctx.fillRect(currentX, squareTop, squareSize, squareSize);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("x²", currentX + squareSize/2, centerY);
  ctx.fillStyle = "#000";
  ctx.textAlign = "right";
  ctx.fillText("x", currentX - MARGIN, centerY);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("x", currentX + squareSize/2, squareTop - MARGIN);
  ctx.textBaseline = "middle";

  // right yellow rectangle
  const rightRectLeft = currentX + squareSize;
  ctx.fillStyle = "#F0B800";
  ctx.fillRect(rightRectLeft, squareTop, splitRectWidth, scale);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(b/2)}x`, rightRectLeft + splitRectWidth/2, centerY);
  ctx.fillText(`${fmt(b/2)}`,  rightRectLeft + splitRectWidth/2, squareTop - MARGIN);
  labelXBelow(ctx, rightRectLeft + splitRectWidth/2, squareTop + scale, MARGIN);

  // bottom yellow rectangle
  ctx.fillStyle = "#F0B800";
  ctx.fillRect(currentX, squareTop + squareSize, squareSize, splitRectWidth);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(b/2)}x`, currentX + squareSize/2, squareTop + squareSize + splitRectWidth/2);
  ctx.fillText("x", currentX + squareSize/2, squareTop + squareSize + splitRectWidth + MARGIN);
  ctx.textAlign = "right";
  ctx.fillText(`${fmt(b/2)}`, currentX - MARGIN, squareTop + squareSize + splitRectWidth/2);
  ctx.textAlign = "center";

  // completing small square (semi-transparent yellow)
  ctx.fillStyle = "rgba(240,184,0,0.3)";
  ctx.fillRect(rightRectLeft, squareTop + squareSize, completingSize, completingSize);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt((b/2)*(b/2))}`, rightRectLeft + completingSize / 2, squareTop + squareSize + completingSize / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${fmt(b/2)}`, rightRectLeft + completingSize / 2, squareTop + squareSize + completingSize + MARGIN);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(`${fmt(b/2)}`, rightRectLeft + completingSize + MARGIN/2, squareTop + squareSize + completingSize / 2);
  ctx.textAlign = "center";

  // equal sign
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText("=", rightRectLeft + splitRectWidth + SPACING / 2, centerY);

  // green square (constant term on right)
  const greenLeft = rightRectLeft + splitRectWidth + SPACING;
  ctx.fillStyle = "#00B800";
  ctx.fillRect(greenLeft, squareTop, rightConstSize, rightConstSize);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(-c + (b/2)*(b/2))}`, greenLeft + rightConstSize / 2, squareTop + rightConstSize/2);
}

function drawCompletedSquare(ctx, a, b, c) {
  const width = canvas.width;
  const height = canvas.height;
  const scale = Math.min(width, height) / 12;
  const centerY = height / 2;
  const MARGIN  = 15;
  const SPACING = scale * 1.5;

  const completedSquareSide = scale * (1 + Math.abs(b/2));
  const rightConstSize  = scale * Math.sqrt(Math.abs(-c + (b/2)*(b/2)));

  const groupWidth = completedSquareSide + SPACING + rightConstSize;
  const currentX   = (width - groupWidth) / 2;
  const squareTop  = centerY - completedSquareSide / 2;

  ctx.font = "bold 16px 'Source Sans Pro'";
  ctx.textBaseline = "middle";

  // red completed square
  ctx.fillStyle = "#E60000";
  ctx.fillRect(currentX, squareTop, completedSquareSide, completedSquareSide);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(`(x + ${fmt(b/2)})²`, currentX + completedSquareSide / 2, centerY);
  ctx.fillStyle = "#000";
  ctx.textAlign = "right";
  ctx.fillText(`x + ${fmt(b/2)}`, currentX - MARGIN, centerY);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`x + ${fmt(b/2)}`, currentX + completedSquareSide / 2, squareTop - MARGIN);
  ctx.textBaseline = "middle";

  // equal sign
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText("=", currentX + completedSquareSide + SPACING / 2, centerY);

  // green square (constant term on right)
  const greenLeft = currentX + completedSquareSide + SPACING;
  ctx.fillStyle = "#00B800";
  ctx.fillRect(greenLeft, squareTop, rightConstSize, rightConstSize);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(`${fmt(-c + (b/2)*(b/2))}`, greenLeft + rightConstSize / 2, squareTop + rightConstSize/2);
}

// Helper to label 'x' below a rectangle
function labelXBelow(ctx, xCenter, yBottom, margin) {
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000";
  ctx.fillText("x", xCenter, yBottom + margin / 2);
}

// ----- Update routine -----
function update() {
  // a is fixed at 1
  b = parseFloat(ids("bRange").value);
  c = parseFloat(ids("cRange").value);

  // Update readouts
  ids("bVal").textContent = fmt(b);
  ids("cVal").textContent = fmt(c);

  // Update step info
  const step = STEPS[currentStep];
  ids("currentStepDisplay").textContent = currentStep + 1;
  ids("totalStepsDisplay").textContent = STEPS.length;
  ids("stepDescription").textContent = step.description;
  ids("currentExpression").textContent = step.expression(a, b, c);

  // Update buttons
  ids("prevStep").disabled = currentStep === 0;
  ids("nextStep").disabled = currentStep === STEPS.length - 1;

  // Clear canvas and draw current step
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  step.draw(ctx, a, b, c);
}

// ----- Event listeners -----
setupEventListeners(["bRange", "cRange"], update, DEFAULTS);

ids("prevStep").addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    update();
  }
});

ids("nextStep").addEventListener("click", () => {
  if (currentStep < STEPS.length - 1) {
    currentStep++;
    update();
  }
});

// Set initial values
ids("bRange").value = DEFAULTS.b;
ids("cRange").value = DEFAULTS.c;

// Initial update
update();

// Set total steps display initially as well, though update() will also do it.
if (ids("totalStepsDisplay")) {
    ids("totalStepsDisplay").textContent = STEPS.length;
} 