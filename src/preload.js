const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
    getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
});