const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  printTicket: (options) => ipcRenderer.invoke('print:ticket', options),
  listSerialPorts: () => ipcRenderer.invoke('serial:list-ports'),
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:save-file', options),
  isDesktop: true
});
