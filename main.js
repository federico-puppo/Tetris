import "./style.css";
import {
  BLOCK_SIZE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PIECES,
  COLORS,
  MOVEMENTS,
  SCORES,
} from "./const";

// 1 - inicializar el canvas
const canvas = document.querySelector("#background");
const context = canvas.getContext("2d");
const $score = document.querySelector("#score");
canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

// AUDIO
const audio = new Audio("../src/sounds/Tetris.mp3");
audio.volume = 0.3;
audio.loop = true;
audio.play()
let score = 0;

// 3 - TABLERO

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

function createBoard(width, height) {
  return Array(height)
    .fill()
    .map(() => Array(width).fill(0));
}

// 4 - Forma

const piece = {
  position: { x: BOARD_WIDTH / 2 - 1, y: 0 },
  shape: PIECES[Math.floor(Math.random() * PIECES.length)],
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
};

function resetPiece() {
  // resetear posicion
  piece.position.x = BOARD_WIDTH / 2 - 1;
  piece.position.y = 0;
  // nueva forma y color
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];
  piece.color = COLORS[Math.floor(Math.random() * COLORS.length)];
}

// 2 - game loop - auto drop

let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > 750) {
    piece.position.y++;
    const audio = new Audio("../src/sounds/move.wav");
    audio.volume = 0.3;
    audio.play();
    dropCounter = 0;
    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      const audio = new Audio("../src/sounds/landing.wav");
      audio.volume = 1;
      audio.play();
      removeRows();
    }
  }
  draw();
  window.requestAnimationFrame(update);
}

// funcion DIBUJO
function draw() {
  // Background
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = value;
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  // Piece
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = piece.color;
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
  $score.innerText = score;
}

// Movimiento de la pieza

document.addEventListener("keydown", (e) => {
  const sfx = new Audio("../src/sounds/hold.wav");
  sfx.volume = 0.3;
  if (e.key === MOVEMENTS.LEFT) {
    piece.position.x--;
    if (checkCollision()) {
      piece.position.x++;
    } else {
      sfx.play();
    }
  }
  if (e.key === MOVEMENTS.RIGHT) {
    piece.position.x++;
    if (checkCollision()) {
      piece.position.x--;
    } else {
      sfx.play();
    }
  }
  if (e.key === MOVEMENTS.DOWN) {
    piece.position.y++;
    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
      const sfx = new Audio("../src/sounds/holdlanding.wav");
      sfx.volume = 0.3;
      sfx.play();
    } else {
      sfx.play();
    }
  }
  if (e.key === MOVEMENTS.ROTATE || e.key === "r") {
    const rotated = [];
    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i]);
      }
      rotated.push(row);
    }
    const previousShape = piece.shape;
    piece.shape = rotated;

    if (checkCollision()) {
      piece.shape = previousShape;
    } else {
      const sfx = new Audio("../src/sounds/rotate.wav");
      sfx.volume = 0.3;
      sfx.play();
    }
  }
});

// Colision de la pieza
function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      );
    });
  });
}

// Solidificar pieza
function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + piece.position.y][x + piece.position.x] = piece.color;
      }
    });
  });
  resetPiece();
  // gameover
  if (checkCollision()) {
    window.alert("Game over!!");
    board.forEach((row) => row.fill(0));
    score = 0;
  }

  const audio = new Audio("../src/sounds/landing.wav");
  audio.volume = 0.3;
  audio.play();
  console.log(board);
}

// Retirar filas fondo
function removeRows() {
  const rowsToRemove = [];
  board.forEach((row, y) => {
    if (row.every((value) => value !== 0)) {
      rowsToRemove.push(y);
    }
  });
  if (rowsToRemove.length > 0) {
    let tetrisAudio;
    switch (rowsToRemove.length) {
      case 1:
        tetrisAudio = new Audio("../src/sounds/single.wav");
        break;
      case 2:
        tetrisAudio = new Audio("../src/sounds/double.wav");
        break;
      case 3:
        tetrisAudio = new Audio("../src/sounds/triple.wav");
        break;
      case 4:
        tetrisAudio = new Audio("../src/sounds/cuadruple.wav");
        break;
      default:
        break;
    }
    tetrisAudio.volume = 0.3;
    tetrisAudio.play();
    score += SCORES[rowsToRemove.length];
  }

  rowsToRemove.forEach((y) => {
    board.splice(y, 1);
    const newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
  });
}

update();
