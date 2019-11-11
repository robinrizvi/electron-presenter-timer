const { ipcRenderer } = require('electron');

var appModel = { presenter: '' };
var timerInstance = new Timer();
var warningConfig = {};
var playSound = false;
var playWarningSound = false;
// this is used to control the sound play
var playNotification = false;

ipcRenderer.on('receive-slot-details', (event, arg) => {
  playSound = false;
  playWarningSound = false;
  timerInstance.stop();
  // this is used to control the sound play
  playNotification = arg.playNotification;
  appModel = arg.arg;
  warningConfig = arg.warningConfig;
  Vue.set(timerApp.appModel, 'presenter', appModel.presenter);
  document.getElementById(
    "progressBar").setAttribute("style", "width:0%");
  document.getElementById("pauseButton").innerText = "pause_circle_outline";
  document.getElementById("slotTitle").innerHTML = appModel.slotHeading;
  document.getElementById("presenter").innerHTML = appModel.presenter;
  document.getElementById("startButton").removeAttribute("disabled");
  document.getElementById(
    "basicUsage").setAttribute("style", "color:#fff !important;text-align:center;");
  document.getElementById(
    "basicUsage"
  ).innerHTML = "00:00:00";
  if (arg.index > 0) {
    startTimer();
  }
});

var config = {
  countdown: true,
  precision: 'seconds',
  startValues: { seconds: 0 }
  //target: { seconds: 0 }
};

function reverseTimer() {
  restetLabels();
  ipcRenderer.send('slot-timer-reverse', 'timer-reversed');
}

function skipTimer() {
  restetLabels();
  ipcRenderer.send('slot-timer-skip', 'timer-skipped');
}

function restetLabels() {
  document.getElementById(
    "progressBar").setAttribute("style", "width:" + '0' + '%');
  timerInstance.stop();
  document.getElementById("basicUsage").innerHTML = "00:00:00";
}

function startTimer() {
  document.getElementById("startButton").setAttribute("disabled", "disabled");
  config.startValues.seconds = appModel.slotTime * 60;
  timerInstance.start(config);
  ipcRenderer.send('slot-timer-start', 'started');
}

function pauseTimer() {
  if (!timerInstance.isRunning() && !timerInstance.isPaused()) {
    return;
  }
  let pauseButton = document.getElementById("pauseButton");
  pauseButton.innerText = pauseButton.innerText == "pause_circle_outline" ? "play_circle_outline" : "pause_circle_outline";

  if (timerInstance.isRunning()) {
    timerInstance.pause();
    ipcRenderer.send('slot-timer-pause', 'paused');
  } else {
    timerInstance.start();
    ipcRenderer.send('slot-timer-resume', 'resumed');
  }
}

function stopTimer() {
  document.getElementById(
    "progressBar").setAttribute("style", "width:" + '0' + '%');
  timerInstance.stop();
  document.getElementById("basicUsage").innerHTML = "00:00:00";
  document.getElementById("pauseButton").innerText = "pause_circle_outline";
  ipcRenderer.send('slot-timer-stop', 'stop');
}

timerInstance.addEventListener("secondsUpdated", function (e) {
  var percentage = getFinishPercentage();

  document.getElementById(
    "basicUsage"
  ).innerHTML = timerInstance.getTimeValues().toString();

  document.getElementById(
    "progressBar").setAttribute("style", "width:" + (100 - percentage) + '%');

  if (percentage <= Number(warningConfig.warningTime1) && percentage >= Number(warningConfig.warningTime2)) {
    document.getElementById(
      "basicUsage").setAttribute("style", "color: #" + warningConfig.warningColor1 + "!important;text-align:center");
    if (!playWarningSound && playNotification) {
      playWarningSound = true;
      document.getElementById("sound").play();
    }
  }

  if (percentage < (warningConfig.warningTime2)) {
    document.getElementById(
      "basicUsage").setAttribute("style", "color: #" + warningConfig.warningColor2 + "!important;text-align:center");
    if (!playSound && playNotification) {
      playSound = true;
      document.getElementById("sound").play();
    }
  }

  if (percentage <= 0) {
    var progressData = appModel;
    progressData['completedSeconds'] = timerInstance.getTotalTimeValues().seconds;
    ipcRenderer.send('slot-timer-finished', 'finished');
  }

});

//calculate the percentage
function getFinishPercentage() {
  return Math.round(timerInstance.getTotalTimeValues().seconds / (appModel.slotTime * 60) * 100);
}

// F12 to pause timer
document.onkeydown = function (e) {
  switch (e.keyCode) {
    case 117:
      startTimer();
      break;
    case 118:
      pauseTimer();
      break;
    case 119:
      stopTimer();
      break;
  }
};

var timerApp = new Vue({
  el: '#timerApp',
  data: {
    appModel: appModel
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".collapsible");
  var instances = M.Collapsible.init(elems);
});

document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".dropdown-trigger");
  var instances = M.Dropdown.init(elems);
});

