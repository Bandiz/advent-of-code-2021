const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const seamap = [];
  const faceEast = [];
  const faceSouth = [];
  const emptySpots = [];

  rl.on("line", (line) => {
    seamap.push(line);
    const y = seamap.length - 1;

    for (let x = 0; x < line.length; x++) {
      const spot = { x, y };
      switch (line[x]) {
        case ">":
          faceEast.push(spot);
          break;
        case "v":
          faceSouth.push(spot);
          break;
        default:
          emptySpots.push(spot);
          break;
      }
    }
  });

  await events.once(rl, "close");

  function findDeadEnd(seamap, east, south, empty) {
    let step = 0;

    let hasMoved = true;

    while (hasMoved) {
      let dEast = [],
        dSouth = [];
      let movedEast = [];
      let movedSouth = [];

      step++;

      for (const cucumber of east) {
        const x = cucumber.x + 1 == seamap[0].length ? 0 : cucumber.x + 1;
        const emptySlotIndex = empty.findIndex(
          (spot) => spot.x == x && spot.y == cucumber.y
        );
        const movedThisStep = movedEast.some(
          (spot) => spot.x == x && spot.y == cucumber.y
        );

        if (emptySlotIndex == -1 || movedThisStep) {
          dEast.push(cucumber);
        } else {
          const emptySlot = empty.splice(emptySlotIndex, 1)[0];
          dEast.push(emptySlot);
          empty.push(cucumber);
          movedEast.push(cucumber);
        }
      }

      for (const cucumber of south) {
        const y = cucumber.y + 1 == seamap.length ? 0 : cucumber.y + 1;
        const emptySlotIndex = empty.findIndex(
          (spot) => spot.x == cucumber.x && spot.y == y
        );

        if (
          emptySlotIndex == -1 ||
          movedSouth.some((spot) => spot.x == cucumber.x && spot.y == y)
        ) {
          dSouth.push(cucumber);
        } else {
          const emptySlot = empty.splice(emptySlotIndex, 1)[0];
          dSouth.push(emptySlot);
          empty.push(cucumber);
          movedSouth.push(cucumber);
        }
      }

      east = dEast;
      south = dSouth;

      hasMoved = Boolean(movedEast.length || movedSouth.length);

      if (!hasMoved) {
        console.log(`-----${step}------`);
        const arr = new Array(seamap.length)
          .fill(0)
          .map((_) => new Array(seamap[0].length).fill("."));
        east.forEach(({ x, y }) => (arr[y][x] = ">"));
        south.forEach(({ x, y }) => (arr[y][x] = "v"));
        for (const row of arr) {
          console.log(row.join(""));
        }
        console.log();
      }
    }

    return step;
  }

  let resultPart1 = findDeadEnd(seamap, faceEast, faceSouth, emptySpots);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
