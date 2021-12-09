const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const basin = [];

  rl.on("line", (line) => {
    const points = line.split("").map(Number);
    basin.push(points);
  });

  await events.once(rl, "close");

  function calculateRiskLevel(basin) {
    const lowPoints = [];

    for (let y = 0; y < basin.length; y++) {
      for (let x = 0; x < basin[y].length; x++) {
        const focusedPoint = basin[y][x];
        let right = x + 1 == basin[y].length ? 10 : basin[y][x + 1],
          left = x - 1 < 0 ? 10 : basin[y][x - 1],
          up = y - 1 < 0 ? 10 : basin[y - 1][x],
          down = y + 1 == basin.length ? 10 : basin[y + 1][x];

        if (
          right > focusedPoint &&
          left > focusedPoint &&
          up > focusedPoint &&
          down > focusedPoint
        ) {
          lowPoints.push(focusedPoint);
        }
      }
    }

    return lowPoints.reduce((prev, curr) => prev + curr + 1, 0);
  }

  let resultPart1 = calculateRiskLevel(basin);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
