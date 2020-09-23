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


function checkGameOver() {

    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        gGame.isOn = false
        var elMsg = document.querySelector('.msg')
        elMsg.innerHTML = `<h3>You Won!</h3>` //אחראי לתגובת ניצחון
    }

}
function killGame(board) {
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

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCaount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }

    }
    // board[2][1] = board[1][3] = MINE
    board[2][1].isMine = true
    board[1][3].isMine = true

    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        var row = board[i]
        for (var j = 0; j < row.length; j++) {
            var cellPos = { i: i, j: j }
            var mineCounter = countNegsAroundCell(board, cellPos)
            gBoard[i][j].minesAroundCaount = mineCounter
        }
    }
    return board;
}

function countNegsAroundCell(board, pos) {
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


function renderBoard(board) {
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

}

function cellClicked(elTd) {

    if (gGame.isOn === false) return;
    var pos = getPosFromElTd(elTd)
    var cell = gBoard[pos.i][pos.j];

    if (!cell.isShown) {
        cell.isShown = true
        if (cell.isMine) {
            var cellType = MINE
            killGame(gBoard)

        }
        else if (cell.minesAroundCaount !== 0) {
            cellType = cell.minesAroundCaount
            gGame.shownCount++
        } else if (cell.minesAroundCaount === 0) {
            cellType 
            
        }

    } else return;

    elTd.innerText = cellType
    checkGameOver()
}


function cellMarked(elCell) {
    if (gGame.isOn === false) return;

    var pos = getPosFromElTd(elCell)
    var cell = gBoard[pos.i][pos.j];

    if (!cell.isShown) {
        elCell.innerText = FLAG
        cell.isMarked = true
        gGame.markedCount++
    }
    checkGameOver()

}


function getPosFromElTd(elTd) {
    var dataSet = elTd.dataset;
    var posStr = dataSet.pos;
    var splitted = posStr.split('-');
    var pos = { i: +splitted[0], j: +splitted[1] };
    return pos;
}

function expendShown(board, pos) {
   

}
//  var cell = board[i][j]
// if (cell.isMine) {
//     var currPos = { i: i, j: j }
//     renderCell(currPos, MINE)
// }
