/*-- CONSTANTS --*/

const BOARD_LEN = 10;
const TOTAL_SHIPS = 17;

/*-- APP'S STATE (VARIABLES) --*/

// Legend for Board Elements: 
//  Orientation of ships:
//      H - Horizontal
//      V - Vertical
//  Ships Name - Length of ship: 
//      A - 5
//      B - 4
//      C1/C2 - 3
//      D - 2
//  Other:
//      X - Hit
//      O - Miss

let playerBoard = [];
let computerBoard = [];
let playerHitCount = 0;
let computerHitCount = 0;
let aiMoves = [];
let aiHitMoves = [];
let playerTurn = true;
let difficulty;
let soundOn = true;
let squarePos;

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
let sfxTitleButton = document.getElementById('effect-sound-title');
let sfxMainButton = document.getElementById('effect-sound-main');
let randomizeButton = document.getElementById('randomize');
let buttonContainer = document.querySelector('.button-container');

/*-- SOUND EFFECTS --*/

let clickSound = new Audio('media/click.wav');
let missSound = new Audio('media/miss-sound.wav');
let hitSound = new Audio('media/hit-marker-sound.mp3');
let loseGameSound = new Audio('media/lose-game-sound.mp3');
let winGameSound = new Audio('media/win-game-sound.mp3');
let invalidSound = new Audio('media/invalid-sound.mp3');

/*-- EVENT LISTENERS --*/

lockButton.addEventListener('click', lockAllShips);
mainPlayButton.addEventListener('click', showMain);
sfxTitleButton.addEventListener('click', soundState);
sfxMainButton.addEventListener('click', soundState);
randomizeButton.addEventListener('click', randomize);

/*-- HELPER FUNCTIONS --*/

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function idToCoord(str) {
    return str.split(',');
}

function shipIdToCoord(id) {
    return id.split(',');
}

function numToCoord(num) {
    let row = Math.floor(num / 10);
    let col = num % 10;
    return [row, col];
}

/*-- MAIN FUNCTIONS --*/

function showMain(e) {
    /* Removes title page and make main boards visibile */
    for (let i=0; i<radios.length; i++) {
        if (radios[i].checked) {
            difficulty = radios[i].value;
            break;
        }
    }
    titlePageContainer.classList.add('ghost');
    mainContainer.classList.remove('ghost');
    clickSound.play();
}

function init() {
    initBoard(playerBoard, playerBoardEle);
    initBoard(computerBoard, computerBoardEle);
    renderInitialBoard(playerBoard);
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

function dropBomb(e) {
    if (!e.target.classList.contains("square") && !e.target.classList.contains("ship")) return;
    let playerLastCoord = idToCoord(e.target.id);
    let row = playerLastCoord[0];
    let col = playerLastCoord[1];
    if (computerBoard[row][col] === "X" || computerBoard[row][col] === "O") return;
    if (computerBoard[row][col] === "") {
        e.target.classList.add("miss");
        computerBoard[row][col] = "O";
        missSound.play();
    } else {
        e.target.classList.add("hit");
        computerBoard[row][col] = "X";
        hitSound.play();
        playerHitCount++;
    }
    if (checkWin(playerHitCount)) {
        winGameSound.play();
        computerFilter.setAttribute('class', 'not-turn');
        computerBoardEle.classList.add('noClick');
        resultMessage.innerHTML = "";
        resultMessage.innerHTML = "YOU WON!";
        modal.classList.remove('ghost');
    } else {
        setTimeout(function() {
            computerFilter.setAttribute('class', 'not-turn');
            playerFilter.classList.remove('not-turn');
        }, 500);
        computerBoardEle.classList.add('noClick');
        if (difficulty === "easy") {
            setTimeout(function() {
                computerEasyAi(aiMoves);
            }, 500);
        } else if (difficulty === "hard") {
            setTimeout(function() {
                computerHardAi(aiMoves);
            }, 500);
        }
    }
}

function randomize() {
    playerBoard = [];
    initBoardState(playerBoard);
    createRandomShips(5, playerBoard, "A");
    createRandomShips(4, playerBoard, "B");
    createRandomShips(3, playerBoard, "C1");
    createRandomShips(3, playerBoard, "C2");
    createRandomShips(2, playerBoard, "D");
    renderInitialBoard(playerBoard);
    clickSound.play();
}

function renderInitialBoard(board) {
    /* Initial render of board with state variables 
    to visualize the game */
    let playerSquares = document.querySelectorAll('#player-board > .square');
    let row = 0;
    let col = 0;
    playerSquares.forEach((square) => {
        while (square.hasChildNodes()) {
            square.removeChild(square.lastChild);
        }
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
    /* Render function used for during the game */
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
            loseGameSound.play();
            playerFilter.setAttribute('class', 'not-turn');
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
                playerFilter.setAttribute('class', 'not-turn');
                computerFilter.classList.remove('not-turn');
            }, 750);
            computerBoardEle.classList.remove('noClick');
        }
    } else if (playerBoard[row][col] === "") {
        playerBoard[row][col] = "O";
        renderBoard();
        setTimeout(function() {
            playerFilter.setAttribute('class', 'not-turn');
            computerFilter.classList.remove('not-turn');
        }, 750);
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
            loseGameSound.play();
            playerFilter.setAttribute('class', 'not-turn');
            resultMessage.innerHTML = "";
            resultMessage.innerHTML = "YOU LOST!";
            modal.classList.remove('ghost');
        } else {
            renderBoard();
            setTimeout(function() {
                playerFilter.setAttribute('class', 'not-turn');
                computerFilter.classList.remove('not-turn');
            }, 750);
            computerBoardEle.classList.remove('noClick');
        }
    } else {
        playerBoard[row][col] = "O";
        renderBoard();
        setTimeout(function() {
            playerFilter.setAttribute('class', 'not-turn');
            computerFilter.classList.remove('not-turn');
        }, 750);
        computerBoardEle.classList.remove('noClick');
    }
}

// drag functions

function addDropableLocations(id, squarePos) {
    let coord = shipIdToCoord(id);
    let shipType = coord[0].slice(1,coord[0].length);
    let max;
    let playerSquares = document.querySelectorAll('#player-board > .square');
    switch (coord[0]) {
        case 'HA':
        case 'VA':
            max = BOARD_LEN - 5 + squarePos;
            break;
        case 'HB':
        case 'VB':
            max = BOARD_LEN - 4 + squarePos;
            break;
        case 'HC1':
        case 'HC2':
        case 'VC1':
        case 'VC2':
            max = BOARD_LEN - 3 + squarePos;
            break;
        case 'HD':
        case 'VD':
            max = BOARD_LEN - 2 + squarePos;
            break;
    }

    if (coord[0].slice(0,1) === "H") {
        for (let i=0; i<BOARD_LEN; i++) {
            for (let j=0; j<BOARD_LEN; j++) {
                // for every square in the board
                if (playerBoard[i][j] !== "" && playerBoard[i][j] !== coord[0] && playerBoard[i][j] !== shipType && playerBoard[i][j] !== "T") {
                    let shipLength = BOARD_LEN+squarePos-max;
                    for (let k=0; k<shipLength; k++) {
                        if (j+squarePos-k > 9 || j+squarePos-k < 0) continue;
                        if (playerBoard[i][j+squarePos-k] === "") {
                            playerBoard[i][j+squarePos-k] = "T";
                        }
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
            if (playerBoard[squareCoord[0]][squareCoord[1]] !== "" && playerBoard[squareCoord[0]][squareCoord[1]] !== shipType) {
                square.removeAttribute('ondrop');
                square.removeAttribute('ondragover');
            };
        });
    } else {
        for (let i=0; i<BOARD_LEN; i++) {
            for (let j=0; j<BOARD_LEN; j++) {
                if (playerBoard[i][j] !== "" && playerBoard[i][j] !== coord[0] && playerBoard[i][j] !== shipType && playerBoard[i][j] !== "T") {
                    let shipLength = BOARD_LEN+squarePos-max;
                    for (let k=0; k<shipLength; k++) {
                        if (i+squarePos-k < 0 || i+squarePos-k > 9) continue;
                        if (playerBoard[i+squarePos-k][j] === "") {
                            playerBoard[i+squarePos-k][j] = "T";
                        }
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
            if (playerBoard[squareCoord[0]][squareCoord[1]] !== "" && playerBoard[squareCoord[0]][squareCoord[1]] !== shipType) {
                square.removeAttribute('ondrop');
                square.removeAttribute('ondragover');
            };
        });
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
    squarePos = Math.max(Math.floor(ev.offsetX/31),Math.floor(ev.offsetY/31));
    addDropableLocations(ev.target.id, squarePos);
    ev.dataTransfer.setData('text/plain', ev.target.id);
}

function drag_end_handler(ev) {
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
    let coord = shipIdToCoord(data);
    let shipOrientation = coord[0].slice(0,1);
    let selectedLand = idToCoord(ev.path[0].id);
    let newLand;
    if (shipOrientation === "H") {
        newLand = `${selectedLand[0]},${parseInt(selectedLand[1])-squarePos}`;
    } else if (shipOrientation === "V") {
        newLand = `${parseInt(selectedLand[0])-squarePos},${selectedLand[1]}`;
    }
    newLand = document.getElementById(newLand);
    newLand.appendChild(document.getElementById(data));
    removeDropableLocations();
    clickSound.play();
    updateStateBoard();
}

function lockAllShips() {
    clickSound.play();
    let ships = document.querySelectorAll('.ship');
    ships.forEach((ship) => {
        ship.removeAttribute('draggable');
    });
    generateAiMoves(aiMoves);
    computerBoardEle.addEventListener('click', dropBomb);
    buttonContainer.setAttribute('class', 'ghost');
    playerBoardEle.classList.add('noClick');
    beforeLockText.classList.add('ghost');
    afterLockText.classList.remove('ghost');
    playerFilter.setAttribute('class', 'not-turn');
    computerFilter.classList.remove('not-turn');
}

function rotatePieces(e) {
    if (!e.target.classList.contains('ship')) return;
    if (checkValidRotation(e.target)) {
        clickSound.play();
        updateStateBoard();
    } else {
        invalidSound.play();
        e.target.style.animation = "shake 0.5s";
        setTimeout(function() {
            e.target.style.removeProperty('animation');
        }, 500);
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

function soundState(e) {
    checkIfSfxMain(e.target);
    if (soundOn) {
        clickSound.muted = true;
        missSound.muted = true;
        hitSound.muted = true;
        loseGameSound.muted = true;
        winGameSound.muted = true;
        invalidSound.muted = true;
        soundOn = false;
    } else {
        clickSound.muted = false;
        missSound.muted = false;
        hitSound.muted = false;
        loseGameSound.muted = false;
        winGameSound.muted = false;
        invalidSound.muted = false;
        soundOn = true;
        clickSound.play();
    }
}

function checkIfSfxMain(e) {
    if (soundOn) {
        if (e.id === "effect-sound-title") {
            sfxMainButton.innerHTML = "SFX SOUND OFF";
            sfxMainButton.classList.add('off');
            sfxMainButton.classList.remove('on');
        }
        e.innerHTML = "SFX SOUND OFF";
        e.classList.add('off');
        e.classList.remove('on');
    } else {
        if (e.id === "effect-sound-title") {
            sfxMainButton.innerHTML = "SFX SOUND OFF";
            sfxMainButton.classList.add('on');
            sfxMainButton.classList.remove('off');
        }
        e.innerHTML = "SFX SOUND ON";
        e.classList.add('on');
        e.classList.remove('off');
    }
}

function gameStart() {
    init();
    playerBoardEle.addEventListener('click', rotatePieces);
}

gameStart();