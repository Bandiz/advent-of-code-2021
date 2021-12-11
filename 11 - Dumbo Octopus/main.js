const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const octopusArray = [];

  rl.on("line", (line) => {
    octopusArray.push(line.split("").map(Number));
  });

  await events.once(rl, "close");

  function calculateFlashes(octopusArray, steps = 100) {
    let flashes = 0;

    function includesPoint(stepFlashes, { x, y }) {
      return stepFlashes.some((point) => point.x == x && point.y == y);
    }

    function chainFlashes(stepFlashes, point) {
      const { x, y } = point;
      octopusArray[y][x] = 0;
      stepFlashes.push(point);
      let right =
          x + 1 == octopusArray[y].length ||
          includesPoint(stepFlashes, { x: x + 1, y })
            ? null
            : { x: x + 1, y },
        left =
          x - 1 < 0 || includesPoint(stepFlashes, { x: x - 1, y })
            ? null
            : { x: x - 1, y },
        up =
          y - 1 < 0 || includesPoint(stepFlashes, { x, y: y - 1 })
            ? null
            : { x, y: y - 1 },
        down =
          y + 1 == octopusArray.length ||
          includesPoint(stepFlashes, { x, y: y + 1 })
            ? null
            : { x, y: y + 1 },
        upLeft =
          x - 1 < 0 ||
          y - 1 < 0 ||
          includesPoint(stepFlashes, { x: x - 1, y: y - 1 })
            ? null
            : { x: x - 1, y: y - 1 },
        upRight =
          x + 1 == octopusArray[y].length ||
          y - 1 < 0 ||
          includesPoint(stepFlashes, { x: x + 1, y: y - 1 })
            ? null
            : { x: x + 1, y: y - 1 },
        downLeft =
          y + 1 == octopusArray.length ||
          x - 1 < 0 ||
          includesPoint(stepFlashes, { x: x - 1, y: y + 1 })
            ? null
            : { x: x - 1, y: y + 1 },
        downRight =
          y + 1 == octopusArray.length ||
          x + 1 == octopusArray[y + 1].length ||
          includesPoint(stepFlashes, {
            x: x + 1,
            y: y + 1,
          })
            ? null
            : {
                x: x + 1,
                y: y + 1,
              };
      const adjacent = [
        upLeft,
        up,
        upRight,
        left,
        right,
        downLeft,
        down,
        downRight,
      ].filter(Boolean);

      for (let adjacentPoint of adjacent) {
        const { x, y } = adjacentPoint;

        if (stepFlashes.find((point) => point.x == x && point.y == y)) {
          continue;
        }
        if (octopusArray[y][x] == 9) {
          chainFlashes(stepFlashes, adjacentPoint);
        } else {
          octopusArray[y][x]++;
        }
      }
    }

    for (let step = 0; step < steps; step++) {
      const stepFlashes = [];
      for (let y = 0; y < octopusArray.length; y++) {
        for (let x = 0; x < octopusArray[y].length; x++) {
          if (stepFlashes.find((point) => point.x == x && point.y == y)) {
            continue;
          }
          if (octopusArray[y][x] == 9) {
            const point = { x, y };
            chainFlashes(stepFlashes, point);
          } else {
            octopusArray[y][x]++;
          }
        }
      }
      flashes += stepFlashes.length;
    }

    return flashes;
  }

  let resultPart1 = calculateFlashes(octopusArray);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
