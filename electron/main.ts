import { app, BrowserWindow, desktopCapturer, globalShortcut, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createTray } from './tray';

dotenv.config({ path: path.join(__dirname, '../.env') });

let mainWindow: BrowserWindow | null = null;

async function capturePrimaryScreen(): Promise<string | null> {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height },
    });

    if (sources && sources.length > 0) {
      return sources[0].thumbnail.resize({ width: 1920 }).toDataURL();
    }
    return null;
  } catch (error) {
    console.error('Failed to capture screen:', error);
    return null;
  }
}

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 600;
  const winHeight = 500;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: Math.floor((screenWidth - winWidth) / 2),
    y: Math.floor((screenHeight - winHeight) / 3),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('blur', () => {
    hideOverlay();
  });
}

function toggleOverlay() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    hideOverlay();
  } else {
    void showOverlay();
  }
}

async function showOverlay() {
  if (!mainWindow) return;

  const screenshotBase64 = await capturePrimaryScreen();

  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send('window-visibility-change', true);

  if (screenshotBase64) {
    mainWindow.webContents.send('screen-captured', screenshotBase64);
  }
}

function hideOverlay() {
  if (!mainWindow) return;
  mainWindow.hide();
  mainWindow.webContents.send('window-visibility-change', false);
}

app.whenReady().then(() => {
  createWindow();
  createTray(() => void showOverlay(), hideOverlay);

  globalShortcut.register('Ctrl+Shift+Space', () => {
    toggleOverlay();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('hide-window', () => {
  hideOverlay();
});

ipcMain.handle('get-api-keys', () => {
  return {
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  };
});
