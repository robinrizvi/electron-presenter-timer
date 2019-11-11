const { ipcRenderer } = require('electron');

ipcRenderer.on('action-update-label', (event, arg) => {
    console.log(arg);
});