// Tower of Hanoi - JavaScript Logic

import { ids, fmt } from '../shared/shared-utils.js'; // Changed import

// --- DOM Elements ---
const numDisksSlider = ids('numDisksSlider');
const numDisksDisplay = ids('numDisksDisplay');
const movesTakenDisplay = ids('movesTakenDisplay');
const optimalMovesDisplay = ids('optimalMovesDisplay');
const resetButton = ids('resetButton');
const hanoiSvg = ids('hanoiSvg');
const hanoiWarning = ids('hanoiWarning'); // Get the warning element

// --- Game Constants & Configuration ---
const NUM_TOWERS = 3;
const TOWER_COLORS = ['#666', '#666', '#666']; // Can be different if desired
const DISK_HEIGHT = 20;
const MIN_DISK_WIDTH = 40;
const DISK_WIDTH_STEP = 20; // How much wider each subsequent disk is
const SVG_WIDTH = 600; // Must match viewBox for calculations
const SVG_HEIGHT = 300; // Must match viewBox for calculations
const TOWER_BASE_Y = SVG_HEIGHT - 30;
const TOWER_WIDTH = 10;
const TOWER_SPACING = SVG_WIDTH / (NUM_TOWERS + 1);
const CLICK_TARGET_WIDTH_PADDING = 30; // Extra width on each side of the peg for clickability
const GOAL_TOWER_COLOR = '#28a745'; // Green for goal, for example

// --- Game State ---
let numDisks = 3;
let towers = []; // Array of arrays, e.g., [[3,2,1], [], []] (disk sizes)
let moveCount = 0;
let selectedDisk = null; // { size: number, originalTowerIndex: number }
let isGameWon = false;
let showGhostStack = true; // New state variable

// --- Disk Colors (match CSS) ---
const DISK_COLORS = [
  '#E60000', '#F0B800', '#00B800', '#007bff',
  '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
];

// --- Game Logic ---
function calculateOptimalMoves(n) {
  return Math.pow(2, n) - 1;
}

function initGame(n) {
  numDisks = n;
  towers = Array.from({ length: NUM_TOWERS }, () => []);
  for (let i = n; i >= 1; i--) {
    towers[0].push(i); // Push disk size (1 is smallest)
  }
  moveCount = 0;
  selectedDisk = null;
  isGameWon = false;
  showGhostStack = true; // Reset ghost stack visibility on new game/reset

  numDisksDisplay.textContent = numDisks;
  movesTakenDisplay.textContent = moveCount;
  optimalMovesDisplay.textContent = calculateOptimalMoves(numDisks);
  
  renderGame();
}

function renderGame() {
  hanoiSvg.innerHTML = ''; // Clear previous SVG content

  // --- Draw Single Continuous Base --- 
  const baseWidth = SVG_WIDTH - TOWER_SPACING / 2; // Make it wide enough
  const baseX = TOWER_SPACING / 4;
  const continuousBase = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  continuousBase.setAttribute('x', baseX);
  continuousBase.setAttribute('y', TOWER_BASE_Y);
  continuousBase.setAttribute('width', baseWidth);
  continuousBase.setAttribute('height', 15); // Slightly thicker base
  continuousBase.setAttribute('class', 'hanoi-tower'); // Use same class for color
  continuousBase.setAttribute('rx', 3);
  continuousBase.setAttribute('ry', 3);
  hanoiSvg.appendChild(continuousBase);

  // Draw Towers (Pegs) and Click Targets
  for (let i = 0; i < NUM_TOWERS; i++) {
    const towerX = TOWER_SPACING * (i + 1);
    const pegTopY = TOWER_BASE_Y - (DISK_HEIGHT * (numDisks + 1));
    const pegHeight = DISK_HEIGHT * (numDisks + 1);

    // --- Invisible Click Target --- 
    const clickTarget = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    clickTarget.setAttribute('x', towerX - TOWER_WIDTH / 2 - CLICK_TARGET_WIDTH_PADDING);
    clickTarget.setAttribute('y', pegTopY - DISK_HEIGHT); // Start slightly above where disks might be picked from
    clickTarget.setAttribute('width', TOWER_WIDTH + 2 * CLICK_TARGET_WIDTH_PADDING);
    clickTarget.setAttribute('height', pegHeight + DISK_HEIGHT * 2); // Cover full peg height and a bit more
    clickTarget.setAttribute('fill', 'transparent'); 
    // Or use a very low opacity fill for debugging: clickTarget.setAttribute('fill', 'rgba(0,255,0,0.1)');
    clickTarget.setAttribute('data-tower-index', i);
    clickTarget.style.cursor = 'pointer'; // Indicate it's clickable
    hanoiSvg.appendChild(clickTarget); // Add click target first (behind peg)

    // --- Visible Peg --- 
    const peg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    peg.setAttribute('x', towerX - TOWER_WIDTH / 2);
    peg.setAttribute('y', pegTopY); 
    peg.setAttribute('width', TOWER_WIDTH);
    peg.setAttribute('height', pegHeight); 
    peg.setAttribute('class', 'hanoi-tower');
    if (i === NUM_TOWERS - 1) { 
      peg.setAttribute('fill', GOAL_TOWER_COLOR);
    } else {
      peg.setAttribute('fill', TOWER_COLORS[i]);
    }
    // peg.setAttribute('data-tower-index', i); // Click target handles this now for tower area clicks
    peg.style.pointerEvents = 'none'; // Make actual peg non-interactive if click target is primary
    hanoiSvg.appendChild(peg);
  }

  const diskElements = []; // To help find the SVG element for the selected disk

  towers.forEach((tower, towerIndex) => {
    tower.forEach((diskSize, diskIndexInTower) => {
      const diskWidth = MIN_DISK_WIDTH + (diskSize - 1) * DISK_WIDTH_STEP;
      const diskX = TOWER_SPACING * (towerIndex + 1) - diskWidth / 2;
      const diskY = TOWER_BASE_Y - (diskIndexInTower + 1) * DISK_HEIGHT;

      const diskRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      diskRect.setAttribute('x', diskX);
      diskRect.setAttribute('y', diskY);
      diskRect.setAttribute('width', diskWidth);
      diskRect.setAttribute('height', DISK_HEIGHT - 2); // -2 for a slight gap
      diskRect.setAttribute('rx', 5); // Rounded corners
      diskRect.setAttribute('ry', 5);
      diskRect.setAttribute('class', `hanoi-disk disk-color-${diskSize - 1}`);
      diskRect.setAttribute('data-disk-size', diskSize);
      diskRect.setAttribute('data-tower-index', towerIndex);
      diskRect.setAttribute('data-disk-id', `disk-${towerIndex}-${diskIndexInTower}`);
      diskElements.push({ id: `disk-${towerIndex}-${diskIndexInTower}`, element: diskRect, size: diskSize, originalTowerIndex: towerIndex });

      if (selectedDisk && selectedDisk.size === diskSize && selectedDisk.originalTowerIndex === towerIndex && towers[towerIndex].length > 0 && towers[towerIndex][towers[towerIndex].length -1] === diskSize) {
        diskRect.classList.add('selected');
        // Optional: Lift selected disk visually
        // diskRect.setAttribute('y', parseFloat(diskRect.getAttribute('y')) - DISK_HEIGHT / 2);
      }
      hanoiSvg.appendChild(diskRect);
    });
  });
  
  // If a disk is selected, make sure it's rendered last to be on top visually
  if (selectedDisk) {
    const selectedElementData = diskElements.find(d => 
        d.size === selectedDisk.size && 
        d.originalTowerIndex === selectedDisk.originalTowerIndex &&
        towers[selectedDisk.originalTowerIndex].length > 0 && 
        towers[selectedDisk.originalTowerIndex][towers[selectedDisk.originalTowerIndex].length -1] === selectedDisk.size
    );
    if (selectedElementData && selectedElementData.element.parentElement) {
        selectedElementData.element.parentElement.appendChild(selectedElementData.element);
        // Apply selected class again if not already applied by above loop
        if(!selectedElementData.element.classList.contains('selected')){
            selectedElementData.element.classList.add('selected');
        }
    }
  }
  
  // --- Draw Ghost Stack (if applicable) ---
  if (showGhostStack) {
    const goalTowerIndex = NUM_TOWERS - 1;
    for (let diskSize = numDisks; diskSize >= 1; diskSize--) {
      const diskIndexInTower = numDisks - diskSize;
      const diskWidth = MIN_DISK_WIDTH + (diskSize - 1) * DISK_WIDTH_STEP;
      const diskX = TOWER_SPACING * (goalTowerIndex + 1) - diskWidth / 2;
      const diskY = TOWER_BASE_Y - (diskIndexInTower + 1) * DISK_HEIGHT;

      const ghostDiskRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      ghostDiskRect.setAttribute('x', diskX);
      ghostDiskRect.setAttribute('y', diskY);
      ghostDiskRect.setAttribute('width', diskWidth);
      ghostDiskRect.setAttribute('height', DISK_HEIGHT - 2);
      ghostDiskRect.setAttribute('rx', 5);
      ghostDiskRect.setAttribute('ry', 5);
      ghostDiskRect.setAttribute('class', `hanoi-disk disk-color-${diskSize - 1}`); // Use actual colors but make transparent
      ghostDiskRect.style.opacity = '0.3'; // Make it transparent
      ghostDiskRect.style.pointerEvents = 'none'; // Non-interactive
      hanoiSvg.appendChild(ghostDiskRect);
    }
  }
  
  if (isGameWon) {
    const winText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    winText.setAttribute('x', SVG_WIDTH / 2);
    winText.setAttribute('y', SVG_HEIGHT / 4);
    winText.setAttribute('text-anchor', 'middle');
    winText.setAttribute('font-size', '24');
    winText.setAttribute('fill', 'green');
    winText.textContent = `You Won in ${moveCount} moves! Optimal: ${calculateOptimalMoves(numDisks)}`;
    hanoiSvg.appendChild(winText);
  }
}

let warningTimeout = null;
function showWarning(message) {
    hanoiWarning.textContent = message;
    hanoiWarning.style.display = 'block';
    clearTimeout(warningTimeout);
    warningTimeout = setTimeout(() => {
        hanoiWarning.style.display = 'none';
    }, 2000);
}

function handleTowerClick(towerIndex) {
  if (isGameWon) return;

  if (selectedDisk === null) { // Try to pick up a disk
    if (towers[towerIndex].length > 0) {
      const diskToSelect = towers[towerIndex][towers[towerIndex].length - 1];
      selectedDisk = { size: diskToSelect, originalTowerIndex: towerIndex };
      // No actual pop from towers array here, just mark as selected for rendering
      // The actual pop happens on a successful drop
      renderGame(); // Re-render to show selection
    }
  } else { // Try to place the selected disk
    const topDiskOnTargetTower = towers[towerIndex].length > 0 ? towers[towerIndex][towers[towerIndex].length - 1] : null;
    
    if (topDiskOnTargetTower === null || selectedDisk.size < topDiskOnTargetTower) {
      // Valid move: Place disk
      // 1. Remove from original tower
      const poppedDisk = towers[selectedDisk.originalTowerIndex].pop();
      // 2. Add to new tower
      towers[towerIndex].push(poppedDisk);
      
      moveCount++;
      if (moveCount === 1 && showGhostStack) { // First successful move
        showGhostStack = false;
        // No need to re-render immediately, next render will omit ghost stack
      }
      movesTakenDisplay.textContent = moveCount;
      selectedDisk = null;
      checkWinCondition();
      renderGame(); // This render will not show ghost if it was just turned off
    } else {
      // Invalid move
      showWarning("Invalid Move: Cannot place larger disk on smaller one.");
      // Find the SVG element for the selected disk to shake it
      const diskElements = Array.from(hanoiSvg.querySelectorAll('.hanoi-disk'));
      const diskToShake = diskElements.find(el => 
          parseInt(el.dataset.diskSize) === selectedDisk.size && 
          el.classList.contains('selected') // Ensure it's the visually selected one
      );
      if (diskToShake) {
        diskToShake.classList.add('invalid-move-shake');
        diskToShake.addEventListener('animationend', () => {
          diskToShake.classList.remove('invalid-move-shake');
        }, { once: true });
      }

      if (towerIndex === selectedDisk.originalTowerIndex) { // Clicked same tower
          selectedDisk = null; 
          renderGame(); 
      }
      // Do not deselect if it's an invalid placement on a *different* tower
    }
  }
}

function checkWinCondition() {
  // Win if all disks are on the last tower or the middle tower (and not on the first)
  if (towers[0].length === 0 && (towers[1].length === numDisks || towers[2].length === numDisks)) {
    isGameWon = true;
    console.log("You won!");
    // Render game will show win message
  }
}

// --- Event Listeners ---
numDisksSlider.addEventListener('input', (event) => {
  const newNumDisks = parseInt(event.target.value);
  initGame(newNumDisks);
});

resetButton.addEventListener('click', () => {
  initGame(numDisks); // Reset with current number of disks
});

hanoiSvg.addEventListener('click', (event) => {
  let targetElement = event.target;
  // Allow clicking on tower base or peg itself, or a disk to select its tower
  while(targetElement && targetElement !== hanoiSvg) {
      if (targetElement.dataset.towerIndex !== undefined) {
          handleTowerClick(parseInt(targetElement.dataset.towerIndex));
          return;
      }
      targetElement = targetElement.parentElement;
  }
});

// --- Initial Game Setup ---
initGame(parseInt(numDisksSlider.value)); 