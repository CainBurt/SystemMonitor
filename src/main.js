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
  return {
    platform: process.platform,
    architecture: os.arch(),
    cpuCount: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    release: os.release(),
    hostname: os.hostname(),
    version: os.version(),
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

app.whenReady().then(() => {
  createWindow();
});