import BrainbitClient from "web-neurosdk-brainbit";

let brainbitClient = null;
let realDeviceConnected = false;

const samplingRate = 250; // Brainbit EEG sampling rate
const channelIds = ["o1", "o2", "t3", "t4"];
const charts = {};
const realEEGData = {
  o1: [],
  o2: [],
  t3: [],
  t4: [],
};

// ✅ Inicializar los gráficos vacíos
function initCharts() {
  channelIds.forEach((id) => {
    const chart = echarts.init(document.getElementById(`chart-${id}`));
    charts[id] = chart;

    const option = {
      grid: {
        top: 28,
        bottom: 28,
        left: 50,
        right: 20,
        containLabel: false,
      },
      xAxis: {
        type: "value",
        min: 0,
        max: 4, // 4 segundos visibles
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
        min: -100,
        max: 100,
        axisLabel: {
          formatter: "{value} µV",
          color: "#444",
          fontSize: 11,
        },
        axisLine: { show: true, lineStyle: { color: "#999" } },
        splitLine: { show: true, lineStyle: { type: "dashed", color: "#ccc" } },
      },
      series: [
        {
          type: "line",
          showSymbol: false,
          lineStyle: { width: 2, color: "#0066ff" },
          data: [],
        },
      ],
      animation: false,
    };

    chart.setOption(option);
  });
}

// ✅ Actualizar los datos en las gráficas
function updateCharts() {
  channelIds.forEach((id) => {
    const channelData = realEEGData[id];
    const visibleData = channelData.map((value, index) => [
      index / samplingRate,
      value * 100, // escalamos para visualizar mejor
    ]);

    charts[id].setOption({
      xAxis: {
        min: visibleData.length > 0 ? visibleData[0][0] : 0,
        max:
          visibleData.length > 0 ? visibleData[visibleData.length - 1][0] : 4,
      },
      series: [
        {
          data: visibleData,
        },
      ],
    });
  });
}

// ✅ Función para manejar los datos EEG recibidos
function handleEEGData(data) {
  if (!data) return;

  // Agregar los dos valores de cada canal (porque vienen dobles en Brainbit)
  realEEGData.o1.push(data.val0_ch1, data.val1_ch1);
  realEEGData.o2.push(data.val0_ch2, data.val1_ch2);
  realEEGData.t3.push(data.val0_ch3, data.val1_ch3);
  realEEGData.t4.push(data.val0_ch4, data.val1_ch4);

  // Limitar el tamaño de la ventana (ej: 1000 muestras ~ 4s)
  const maxSamples = 1000;
  for (const id of channelIds) {
    if (realEEGData[id].length > maxSamples) {
      realEEGData[id] = realEEGData[id].slice(
        realEEGData[id].length - maxSamples
      );
    }
  }

  updateCharts();
}

// ✅ Conectar al dispositivo BrainBit
async function connectDevice() {
  try {
    brainbitClient = new BrainbitClient();

    brainbitClient.connectionStatus.subscribe((status) => {
      console.log(status ? "✅ Connected!" : "❌ Disconnected");
      realDeviceConnected = status;
      updateConnectionStatus(status);
    });

    await brainbitClient.connect();

    brainbitClient.statusData.subscribe((data) => {
      console.log("Status Data:", data);
    });

    brainbitClient.eegStream.subscribe((data) => {
      handleEEGData(data);
    });

    const eegStatus = await brainbitClient.startEEGStream();
    console.log("EEG Stream Started:", eegStatus);
  } catch (error) {
    console.error("Connection failed:", error);
    updateConnectionStatus(false);
  }
}

// ✅ Cambiar visualmente el estado de conexión
function updateConnectionStatus(connected) {
  const statusDiv = document.getElementById("connectionStatus");
  if (connected) {
    statusDiv.textContent = "Connected";
    statusDiv.classList.remove("disconnected");
    statusDiv.classList.add("connected");
  } else {
    statusDiv.textContent = "Disconnected";
    statusDiv.classList.remove("connected");
    statusDiv.classList.add("disconnected");
  }
}

// ✅ Evento para el botón de conexión
document.getElementById("connectDeviceBtn").addEventListener("click", () => {
  connectDevice();
});

// Inicializar todo al cargar
initCharts();
updateConnectionStatus(false);
