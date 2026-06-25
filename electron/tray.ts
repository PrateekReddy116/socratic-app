import { app, Tray, Menu } from 'electron';
import * as path from 'path';

let tray: Tray | null = null;

export function createTray(onOpen: () => void, onHide: () => void) {
  const iconPath = path.join(__dirname, app.isPackaged ? '../dist/icon.png' : '../public/icon.png');

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Socratic', click: () => onOpen() },
    { label: 'Hide Socratic', click: () => onHide() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Socratic Tutor');
  tray.setContextMenu(contextMenu);
}
