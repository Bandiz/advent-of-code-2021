const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const readings = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    const bits = line.split("").map(Number);
    for (let i = 0; i < bits.length; i++) {
      readings[i] += bits[i] > 0 ? 1 : -1;
    }
  });

  await events.once(rl, "close");

  console.log(readings);

  let gamma = parseInt(
    readings.reduce((prev, curr) => `${prev}${curr > 0 ? "1" : "0"}`, ""),
    2
  );
  let epsilon = parseInt(
    readings.reduce((prev, curr) => `${prev}${curr > 0 ? "0" : "1"}`, ""),
    2
  );

  console.log("gamma", gamma);
  console.log("epsilon", epsilon);

  let result = gamma * epsilon;
  fs.writeFileSync("data.out", result.toString());

  console.log(result);
})();
