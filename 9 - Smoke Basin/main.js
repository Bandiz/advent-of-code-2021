const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const ground = [];

  rl.on("line", (line) => {
    const points = line.split("").map(Number);
    ground.push(points);
  });

  await events.once(rl, "close");

  function calculateRiskLevel(ground) {
    const lowPoints = [];

    for (let y = 0; y < ground.length; y++) {
      for (let x = 0; x < ground[y].length; x++) {
        const focusedPoint = ground[y][x];
        let right = x + 1 == ground[y].length ? 10 : ground[y][x + 1],
          left = x - 1 < 0 ? 10 : ground[y][x - 1],
          up = y - 1 < 0 ? 10 : ground[y - 1][x],
          down = y + 1 == ground.length ? 10 : ground[y + 1][x];

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

  function calculateLargestBasins(ground) {
    let largest = [],
      larger = [],
      large = [];
    const visitedPoints = {};

    function addPoint(point, basin) {
      const { x, y } = point;
      if (!visitedPoints[y]) {
        visitedPoints[y] = [x];
      } else {
        visitedPoints[y].push(x);
      }
      if (!basin.find((p) => p.x === x && p.y === y)) {
        basin.push(point);
      }
    }

    function includesPoint({ y, x }) {
      if (visitedPoints[y] && visitedPoints[y].includes(x)) {
        return true;
      }
      return false;
    }

    function scanBasin(point, basin = []) {
      const { x, y } = point;

      if (includesPoint(point)) {
        return [];
      }

      const availablePoints = [
        x + 1 == ground[y].length || ground[y][x + 1] == 9
          ? null
          : { x: x + 1, y },
        x - 1 < 0 || ground[y][x - 1] == 9 ? null : { x: x - 1, y },
        y - 1 < 0 || ground[y - 1][x] == 9 ? null : { x, y: y - 1 },
        y + 1 == ground.length || ground[y + 1][x] == 9
          ? null
          : {
              x,
              y: y + 1,
            },
      ].filter(Boolean);

      addPoint(point, basin);

      for (const availablePoint of availablePoints) {
        scanBasin(availablePoint, basin);
      }

      return basin;
    }

    for (let y = 0; y < ground.length; y++) {
      for (let x = 0; x < ground[y].length; x++) {
        const point = { x, y };
        if (ground[y][x] == 9 || includesPoint(point)) {
          continue;
        }
        const basin = scanBasin(point);

        if (basin.length > large.length) {
          large = basin;
        }
        if (large.length > larger.length) {
          large = larger;
          larger = basin;
        }
        if (larger.length > largest.length) {
          larger = largest;
          largest = basin;
        }
      }
    }
    return large.length * larger.length * largest.length;
  }

  let resultPart1 = calculateRiskLevel(ground);
  let resultPart2 = calculateLargestBasins(ground);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
