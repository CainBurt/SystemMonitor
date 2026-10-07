const api = window.desktop;
const cpuHistory = [];

function loadSystemInfo(info) {
  const rows = [
    ['Computer', info.hostname],
    ['User', info.username],
    ['OS', `${info.osType} ${info.osRelease}`],
    ['Version', info.osVersion],
    ['Architecture', info.arch],
    ['CPU', `${info.cpuModel} (${info.cpuCores} logical cores)`],
    ['Total memory', info.totalMemory],
    ['Electron / Node', `${info.electron} / ${info.node}`],
  ];
  const list = document.getElementById('system-list');
  list.replaceChildren();
  for (const [label, value] of rows) {
    const parent = document.createElement('div');
    parent.textContent = label;
    const child = document.createElement('div');
    child.textContent = value || '–';
    list.append(parent, child);
  }
}

async function loadProcessInfo() {
  const info = await window.desktop.getProcessInfo();

  const tableBody = document.getElementById('process-table-body');
  const timestampElement = document.getElementById('process-timestamp');

  tableBody.innerHTML = '';

  info.electronProcesses.forEach((processInfo) => {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${processInfo.pid}</td>
        <td>${processInfo.type}</td>
        <td>${processInfo.name ?? '-'}</td>
        <td>${processInfo.memory.workingSetSize} KB</td>
        <td>${processInfo.sandboxed ? 'Yes' : 'No'}</td>
        `;

    tableBody.appendChild(row);
  });

  timestampElement.textContent = info.timestamp;
}

function drawCpuChart() {
  const canvas = document.getElementById('cpu-chart');
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  if (cpuHistory.length < 2) return;

  ctx.strokeStyle = '#4cc2ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  cpuHistory.forEach((value, i) => {
    const x = (i / (60 - 1)) * width;
    const y = height - (value / 100) * (height - 4) - 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function setFill(el, percent) {
  el.style.width = `${Math.min(percent, 100)}%`;
  el.classList.toggle('warn', percent >= 70 && percent < 90);
  el.classList.toggle('danger', percent >= 90);
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i >= 3 ? 1 : 0)} ${units[i]}`;
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `Uptime ${d ? d + 'd ' : ''}${h}h ${m}m`;
}

function renderLive(stats) {
  document.getElementById('cpu-value').textContent = `${stats.cpuPercent.toFixed(1)}%`;
  setFill(document.getElementById('cpu-fill'), stats.cpuPercent);

  const memPercent = (stats.memUsed / stats.memTotal) * 100;
  document.getElementById('mem-value').textContent = `${memPercent.toFixed(0)}%`;
  setFill(document.getElementById('mem-fill'), memPercent);
  document.getElementById('mem-detail').textContent =
    `${formatBytes(stats.memUsed)} used of ${formatBytes(stats.memTotal)} · ${formatBytes(stats.memFree)} free`;

  document.getElementById('uptime').textContent = formatUptime(stats.uptimeSeconds);

  cpuHistory.push(stats.cpuPercent);
  if (cpuHistory.length > 60) cpuHistory.shift();
  drawCpuChart();
}



async function init() {
  try {
    loadSystemInfo(await api.getSystemInfo());
    await loadProcessInfo();
  } catch (error) {
    console.error('Failed to initialize diagnostics:', error);
  }

  setInterval(async () => {
    renderLive(await api.getLiveStats());
  }, 1000);
}

init();