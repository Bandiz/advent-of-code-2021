const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const input = [];

  rl.on("line", (line) => {
    const [segmentsPart, outputPart] = line.split("|");
    input.push({
      segments: segmentsPart.split(" ").filter(Boolean),
      output: outputPart.split(" ").filter(Boolean),
    });
  });

  await events.once(rl, "close");

  function calculatePart1() {
    const searchLengths = [2, 3, 4, 7];
    let result = 0;
    for (const { output } of input) {
      for (const segment of output) {
        if (searchLengths.includes(segment.length)) {
          result++;
        }
      }
    }
    return result;
  }

  let resultPart1 = calculatePart1();
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
