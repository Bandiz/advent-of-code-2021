const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  let polymerTemplate;
  const pairInsertions = {};
  let separator = 0;

  rl.on("line", (line) => {
    if (!line) {
      separator++;
    } else if (separator) {
      const [key, value] = line.split(" -> ");
      pairInsertions[key] = value;
    } else {
      polymerTemplate = line;
    }
  });

  await events.once(rl, "close");

  function calculateOccurances(polymerTemplate, pairInsertions, steps) {
    let pairSum = {};

    for (let x1 = 0, x2 = 1; x2 < polymerTemplate.length; x1++, x2++) {
      const polymer = polymerTemplate[x1] + polymerTemplate[x2];
      pairSum[polymer] = ++pairSum[polymer] || 1;
    }

    for (let step = 0; step < steps; step++) {
      const newPairSum = {};
      for (const [key, value] of Object.entries(pairSum)) {
        const insertion = pairInsertions[key];
        const pair1 = key[0] + insertion,
          pair2 = insertion + key[1];
        newPairSum[pair1] = (newPairSum[pair1] ?? 0) + value;
        newPairSum[pair2] = (newPairSum[pair2] ?? 0) + value;
      }
      pairSum = newPairSum;
    }
    console.log(pairSum);

    const seqSum = Object.entries(pairSum).reduce((prev, [key, value]) => {
      prev[key[0]] = (prev[key[0]] ?? 0) + value;
      prev[key[1]] = (prev[key[1]] ?? 0) + value;
      return prev;
    }, {});

    console.log(seqSum);

    const values = Object.values(seqSum);
    const min = Math.ceil(values.reduce((a, b) => Math.min(a, b)) / 2);
    const max = Math.ceil(values.reduce((a, b) => Math.max(a, b)) / 2);
    return max - min;
  }

  let resultPart1 = calculateOccurances(polymerTemplate, pairInsertions, 10);
  let resultPart2 = calculateOccurances(polymerTemplate, pairInsertions, 40);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
