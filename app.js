const MAX_PLAYER_BLOCKS = 7;
const PLAYER1COLOR = "blueviolet";
const PLAYER2COLOR = "orangered";
const BLOCK_SIZE = 4;

const gridSelect = document.querySelector("#grid-size");
const isGameInProgress = false;
const gridDomElement = document.querySelector("#grid");
let selectedGridSize = 8;
const player1Blocks = [];
const player2Blocks = [];
const player1Grid = document.querySelector("#player1");
const player2Grid = document.querySelector("#player2");
let selectedPlayerBlock = null;
let isInvalidPosition = false;
let selectedBlockMarkedPosition = [null, null];
let player1Scroe = 0,
  player2Score = 0;

let currentPlayerTurn = 1;

let gridState = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const blockOptions = [
  [
    [0, 0, 0, 0],
    [0, "X", 0, 0],
    [0, "X", "X", "X"],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, "X", 0],
    ["X", "X", "X", 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, "X", "X", 0],
    [0, "X", "X", 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, "X", "X", 0],
    ["X", "X", 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, "X", "X", 0],
    [0, 0, "X", "X"],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, "X", 0],
    [0, "X", "X", "X"],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    ["X", "X", "X", "X"],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
];

function printGrid() {
  console.log("GRID", gridState);
}

function showModal(msg, style, icon) {
  console.log(msg, style, icon);
}

function showErrorModal(msg) {
  showModal(msg, "error", "excalmation");
}

function changeGridSize(event) {
  if (isGameInProgress) {
    showErrorModal("Could not change grid while a game is in progress!");
    return false;
  }

  if (gridSelect) {
    selectedGridSize = gridSelect.value;
    gridState = new Array(selectedGridSize).fill(null);
    for (let i = 0; i < selectedGridSize; i++) {
      gridState[i] = new Array(selectedGridSize).fill(null);
    }
    drawGameGrid();
  }
  return true;
}

function drawGameGrid() {
  const gridDom = [];
  for (let i = 0; i < selectedGridSize; i++) {
    for (let j = 0; j < selectedGridSize; j++) {
      gridDom.push(
        `<div class='cell cell-${i}-${j}' data-color='${
          gridState[i][j] === "X"
            ? currentPlayerTurn === 1
              ? PLAYER1COLOR
              : PLAYER2COLOR
            : ""
        }'></div>`
      );
    }
  }
  gridDomElement.className = `grid grid-${selectedGridSize}`;
  gridDomElement.innerHTML = gridDom.join("");
  gridDomElement
    .querySelectorAll(".cell")
    .forEach((cell) => cell.addEventListener("mouseenter", showBlockPlacement));
  gridDomElement
    .querySelectorAll(".cell")
    .forEach((cell) => cell.addEventListener("mouseleave", resetGrid));
  gridDomElement
    .querySelectorAll(".cell")
    .forEach((cell) =>
      cell.addEventListener("click", addSelectedBlockToPosition)
    );
}

function randomBlockSugguestion() {
  const randomBlock = parseInt(Math.random() * blockOptions.length);
  return Array.from(blockOptions[randomBlock]);
}

function generatePlayerSuggestions() {
  for (let i = player1Blocks.length; i < MAX_PLAYER_BLOCKS; i++) {
    player1Blocks.push(randomBlockSugguestion());
  }
  for (let i = player2Blocks.length; i < MAX_PLAYER_BLOCKS; i++) {
    player2Blocks.push(randomBlockSugguestion());
  }
}

function updateVisiblePlayerBlocks() {
  let gridDom = [];

  for (let i = 0; i < MAX_PLAYER_BLOCKS; i++) {
    gridDom.push(`<div class='block block-${i}'
      data-player-block=${i}
      draggable="true" 
      onClick="selectPlayerBlock(event)" 
      onDragStart="dragPlayerBlock(event)" 
      onDragEnd="dropPlayerBlock(event)"
    >`);
    for (let j = 0; j < BLOCK_SIZE; j++) {
      for (let k = 0; k < BLOCK_SIZE; k++) {
        gridDom.push(`<div class='cell cell-small cell-${j}-${k}'></div>`);
      }
    }
    gridDom.push("</div>");
  }
  player1Grid.innerHTML = gridDom.join("");

  // gridDom = [];
  // for(let i=0; i<5; i++) {
  //   for(let j=0; j<30; j++) {
  //     gridDom.push(`<div class='cell cell-small cell-${i}-${j}'></div>`);
  //   }
  // }
  // player2Grid.innerHTML = gridDom.join("");

  drawPlayerOptionBlocks();
}

function rotatePlayerBlock(event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.target) {
    const targetBlock = event.target;
    const targetBlockIndex = targetBlock.getAttribute("data-block-index");
    const playerBlocks =
      currentPlayerTurn === 1 ? player1Blocks : player2Blocks;
    playerBlocks[targetBlockIndex] = JSON.parse(
      JSON.stringify(rotateBlock90Deg(playerBlocks[targetBlockIndex]))
    );
    updateVisiblePlayerBlocks();
  }
}

function rotateBlock90Deg(block) {
  const n = block.length;
  const rotation = JSON.parse(JSON.stringify(block));
  block.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      rotation[cellIndex][n - rowIndex - 1] = cell;
    });
  });
  return rotation;
}

function drawPlayerOptionBlocks() {
  player1Blocks.forEach((playerBlock, index) => {
    playerBlock.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        const playerCell = player1Grid.querySelector(
          `.block-${index} .cell-${rowIndex}-${cellIndex}`
        );
        playerCell.setAttribute("data-block-index", index);
        cell === "X" && playerCell.setAttribute("data-color", PLAYER1COLOR);
        playerCell.setAttribute("onDblClick", "rotatePlayerBlock(event)");
      });
    });
  });
}

function dragPlayerBlock(event) {
  if (event.target) {
    const targetPlayerBlock = event.target;
    targetPlayerBlock.classList.add("dragging");
  }
}

function dropPlayerBlock(event) {
  if (event.target) {
    const targetPlayerBlock = event.target;
    targetPlayerBlock.classList.remove("dragging");
  }
}

function checkLineCompletion() {
  let pointsEarned = 0;
  const rowsCompleted = [],
    columnsCompleted = [];
  gridState.forEach((row, rowIndex) => {
    row.filter((cell) => cell === "X").length === selectedGridSize &&
      rowsCompleted.push(rowIndex);
  });
  gridState.forEach((column, columnIndex) => {
    let isColunmComplete = true;
    for (let i = 0; i < selectedGridSize; i++) {
      if (isColunmComplete) {
        isColunmComplete = gridState[i][columnIndex] === "X";
      }
    }
    if (isColunmComplete) columnsCompleted.push(columnIndex);
  });
  pointsEarned = rowsCompleted.length + columnsCompleted.length;
  destroyCompletedLines(rowsCompleted, columnsCompleted);
}

function selectPlayerBlock(event) {
  event.stopPropagation();
  event.preventDefault();

  if (selectedPlayerBlock) {
    document
      .querySelector(`.block[data-player-block='${selectedPlayerBlock}']`)
      .classList?.remove("dragging");
    selectedPlayerBlock = null;
  }
  if (event.target) {
    const block = event.target;
    if (block.classList.contains("cell")) {
      playerBlockActive = block.parentElement;
    }
    if (playerBlockActive) {
      if (playerBlockActive.classList.contains("dragging")) {
        playerBlockActive.classList.remove("dragging");
      } else {
        playerBlockActive.classList.add("dragging");
      }
    }
    selectedPlayerBlock = playerBlockActive.getAttribute("data-player-block");
  }
}

function showBlockPlacement(event, placeBlock) {
  if (selectedPlayerBlock && event.target) {
    isInvalidPosition = false;
    const targetCell = event.target;
    resetGrid();
    const cellPosition = targetCell.classList[1].split("-");
    const selectedBlock =
      currentPlayerTurn === 1
        ? player1Blocks[selectedPlayerBlock]
        : player2Blocks[selectedPlayerBlock];
    selectedBlock.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        if (column === "X") {
          if (
            selectedBlockMarkedPosition[0] > rowIndex ||
            selectedBlockMarkedPosition[0] === null
          ) {
            selectedBlockMarkedPosition[0] = rowIndex;
          }
          if (
            selectedBlockMarkedPosition[1] > columnIndex ||
            selectedBlockMarkedPosition[1] === null
          ) {
            selectedBlockMarkedPosition[1] = columnIndex;
          }
        }
      });
    });

    const cellX = parseInt(cellPosition[1]);
    const cellY = parseInt(cellPosition[2]);
    for (let i = 0; i < BLOCK_SIZE; i++) {
      for (let j = 0; j < BLOCK_SIZE; j++) {
        if (isInvalidPosition) {
          resetGrid();
          return;
        }
        if (
          !selectedBlock[i + selectedBlockMarkedPosition[0]] ||
          !selectedBlock[i + selectedBlockMarkedPosition[0]][
            j + selectedBlockMarkedPosition[1]
          ]
        )
          continue;

        const cellElement = gridDomElement.querySelector(
          `.cell-${i + cellX}-${j + cellY}`
        );
        console.log(i+cellX, j+cellY);
        if (
          !cellElement &&
          gridState[i + selectedBlockMarkedPosition[0]][
            j + selectedBlockMarkedPosition[1]
          ] === "X"
        ) {
          isInvalidPosition = true;
        }
        if (
          selectedBlock[i + selectedBlockMarkedPosition[0]][
            j + selectedBlockMarkedPosition[1]
          ] === "X" &&
          cellElement &&
          cellElement !== "X"
        ) {
          cellElement.classList.add("show-position");
          cellElement.setAttribute(
            "data-color",
            currentPlayerTurn === 1 ? PLAYER1COLOR : PLAYER2COLOR
          );
          if (placeBlock) {
            gridState[i + cellX][j + cellY] = "X";
          }
        }
      }
    }
  }
}

function resetGrid() {
  gridDomElement.querySelectorAll(".cell").forEach((cell) => {
    const blockPos = cell.classList[1].split("-");
    if (gridState[blockPos[1]][blockPos[2]] !== "X") {
      cell.removeAttribute("data-color");
    }
    cell.classList.remove("show-position");
  });
}

function addSelectedBlockToPosition(event) {
  if (
    event &&
    event.target &&
    !isInvalidPosition &&
    selectedBlockMarkedPosition[0] !== null &&
    selectedBlockMarkedPosition[1] !== null
  ) {
    showBlockPlacement(event, true);
    checkLineCompletion();
    drawGameGrid();
    removePlayerOption();
    //updateVisiblePlayerBlocks();
  }
}

function removePlayerOption() {
  if (selectedPlayerBlock) {
    player1Blocks.splice(selectedPlayerBlock, 1);
    generatePlayerSuggestions();
    selectedPlayerBlock = null;
    isInvalidPosition = false;
    selectedBlockMarkedPosition = [null, null];
    updateVisiblePlayerBlocks();
  }
}

function destroyCompletedLines(rows, columns) {
  rows.forEach((row) => {
    for (let i = 0; i < selectedGridSize; i++) {
      gridDomElement
        .querySelector(`.cell-${row}-${i}`)
        .classList.add("explode");
      gridState[row][i] = 0;
    }
  });
  columns.forEach((column) => {
    for (let i = 0; i < selectedGridSize; i++) {
      gridDomElement
        .querySelector(`.cell-${i}-${column}`)
        .classList.add("explode");
      gridState[i][column] = 0;
    }
  });
}

drawGameGrid();
generatePlayerSuggestions();
updateVisiblePlayerBlocks();

gridSelect.addEventListener("change", changeGridSize);
