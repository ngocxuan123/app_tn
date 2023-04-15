import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import { Worker } from 'worker_threads';
import { registerTitlebarIpc } from '@misc/window/titlebarIPC';
import path from 'path';
import fs from 'fs';
import { RunnerProcessDto } from '@src/modules/shared/dtos/OptionRunnerDto';

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let appWindow: BrowserWindow;

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export function createAppWindow(): BrowserWindow {
  // Create new window instance
  appWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    backgroundColor: '#202020',
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.resolve('assets/images/appIcon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: false,
      webSecurity: false
    },
  });

  // Load the index.html of the app window.
  appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);

  // Show window when its ready to
  appWindow.on('ready-to-show', () => appWindow.show());

  // Register Inter Process Communication for main process
  registerMainIPC();

  // Close all windows when main window is closed
  appWindow.on('close', () => {
    appWindow = null;
    app.quit();
  });

  const workers: Worker[] = [];
  // Ipc Events
  // 
  ipcMain?.on('startProcess', async (event, process: RunnerProcessDto[]) => {
    process.map(item => {
      const workerPath = path.join(__dirname, 'worker.js');
      const worker = new Worker(workerPath);
      workers.push(worker);
      worker.postMessage(item);
      // On Exit
      worker.on('exit', () => console.log('Worker has exited'));
      // On message
      worker.on('message', (value) => ipcMain.emit('updateStatus', value))
    })
  });

  ipcMain?.on('stopAll', async () => {
    workers.forEach((worker) => {
      worker.postMessage('stop');
      worker.terminate();
    });
  });

  ipcMain?.on('stopOne', async (event, workerIndex) => {
    workers[workerIndex].postMessage('stop');
    workers[workerIndex].terminate();
  });

  ipcMain?.on('toggleLog', async (event, workerIndex, value) => {
    workers[workerIndex].postMessage('toggleLog', value);
  });

  ipcMain.on('getLogs', (event, fileName) => {
    const logs = fs.readFileSync(path.join('logs', 'texts', fileName), 'utf-8');
    event.sender.send('getLogs-reply', logs);
  });

  return appWindow;
}

/**
 * Register Inter Process Communication
 */
function registerMainIPC() {
  /**
   * Here you can assign IPC related codes for the application window
   * to Communicate asynchronously from the main process to renderer processes.
   */
  registerTitlebarIpc(appWindow);
}
