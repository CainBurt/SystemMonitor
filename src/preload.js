const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
    getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
    getProcessInfo: () => ipcRenderer.invoke('process:get-info'),
});