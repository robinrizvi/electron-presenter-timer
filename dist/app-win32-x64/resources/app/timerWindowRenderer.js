const { ipcRenderer } = require('electron');

ipcRenderer.send('request-update-label-in-second-window', 'some data');