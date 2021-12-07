const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  let crabsMap = {};

  rl.on("line", (line) => {
    let crabs = line.split(",").map(Number);
    for (let i = 0; i < crabs.length; i++) {
      crabsMap[crabs[i]] = ++crabsMap[crabs[i]] || 1;
    }
  });

  await events.once(rl, "close");

  function calculateAlignmentFuelPart1() {
    let fuel = Number.MAX_VALUE;

    for (const position in crabsMap) {
      let currentFuel = 0;
      for (const position2 in crabsMap) {
        const crabCount = crabsMap[position2];
        const positionDiff = Math.abs(position2 - position);
        currentFuel += positionDiff * crabCount;
      }
      if (fuel > currentFuel) {
        fuel = currentFuel;
      }
    }
    return fuel;
  }

  function calculateAlignmentFuelPart2() {
    let fuel = Number.MAX_VALUE;
    const keys = Object.keys(crabsMap).map(Number);

    for (let position = keys[0]; position < keys[keys.length - 1]; position++) {
      let currentFuel = 0;
      for (const position2 in crabsMap) {
        const crabCount = crabsMap[position2];
        const positionDiff = Math.abs(position2 - position);
        let accumulateFuel = 0;
        for (let i = 1; i <= positionDiff; i++) {
          accumulateFuel += i;
        }
        currentFuel += accumulateFuel * crabCount;
      }
      if (fuel > currentFuel) {
        fuel = currentFuel;
      }
    }
    return fuel;
  }

  let resultPart1 = calculateAlignmentFuelPart1();
  let resultPart2 = calculateAlignmentFuelPart2();

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
