/*-- CONSTANTS --*/

const BOARD_LEN = 10;
const TOTAL_SHIPS = 17;

/*-- APP'S STATE (VARIABLES) --*/

// LEGEND : 
//  H - Horizontal, V - Vertical, A,B,C,D - Ships, X - Hit, O - Miss
let playerBoard = [];
let computerBoard = [];
let gameOn = true;
let playerHitCount = 0;
let computerHitCount = 0;
let aiMoves = [];
let playerTurn = true;


/*-- CAHCED ELEMENT REFERENCES --*/

let computerBoardEle = document.getElementById('computer-board');
let playerBoardEle = document.getElementById('player-board');
let lockButton = document.getElementById('lock');


/*-- EVENT LISTENERS --*/

// need to add play again button
lockButton.addEventListener('click', lockAllShips);

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
    createShips(3, board, "C1");
    createShips(3, board, "C2");
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
    playerLastCoord = idToCoord(e.target.id);
    let row = playerLastCoord[0];
    let col = playerLastCoord[1];
    if (computerBoard[row][col] === "X") return;
    if (computerBoard[row][col] === "") {
        e.target.classList.add("miss");
        computerBoard[row][col] = "O";
        computerBoardEle.classList.add('noClick');
        computerAi(aiMoves);
    } else {
        e.target.classList.add("hit");
        computerBoard[row][col] = "X";
        playerHitCount++;
        if (checkWin(playerHitCount)) {
            computerBoardEle.classList.add('noClick');
        }
    }
}

function render() {
    let playerSquares = document.querySelectorAll('#player-board > .square');
    // let computerSquares = document.querySelectorAll('#computer-board > .square');
    renderBoard(playerBoard, playerSquares);
    // renderBoard(computerBoard, computerSquares);
}

// fix render board
function renderBoard(board, squares) {
    let row = 0;
    let col = 0;
    squares.forEach((square) => {
        let pos = board[row][col];
        if (pos !== "" && pos !== "A" && pos !== "B" && pos !== "C" && pos !== "D" && pos !== "X" && pos !== "O") {
            let divEl = document.createElement("div");
            divEl.setAttribute('id', pos+','+row+','+col);
            divEl.setAttribute('class', pos);
            divEl.classList.add('ship');
            divEl.setAttribute('draggable', 'true');
            square.appendChild(divEl);
        }
        col++;
        if (col > 9) {
            col = 0;
            row++;
        }
    });
}

function checkWin(count) {
    if (count >= TOTAL_SHIPS) return true;
    return false;
}


function numToCoord(num) {
    let row = Math.floor(num / 10);
    let col = num % 10;
    return [row, col];
}

function generateAiMoves(arr) {
    for (let i=0; i<100; i++) {
        arr.push(i);
    }
    let m = arr.length, t, i;
    // fisher-yates shuffle
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
    }
}

function computerAi(arr) {
    let coord = numToCoord(arr.pop());
    let row = coord[0];
    let col = coord[1];
    if (playerBoard[row][col] !== "") {
        playerBoard[row][col] = "X";
        computerHitCount++;
        if (checkWin(computerHitCount)) {
            computerBoardEle.classList.add('noClick');
        } else {
            computerAi(arr);
        }
    } else {
        playerBoard[row][col] = "O";
        computerBoardEle.classList.remove('noClick');
        console.log(playerBoard);
    }
}

// drag functions

function shipIdToCoord(id) {
    return id.split(',');
}

function addDropableLocations(id) {
    let coord = shipIdToCoord(id);
    let max;
    let playerSquares = document.querySelectorAll('#player-board > .square');
    switch (coord[0]) {
        case 'HA':
        case 'VA':
            max = BOARD_LEN - 5;
            break;
        case 'HB':
        case 'VB':
            max = BOARD_LEN - 4;
            break;
        case 'HC1':
        case 'HC2':
        case 'VC1':
        case 'VC2':
            max = BOARD_LEN - 3;
            break;
        case 'HD':
        case 'VD':
            max = BOARD_LEN - 2;
            break;
    }

    switch (coord[0]) {
        case 'HA':
        case 'HB':
        case 'HC1':
        case 'HC2':
        case 'HD':
            for (let i=0; i<BOARD_LEN; i++) {
                for (let j=0; j<BOARD_LEN; j++) {
                    if (playerBoard[i][j] !== "") {
                        count = 1;
                        while (count < BOARD_LEN-max) {
                            if (j - count < 0) break;
                            if (playerBoard[i][j-count] === "") {
                                playerBoard[i][j-count] = "T";
                            }
                            count++;
                        }
                    }
                }
            }
            playerSquares.forEach((square) => {
                let squareCoord = idToCoord(square.id);
                if (squareCoord[1] <= max) {
                    square.setAttribute('ondrop', 'drop_handler(event)');
                    square.setAttribute('ondragover', 'dragover_handler(event)');
                }
                // add condition so that it can be dropped on itself
                if (playerBoard[squareCoord[0]][squareCoord[1]] !== "") {
                    square.removeAttribute('ondrop');
                    square.removeAttribute('ondragover');
                };
            });
            break;
        case 'VA':
        case 'VB':
        case 'VC1':
        case 'VC2':
        case 'VD':
            for (let i=0; i<BOARD_LEN; i++) {
                for (let j=0; j<BOARD_LEN; j++) {
                    if (playerBoard[i][j] !== "") {
                        count = 1;
                        while (count < BOARD_LEN-max) {
                            if (i - count < 0) break;
                            if (playerBoard[i-count][j] === "") {
                                playerBoard[i-count][j] = "T";
                            }
                            count++;
                        }
                    }
                }
            }
            playerSquares.forEach((square) => {
                let squareCoord = idToCoord(square.id);
                if (squareCoord[0] <= max) {
                    square.setAttribute('ondrop', 'drop_handler(event)');
                    square.setAttribute('ondragover', 'dragover_handler(event)');
                }
                // add condition so that it can be dropped on itself
                if (playerBoard[squareCoord[0]][squareCoord[1]] !== "") {
                    square.removeAttribute('ondrop');
                    square.removeAttribute('ondragover');
                };
            });
            break;
    }
    for (let i=0; i<BOARD_LEN; i++) {
        for (let j=0; j<BOARD_LEN; j++) {
            if (playerBoard[i][j] === "T") {
                playerBoard[i][j] = "";             
            }
        }
    }
}

function removeDropableLocations() {
    let playerSquares = document.querySelectorAll('#player-board > .square');
    playerSquares.forEach((square) => {
        square.removeAttribute('ondrop');
        square.removeAttribute('ondragover');
    });
}

function drag_start_handler(ev) {
    // add function to show draggable locations
    addDropableLocations(ev.target.id);
    ev.dataTransfer.setData('text/plain', ev.target.id);
}

function drag_end_handler(ev) {
    // add function to show draggable locations
    removeDropableLocations();
}

window.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.ship');
    elements.forEach((element) => {
        element.addEventListener('dragstart', drag_start_handler);
        element.addEventListener('dragend', drag_end_handler);
    });
})

function dragover_handler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}

function drop_handler(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text/plain');
    ev.target.appendChild(document.getElementById(data));
    removeDropableLocations();
}

// end

function lockAllShips() {
    let ships = document.querySelectorAll('.ship');
    ships.forEach((ship) => {
        ship.removeAttribute('draggable');
    });
    generateAiMoves(aiMoves);
    computerBoardEle.addEventListener('click', dropBomb);
}
// game start 

function gameStart() {
    init();
}

gameStart();


// console.log(playerBoard);
// console.log(computerBoard);