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

  function calculateAlignmentFuel() {
    let fuel = Number.MAX_VALUE;

    for (const position in crabsMap) {
      let currentFuel = 0;
      for (const position2 in crabsMap) {
        const crabCount2 = crabsMap[position2];
        const positionDiff = Math.abs(position2 - position);
        currentFuel += positionDiff * crabCount2;
      }
      if (fuel > currentFuel) {
        fuel = currentFuel;
      }
    }
    return fuel;
  }

  let resultPart1 = calculateAlignmentFuel();
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
