const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const commands = [];

  rl.on("line", (line) => {
    const regex =
      /(on|off) x=((-?\d+)\.\.(-?\d+)),y=((-?\d+)\.\.(-?\d+)),z=((-?\d+)\.\.(-?\d+))/g;
    const [, op, , x1, x2, , y1, y2, , z1, z2] = regex.exec(line);
    commands.push({
      op,
      x1: parseInt(x1),
      x2: parseInt(x2),
      y1: parseInt(y1),
      y2: parseInt(y2),
      z1: parseInt(z1),
      z2: parseInt(z2),
    });
  });

  await events.once(rl, "close");

  function calculateTurnedOnCubes(commands) {
    const onCubes = {};

    for (const { op, x1, x2, y1, y2, z1, z2 } of commands) {
      if (
        (x1 < -50 && x2 < -50) ||
        (x1 > 50 && x2 > 50) ||
        (y1 < -50 && y2 < -50) ||
        (y1 > 50 && y2 > 50) ||
        (z1 < -50 && z2 < -50) ||
        (z1 > 50 && z2 > 50)
      )
        continue;

      const maxX1 = x1 < 0 ? Math.max(-50, x1) : Math.min(50, x1);
      const maxX2 = x2 < 0 ? Math.max(-50, x2) : Math.min(50, x2);
      const maxY1 = y1 < 0 ? Math.max(-50, y1) : Math.min(50, y1);
      const maxY2 = y2 < 0 ? Math.max(-50, y2) : Math.min(50, y2);
      const maxZ1 = z1 < 0 ? Math.max(-50, z1) : Math.min(50, z1);
      const maxZ2 = z2 < 0 ? Math.max(-50, z2) : Math.min(50, z2);

      for (let x = maxX1; x <= maxX2; x++) {
        for (let y = maxY1; y <= maxY2; y++) {
          for (let z = maxZ1; z <= maxZ2; z++) {
            onCubes[[x, y, z]] = op == "on" ? 1 : 0;
          }
        }
      }
    }
    return Object.values(onCubes).reduce((prev, curr) => prev + curr, 0);
  }

  let resultPart1 = calculateTurnedOnCubes(commands);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
