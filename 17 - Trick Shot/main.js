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

  function simulateVelocities(target) {
    const { x1, y1, x2, y2 } = target;
    let maxHeight = 0;
    let hits = 0;

    for (let xVelocity = 0; xVelocity < x2 + 1; xVelocity++) {
      for (let yVelocity = y1; yVelocity < Math.abs(y1); yVelocity++) {
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

          if (
            x1 <= position.x &&
            position.x <= x2 &&
            y1 <= position.y &&
            position.y <= y2
          ) {
            hits++;
            break;
          }
        }
        maxHeight = Math.max(maxHeight, highestPoint);
      }
    }

    return { maxHeight, hits };
  }

  const results = simulateVelocities(target);

  let resultPart1 = results.maxHeight;
  let resultPart2 = results.hits;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
