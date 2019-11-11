const { app, BrowserWindow, ipcMain } = require('electron');
var electron = require('electron');
var WindowPositioner = require('electron-positioner')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let timerWindow, configWindow, progressWindow;

function createWindow() {
  timerWindow = new BrowserWindow({
    width: 340, height: 130, alwaysOnTop: true, toolbar: true,
    frame: false, transparent: true, resizable: true
  })
  timerWindow.loadFile('index.html')

  timerWindow.on('closed', () => {
    timerWindow = null
  })
}

function createConfigurationWindow() {
  configWindow = new BrowserWindow({ width: 600, height: 700, alwaysOnTop: false, frame: true, icon: 'assets/images/profile.ico' })
  configWindow.loadFile('configWindow.html');

  configWindow.setMenu(null);

  configWindow.on('closed', () => {
    configWindow = null;
    if (progressWindow != null) {
      progressWindow.close();
    }
    if (timerWindow != null) {
      timerWindow.close();
    }
  })
}

function createProgressWindow() {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  progressWindow = new BrowserWindow({
    width: Math.round((width / 100) * 90), height: 50, alwaysOnTop: true, toolbar: false,
    frame: false, transparent: true, resizable: true
  })
  progressWindow.loadFile('progressWindow.html')

  progressWindow.on('closed', () => {
    progressWindow = null
  })
}

ipcMain.on('send-to-timer-window', (event, arg) => {
  timerWindow.webContents.send('receive-slot-details', arg);
});

ipcMain.on('slot-timer-finished', (event, arg) => {
  progressWindow.webContents.send('receive-slot-timer-finish', arg);
});

ipcMain.on('slot-timer-pause', (event, arg) => {
  progressWindow.webContents.send('receive-slot-timer-pause', arg);
});

ipcMain.on('slot-timer-resume', (event, arg) => {
  progressWindow.webContents.send('receive-slot-timer-resume', arg);
});

ipcMain.on('slot-timer-start', (event, arg) => {
  progressWindow.webContents.send('receive-slot-timer-start', arg);
});

ipcMain.on('slot-timer-stop', (event, arg) => {
  progressWindow.webContents.send('receive-slot-timer-stop', arg);
});

ipcMain.on('slot-timer-skip', (event, arg) => {
  progressWindow.webContents.send('receive-slot-timer-skip', arg);
});

ipcMain.on('slot-timer-reverse', (event, arg) => {
  progressWindow.webContents.send('receive-slot-timer-reverse', arg);
});

ipcMain.on('receive-configuration-details', (event, arg) => {
  if (timerWindow == null) {
    createWindow();
  }
  if (progressWindow == null) {
    createProgressWindow();
  } else {
    openWindows(arg);
  }

  progressWindow.webContents.on('dom-ready', function () {
    openWindows(arg);
  });
});

function openWindows(arg) {
  configWindow.minimize();
  new WindowPositioner(timerWindow).move('topRight');
  new WindowPositioner(progressWindow).move('bottomCenter');
  progressWindow.webContents.send('initialize-progress', arg);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createConfigurationWindow();
  new WindowPositioner(configWindow).move('topCenter');
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
})

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.