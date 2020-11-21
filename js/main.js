'use strict';
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var MINE = '💣';
var FLAG = '🚩';
var gBoard;
var gIsFirstClick = true;
var gClickCount = 0;
var gIsGameOn = true;
var gLives = 3;
var gIsHintMode = false;
var gHintCount = 3;
var gHintNegs = [];
var gBestScoreEasy = localStorage.easy;
var gBestScoreMed = localStorage.medium;
var gBestScoreHard = localStorage.hard;
var gSafeClickCount = 3;
var gIsSafeOn = false;
var gIsSoundOn = true;


function initDifficulty(size = 4) { // A function used with resetData() to reset the game to the same level the user was on after finishing one game.

    resetData()
    if (size === 4) {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
    }

    if (size === 8) {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
    }

    if (size === 12) {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
    }

    init();
}

function init() { // called on page load
    resetData();
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function resetData() { // Clear all global data and intervals
    if (gBestScoreEasy) document.querySelector('.easy').innerText = gBestScoreEasy;
    if (gBestScoreMed) document.querySelector('.medium').innerText = gBestScoreMed;
    if (gBestScoreHard) document.querySelector('.extreme').innerText = gBestScoreHard;
    var elSmiley = document.querySelector('.smiley-face p');
    var elHintCount = document.querySelector('.hint-counter')
    var elLivesCounter = document.querySelector('.lives-counter')
    var elSafeCount = document.querySelector('.safe-counter');
    elSmiley.innerText = '😃';
    elHintCount.innerText = gHintCount;
    elLivesCounter.innerText = gLives;
    elSafeCount.innerText = gSafeClickCount;
    gIsFirstClick = true;
    gClickCount = 0;
    gIsGameOn = true;
    gLives = 3;
    gHintCount = 3;
    gIsHintMode = false;
    gSafeClickCount = 3;
    if (started) clearInterval(started);
    reset(); // reset stopwatch

}

function resetGame() {
    resetData()
    initDifficulty(gLevel.SIZE);
}

function livesCounter(i, j) {
    if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
        var elLivesCounter = document.querySelector('.lives-counter')
        if (!gLives) return;
        var mineHitSound = new Audio('./misc/minehit.mp3')
        if (gIsSoundOn) mineHitSound.play();
        gLives--;
        elLivesCounter.innerText = gLives;
        console.log(`SAVED. ${gLives} left`);
    }
}

function hintModeOn() { // Change bulb photo when activating hint mode
    if (gHintCount <= 0) return
    var elBulb = document.querySelector('.hint-mode img');
    gIsHintMode = true;
    elBulb.src = './misc/bulb-on.png'

}

function showCell(elCell, i, j) { // hint mode, will dissappear after 1 second
    var elHintCount = document.querySelector('.hint-counter')
    var elBulb = document.querySelector('.hint-mode img');
    hintExpandNegs({ i: i, j: j })
    elCell.innerText = gBoard[i][j].minesAroundCount;


    setTimeout(function () {
        elCell.innerText = ' ';
        for (var k = 0; k < gHintNegs.length; k++) {
            var hintI = gHintNegs[k].i;
            var hintJ = gHintNegs[k].j;
            var currCell = document.querySelector(`.cell-${hintI}-${hintJ}`)
            if (currCell.innerText === FLAG) continue // if a cell is marked with a flag, don't change its text to an empty string
            currCell.innerText = ' ';
            elBulb.src = './misc/bulb-off.png'
            gIsHintMode = false;
        }
    }, 1000)
    gHintCount--;
    elHintCount.innerText = gHintCount;
}


function revealCell(elCell, i, j) { // Reveal the cell and its content
    elCell.innerText = gBoard[i][j].minesAroundCount;
    if (!gIsHintMode) {
        elCell.classList.add('clicked');

    }
    gBoard[i][j].isShown = true;
}


function cellClick(elCell, i, j) {
    var currCell = { i, j };
    gClickCount++
    if (gIsFirstClick) {
        gIsGameOn = true;
        renderMines(gBoard, currCell); // Put mines at random locations
        setMinesNegsCount();
        startTimer()
        renderMinesToBoard(); // Render the mine cells instead of the whole board


    }
    gIsFirstClick = false;

    // Handling hint mode
    if (gIsHintMode) {
        showCell(elCell, i, j);
    }
    if (gIsHintMode) return;


    livesCounter(i, j);
    if (!gIsGameOn) return;

    // Handling tiles
    if (!gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
        revealCell(elCell, i, j)
        console.log('clicked');
    }

    // Handling mines
    if (!gIsHintMode && !gBoard[i][j].isMarked && gLives === 0 && gBoard[i][j].isMine) {
        checkGameOver(elCell);
    }
    // Expanding negs
    if (!gBoard[i][j].minesAroundCount && !gBoard[i][j].isMine && !gIsHintMode) {

        expandNegs({ i: i, j: j });
    }


    // Check if the user won every click
    gameWon();


}


function cellMark(elCell, i, j) { // Handle flags
    window.addEventListener('contextmenu', function (elCell) { // Prevents context menu from showing
        elCell.preventDefault();
    }, false);

    if (gIsFirstClick) return
    if (!gIsGameOn) return;
    if (gIsHintMode) return;
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        elCell.classList.add('marked');
        elCell.innerText = FLAG;
        var flagSound = new Audio('./misc/flagsound.mp3');
        if (gIsSoundOn) flagSound.play();
        gBoard[i][j].isMarked = true;
    } else if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        var pullFlag = new Audio('./misc/pullflag.mp3');
        if (gIsSoundOn) pullFlag.play();
        elCell.classList.remove('marked')
        elCell.innerText = ' ';
    }
    gameWon();
}



function renderMines(board, currCell) {
    var minesAmount = gLevel.MINES;
    for (var i = 0; i < minesAmount; i++) {
        var randRow = getRandomInteger(0, gLevel.SIZE);
        var randCol = getRandomInteger(0, gLevel.SIZE);
        var randPos = board[randRow][randCol];
        if (randRow === currCell.i && randCol === currCell.j) {
            // console.log('hit same spot');
            minesAmount++
            continue;
        }
        if (randPos.isMine) minesAmount++
        randPos.isMine = true;
    }
}


function checkGameOver(currCell) {
    currCell.style.backgroundImage = 'linear-gradient(135deg, #ff0000 0%, #ff0000 100%)';
    var elMines = document.querySelectorAll('.mine')
    for (var i = 0; i < elMines.length; i++) {
        elMines[i].innerText = MINE;

    }
    stop();
    var loseSound = new Audio('./misc/losesound.mp3')
    setTimeout(function () {
        if (gIsSoundOn) loseSound.play();
    }, 350)
    gIsGameOn = false;
    smileyStatus('Sad');
}

function gameWon() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine && !currCell.isMarked || !currCell.isShown && !currCell.isMine) return;

        }
    }
    var winSound = new Audio('./misc/winsound.mp3');
    if (gIsSoundOn) winSound.play();
    stop();
    bestScore();
    gIsGameOn = false;
    smileyStatus('Sunglasses');
}

function expandNegs(pos) {
    // console.log('This cell has no negs');
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var cell = gBoard[i][j];
            if (!cell.isShown) {
                cell.isShown = true;
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                elCell.classList.add('clicked');
                elCell.innerText = cell.isMine ? MINE : cell.minesAroundCount;
            }
        }
    }
}

function hintExpandNegs(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var cell = gBoard[i][j];
            if (!cell.isShown) {
                cell.isShown = false;
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                if (gBoard[i][j].isMarked) continue;
                elCell.innerText = cell.isMine ? MINE : cell.minesAroundCount;
                gHintNegs.push({ i, j })
            }
        }
    }
}

function smileyStatus(state) {
    var elSmiley = document.querySelector('.smiley-face p');
    if (state === 'Sad') {
        elSmiley.innerText = '😭';
    }

    if (state === 'Sunglasses') {
        elSmiley.innerText = '😎';
    }

}

// Best Score - Local Storage

function bestScore() {
    var currScore = document.getElementById("display-area").innerHTML
    if (!gBestScoreEasy && gLevel.SIZE === 4) gBestScoreEasy = '9999'
    if (gLevel.SIZE === 4 && currScore < gBestScoreEasy) {
        gBestScoreEasy = currScore;
        localStorage.setItem('easy', gBestScoreEasy);
        document.querySelector('.easy').innerText = localStorage.easy;
    }
    if (!gBestScoreMed && gLevel.SIZE === 8) gBestScoreMed = '9999'
    if (gLevel.SIZE === 8 && currScore < gBestScoreMed) {
        gBestScoreMed = currScore;
        localStorage.setItem('medium', gBestScoreMed);
        document.querySelector('.medium').innerText = localStorage.medium;
    }
    if (!gBestScoreHard && gLevel.SIZE === 12) gBestScoreHard = '9999'
    if (gLevel.SIZE === 12 && currScore < gBestScoreHard) {
        gBestScoreHard = currScore;
        localStorage.setItem('hard', gBestScoreHard);
        document.querySelector('.extreme', gBestScoreHard);
    }
    console.log(currScore);
    console.log('local storage:', localStorage.bestScoreEasy);
}

function resetBestScore() {
    localStorage.clear();
    gBestScoreEasy = localStorage.easy;
    gBestScoreMed = localStorage.medium;
    gBestScoreHard = localStorage.hard;
    document.querySelector('.easy').innerText = 'Play to update!';
    document.querySelector('.medium').innerText = 'Play to update!';
    document.querySelector('.extreme').innerText = 'Play to update!';
}

function safeMode() {
    if (!gSafeClickCount) return;
    if (!gIsGameOn) return
    gIsSafeOn = true;
    var safeClicks = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                safeClicks.push({ i, j });
            }
        }
    }
    shuffleArray(safeClicks);
    var safeClick = safeClicks.pop();
    var i = safeClick.i;
    var j = safeClick.j
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.innerText = 'SAFE';
    // gBoard[i][j].minesAroundCount
    elCell.style.backgroundImage = 'linear-gradient(to right, #FF0000, #FF0000)'

    setTimeout(function () {
        elCell.innerText = ' ';
        elCell.style.backgroundImage = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }, 2000)
    gSafeClickCount--
    gIsSafeOn = false;
    document.querySelector('.safe-counter').innerText = gSafeClickCount;

}


function muteUnmute() {
    var soundIcon = document.querySelector('.sound-icon')
    var soundText = document.querySelector('.sound-icon-text');
    if (gIsSoundOn) {
        soundIcon.innerText = '🔈'
        soundText.innerText = 'Unmute';
        gIsSoundOn = false;
    } else {
        soundIcon.innerText = '🔊';
        soundText.innerText = 'Mute';
        gIsSoundOn = true;
    }
}