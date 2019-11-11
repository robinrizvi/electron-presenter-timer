const { ipcRenderer } = require('electron');
var randomColor = require('randomcolor'); //

var timerInstance = new Timer();
var initData = {};
var index = 0;
var appModel = {
    timerLimit: 0,
    slots: [{
        presenter: ''
    }]
};

ipcRenderer.on('initialize-progress', (event, arg) => {
    initData = arg;
    initDisplay(arg);
    sendToTimerWindow();
});

ipcRenderer.on('receive-slot-timer-finish', (event, arg) => {
    if (index == appModel.slots.length) {
        // some code
    } else {
        sendToTimerWindow();
    }
});

ipcRenderer.on('receive-slot-timer-pause', (event, arg) => {
    pauseTimer();
});

ipcRenderer.on('receive-slot-timer-resume', (event, arg) => {
    resumeTimer();
});

ipcRenderer.on('receive-slot-timer-start', (event, arg) => {
    startTimer();
});

ipcRenderer.on('receive-slot-timer-stop', (event, arg) => {
    stopTimer();
});

ipcRenderer.on('receive-slot-timer-skip', (event, arg) => {
    skipTimer();
});

ipcRenderer.on('receive-slot-timer-reverse', (event, arg) => {
    index--;
    skipTimer();
});

function initDisplay(arg) {
    timerInstance.stop();
    index = 0;
    if (arg == null) {
        arg = appModel;
    }
    $('#progressBarStatus').empty();
    $('#totalTime').empty();
    $('#totalTime').append('00:00:00/' + formatDuration(arg.timerLimit * 60));
    document.getElementById(
        "progressBar").setAttribute("style", "width:" + 0 + '%');
    for (var i = 0; i < arg.slots.length; i++) {
        arg.slots[i]['percentage'] = (arg.slots[i]['slotTime'] * 60) / (arg.timerLimit * 60) * 100;
        $('#progressBarStatus').append('<div class="progress-bar progress-bar-success white-text"'
            + 'role="progressbar" style="font-size: 16px;text-align:center;width:'
            + arg.slots[i]['percentage'] + '%; "><span>' + arg.slots[i]['slotHeading'] + '</span></div>');
        $('#progressBarStatus').append('<div class="sep" style="left:' + getPreviousSlotsWidthPercentage(arg, i) + '%;' + '"></div>');
    }
    Vue.set(progressApp.appModel, 'timerLimit', arg.timerLimit);
    for (var i = 0; i < arg.slots.length; i++) {
        Vue.set(progressApp.appModel.slots, i, arg.slots[i]);
    }
}

var config = {
    precision: 'seconds',
    startValues: { seconds: 0 },
    target: { seconds: 0 }
};

function getPreviousSlotsWidthPercentage(arg, i) {
    var total = 0;
    for (; i >= 0; i--) {
        total += arg.slots[i]['percentage'];
    }
    return total;
}

function skipTimer() {
    timerInstance.stop();
    if (index >= appModel.slots.length) {
        $('#totalTime').empty();
        $('#totalTime').append(formatDuration(appModel.timerLimit * 60) + '/' + formatDuration(appModel.timerLimit * 60));
        document.getElementById(
            "progressBar").setAttribute("style", "width:100%");
    } else {
        sendToTimerWindow();
        timerInstance.start({
            precision: 'seconds',
            startValues: { seconds: getTotalSlotTimeExecuted() },
            target: { seconds: appModel.timerLimit * 60 }
        });
    }
}

function startTimer() {
    config.target.seconds = appModel.timerLimit * 60;
    if (timerInstance.isRunning()) {
        timerInstance.start();
    } else {
        timerInstance.start(config);
    }
}

function pauseTimer() {
    if (timerInstance.isRunning()) {
        timerInstance.pause();
    }
}

function resumeTimer() {
    if (!timerInstance.isRunning()) {
        timerInstance.start();
    }
}

function stopTimer() {
    $('#totalTime').empty();
    timerInstance.stop();
    initDisplay(null);
    sendToTimerWindow();
}


function sendToTimerWindow() {
    if (index < appModel.slots.length) {
        ipcRenderer.send('send-to-timer-window', {
            arg: appModel.slots[index],
            index: index,
            playNotification: initData.playNotification,
            warningConfig: initData.warningConfig
        });
        index++;
    }
}

timerInstance.addEventListener("secondsUpdated", function (e) {
    var percentage = getFinishTotalCompletedPercentage();
    $('#progressBarStatus').empty();
    $('#totalTime').empty();
    $('#totalTime').append(timerInstance.getTimeValues().toString() + '/' + formatDuration(appModel.timerLimit * 60));
    for (var i = 0; i < progressApp.appModel.slots.length; i++) {
        if (index - 1 == i) {
            var time = 0;
            if (i > 0) {
                time = timerInstance.getTotalTimeValues().seconds - getTotalSlotTimeExecuted();
            } else {
                time = timerInstance.getTotalTimeValues().seconds;
            }
            $('#progressBarStatus').append('<div class="progress-bar progress-bar-success white-text"'
                + 'role="progressbar" style="font-size: 16px;text-align:center;width:'
                + progressApp.appModel.slots[i]['percentage'] + '%;"><span>' + progressApp.appModel.slots[i]['slotHeading']
                + '</span></div>');
        } else {
            $('#progressBarStatus').append('<div class="progress-bar progress-bar-success white-text"'
                + 'role="progressbar" style="font-size: 16px;text-align:center;width:'
                + progressApp.appModel.slots[i]['percentage'] + '%;"><span>' + progressApp.appModel.slots[i]['slotHeading']
                + '</span></div>');
        }
        $('#progressBarStatus').append('<div class="sep" style="left:' + getPreviousSlotsWidthPercentage(progressApp.appModel, i) + '%;' + '"></div>');
    }

    document.getElementById(
        "progressBar").setAttribute("style", "width:" + percentage + '%');
});

function getTotalSlotTimeExecuted() {
    var timeExecuted = 0;
    for (var i = 0; i < index - 1; i++) {
        timeExecuted += progressApp.appModel.slots[i]['slotTime'] * 60;
    }
    return timeExecuted;
}

function formatDuration(seconds) {
    return moment().startOf('day')
        .seconds(seconds)
        .format('HH:mm:ss');
}

//calculate the total percentage
function getFinishTotalCompletedPercentage() {
    return Math.round(timerInstance.getTotalTimeValues().seconds / (appModel.timerLimit * 60) * 100);
}

var progressApp = new Vue({
    el: '#progressApp',
    data: {
        appModel: appModel
    }
});