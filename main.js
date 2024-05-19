import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.cjs'),
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  const startURL = `file://${path.join(__dirname, 'excalidraw-app/build/index.html')}`;
  mainWindow.loadURL(startURL);
  // mainWindow.webContents.openDevTools();
}

app.on('ready', () => {
  createWindow();

  // 모든 네트워크 요청을 차단
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    console.log('Intercepting request to:', details.url);  // 디버깅 로그 추가
    if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
      callback({ cancel: true });
    } else {
      callback({});
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
