const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let widgetWindow;

// 위젯 창 크기 조절을 위한 리스너 추가
ipcMain.on('resize-widget', (event, width, height) => {
  if (!widgetWindow) return;


  const [currentWidth, currentHeight] = widgetWindow.getSize();
  const [currentX, currentY] = widgetWindow.getPosition();

  const deltaWidth = width - currentWidth;

  widgetWindow.setBounds(
    {
      x: currentX - deltaWidth,
      y: currentY,
      width,
      height,
    },
    true
  );
});

function createWidgetWindow() {
  if (widgetWindow) {
    widgetWindow.focus();
    return;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const widgetWidth = 300;
  const widgetHeight = 400;

  widgetWindow = new BrowserWindow({
    width: widgetWidth,
    height: widgetHeight,
    x: width - widgetWidth - 20,
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // widgetWindow.webContents.openDevTools({ mode: 'detach' });
  widgetWindow.loadURL(
    isDev
      ? 'http://localhost:3000/#/widget'
      : `file://${path.join(__dirname, 'index.html')}#/widget` // ../build/ 제거
  );
  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

function createMainWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'index.html')}` // ../build/ 제거
  );

  mainWindow.on('close', () => {
    if (!widgetWindow) {
      createWidgetWindow();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

app.whenReady().then(() => {
  createWidgetWindow();

  app.setLoginItemSettings({
    openAtLogin: true,
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWidgetWindow();
  }
});

ipcMain.on('open-main-app', () => {
  createMainWindow();
  if (widgetWindow) {
    widgetWindow.close();
  }
});
