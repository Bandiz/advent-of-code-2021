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

  function calculateLimitedTurnedOnCubes(commands) {
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

  function calculateAllTurnedOnCubes(commands) {
    let onCuboids = [];

    for (const command of commands) {
      const { op, x1, x2, y1, y2, z1, z2 } = command;
      if (op == "on") {
        turnOnCubes([x1, x2, y1, y2, z1, z2]);
      } else {
        turnOffCubes([x1, x2, y1, y2, z1, z2]);
      }
    }

    return Object.values(onCuboids).reduce((prev, curr) => {
      let sum = 1;
      for (let i1 = 0, i2 = 1; i2 < curr.length; i1 += 2, i2 += 2) {
        const num1 = curr[i1],
          num2 = curr[i2];
        if (num1 < 0 && num2 < 0) {
          sum *= Math.abs(num1) - Math.abs(num2) + 1;
        } else if (num1 < 0 && num2 >= 0) {
          sum *= Math.abs(num1) + num2 + 1;
        } else {
          sum *= num2 - num1 + 1;
        }
      }
      return prev + sum;
    }, 0);

    function turnOffCubes(targetCuboid) {
      const [rx1, rx2, ry1, ry2, rz1, rz2] = targetCuboid;
      const cuboids = [];

      for (const cuboid of onCuboids) {
        const [x1, x2, y1, y2, z1, z2] = cuboid;
        const intersectX = intersect(x1, x2, rx1, rx2);
        const intersectY = intersect(y1, y2, ry1, ry2);
        const intersectZ = intersect(z1, z2, rz1, rz2);
        const intersection = [...intersectX, ...intersectY, ...intersectZ];

        if (intersection.length == 6) {
          cuboids.push(...exclude(intersection, cuboid));
        } else {
          cuboids.push(cuboid);
        }
      }
      onCuboids = cuboids;
    }

    function turnOnCubes(targetCuboid) {
      let cuboids = [targetCuboid];

      for (const [x1, x2, y1, y2, z1, z2] of onCuboids) {
        const newRanges = [];

        for (const cuboid of cuboids) {
          const [rx1, rx2, ry1, ry2, rz1, rz2] = cuboid;
          const intersectX = intersect(x1, x2, rx1, rx2);
          const intersectY = intersect(y1, y2, ry1, ry2);
          const intersectZ = intersect(z1, z2, rz1, rz2);
          const intersection = [...intersectX, ...intersectY, ...intersectZ];

          if (intersection.length == 6) {
            const crossSection = exclude(intersection, cuboid);
            newRanges.push(...crossSection);
          } else {
            newRanges.push(cuboid);
          }
        }
        cuboids = newRanges;
      }

      cuboids.forEach((newRange) => onCuboids.push(newRange));
    }

    function intersect(x1, x2, rx1, rx2) {
      const intersection = [];

      if (x1 <= rx1 && rx1 <= x2 && x2 <= rx2) {
        intersection.push(rx1, x2);
      } else if (rx1 <= x1 && x2 <= rx2) {
        intersection.push(x1, x2);
      } else if (rx1 <= x1 && x1 <= rx2) {
        intersection.push(x1, rx2);
      } else if (x1 <= rx1 && rx2 <= x2) {
        intersection.push(rx1, rx2);
      }

      return intersection;
    }

    function exclude(cuboid1, cuboid2) {
      const [x1, x2, y1, y2, z1, z2] = cuboid1;
      const [rx1, rx2, ry1, ry2, rz1, rz2] = cuboid2;
      const exclusion = [];

      if (rx1 < x1) exclusion.push([rx1, x1 - 1, ry1, ry2, rz1, rz2]);
      if (rx2 > x2) exclusion.push([x2 + 1, rx2, ry1, ry2, rz1, rz2]);
      if (ry1 < y1) exclusion.push([x1, x2, ry1, y1 - 1, rz1, rz2]);
      if (ry2 > y2) exclusion.push([x1, x2, y2 + 1, ry2, rz1, rz2]);
      if (rz1 < z1) exclusion.push([x1, x2, y1, y2, rz1, z1 - 1]);
      if (rz2 > z2) exclusion.push([x1, x2, y1, y2, z2 + 1, rz2]);

      return exclusion;
    }
  }

  let resultPart1 = calculateLimitedTurnedOnCubes(commands);
  let resultPart2 = calculateAllTurnedOnCubes(commands);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
