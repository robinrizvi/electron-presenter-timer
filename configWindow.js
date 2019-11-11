const { ipcRenderer } = require('electron');

var timerLimit = 0;
var playNotification = true;

var slots = [{
    "slotTime": 0,
    "slotHeading": "",
    "presenter": "",
    "isFinished": false
}];

var appModel = {
    "timerLimit": 0,
    "playNotification": true,
    "slots": []
}

function sendResponse() {
    if (validate()) {
        appModel.slots = slots;
        appModel.playNotification = config.playNotification;
        appModel.timerLimit = document.getElementById('timerLimit').value;
        appModel.warningConfig = {
            warningTime1: config.warningTime1,
            warningTime2: config.warningTime2,
            warningColor1: document.getElementById('warningColor1').value,
            warningColor2: document.getElementById('warningColor2').value
        }
        ipcRenderer.send('receive-configuration-details', appModel);
    }
}

function validate() {
    var time = appModel.timerLimit = document.getElementById('timerLimit').value;
    if (time < 1) {
        alert('Timer time can not be less than 1 minute');
        return false;
    }

    var totalSlotTime = 0;
    for (var i = 0; i < slots.length; i++) {
        totalSlotTime += Number(slots[i].slotTime);
    }

    if (totalSlotTime < time) {
        alert('Total slot time could not be less than the Timer total allocated time.');
        return false;
    }

    if (totalSlotTime > time) {
        alert('Total slot time could not be greater than the Timer total allocated time.');
        return false;
    }

    return true;

}

var app4 = new Vue({
    el: '#app-4',
    data: {
        slots: slots
    },
    methods: {
        addSlot: function () {
            slots.push({
                "slotTime": 0,
                "slotHeading": "",
                "presenter": "",
                "isFinished": false
            });
        },
        process: sendResponse
    }
});

var config = new Vue({
    el: '#config',
    data: {
        timerLimit: 0,
        playNotification: true,
        warningColor1: 'FFA500',
        warningColor2: 'F44336',
        warningTime1: '20',
        warningTime2: '10'
    },
    methods: {
        toggleNotification: function () {
            config.playNotification = config.playNotification ? false : true;
        }
    }
});
