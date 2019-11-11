const { ipcRenderer } = require('electron');

var appModel;

ipcRenderer.on('initialize-progress', (event, arg) => {
    console.log('here i am ' + arg);
    appModel = arg;
});