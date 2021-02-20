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

computerBoardEle.addEventListener('click', dropBomb);

/*-- FUNCTIONS --*/

function init() {
    initBoard(playerBoard, playerBoardEle);
    initBoard(computerBoard, computerBoardEle);
    render();
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
    let row = 0;
    let col = 0;
    for (let i=0; i<BOARD_LEN*BOARD_LEN; i++) {
        let divEl = document.createElement("div");
        divEl.setAttribute('class', 'square');
        divEl.setAttribute('id', `${row},${col}`);
        // // drop zone attributes
        // divEl.setAttribute('ondrop', 'drop_handler(event)');
        // divEl.setAttribute('ondragover', 'dragover_handler(event)');
        // maybe think about adding a function for add coordinates as IDs
        boardEle.appendChild(divEl);
        col++;
        if (col > 9) {
            col = 0;
            row++;
        }
    }
}

function initBoard(board, boardEl) {
    initBoardState(board);
    initBoardEle(boardEl);
    createShips(5, board, "A");
    createShips(4, board, "B");
    createShips(3, board, "C");
    createShips(3, board, "C");
    createShips(2, board, "D");
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function createShips(len, board, id) {
    let isHorizontal = getRandomInt(2) == 0 ? true : false;

    if (!isHorizontal) {
        let row = getRandomInt(10-len);
        let column = getRandomInt(10);
        
        for (let i=row; i<row+len; i++) {
            if (board[i][column] !== "") return createShips(len, board, id);
        }

        board[row][column] = "V" + id;

        for (let i=row+1; i<row+len; i++) {
            board[i][column] = id;
        }
    } else {
        let row = getRandomInt(10);
        let column = getRandomInt(10-len);
        
        for (let i=column; i<column+len; i++) {
            if (board[row][i] !== "") return createShips(len, board, id);
        }

        board[row][column] = "H" + id;

        for (let i=column+1; i<column+len; i++) {
            board[row][i] = id;
        }
    }
}

function idToCoord(str) {
    return str.split(',');
}

function dropBomb(e) {
    if (!e.target.classList.contains("square") && !e.target.classList.contains("ship")) return;
    let coord = idToCoord(e.target.id);
    if (computerBoard[coord[0]][coord[1]] === "X") return;
    if (computerBoard[coord[0]][coord[1]] === "") {
        e.target.classList.add("miss");
        computerBoard[coord[0]][coord[1]] = "X";
    } else {
        e.target.classList.add("hit");
        computerBoard[coord[0]][coord[1]] = "X";
    }
}

function render() {
    let playerSquares = document.querySelectorAll('#player-board > .square');
    // let computerSquares = document.querySelectorAll('#computer-board > .square');
    renderBoard(playerBoard, playerSquares);
    // renderBoard(computerBoard, computerSquares);
}

function renderBoard(board, squares) {
    let row = 0;
    let col = 0;
    squares.forEach((square) => {
        let pos = board[row][col];
        if (pos !== "" || pos !== "A" || pos !== "B" || pos !== "C" || pos !== "D") {
            let divEl = document.createElement("div");
            divEl.setAttribute('class', pos);
            divEl.classList.add('ship');
            square.appendChild(divEl);
        }
        col++;
        if (col > 9) {
            col = 0;
            row++;
        }
    });
}

// drag functions

// function drag_start_handler(ev) {
//     ev.dataTransfer.setData('text/plain', ev.target.id);
// }

// window.addEventListener('DOMContentLoaded', () => {
//     const element = document.getElementById('square');
//     element.addEventListener('dragstart', drag_start_handler);
// })

// function dragover_handler(ev) {
//     ev.preventDefault();
//     ev.dataTransfer.dropEffect = "move";
// }

// function drop_handler(ev) {
//     ev.preventDefault();
//     const data = ev.dataTransfer.getData('text/plain');
//     ev.target.appendChild(document.getElementById(data));
// }
// game start 

init();

console.log(playerBoard);
console.log(computerBoard);