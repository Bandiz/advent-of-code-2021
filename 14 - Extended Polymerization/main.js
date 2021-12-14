const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  let polymerTemplate = [];
  const pairInsertions = {};
  let separator = 0;

  rl.on("line", (line) => {
    if (!line) {
      separator++;
    } else if (separator) {
      const [key, value] = line.split(" -> ");
      pairInsertions[key] = value;
    } else {
      polymerTemplate.push(...line.split(""));
    }
  });

  await events.once(rl, "close");

  function calculateOccurances(polymerTemplate, pairInsertions, steps = 10) {
    let stepSequence = [...polymerTemplate];

    for (let step = 0; step < steps; step++) {
      for (let x1 = 0, x2 = 1; x2 < stepSequence.length; x1++, x2++) {
        const combination = `${stepSequence[x1]}${stepSequence[x2]}`;
        const insertion = pairInsertions[combination];
        if (typeof insertion !== "undefined") {
          stepSequence.splice(x2, 0, insertion);
          x1++;
          x2++;
        }
      }
    }
    const lookup = stepSequence.reduce((prev, curr) => {
      prev[curr] = ++prev[curr] || 1;
      return prev;
    }, {});
    const values = Object.values(lookup);
    const min = values.reduce((a, b) => Math.min(a, b));
    const max = values.reduce((a, b) => Math.max(a, b));
    return max - min;
  }

  let resultPart1 = calculateOccurances(polymerTemplate, pairInsertions);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
