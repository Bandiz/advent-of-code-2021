const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  let pointMapPart1 = {};
  let pointMapPart2 = {};

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
      if (y1 < y2) {
        addPointX(x1, y1, y2, pointMapPart1);
        addPointX(x1, y1, y2, pointMapPart2);
      } else if (y1 > y2) {
        addPointX(x1, y2, y1, pointMapPart1);
        addPointX(x1, y2, y1, pointMapPart2);
      } else if (x1 < x2) {
        addPointY(y1, x1, x2, pointMapPart1);
        addPointY(y1, x1, x2, pointMapPart2);
      } else if (x1 > x2) {
        addPointY(y1, x2, x1, pointMapPart1);
        addPointY(y1, x2, x1, pointMapPart2);
      }
    } else if (x1 >= x2 && y1 >= y2) {
      for (let x = x1 - x2, y = y1 - y2; x >= 0, y >= 0; x--, y--) {
        addPoint(x2 + x, y2 + y, pointMapPart2);
      }
    } else if (x1 >= x2 && y1 <= y2) {
      for (let x = x1 - x2, y = y1; x >= 0, y <= y2; x--, y++) {
        addPoint(x2 + x, y, pointMapPart2);
      }
    } else if (x1 <= x2 && y1 >= y2) {
      for (let x = x1, y = y1 - y2; x <= x2, y >= 0; x++, y--) {
        addPoint(x, y2 + y, pointMapPart2);
      }
    } else if (x1 <= x2 && y1 <= y2) {
      for (let x = x1, y = y1; x <= x2, y <= y2; x++, y++) {
        addPoint(x, y, pointMapPart2);
      }
    }
  });

  function addPointX(x, y1, y2, pointMap) {
    for (let y = y1; y <= y2; y++) {
      addPoint(x, y, pointMap);
    }
  }

  function addPointY(y, x1, x2, pointMap) {
    for (let x = x1; x <= x2; x++) {
      addPoint(x, y, pointMap);
    }
  }

  function addPoint(x, y, pointMap) {
    const point = `${x}, ${y}`;
    if (pointMap.hasOwnProperty(point)) {
      pointMap[point]++;
    } else {
      pointMap[point] = 1;
    }
  }

  await events.once(rl, "close");

  // console.log("map1", JSON.stringify(pointMapPart1, null, 4));
  // console.log("map2", JSON.stringify(pointMapPart2, null, 4));

  let resultPart1 = 0;
  let resultPart2 = 0;

  for (const point in pointMapPart1) {
    if (pointMapPart1[point] >= 2) resultPart1++;
  }

  for (const point in pointMapPart2) {
    if (pointMapPart2[point] >= 2) resultPart2++;
  }

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
