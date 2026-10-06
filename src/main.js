const { app, BrowserWindow } = require('electron');
const path = require('path');

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