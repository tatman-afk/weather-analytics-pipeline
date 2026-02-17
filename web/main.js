import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const SUPABASE_URL = "https://dikgnfpahgrjqpikcvwe.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2duZnBhaGdyanFwaWtjdndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Njk2NjksImV4cCI6MjA4NjM0NTY2OX0.TKWRmPrCpOOcaJnU7rqBHBherH8gc0llYMhmfN8TguU";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const cityInput = document.getElementById("cityInput");
const schemaInput = document.getElementById("schemaInput");
const tableInput = document.getElementById("tableInput");
const rangeSelect = document.getElementById("rangeSelect");
const refreshBtn = document.getElementById("refreshBtn");
const statusText = document.getElementById("statusText");
const lastUpdatedText = document.getElementById("lastUpdatedText");

const kpiTemp = document.getElementById("kpiTemp");
const kpiHumidity = document.getElementById("kpiHumidity");
const kpiPressure = document.getElementById("kpiPressure");
const kpiWind = document.getElementById("kpiWind");

schemaInput.value = localStorage.getItem("weather_schema") || schemaInput.value;
tableInput.value = localStorage.getItem("weather_table") || tableInput.value;
cityInput.value = localStorage.getItem("weather_city") || cityInput.value;
rangeSelect.value = localStorage.getItem("weather_range") || rangeSelect.value;

const charts = {
  temperature: null,
  humidityWind: null,
  pressure: null,
  dailyRange: null,
};

function formatTimestampLabel(timestamp) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
  }).format(date);
}

function rangeToStartIso(range) {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  if (range === "24h") return new Date(now - 24 * hour).toISOString();
  if (range === "30d") return new Date(now - 30 * 24 * hour).toISOString();
  return new Date(now - 7 * 24 * hour).toISOString();
}

function renderKpis(latestRow) {
  if (!latestRow) {
    kpiTemp.textContent = "--";
    kpiHumidity.textContent = "--";
    kpiPressure.textContent = "--";
    kpiWind.textContent = "--";
    return;
  }
  kpiTemp.textContent = `${Number(latestRow.temperature).toFixed(1)} F`;
  kpiHumidity.textContent = `${latestRow.humidity}%`;
  kpiPressure.textContent = `${latestRow.pressure} hPa`;
  kpiWind.textContent = `${Number(latestRow.wind_speed).toFixed(1)} mph`;
}

function destroyCharts() {
  Object.values(charts).forEach((chart) => {
    if (chart) chart.destroy();
  });
}

function buildDailyRanges(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    const day = new Date(row.timestamp).toISOString().slice(0, 10);
    if (!grouped.has(day)) {
      grouped.set(day, { min: row.temperature, max: row.temperature });
      return;
    }
    const entry = grouped.get(day);
    entry.min = Math.min(entry.min, row.temperature);
    entry.max = Math.max(entry.max, row.temperature);
  });
  return [...grouped.entries()].map(([day, entry]) => ({
    day,
    min: entry.min,
    max: entry.max,
  }));
}

function renderCharts(rows) {
  destroyCharts();

  const labels = rows.map((row) => formatTimestampLabel(row.timestamp));
  const fullTimestamps = rows.map((row) =>
    new Date(row.timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  );
  const temperatures = rows.map((row) => row.temperature);
  const humidities = rows.map((row) => row.humidity);
  const windSpeeds = rows.map((row) => row.wind_speed);
  const pressures = rows.map((row) => row.pressure);
  const dailyRanges = buildDailyRanges(rows);

  const sharedInteraction = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
    hover: {
      mode: "index",
      intersect: false,
    },
  };

  charts.temperature = new Chart(document.getElementById("temperatureChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature (F)",
          data: temperatures,
          borderColor: "#fb923c",
          backgroundColor: "rgba(251, 146, 60, 0.2)",
          tension: 0.35,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 16,
        },
      ],
    },
    options: {
      ...sharedInteraction,
      plugins: {
        ...sharedInteraction.plugins,
        tooltip: {
          callbacks: {
            title(items) {
              return fullTimestamps[items[0].dataIndex];
            },
            label(context) {
              return `Temperature: ${Number(context.raw).toFixed(1)} F`;
            },
          },
        },
      },
    },
  });

  charts.humidityWind = new Chart(document.getElementById("humidityWindChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Humidity (%)",
          data: humidities,
          borderColor: "#22d3ee",
          yAxisID: "y",
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 16,
        },
        {
          label: "Wind (mph)",
          data: windSpeeds,
          borderColor: "#a78bfa",
          yAxisID: "y1",
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 16,
        },
      ],
    },
    options: {
      ...sharedInteraction,
      plugins: {
        ...sharedInteraction.plugins,
        tooltip: {
          callbacks: {
            title(items) {
              return fullTimestamps[items[0].dataIndex];
            },
          },
        },
      },
      scales: {
        y: { position: "left" },
        y1: { position: "right", grid: { drawOnChartArea: false } },
      },
    },
  });

  charts.pressure = new Chart(document.getElementById("pressureChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Pressure (hPa)",
          data: pressures,
          borderColor: "#4ade80",
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 16,
        },
      ],
    },
    options: {
      ...sharedInteraction,
      plugins: {
        ...sharedInteraction.plugins,
        tooltip: {
          callbacks: {
            title(items) {
              return fullTimestamps[items[0].dataIndex];
            },
            label(context) {
              return `Pressure: ${context.raw} hPa`;
            },
          },
        },
      },
    },
  });

  charts.dailyRange = new Chart(document.getElementById("dailyRangeChart"), {
    type: "bar",
    data: {
      labels: dailyRanges.map((d) => d.day),
      datasets: [
        {
          label: "Min Temp (F)",
          data: dailyRanges.map((d) => d.min),
          backgroundColor: "#38bdf8",
        },
        {
          label: "Max Temp (F)",
          data: dailyRanges.map((d) => d.max),
          backgroundColor: "#f97316",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label(context) {
              const val = Number(context.raw).toFixed(1);
              return `${context.dataset.label}: ${val} F`;
            },
          },
        },
      },
    },
  });
}

async function fetchWeather() {
  let table = tableInput.value.trim();
  let schema = schemaInput.value.trim() || "public";
  const city = cityInput.value.trim();
  const range = rangeSelect.value;
  const startIso = rangeToStartIso(range);

  if (table.includes(".")) {
    const [dotSchema, dotTable] = table.split(".");
    if (dotSchema && dotTable) {
      schema = dotSchema;
      table = dotTable;
      schemaInput.value = schema;
      tableInput.value = table;
    }
  }

  localStorage.setItem("weather_schema", schema);
  localStorage.setItem("weather_table", table);
  localStorage.setItem("weather_city", city);
  localStorage.setItem("weather_range", range);

  if (!table) {
    statusText.textContent = "Set a table name.";
    return;
  }

  statusText.textContent = "Refreshing weather data...";

  let query = supabase
    .schema(schema)
    .from(table)
    .select("id,city,timestamp,temperature,humidity,pressure,wind_speed")
    .gte("timestamp", startIso)
    .order("timestamp", { ascending: true })
    .limit(2000);

  if (city) query = query.eq("city", city);

  const { data, error } = await query;

  if (error) {
    const message = String(error.message || "");
    if (message.includes("schema cache")) {
      statusText.textContent = `Table not found: ${schema}.${table}. Update Schema/Table fields.`;
    } else if (message.toLowerCase().includes("permission denied")) {
      statusText.textContent = `Permission denied on ${schema}.${table}. Add a SELECT policy for anon.`;
    } else {
      statusText.textContent = `Query failed: ${error.message}`;
    }
    renderKpis(null);
    destroyCharts();
    return;
  }

  if (!data || data.length === 0) {
    statusText.textContent = "No rows found for this city/range.";
    renderKpis(null);
    destroyCharts();
    return;
  }

  const latest = data[data.length - 1];
  renderKpis(latest);
  renderCharts(data);
  statusText.textContent = `Loaded ${data.length} rows for ${city || "all cities"}.`;
  lastUpdatedText.textContent = `Last updated: ${new Date().toLocaleString()}`;
}

refreshBtn.addEventListener("click", fetchWeather);
rangeSelect.addEventListener("change", fetchWeather);

setInterval(fetchWeather, REFRESH_INTERVAL_MS);
fetchWeather();
