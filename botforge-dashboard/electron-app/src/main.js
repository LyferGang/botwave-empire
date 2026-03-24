const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a', // Slate 900 (Dark Mode)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // In dev, load Next.js localhost. In prod, load built static files.
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../out/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Inter-Process Communication (IPC) for Ping/Status checks of Edge Nodes
ipcMain.handle('ping-node', async (event, ip) => {
  // Execute a secure Tailscale ping to check if the Pi is alive
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec(`tailscale ping -c 1 -t 2 ${ip}`, (error) => {
      resolve(!error);
    });
  });
});
