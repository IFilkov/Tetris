//01:30 01:57
let main = document.querySelector(".main");
const scoreElmn = document.getElementById("score");
const leveleElmn = document.getElementById("level");
const nextTetroElem = document.getElementById("next-tetro");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const gameOver = document.getElementById("game-over");

let playfield = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
// let playfield = Array(20).fill(Array(10).fill(0)); генирация игрового поля


// let gameSpeed = 400;
let score = 0;
let gameTimerID;//старт игры
let currentLevel = 1;
let isPaused = true;
let possibleLevels = {
  1:{
    scorePerLine: 10,
    speed: 400,
    nextLevelScore: 10,
  },
  2:{
    scorePerLine: 15,
    speed: 300,
    nextLevelScore: 100,
  },
  3:{
    scorePerLine: 15,
    speed: 200,
    nextLevelScore: 150,
  },
  4:{
    scorePerLine: 15,
    speed: 100,
    nextLevelScore: 200,
  },
  5:{
    scorePerLine: 15,
    speed: 50,
    nextLevelScore: Infinity,
  },
};
let figures = {
  O: [
    [1,1],
    [1,1]
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S:[
    [0,1,1],
    [1,1,0],
    [0,0,0]
  ],
  Z:[
    [1,1,0],
    [0,1,1],
    [0,0,0]
  ],
  L:[
    [1,0,0],
    [1,1,1],
    [0,0,0]
  ],
  J:[
    [0,0,1],
    [1,1,1],
    [0,0,0]
  ],
  T:[
    [1,1,1],
    [0,1,0],
    [0,0,0]
  ]
}
let activeTetro = getNewTetro(); 
let nextTetro = getNewTetro(); 

//отрисовка поля
function draw() {
  let mainInnerHTML = "";
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        mainInnerHTML += '<div class="cell movingCell"></div>';
      } else if (playfield[y][x] === 2) {
        mainInnerHTML += '<div class="cell fixedCell"></div>';
      } else {
        mainInnerHTML += '<div class="cell"></div>';
      }
    }
  }
  main.innerHTML = mainInnerHTML;
}
//получение следующий фигуры (подсказки)
function drawNextTetro() {
  let nextTetroInnerHTML = '';
  for (let y = 0; y < nextTetro.shape.length; y++){
    for (let x = 0; x < nextTetro.shape[y].length; x++){
      if (nextTetro.shape[y][x]) {
        nextTetroInnerHTML += '<div class="cell movingCell"></div>';
      } else {
        nextTetroInnerHTML += '<div class="cell"></div>';
      }
    }
    nextTetroInnerHTML += '<br>';
  }
  nextTetroElem.innerHTML = nextTetroInnerHTML;
}
//стираем след перерисованной фигуры
function removePrevActiveTetro(){
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 0;
      }
    }
  }
};
//рисуем фигуру в новой позийии
function addActiveTetro() {
  removePrevActiveTetro();
  for (let y =0; y < activeTetro.shape.length; y++) {
    for (let x =0; x < activeTetro.shape[y].length; x++){
      if (activeTetro.shape[y][x] === 1) {
        playfield[activeTetro.y + y][activeTetro.x + x] = activeTetro.shape[y][x];
      }
    }
  }
}
//поворот фигуры
function rotateTetro() {
  const prevTetroState = activeTetro.shape;

  activeTetro.shape = activeTetro.shape[0].map((val, index) =>
  activeTetro.shape.map((row) => row[index]).reverse());
//проверка состояния поворота фигуры
  if (hasCollisions()) {
    activeTetro.shape = prevTetroState;
  }
}
//проверка границ поля и столкновений
function hasCollisions(){
  for (let y =0; y < activeTetro.shape.length; y++) {
    for (let x =0; x < activeTetro.shape[y].length; x++){
      if (activeTetro.shape[y][x] && (playfield[activeTetro.y + y] === undefined ||
        playfield[activeTetro.y + y][activeTetro.x + x] === undefined ||
        playfield[activeTetro.y + y][activeTetro.x + x] === 2
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

//удаляем заполненные ряды
function removeFullLines() {
  let canRemoveLine = true,
      filledLines = 0;
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] !== 2) {
        canRemoveLine = false;
        break;
      }
    }
    if (canRemoveLine) {
      playfield.splice(y, 1);
      playfield.splice(0, 0, [0,0,0,0,0,0,0,0,0,0]);
      filledLines += 1;
    }
    canRemoveLine = true;
  }
//количество начесляемых очков в зависимости сколько рядов заполненно одновременно
  switch (filledLines) {
    case 1:
      score += possibleLevels[currentLevel].scorePerLine;
      break;
    case 2:
      score += possibleLevels[currentLevel].scorePerLine * 3;
      break;
    case 3:
      score += possibleLevels[currentLevel].scorePerLine * 6;
    case 4:
      score += possibleLevels[currentLevel].scorePerLine * 12;
      break;
  }

  scoreElmn.innerHTML = score;
//проверка количества очков для перехода на следующий уровень
  if (score >= possibleLevels[currentLevel].nextLevelScore){
    currentLevel++;
    leveleElmn.innerHTML = currentLevel;
  }
}

//получаем случайную новую фигуру
function getNewTetro() {
  const possibleFigures = 'IOLJTSZ'
  const rand = Math.floor(Math.random() * 7);
  const newTetro = figures[possibleFigures[rand]];

  return {
    x: Math.floor((10 - newTetro[0].length) / 2),
    y: 0,
    shape: newTetro,
  }
}
//фиксируем фигуры при достижении низа или другой фигуры
function fixTetro() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 2;
      }
    }
  }
}
//Движение фигуры в низ
  function moveTetroDown() {
    activeTetro.y +=1;
    if (hasCollisions()) {
      activeTetro.y -= 1;
      fixTetro();
      removeFullLines();
      //показ следующий фигуры
      activeTetro = nextTetro;
      if (hasCollisions()) {
        reset();
      }
      nextTetro = getNewTetro();
    }
  }
    
//моментальное призимление фигуры
  function dropTetro() {
    for (let y = activeTetro.y; y < playfield.length; y++) {
      activeTetro.y += 1;
      if (hasCollisions()) {
        activeTetro.y -= 1;
        break
      }
    }
  }

  function reset() {
    isPaused = true;
    clearTimeout(gameTimerID);
    playfield = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    draw();
    gameOver.style.display = "block";
  }

//получение клавиш управления если игра не на паузе

document.onkeydown = function (e) {
  if (!isPaused) {
    if (e.keyCode === 37) {
      activeTetro.x -=1;
      if (hasCollisions()) {
      activeTetro.x += 1;
      }
    } else if (e.keyCode === 39) {
    activeTetro.x +=1;
      if (hasCollisions()) {
       activeTetro.x -= 1;
      }
     } else if (e.keyCode === 40) {
     moveTetroDown();           
     } else if (e.keyCode === 38) {
     rotateTetro();
     } else if (e.keyCode === 32) {
     dropTetro();
  }
  updateGameState();
  }
};

function updateGameState() {
  if (!isPaused) {
    addActiveTetro();
    draw();
    drawNextTetro();
  }
}
//отслеживание кнопки паузы
pauseBtn.addEventListener("click",(e) => {
  if (e.target.innerHTML === 'Pause') {
    e.target.innerHTML = 'Play';
    clearTimeout(gameTimerID)
  }else {
    e.target.innerHTML = 'Pause';
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
  isPaused = !isPaused;
});

startBtn.addEventListener("click", (e) => {
  e.target.innerHTML = "Start again";
  isPaused = false;
  gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  gameOver.style.display = "none";
});

scoreElmn.innerHTML = score;
leveleElmn.innerHTML = currentLevel;

// addAvtiveTetro();
draw();
// drawNextTetro();
function startGame() {
    moveTetroDown();
    if (!isPaused){
    addActiveTetro();
    draw();
    drawNextTetro();
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
}

// setTimeout(startGame, possibleLevels[currentLevel].speed);

