'use strict'
const MINE = '💣'
const FLAG = '🚩'
const EMPTYCELL = ' '
const RESTART = '😊'
const LOSE = '😖'

var easy = 4
var medium = 8
var hard = 12
var gBoard = []
var gLevel = {}
var gStopWatchInterval;
var gTimeElapsed;
var gEmptyCells;
var gCounterMine

var gGame = {}

var elCounterMine = document.querySelector ('.countMinesLeft')

function init(size) {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0  //לא השתמשתי
    }
    clearInterval(gStopWatchInterval);
    switch (size) {
        case easy:
            gLevel = {
                SIZE: 4,
                MINES: 2
            }
            break;
        case medium:
            gLevel = {
                SIZE: 8,
                MINES: 12
            }
            break;
        case hard:
            gLevel = {
                SIZE: 12,
                MINES: 30
            }
            break;
    }
    gBoard = buildBoard(gLevel.SIZE)
    setRandomMines(gLevel.MINES)
    renderBoard(gBoard)
    setMinesNegsCount(gBoard)
    renderTime(0);
    var elMsg = document.querySelector('.msg') //אחראי לתגובת הפסד
    elMsg.innerHTML = `<h3></h3>`
    gCounterMine=gLevel.MINES
    elCounterMine.innerText='Mines left : '+gCounterMine
    
}

function restart(elRestarter) {
    if (gGame.isOn) {
        killGame(gBoard);
    }
    else {
        init();
        elRestarter.innerText = RESTART;
    }
}

function stopWatch() {
    var milSecElapsed = 0;
    gStopWatchInterval = setInterval(function () {
        milSecElapsed += 5;
        renderTime(milSecElapsed);
    }, 5);
}


function checkGameOver() { //בודקת אם הסכום חשופים וסכום דגלים שווה לגודל הלוח

    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        gGame.isOn = false
        var elMsg = document.querySelector('.msg')
        elMsg.innerHTML = `<h3>You Won!</h3>` //אחראי לתגובת ניצחון
        clearInterval(gStopWatchInterval);
    }

}
function killGame(board) {// אם לחצתי על מוקש הפונקציה תחשוף את כל המוקשים על הלוח ותסיים את המשחק
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            if (cell.isMine) {
                var currPos = { i: i, j: j }
                renderCell(currPos, MINE)
            }
        }
    }
    var elMsg = document.querySelector('.msg') //אחראי לתגובת הפסד
    elMsg.innerHTML = `<h3>You Lose</h3>`
    clearInterval(gStopWatchInterval);
    var elRestarter = document.querySelector('.restart')
    elRestarter.innerText = LOSE;
    gGame.isOn=false
    
}

function buildBoard(size = 4) { // יוצרת לוח וכל תא הוא אובייקט
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }

    }
    return board
}

function setRandomMines(mineNums = 2) {
    gEmptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gEmptyCells.push({ i, j })
        }
    }

    for (var j = 0; j < mineNums; j++) {
        var randomCell = getRandomIntInclusive(0, gEmptyCells.length - 1)
        var mine = gEmptyCells[randomCell]
        gBoard[mine.i][mine.j].isMine = true
        gEmptyCells.splice(randomCell, 1)
    }

}

function setMinesNegsCount(board) {//מקבלת כמות שחכנים מתוך הפונקציה וכותבת את המספר במשבצת רצ על כל הלוח
    for (var i = 0; i < board.length; i++) {
        var row = board[i]
        for (var j = 0; j < row.length; j++) {
            var cellPos = { i: i, j: j }
            var mineCounter = countNegsAroundCell(board, cellPos)
            gBoard[i][j].minesAroundCount = mineCounter
        }
    }
    return board;
}

function countNegsAroundCell(board, pos) { //בודקת כמה מוקשים יש מסביב לתא הספציפי
    var counter = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var cell = gBoard[i][j].isMine
            if (cell) counter++
        }
    }
    return counter;
}


function renderBoard(board) { //מרנדת לוח
    var htmlStr = '';
    for (var i = 0; i < board.length; i++) {
        htmlStr += '<tr>';
        var row = board[i];
        for (var j = 0; j < row.length; j++) {
            var posStr = i + '-' + j
            htmlStr += '<td onclick="cellClicked(this)" oncontextmenu="cellMarked(this)" data-pos="' + posStr + '"></td>'
        }
        htmlStr += '</tr>';
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = htmlStr
    window.addEventListener("contextmenu", function (e) { e.preventDefault(); })
}

function renderCell(pos, value) {
    var posStr = pos.i + '-' + pos.j;
    var elTd = document.querySelector('[data-pos="' + posStr + '"]');
    elTd.innerText = value;
    elTd.style.backgroundColor = 'rgb(255, 207, 255)'
}

function cellClicked(elTd) { //בלחיצת מקש שמאלי
    if (gGame.isOn === false) {

        if (gGame.shownCount === 0) {
            gGame.isOn = true
            stopWatch();
        } else return;

    }

    var pos = getPosFromElTd(elTd)
    var cell = gBoard[pos.i][pos.j];

    if (cell.isMarked === true) return;

    if (!cell.isShown) { //אם מוקש מפעילת את פונקציה קיל גיים

        if (cell.isMine) {
            var cellType = MINE
            killGame(gBoard)

        }
        else if (cell.minesAroundCount !== 0) { // אם לא אפס רק פותחת אותו ספציפי
            cellType = cell.minesAroundCount
            gGame.shownCount++
        } else if (cell.minesAroundCount === 0) {//אם 0 פותחת את כל השכנים
            expendShown(gBoard, pos)
            cellType = EMPTYCELL

        }
        cell.isShown = true
        elTd.innerText = cellType
        elTd.style.backgroundColor = 'rgb(255, 207, 255)'

    }
    //DOM
    checkGameOver()
}


function cellMarked(elCell) { //סימון תא בדגל
    
    if (gGame.isOn === false) {
        gGame.isOn = true
        stopWatch();
    }
    var pos = getPosFromElTd(elCell)
    var cell = gBoard[pos.i][pos.j];

    if (cell.isShown === false) {// רק בתנאי שהוא לא גלוי אפשר לסמן כדגל
        if (cell.isMarked === true) {
            gGame.markedCount--
            elCell.innerText = EMPTYCELL
            cell.isMarked = false
            gCounterMine++
            elCounterMine.innerText ='Mines left : '+gCounterMine

        } else {
            gGame.markedCount++
            elCell.innerText = FLAG
            cell.isMarked = true
            gCounterMine--
            elCounterMine.innerText = 'Mines left : '+ gCounterMine
        }
    }
    checkGameOver() //אחרי כל סימון כזה בודקת אם יש ניצחון במשחק

}

function getPosFromElTd(elTd) {
    var dataSet = elTd.dataset;
    var posStr = dataSet.pos;
    var splitted = posStr.split('-');
    var pos = { i: +splitted[0], j: +splitted[1] };
    return pos;
}

function expendShown(board, pos) { //פתיחה של 0 מאפשר לבדוק אם פתחתי עוד אפס ולפתוח גם אותו
    var counter = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var currPos = { i: i, j: j }
            var cellContent = board[i][j].minesAroundCount
            if (cellContent === 0) {
                renderCell(currPos, EMPTYCELL)
            } else renderCell(currPos, cellContent)
            if (!board[i][j].isShown) {
                counter++
                board[i][j].isShown = !board[i][j].isShown
                if (board[i][j].minesAroundCount === 0) {
                    expendShown(board, { i: i, j: j })
                    //רקורסיה זו אהבה!
                }
            }
        }
    }
    gGame.shownCount += counter
}

function renderTime(time) {
    var elTimer = document.querySelector('.timer');
    gTimeElapsed = new Date(time).toISOString().slice(14, -5);
    elTimer.innerText = 'Time: ' + gTimeElapsed;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
}
