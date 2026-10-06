const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
    getPlatform: () => process.platform,
});