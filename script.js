let requestedStart = false;
let paused = true;
let started = false;

let amplitudeLimit = 50;
let visibleSeconds = 2;
const samplingRate = 250;
const totalDuration = 100;
const totalSamples = samplingRate * totalDuration;
const warmupSeconds = 2;
const warmupSamples = samplingRate * warmupSeconds;

const channelIds = ["o1", "o2", "t3", "t4"];
const charts = {};
const data = {};

let index = 0;
let loop;
let N_VISIBLE = samplingRate * visibleSeconds;

// 📊 Simulación EEG
function simulateAllChannels() {
  channelIds.forEach((id, chIndex) => {
    const signal = [];
    for (let i = 0; i < totalSamples; i++) {
      const t = i / samplingRate;
      const delta = Math.sin(2 * Math.PI * 1.5 * t + chIndex) * 10;
      const theta = Math.sin(2 * Math.PI * 6 * t + chIndex * 0.3) * 5;
      const alpha = Math.sin(2 * Math.PI * 10 * t + chIndex * 0.5) * 8;
      const beta = Math.sin(2 * Math.PI * 20 * t + chIndex * 0.8) * 3;
      const noise = (Math.random() - 0.5) * 2;
      signal.push(delta + theta + alpha + beta + noise);
    }
    data[id] = signal;
  });
}

// 📉 Gráfica base
function loadInitialZeroGraph() {
  channelIds.forEach((id) => {
    const chart = echarts.init(document.getElementById(`chart-${id}`));
    charts[id] = chart;

    const baseline = Array.from({ length: N_VISIBLE }, (_, i) => [
      i / samplingRate,
      0,
    ]);

    chart.setOption({
      grid: { top: 28, bottom: 28, left: 50, right: 20, containLabel: false },
      xAxis: {
        type: "value",
        min: 0,
        max: visibleSeconds,
        axisLabel: {
          color: "#444",
          fontSize: 11,
          formatter: (val) => `${val}s`,
        },
        axisLine: { lineStyle: { color: "#999" } },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: -amplitudeLimit,
        max: amplitudeLimit,
        axisLabel: {
          formatter: "{value} µV",
          color: "#444",
          fontSize: 11,
        },
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { color: "#999" } },
        splitLine: { show: true, lineStyle: { type: "dashed", color: "#ccc" } },
      },
      series: [
        {
          type: "line",
          showSymbol: false,
          lineStyle: { width: 2, color: "#0066ff" },
          data: baseline || [],
        },
      ],
      animation: false,
    });
  });
}

// ▶️ Iniciar animación
function startChart() {
  index = 0;
  if (loop) clearInterval(loop);
  loop = setInterval(() => {
    if (paused) return;
    if (index + N_VISIBLE >= totalSamples) index = 0;

    channelIds.forEach((id) => {
      const visibleData = [];
      for (let i = 0; i < N_VISIBLE; i++) {
        const globalIndex = index + i;
        const t = globalIndex / samplingRate;
        const val = globalIndex < warmupSamples ? 0 : data[id][globalIndex];
        visibleData.push([parseFloat(t.toFixed(3)), val]);
      }

      charts[id].setOption({
        xAxis: {
          min: visibleData[0][0],
          max: visibleData[N_VISIBLE - 1][0],
        },
        series: [{ data: visibleData }],
      });
    });

    index++;
  }, 40);
}

// 🎚 Control de ejes
function updateYAxisAll() {
  channelIds.forEach((id) => {
    charts[id].setOption({
      yAxis: { min: -amplitudeLimit, max: amplitudeLimit },
    });
  });
}

function updateXAxisAll() {
  N_VISIBLE = samplingRate * visibleSeconds;
  index = 0;
}

// ▶️/⏸ Botón
document.getElementById("playPauseBtn").addEventListener("click", () => {
  const btn = document.getElementById("playPauseBtn");
  if (!started) {
    simulateAllChannels();
    loadInitialZeroGraph();
    startChart();
    started = true;
    paused = false;
    btn.textContent = "Pause";
  } else {
    paused = !paused;
    btn.textContent = paused ? "Start" : "Pause";
  }
});

// 🔁 Reset
document.getElementById("resetBtn").addEventListener("click", () => {
  index = 0;
  paused = true;
  started = false;
  document.getElementById("playPauseBtn").textContent = "Start";
  loadInitialZeroGraph();
});

// 🎛 Mostrar controles según modo
function toggleControlPanels(mode) {
  const sim = document.getElementById("simControls");
  const real = document.getElementById("realControls");
  if (!sim || !real) return;

  if (mode === "sim") {
    sim.style.display = "flex";
    real.style.display = "none";
  } else if (mode === "real") {
    sim.style.display = "none";
    real.style.display = "flex";
  }
}

// ✨ Visual de tarjeta seleccionada
function selectMode(mode) {
  document
    .querySelectorAll(".mode-card")
    .forEach((card) => card.classList.remove("selected"));
  document.getElementById(mode).classList.add("selected");

  if (mode === "simMode") {
    toggleControlPanels("sim");
  } else if (mode === "realMode") {
    toggleControlPanels("real");
  }
}

// 🎯 Eventos de selección
document.getElementById("simMode").addEventListener("click", () => {
  selectMode("simMode");
  console.log("🧪 Simulation mode selected");
});

document.getElementById("realMode").addEventListener("click", () => {
  selectMode("realMode");
  console.log("🔌 Real device mode selected");
});

// Select changes
document.getElementById("amplitudeSelect").addEventListener("change", (e) => {
  amplitudeLimit = parseInt(e.target.value);
  updateYAxisAll();
});

document.getElementById("durationSelect").addEventListener("change", (e) => {
  visibleSeconds = parseInt(e.target.value);
  updateXAxisAll();
});

// Inicializar con línea base
loadInitialZeroGraph();
