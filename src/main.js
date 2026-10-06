const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

ipcMain.handle('system:get-info', () => {
  return {
    platform: process.platform,
    architecture: os.arch(),
    cpuCount: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
  };
});

ipcMain.handle('process:get-info', () => {
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
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,

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

app.whenReady().then(() => {
    createWindow();
});