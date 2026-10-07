const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

const RENDERER_INDEX = path.join(__dirname, 'renderer', 'index.html');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,

    webPreferences: {
      preload: path.join(__dirname, '/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(
    path.join(__dirname, '/renderer/index.html')
  );
}

function getSystemInfo() {
  const cpus = os.cpus();
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    osType: os.type(),
    osVersion: typeof os.version === 'function' ? os.version() : '',
    osRelease: os.release(),
    arch: os.arch(),
    username: os.userInfo().username,
    cpuModel: cpus[0] ? cpus[0].model.trim() : 'Unknown',
    cpuCores: cpus.length,
    totalMemory: os.totalmem(),
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  };
}

function getProcessInfo() {
  const processes = app.getAppMetrics();

  return {
    timestamp: new Date().toISOString(),

    mainProcess: {
      pid: process.pid,
      memory: process.memoryUsage(),
    },

    electronProcesses: processes.map((processInfo) => ({
      pid: processInfo.pid,
      type: processInfo.type,
      name: processInfo.name,
      serviceName: processInfo.serviceName,
      memory: processInfo.memory,
      cpu: processInfo.cpu,
      sandboxed: processInfo.sandboxed,
      integrityLevel: processInfo.integrityLevel,
    })),
  };
}

let lastCpuSample = sampleCpu();

function sampleCpu() {
  let idle = 0;
  let total = 0;
  for (const cpu of os.cpus()) {
    for (const value of Object.values(cpu.times)) total += value;
    idle += cpu.times.idle;
  }
  return { idle, total };
}

function getCpuUsagePercent() {
  const current = sampleCpu();
  const idleDelta = current.idle - lastCpuSample.idle;
  const totalDelta = current.total - lastCpuSample.total;
  lastCpuSample = current;
  if (totalDelta <= 0) return 0;
  return Math.round((1 - idleDelta / totalDelta) * 1000) / 10;
}

function getLiveStats() {
  const total = os.totalmem();
  const free = os.freemem();
  return {
    cpuPercent: getCpuUsagePercent(),
    memTotal: total,
    memFree: free,
    memUsed: total - free,
    uptimeSeconds: os.uptime(),
    timestamp: Date.now(),
  };
}

function isTrustedSender(event) {
  try {
    const url = new URL(event.senderFrame.url);
    return url.protocol === 'file:' &&
      path.normalize(decodeURIComponent(url.pathname.replace(/^\//, ''))) ===
      path.normalize(RENDERER_INDEX.replace(/^\//, ''));
  } catch {
    return false;
  }
}

function handle(channel, fn) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted IPC sender');
    return fn(...args);
  });
}

handle('system:get-info', () => getSystemInfo());
handle('process:get-info', () => getProcessInfo());
handle('live:get-info', () => getLiveStats());

app.whenReady().then(() => {
  createWindow();
});