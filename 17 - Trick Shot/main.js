const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const target = {};

  rl.on("line", (line) => {
    const regExp = new RegExp(
      /target area: x=(\d+)\.\.(\d+), y=(-?\d+)\.\.(-?\d+)/g
    );
    const groups = regExp.exec(line);
    target.x1 = parseInt(groups[1]);
    target.x2 = parseInt(groups[2]);
    target.y1 = parseInt(groups[3]);
    target.y2 = parseInt(groups[4]);
  });

  await events.once(rl, "close");

  function calculatePeakHeight(area, target) {
    const { x2, y1 } = target;
    let maxHeight = 0;

    for (let xVelocity = 0; xVelocity < x2 + 1; xVelocity++) {
      for (let yVelocity = 0; yVelocity < Math.abs(y1); yVelocity++) {
        const velocity = { x: xVelocity, y: yVelocity };
        const position = { x: 0, y: 0 };
        let highestPoint = 0;

        while (true) {
          position.x += velocity.x;
          position.y += velocity.y;
          highestPoint = Math.max(highestPoint, position.y);

          if (velocity.x > 0) velocity.x--;
          velocity.y--;

          if (position.x > x2 || position.y < y1) {
            break;
          }
          
          if (area.some(({ x, y }) => x == position.x && y == position.y)) {
            break;
          }
        }
        maxHeight = Math.max(maxHeight, highestPoint);
      }
    }

    return maxHeight;
  }

  function prepareTargetArea(target) {
    const area = [];
    const { x1, y1, x2, y2 } = target;

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        area.push({ x, y });
      }
    }
    return area;
  }

  const targetArea = prepareTargetArea(target);

  let resultPart1 = calculatePeakHeight(targetArea, target);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
