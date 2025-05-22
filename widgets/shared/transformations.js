// Common functionality for transformation widgets

// Point label plugin for Chart.js
const pointLabelPlugin = {
  id: "pointLabels",
  afterDraw(chart) {
    const {
      ctx,
      chartArea: { left, right, top, bottom },
      scales: { x, y }
    } = chart;
    const pts = chart.options.plugins.pointLabels.points || [];
    ctx.save();
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "black";
    const placed = [];
    pts.forEach((p) => {
      const text = p.label;
      const w = ctx.measureText(text).width;
      const hTxt = 12;
      let px = x.getPixelForValue(p.x);
      let py = y.getPixelForValue(p.y);
      let dx = 8,
        dy = -8;
      if (px + dx + w > right) dx = -w - 8;
      if (px + dx < left) dx = 8;
      if (py + dy < top) dy = 12;
      if (py + dy + hTxt > bottom) dy = -12;
      let box = { x: px + dx, y: py + dy, w, h: hTxt };
      placed.forEach((bx) => {
        while (
          !(
            box.x + box.w < bx.x ||
            bx.x + bx.w < box.x ||
            box.y + box.h < bx.y ||
            bx.y + bx.h < box.y
          )
        ) {
          box.y += 14;
          if (box.y + box.h > bottom) {
            box.y = py - 14;
            break;
          }
        }
      });
      placed.push(box);
      ctx.fillText(text, box.x, box.y);
    });
    ctx.restore();
  }
};

// Register the plugin
Chart.register(pointLabelPlugin);

// Common chart configuration
const commonChartConfig = {
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: { legend: { display: false }, pointLabels: { points: [] } },
  scales: {
    x: {
      type: 'linear',
      ticks: {
        stepSize: 1
      },
      title: { display: true, text: "x" },
      border: { color: "black", width: 2 },
      grid: { color: "rgba(0,0,0,0.1)" }
    },
    y: {
      ticks: {
        stepSize: 1
      },
      title: { display: true, text: "y" },
      border: { color: "black", width: 2 },
      grid: { color: "rgba(0,0,0,0.1)" }
    }
  }
};

// Common helper functions
const fmt = (n) =>
  Math.abs(n) >= 1000 ? n.toFixed(0) : parseFloat(n.toFixed(2));

// Common DOM helpers
const ids = (id) => document.getElementById(id);

// Common event listener setup
function setupEventListeners(inputIds, updateFunction, defaults) {
  inputIds.forEach(id => {
    const element = ids(id);
    if (element) {
      element.removeEventListener("input", updateFunction);
      element.addEventListener("input", updateFunction);
      
      // Add double-click handler for sliders
      if (id !== "flipChk" && id !== "flipHChk") {
        element.addEventListener("dblclick", () => {
          const defaultKey = {
            "aRange": "aStretch",
            "sRange": "pStretch",
            "bRange": "bBase",
            "hRange": "hShift",
            "kRange": "kShift"
          }[id];
          element.value = defaults[defaultKey];
          updateFunction();
        });
      }
    }
  });
}

// Export common functionality
export {
  pointLabelPlugin,
  commonChartConfig,
  fmt,
  ids,
  setupEventListeners
}; 