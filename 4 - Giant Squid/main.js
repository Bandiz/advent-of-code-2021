const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  let ln = 1;
  const draws = [];
  const boards = [];
  let currentBoard = [];

  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  let rowBingoDraw;
  let rowBingo;
  let rowBingoBoard;

  let columnBingoDraw;
  let columnBingo;
  let columnBingoBoard;

  rl.on("line", (line) => {
    if (ln == 1) {
      draws.push(...line.split(","));
      rowBingoDraw = draws.length;
      columnBingoDraw = draws.length;
      ln++;
      return;
    }
    if (!line) {
      return;
    }

    if (currentBoard.length == 5) {
      currentBoard = [];
    }
    const row = line.split(" ").filter(Boolean);
    if (currentBoard.length < 5) {
      currentBoard.push(row);
      let lastDraw = 0;
      for (let rowIndex = 0; rowIndex < row.length; rowIndex++) {
        const draw = draws.indexOf(row[rowIndex]);
        if (draw > lastDraw) {
          lastDraw = draw;
        }
      }
      if (lastDraw < rowBingoDraw) {
        rowBingoDraw = lastDraw;
        rowBingo = row;
        rowBingoBoard = currentBoard;
      }

      if (currentBoard.length == 5) {
        boards.push(currentBoard);
        for (let column = 0; column < 5; column++) {
          let lastDraw = 0;
          for (let row = 0; row < 5; row++) {
            const currentDraw = draws.indexOf(currentBoard[row][column]);
            if (lastDraw < currentDraw) {
              lastDraw = currentDraw;
            }
          }
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
        }
      }
    }
  });

  await events.once(rl, "close");

  console.log("row board", rowBingoBoard);
  console.log("row draw", rowBingoDraw);
  console.log("row", rowBingo);
  console.log("column board", columnBingoBoard);
  console.log("column draw", columnBingoDraw);
  console.log("column", columnBingo);

  let result;
  if (rowBingoDraw < columnBingoDraw) {
    const sum = rowBingoBoard.reduce(
      (prev, curr) =>
        curr.reduce((prev, curr) => {
          let currIndex = draws.indexOf(curr);
          if (currIndex <= rowBingoDraw) {
            return prev;
          }
          return prev + Number(curr);
        }, 0) + prev,
      0
    );
    result = sum * draws[rowBingoDraw];
  } else {
    const sum = columnBingoBoard.reduce(
      (prev, curr) =>
        curr.reduce((prev, curr) => {
          let currIndex = draws.indexOf(curr);
          if (currIndex <= columnBingoDraw) {
            return prev;
          }
          return prev + Number(curr);
        }, 0) + prev,
      0
    );
    result = sum * draws[columnBingoDraw];
  }

  fs.writeFileSync("data.out", result.toString());

  console.log(result);
})();
