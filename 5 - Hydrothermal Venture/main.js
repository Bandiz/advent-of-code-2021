const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  let pointMap = {};

  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    const [point1, point2] = line.split(" -> ");
    const [x1, y1] = point1.split(",").map(Number);
    const [x2, y2] = point2.split(",").map(Number);

    if (x1 == x2 || y1 == y2) {
      if (x1 >= x2 && y1 <= y2) {
        for (let x = x2; x <= x1; x++) {
          for (let y = y1; y <= y2; y++) {
            const point = `${x}, ${y}`;
            if (pointMap.hasOwnProperty(point)) {
              pointMap[point]++;
            } else {
              pointMap[point] = 1;
            }
          }
        }
      } else if (x1 >= x2 && y1 >= y2) {
        for (let x = x2; x <= x1; x++) {
          for (let y = y2; y <= y1; y++) {
            const point = `${x}, ${y}`;
            if (pointMap.hasOwnProperty(point)) {
              pointMap[point]++;
            } else {
              pointMap[point] = 1;
            }
          }
        }
      } else if (x1 <= x2 && y1 <= y2) {
        for (let x = x1; x <= x2; x++) {
          for (let y = y1; y <= y2; y++) {
            const point = `${x}, ${y}`;
            if (pointMap.hasOwnProperty(point)) {
              pointMap[point]++;
            } else {
              pointMap[point] = 1;
            }
          }
        }
      } else if (x1 <= x2 && y1 >= y2) {
        for (let x = x1; x <= x2; x++) {
          for (let y = y2; y <= y1; y++) {
            const point = `${x}, ${y}`;
            if (pointMap.hasOwnProperty(point)) {
              pointMap[point]++;
            } else {
              pointMap[point] = 1;
            }
          }
        }
      }
    }
  });

  await events.once(rl, "close");

  // console.log("map", JSON.stringify(pointMap, null, 4));

  let resultPart1 = 0;
  let resultPart2 = 0;

  for (const point in pointMap) {
    if (pointMap[point] >= 2) resultPart1++;
  }

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
