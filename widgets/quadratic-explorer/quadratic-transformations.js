// DOM Elements
const standardFormBtn = document.getElementById('standardFormBtn');
const vertexFormBtn = document.getElementById('vertexFormBtn');
const standardFormDisplay = document.getElementById('standardForm');
const vertexFormDisplay = document.getElementById('vertexForm');

// Standard form controls
const aSlider = document.getElementById('a');
const bSlider = document.getElementById('b');
const cSlider = document.getElementById('c');
const aValue = document.getElementById('aValue');
const bValue = document.getElementById('bValue');
const cValue = document.getElementById('cValue');

// Vertex form controls
const aVertexSlider = document.getElementById('aVertex');
const hSlider = document.getElementById('h');
const kSlider = document.getElementById('k');
const aVertexValue = document.getElementById('aVertexValue');
const hValue = document.getElementById('hValue');
const kValue = document.getElementById('kValue');

// Plot element
const plotElement = document.getElementById('plot');

// Initialize plot
let plot = null;

// Function to convert vertex form to standard form
function vertexToStandard(a, h, k) {
    return {
        a: a,
        b: -2 * a * h,
        c: a * h * h + k
    };
}

// Function to convert standard form to vertex form
function standardToVertex(a, b, c) {
    const h = -b / (2 * a);
    const k = c - (b * b) / (4 * a);
    return {
        a: a,
        h: h,
        k: k
    };
}

// Function to generate points for plotting
function generatePoints(a, b, c) {
    const points = [];
    const xRange = 10;
    const step = 0.1;

    for (let x = -xRange; x <= xRange; x += step) {
        const y = a * x * x + b * x + c;
        points.push({ x, y });
    }

    return points;
}

// Function to update the plot
function updatePlot() {
    let a, b, c;

    if (standardFormBtn.classList.contains('active')) {
        a = parseFloat(aSlider.value);
        b = parseFloat(bSlider.value);
        c = parseFloat(cSlider.value);

        // Update vertex form controls
        const vertex = standardToVertex(a, b, c);
        aVertexSlider.value = vertex.a;
        hSlider.value = vertex.h;
        kSlider.value = vertex.k;
        aVertexValue.textContent = vertex.a.toFixed(1);
        hValue.textContent = vertex.h.toFixed(1);
        kValue.textContent = vertex.k.toFixed(1);
    } else {
        const aVertex = parseFloat(aVertexSlider.value);
        const h = parseFloat(hSlider.value);
        const k = parseFloat(kSlider.value);

        // Update standard form controls
        const standard = vertexToStandard(aVertex, h, k);
        aSlider.value = standard.a;
        bSlider.value = standard.b;
        cSlider.value = standard.c;
        aValue.textContent = standard.a.toFixed(1);
        bValue.textContent = standard.b.toFixed(1);
        cValue.textContent = standard.c.toFixed(1);

        a = standard.a;
        b = standard.b;
        c = standard.c;
    }

    const points = generatePoints(a, b, c);

    const trace = {
        x: points.map(p => p.x),
        y: points.map(p => p.y),
        type: 'scatter',
        mode: 'lines',
        name: 'f(x)',
        line: {
            color: '#E60000',
            width: 2
        }
    };

    const layout = {
        title: 'Quadratic Function',
        xaxis: {
            title: 'x',
            range: [-10, 10],
            zeroline: true,
            zerolinecolor: '#666',
            zerolinewidth: 1,
            gridcolor: '#ddd'
        },
        yaxis: {
            title: 'f(x)',
            range: [-10, 10],
            zeroline: true,
            zerolinecolor: '#666',
            zerolinewidth: 1,
            gridcolor: '#ddd'
        },
        plot_bgcolor: 'white',
        paper_bgcolor: 'white',
        showlegend: false,
        margin: {
            l: 50,
            r: 50,
            t: 50,
            b: 50
        }
    };

    Plotly.newPlot(plotElement, [trace], layout);
}

// Event listeners for form toggle
standardFormBtn.addEventListener('click', () => {
    standardFormBtn.classList.add('active');
    vertexFormBtn.classList.remove('active');
    standardFormDisplay.style.display = 'block';
    vertexFormDisplay.style.display = 'none';
    updatePlot();
});

vertexFormBtn.addEventListener('click', () => {
    vertexFormBtn.classList.add('active');
    standardFormBtn.classList.remove('active');
    vertexFormDisplay.style.display = 'block';
    standardFormDisplay.style.display = 'none';
    updatePlot();
});

// Event listeners for sliders
[aSlider, bSlider, cSlider, aVertexSlider, hSlider, kSlider].forEach(slider => {
    slider.addEventListener('input', () => {
        const valueDisplay = document.getElementById(slider.id + 'Value');
        valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
        updatePlot();
    });
});

// Initial plot
updatePlot(); 