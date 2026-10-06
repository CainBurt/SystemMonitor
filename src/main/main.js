const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });

     mainWindow.loadFile(
        path.join(__dirname, '../renderer/index.html')
    );
}

app.whenReady().then(() => {
    createWindow();
});