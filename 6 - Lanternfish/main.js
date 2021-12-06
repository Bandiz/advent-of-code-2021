const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  class Lanternfish {
    #cycle;
    constructor(cycle = 8) {
      this.#cycle = Number(cycle);
    }

    advanceDay() {
      if (this.#cycle == 0) {
        this.#cycle = 6;
      } else {
        this.#cycle--;
      }
    }

    createFish() {
      if (this.#cycle == 0) {
        return new Lanternfish();
      }
      return null;
    }
  }

  let fishes;

  rl.on("line", (line) => {
    fishes = line.split(",").map(x => new Lanternfish(x));
  });

  function simulatePart1(currentDay, endDay, fishes) {
    if (currentDay == endDay) return fishes.length;
    let deltaFish = [];
    for (let i = 0; i < fishes.length; i++) {
      let fish = fishes[i];
      deltaFish.push(fish);
      const newFish = fish.createFish();
      if (newFish) deltaFish.push(newFish);
      fish.advanceDay();
    }
    return simulatePart1(++currentDay, endDay, deltaFish);
  }

  await events.once(rl, "close");

  let resultPart1 = simulatePart1(0, 80, fishes);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
