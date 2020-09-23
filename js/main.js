'use strict'
const MINE = '💣'
const FLAG = '🚩'


var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard = buildBoard(gLevel.SIZE)
console.table(setMinesNegsCount(gBoard))
renderBoard(gBoard)


function checkGameOver() { //בודקת אם הסכום חשופים וסכום דגלים שווה לגודל הלוח

    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        gGame.isOn = false
        var elMsg = document.querySelector('.msg')
        elMsg.innerHTML = `<h3>You Won!</h3>` //אחראי לתגובת ניצחון
    }

}
function killGame(board) {// אם לחצתי על מוקש הפונקציה תחשוף את כל המוקשים על הלוח ותסיים את המשחק
    gGame.isOn = false
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


}

function buildBoard(size) { // יוצרת לוח וכל תא הוא אובייקט
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
    board[2][1].isMine = true
    board[1][3].isMine = true

    return board
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

    if (gGame.isOn === false) return;
    var pos = getPosFromElTd(elTd)
    var cell = gBoard[pos.i][pos.j];

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
            cellType = 0

        }
        cell.isShown = true

    } else return;
    //DOM
    elTd.innerText = cellType
    elTd.style.backgroundColor = 'rgb(255, 207, 255)'
    checkGameOver()
}


function cellMarked(elCell) { //סימון תא בדגל
    if (gGame.isOn === false) return; //אם כבר מסומן אז לא לאפשר לחיצה

    var pos = getPosFromElTd(elCell)
    var cell = gBoard[pos.i][pos.j];

    if (!cell.isShown) {// רק בתנאי שהוא לא גלוי אפשר לסמן כדגל
        elCell.innerText = FLAG
        cell.isMarked = true
        gGame.markedCount++
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
            renderCell(currPos, cellContent)
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
