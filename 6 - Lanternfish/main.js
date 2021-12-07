const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  let fishQueue = new Array(9).fill(0);

  rl.on("line", (line) => {
    let fishes = line.split(",").map(Number);
    for (let i = 0; i < fishes.length; i++) {
      fishQueue[fishes[i]]++;
    }
  });

  function simulatePopulationGrowth(days) {
    for (let day = 0; day < days; day++) {
      const newFish = fishQueue.shift();
      fishQueue.push(0);
     
      fishQueue[6] += newFish;
      fishQueue[8] = newFish;   
    }

    return fishQueue.reduce((prev, curr) => prev + curr, 0);
  }

  await events.once(rl, "close");

  let resultPart1 = simulatePopulationGrowth(80);
  let resultPart2 = simulatePopulationGrowth(256);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
