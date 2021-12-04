const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  let ln = 1;
  const draws = [];
  let currentBoard = [];
  let currentBoardWinDraw;

  let rowBingoDraw;
  let rowBingo;
  let rowBingoBoard;

  let columnBingoDraw;
  let columnBingo;
  let columnBingoBoard;

  let lastBingoDraw = 0;
  let lastBingoBoard;

  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    if (ln == 1) {
      draws.push(...line.split(","));
      rowBingoDraw = draws.length;
      columnBingoDraw = draws.length;
      currentBoardWinDraw = draws.length;
      ln++;
      return;
    }
    if (!line) {
      return;
    }

    if (currentBoard.length == 5) {
      currentBoard = [];
      currentBoardWinDraw = draws.length;
    }
    const row = line.split(" ").filter(Boolean);
    if (currentBoard.length < 5) {
      currentBoard.push(row);
      let lastDraw = rowWinDraw(row);
      if (lastDraw < rowBingoDraw) {
        rowBingoDraw = lastDraw;
        rowBingo = row;
        rowBingoBoard = currentBoard;
      }
      if (lastDraw <= currentBoardWinDraw) {
        currentBoardWinDraw = lastDraw;
      }

      if (currentBoard.length == 5) {
        for (let column = 0; column < 5; column++) {
          let lastDraw = columnWinDraw(column);
          if (lastDraw < columnBingoDraw) {
            columnBingoDraw = lastDraw;
            columnBingoBoard = currentBoard;
            columnBingo = [
              currentBoard[0][column],
              currentBoard[1][column],
              currentBoard[2][column],
              currentBoard[3][column],
              currentBoard[4][column],
            ];
          }
          if (lastDraw <= currentBoardWinDraw) {
            currentBoardWinDraw = lastDraw;
          }
        }

        if (lastBingoDraw <= currentBoardWinDraw) {
          lastBingoDraw = currentBoardWinDraw;
          lastBingoBoard = currentBoard;
        }
      }
    }

    function columnWinDraw(column) {
      let lastDraw = 0;
      for (let row = 0; row < 5; row++) {
        const currentDraw = draws.indexOf(currentBoard[row][column]);
        if (lastDraw < currentDraw) {
          lastDraw = currentDraw;
        }
      }
      return lastDraw;
    }

    function rowWinDraw(row) {
      let lastDraw = 0;
      for (let rowIndex = 0; rowIndex < row.length; rowIndex++) {
        const draw = draws.indexOf(row[rowIndex]);
        if (draw > lastDraw) {
          lastDraw = draw;
        }
      }
      return lastDraw;
    }
  });

  await events.once(rl, "close");

  console.log("row board", rowBingoBoard);
  console.log("row draw", rowBingoDraw);
  console.log("row", rowBingo);
  console.log("column board", columnBingoBoard);
  console.log("column draw", columnBingoDraw);
  console.log("column", columnBingo);
  console.log("last draw", lastBingoDraw);
  console.log("last board", lastBingoBoard);

  let resultPart1 =
    rowBingoDraw < columnBingoDraw
      ? computeResult(rowBingoBoard, rowBingoDraw)
      : computeResult(columnBingoBoard, columnBingoDraw);

  let resultPart2 = computeResult(lastBingoBoard, lastBingoDraw);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);

  function computeResult(board, lastDraw) {
    const sum = board.reduce(
      (prev, curr) =>
        curr.reduce((prev, curr) => {
          let currIndex = draws.indexOf(curr);
          if (currIndex <= lastDraw) {
            return prev;
          }
          return prev + Number(curr);
        }, 0) + prev,
      0
    );
    return sum * draws[lastDraw];
  }
})();
