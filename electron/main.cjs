const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'AGROSCALE ERP - Sistem Jembatan Timbang & Ramp Peron Sawit',
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    frame: true,
    show: false
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Communication Handlers
ipcMain.handle('app:info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    isElectron: true
  };
});

ipcMain.handle('print:ticket', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  
  try {
    // If silent print requested, print to default printer
    if (options.silent) {
      mainWindow.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: options.deviceName || ''
      }, (success, failureReason) => {
        if (!success) console.error('Print failed:', failureReason);
      });
      return { success: true };
    } else {
      mainWindow.webContents.print({
        silent: false,
        printBackground: true
      });
      return { success: true };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('serial:list-ports', async () => {
  // In native environment with serialport module, we list COM ports.
  // Standard simulated / virtual fallbacks provided here.
  return [
    { path: 'COM1', manufacturer: 'Weighbridge Terminal RS232' },
    { path: 'COM3', manufacturer: 'Yaohua XK3190 Indicator USB-Serial' },
    { path: 'COM4', manufacturer: 'Mettler Toledo Panther Terminal' },
    { path: '/dev/ttyUSB0', manufacturer: 'Avery Berkel Digital Indicator' }
  ];
});

ipcMain.handle('dialog:save-file', async (event, options) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Simpan Laporan',
    defaultPath: options.defaultPath || 'Laporan_Ramp_Sawit.csv',
    filters: options.filters || [{ name: 'CSV File', extensions: ['csv'] }]
  });
  return result;
});
