const { app, BrowserWindow } = require('electron');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });

     mainWindow.loadURL(
        'data:text/html,<h1>System Monitor</h1><p>Running...</p>'
    );
}

app.whenReady().then(() => {
    createWindow();
});