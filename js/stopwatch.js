'use strict';

var timeBegan = null
    , timeStopped = null
    , stoppedDuration = 0
    , started = null;

function start() {

    if (timeBegan === null) {
        timeBegan = new Date();
    } else {
        clearInterval(started);
    };

    if (timeStopped !== null) {
        stoppedDuration += (new Date() - timeStopped);
    };

    if (stoppedDuration < 1000) {
        console.log(stoppedDuration + ' ms');
    };

    if (stoppedDuration > 1000) {
        console.log(stoppedDuration / 1000 + ' seconds');
    };

    started = setInterval(clockRunning, 10);

    return stoppedDuration
}

function stop() {
    timeStopped = new Date();
    clearInterval(started);
}

function reset() {
    clearInterval(started);
    stoppedDuration = 0;
    timeBegan = null;
    timeStopped = null;
    document.getElementById("display-area").innerHTML = "00:00";
}

function clockRunning() {
    var currentTime = new Date()
        , timeElapsed = new Date(currentTime - timeBegan - stoppedDuration)
        , min = timeElapsed.getUTCMinutes()
        , sec = timeElapsed.getUTCSeconds()
        , ms = timeElapsed.getUTCMilliseconds();

    document.getElementById("display-area").innerHTML =
        (min > 9 ? min : "0" + min) + ":" +
        (sec > 9 ? sec : "0" + sec)
};

function startTimer() {
    var elTimer = document.querySelector('.stopwatch');
    elTimer.style.visibility = 'visible';
    start();
}