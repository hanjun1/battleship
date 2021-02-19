/*-- CONSTANTS --*/

const BOARD_LEN = 10;

/*-- APP'S STATE (VARIABLES) --*/

// represent "" as empty spaces; represent "S" as ships; represent "X" as bomb locations
let playerBoard = [];
let computerBoard = [];

/*-- CAHCED ELEMENT REFERENCES --*/

let computerBoardEle = document.getElementById('computer-board');
let playerBoardEle = document.getElementById('player-board');

/*-- EVENT LISTENERS --*/



/*-- FUNCTIONS --*/

function init() {
    initBoardState(playerBoard);
    initBoardState(computerBoard);
    initBoardEle(computerBoardEle);
    initBoardEle(playerBoardEle);
}

function initBoardState(board) {
    for (let i=0; i<BOARD_LEN; i++) {
        let row = [];
        for (let j=0; j<BOARD_LEN; j++) {
            row.push("");
        }
        board.push(row);
    }
}

function initBoardEle(boardEle) {
    for (let i=0; i<BOARD_LEN*BOARD_LEN; i++) {
        let divEl = document.createElement("div");
        divEl.setAttribute('class', 'square');
        // maybe think about adding a function for add coordinates as IDs
        boardEle.appendChild(divEl);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function createShips(len, board) {
    let isHorizontal = getRandomInt(2) == 0 ? true : false;

    if (!isHorizontal) {
        let row = getRandomInt(10-len);
        let column = getRandomInt(10);
        
        for (let i=row; i<row+len; i++) {
            if (board[i][column] !== "") return createShips(len, board);
        }

        for (let i=row; i<row+len; i++) {
            board[i][column] = "S";
        }
    } else {
        let row = getRandomInt(10);
        let column = getRandomInt(10-len);
        
        for (let i=column; i<column+len; i++) {
            if (board[row][i] !== "") return createShips(len, board);
        }

        for (let i=column; i<column+len; i++) {
            board[row][i] = "S";
        }
    }
}

init();

console.log(playerBoard);