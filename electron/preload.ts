import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  hideWindow: () => ipcRenderer.send('hide-window'),
  getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
  onWindowVisibilityChange: (callback: (visible: boolean) => void) => {
    ipcRenderer.on('window-visibility-change', (_event, value) => callback(value));
  },
  onScreenCaptured: (callback: (base64Image: string) => void) => {
    ipcRenderer.removeAllListeners('screen-captured');
    ipcRenderer.on('screen-captured', (_event, value) => callback(value));
  },
});
