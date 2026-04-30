const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let nextProcess;
const NEXT_PORT = process.env.PORT || '3000';
const isDev = !app.isPackaged;

function waitForServer(url, attempts = 60) {
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const req = require('http').get(url, (res) => {
        res.resume();
        resolve();
      });

      req.on('error', () => {
        if (attempts <= 0) {
          reject(new Error(`Unable to reach ${url}`));
          return;
        }

        attempts -= 1;
        setTimeout(tryConnect, 500);
      });
    };

    tryConnect();
  });
}

function startNextServer() {
  if (isDev) {
    return;
  }

  const appPath = process.resourcesPath;
  const serverScript = path.join(appPath, 'app', '.next', 'standalone', 'server.js');

  nextProcess = spawn(process.execPath, [serverScript], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: NEXT_PORT,
      HOSTNAME: '127.0.0.1'
    },
    stdio: 'inherit'
  });

  nextProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Next.js server exited with code ${code}`);
    }
  });
}

async function createWindow() {
  const targetUrl = isDev ? 'http://localhost:3000' : `http://127.0.0.1:${NEXT_PORT}`;

  if (!isDev) {
    startNextServer();
    await waitForServer(targetUrl);
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await mainWindow.loadURL(targetUrl);
}

app.whenReady().then(createWindow).catch((error) => {
  console.error('Failed to start desktop app', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});
