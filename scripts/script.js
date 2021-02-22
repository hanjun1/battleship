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
let aiHitMoves = [];
let playerTurn = true;
let difficulty;


/*-- CAHCED ELEMENT REFERENCES --*/

let computerBoardEle = document.getElementById('computer-board');
let playerBoardEle = document.getElementById('player-board');
let lockButton = document.getElementById('lock');
let boardContainer = document.getElementById('board-container');
let mainPlayButton = document.getElementById('main-play');
let titlePageContainer = document.querySelector('.title-page');
let mainContainer = document.querySelector('.main-page');
let beforeLockText = document.getElementById('before-lock');
let afterLockText = document.getElementById('after-lock');
let modal = document.getElementById('play-again-modal');
let resultMessage = document.getElementById('result-message');
let radios = document.getElementsByName('difficulty');
let playerFilter = document.getElementById('player-filter');
let computerFilter = document.getElementById('computer-filter');

/*-- EVENT LISTENERS --*/

// need to add play again button
lockButton.addEventListener('click', lockAllShips);
mainPlayButton.addEventListener('click', showMain);

/*-- FUNCTIONS --*/

function showMain(e) {
    for (let i=0; i<radios.length; i++) {
        if (radios[i].checked) {
            difficulty = radios[i].value;
            break;
        }
    }
    titlePageContainer.classList.add('ghost');
    mainContainer.classList.remove('ghost');
}

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
    createRandomShips(5, board, "A");
    createRandomShips(4, board, "B");
    createRandomShips(3, board, "C1");
    createRandomShips(3, board, "C2");
    createRandomShips(2, board, "D");
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function createRandomShips(len, board, id) {
    let isHorizontal = getRandomInt(2) == 0 ? true : false;

    if (!isHorizontal) {
        let row = getRandomInt(10-len);
        let column = getRandomInt(10);
        
        for (let i=row; i<row+len; i++) {
            if (board[i][column] !== "") return createRandomShips(len, board, id);
        }

        board[row][column] = "V" + id;

        for (let i=row+1; i<row+len; i++) {
            board[i][column] = id;
        }
    } else {
        let row = getRandomInt(10);
        let column = getRandomInt(10-len);
        
        for (let i=column; i<column+len; i++) {
            if (board[row][i] !== "") return createRandomShips(len, board, id);
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
    if (computerBoard[row][col] === "X" || computerBoard[row][col] === "O") return;
    if (computerBoard[row][col] === "") {
        computerFilter.setAttribute('class', 'not-turn');
        playerFilter.classList.remove('not-turn');
        e.target.classList.add("miss");
        computerBoard[row][col] = "O";
        computerBoardEle.classList.add('noClick');
        if (difficulty === "easy") {
            setTimeout(function() {
                computerEasyAi(aiMoves);
            }, 500);
        } else if (difficulty === "hard") {
            setTimeout(function() {
                computerHardAi(aiMoves);
            }, 500);
        } else {
            console.log("Something has gone terribly wrong!");
        }
    } else {
        e.target.classList.add("hit");
        computerBoard[row][col] = "X";
        playerHitCount++;
        if (checkWin(playerHitCount)) {
            computerBoardEle.classList.add('noClick');
            resultMessage.innerHTML = "";
            resultMessage.innerHTML = "YOU WON!";
            modal.classList.remove('ghost');
        }
    }
}

function render() {
    let playerSquares = document.querySelectorAll('#player-board > .square');
    renderInitialBoard(playerBoard, playerSquares);
}

// fix render board
function renderInitialBoard(board, squares) {
    let row = 0;
    let col = 0;
    squares.forEach((square) => {
        let pos = board[row][col];
        if (pos !== "" && pos !== "A" && pos !== "B" && pos !== "C1" && pos !== "C2" && pos !== "D" && pos !== "X" && pos !== "O") {
            let divEl = document.createElement("div");
            divEl.setAttribute('id', pos+','+row+','+col);
            divEl.setAttribute('class', pos);
            divEl.classList.add('ship');
            divEl.setAttribute('draggable', 'true');
            square.appendChild(divEl);
        }
        if (++col > 9) {
            col = 0;
            row++;
        }
    });
}

function renderBoard() {
    let playerSquares = document.querySelectorAll('#player-board > .square');
    let row = 0;
    let col = 0;
    playerSquares.forEach((square) => {
        if (playerBoard[row][col] === "O") {
            if (!square.hasChildNodes()) {
                let spanEl = document.createElement("span");
                spanEl.setAttribute('class', 'miss-ship');
                square.appendChild(spanEl);
            }
        } else if (playerBoard[row][col] === "X") {
            if (square.childNodes.length === 0) {
                let spanEl = document.createElement("span");
                spanEl.setAttribute('class', 'hit-ship');
                square.appendChild(spanEl);
            } else if (square.childNodes.length === 1) {
                if (square.childNodes[0].nodeName === "DIV") {
                    let spanEl = document.createElement("span");
                    spanEl.setAttribute('class', 'hit-ship');
                    square.appendChild(spanEl);
                }
            }
        }
        if (++col > 9) {
            col = 0;
            row++;
        }
    });
}


function updateStateBoard() {
    playerBoard = [];
    initBoardState(playerBoard);
    let playerSquares = document.querySelectorAll('#player-board > .square');
    let row = 0;
    let col = 0;
    playerSquares.forEach((square) => {
        if (square.hasChildNodes()) {
            let shipId = shipIdToCoord(square.childNodes[0].id);
            playerBoard[row][col] = shipId[0];
            createShips(shipId[0], row, col);
        }
        if (++col > 9) {
            col = 0;
            row++;
        }
    });
}

function createShips(shipId, row, col) {
    let id = shipId.split("");
    let len = 0;
    switch (shipId.slice(1, id.length)) {
        case "A":
            len = 5;
            break;
        case "B":
            len = 4;
            break;
        case "C1":
            len = 3;
            break;
        case "C2":
            len = 3;
            break;
        case "D":
            len = 2;
            break;
    }
    if (id[0] === "V") {
        for (let i=row+1; i<row+len; i++) {
            playerBoard[i][col] = shipId.slice(1, id.length);
        }
    } else if (id[0] === "H") {
        for (let i=col+1; i<col+len; i++) {
            playerBoard[row][i] = shipId.slice(1, id.length);
        }
    }
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
    if (difficulty === "easy") {
        for (let i=0; i<100; i++) {
            arr.push(i);
        }
    } else if (difficulty === "hard") {
        for (let i=0; i<100; i++) {
            if (Math.floor(i/10) % 2 === 0) {
                if (i % 2 === 0) {
                    arr.push(i);
                }
            } else {
                if (i % 2 !== 0) {
                    arr.push(i);
                }
            }
        }
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

function computerHardAi(arr) {
    let coord, row, col;
    if (aiHitMoves.length === 0) {
        coord = numToCoord(arr.pop());
    } else {
        coord = aiHitMoves.shift();
    }
    row = coord[0];
    col = coord[1];
    if (playerBoard[row][col] !== "" && playerBoard[row][col] !== "O" && playerBoard[row][col] !== "X") {
        playerBoard[row][col] = "X";
        computerHitCount++;
        if (checkWin(computerHitCount)) {
            renderBoard();
            computerBoardEle.classList.add('noClick');
            resultMessage.innerHTML = "";
            resultMessage.innerHTML = "YOU LOST!";
            modal.classList.remove('ghost');
        } else {
            if (col < BOARD_LEN-1) {
                aiHitMoves.push([row, col+1]);
            }
            if (row < BOARD_LEN-1) {
                aiHitMoves.push([row+1, col]);
            }
            if (row > 0) {
                aiHitMoves.push([row-1, col]);
            }
            if (col > 0) {
                aiHitMoves.push([row, col-1]);
            }
            renderBoard();
            setTimeout(function() {
                computerHardAi(arr);
            }, 1000);
        }
    } else if (playerBoard[row][col] === "") {
        playerFilter.setAttribute('class', 'not-turn');
        computerFilter.classList.remove('not-turn');
        playerBoard[row][col] = "O";
        renderBoard();
        computerBoardEle.classList.remove('noClick');
    } else {
        computerHardAi(arr);
    }
}

function computerEasyAi(arr) {
    let coord = numToCoord(arr.pop());
    let row = coord[0];
    let col = coord[1];
    if (playerBoard[row][col] !== "") {
        playerBoard[row][col] = "X";
        computerHitCount++;
        if (checkWin(computerHitCount)) {
            renderBoard();
            computerBoardEle.classList.add('noClick');
            resultMessage.innerHTML = "";
            resultMessage.innerHTML = "YOU LOST!";
            modal.classList.remove('ghost');
        } else {
            renderBoard();
            setTimeout(function() {
                computerEasyAi(arr);
            }, 1000);
        }
    } else {
        playerFilter.setAttribute('class', 'not-turn');
        computerFilter.classList.remove('not-turn');
        playerBoard[row][col] = "O";
        renderBoard();
        computerBoardEle.classList.remove('noClick');
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
    updateStateBoard();
}

// end

function lockAllShips() {
    let ships = document.querySelectorAll('.ship');
    ships.forEach((ship) => {
        ship.removeAttribute('draggable');
    });
    generateAiMoves(aiMoves);
    computerBoardEle.addEventListener('click', dropBomb);
    lockButton.setAttribute('class', 'ghost');
    playerBoardEle.classList.add('noClick');
    beforeLockText.classList.add('ghost');
    afterLockText.classList.remove('ghost');
    playerFilter.setAttribute('class', 'not-turn');
    computerFilter.classList.remove('not-turn');
}

function rotatePieces(e) {
    if (!e.target.classList.contains('ship')) return;
    if (checkValidRotation(e.target)) {
        updateStateBoard();
    }
}

function checkValidRotation(ele) {
    let coord = idToCoord(ele.parentNode.id);
    let row = parseInt(coord[0]);
    let col = parseInt(coord[1]);
    let oldShipType = playerBoard[row][col];
    let direction = oldShipType.slice(0,1);
    if (direction === "H") direction = "V";
    else direction = "H";
    let newShipType = direction + oldShipType.slice(1,oldShipType.length);
    let id = newShipType.split("");
    let len = 0;
    switch (newShipType.slice(1, id.length)) {
        case "A":
            len = 5;
            break;
        case "B":
            len = 4;
            break;
        case "C1":
            len = 3;
            break;
        case "C2":
            len = 3;
            break;
        case "D":
            len = 2;
            break;
    }
    if (id[0] === "V") {
        for (let i=row+1; i<row+len; i++) {
            if (i >= BOARD_LEN) return false;
            if (playerBoard[i][col] !== "") return false;
        }
    } else if (id[0] === "H") {
        for (let i=col+1; i<col+len; i++) {
            if (i >= BOARD_LEN) return false;
            if (playerBoard[row][i] !== "") return false;
        }
    }

    ele.setAttribute('id', newShipType + "," + coord[0] + "," + coord[1]);
    ele.classList.remove(oldShipType);
    ele.classList.add(newShipType);

    return true;
}

// game start 

function gameStart() {
    init();
    playerBoardEle.addEventListener('click', rotatePieces);
}

gameStart();