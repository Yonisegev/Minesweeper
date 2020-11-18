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



function initDifficulty(size = 4) {
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

function init() {
    resetData();
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function resetData() { // Clear all global data and intervals
    var elSmiley = document.querySelector('.smiley-face p');
    var elHintCount = document.querySelector('.hint-counter')
    elSmiley.innerText = '😃';
    elHintCount.innerText = gHintCount;
    gIsFirstClick = true;
    gClickCount = 0;
    gIsGameOn = true;
    gLives = 3;
    gHintCount = 3;
    gIsHintMode = false;
    if (started) clearInterval(started);
    reset(); // reset stopwatch

}

function resetGame() {
    resetData()
    initDifficulty(gLevel.SIZE);
}

function livesCounter(elCell, i, j) {
    // add html lives
    // add css lives
    if (gBoard[i][j].isMine) {
        var elLivesCounter = document.querySelector('.lives-counter')
        if (!gLives) return;
        gLives--;
        elLivesCounter.innerText = gLives;
        console.log(`SAVED. ${gLives} left`);
    }
}

function hintModeOn() {
    if (gHintCount <= 0) return
    var elBulb = document.querySelector('.hint-mode img');
    gIsHintMode = true;
    elBulb.src = './misc/bulb-on.png'

}

function showCell(elCell, i, j) { // hint mode
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
            currCell.innerText = ' ';
            elBulb.src = './misc/bulb-off.png'
            gIsHintMode = false;
        }
    }, 1000)


    // add css
    gHintCount--;
    elHintCount.innerText = gHintCount;
}


function revealCell(elCell, i, j) {
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
        renderMines(gBoard, currCell);
        setMinesNegsCount();
        startTimer()
        renderBoard(gBoard);

    }
    gIsFirstClick = false;

    // Handling hint mode
    if (gIsHintMode) {
        showCell(elCell, i, j);
    }
    if (gIsHintMode) return;


    livesCounter(elCell, i, j);
    if (!gIsGameOn) return;

    // Handling tiles
    if (!gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
        revealCell(elCell, i, j)
        console.log('clicked');
    }

    // Handling mines
    if (gBoard[i][j].isMine && gLives === 0) {
        checkGameOver(elCell);
    }
    // Expanding negs
    if (!gBoard[i][j].minesAroundCount && !gBoard[i][j].isMine && !gIsHintMode) {
        expandNegs({ i: i, j: j });
    }



    gameWon();




    var pos = { i, j };
    console.log(pos);

}


function cellMark(elCell, i, j) {
    window.addEventListener('contextmenu', function (elCell) { // Prevents context menu from showing
        elCell.preventDefault();
    }, false);

    if (gIsFirstClick) {
        startTimer();
    }
    gIsFirstClick = false;
    if (!gIsGameOn) return;
    if (gIsHintMode) return;
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        elCell.classList.add('marked');
        elCell.innerText = FLAG;
        gBoard[i][j].isMarked = true;
    } else if (gBoard[i][j].isMarked) {
        elCell.classList.remove('marked')
        elCell.innerText = ' ';
        gBoard[i][j].isMarked = false;
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
    currCell.style.backgroundColor = 'red';
    var elMines = document.querySelectorAll('.mine')
    for (var i = 0; i < elMines.length; i++) {

        elMines[i].innerText = MINE;
    }
    stop();
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
    console.log('win');
    stop();
    gIsGameOn = false;
    smileyStatus('Sunglasses');
}

function expandNegs(pos) {
    console.log('This cell has no negs');
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