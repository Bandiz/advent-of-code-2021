const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  let increases = 0;
  let lastSum = null;
  let sum = 0;
  let measurements = [];

  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    const num = Number(line);
    measurements.push(num);

    if (measurements.length > 3) 
    {
        measurements.shift();
    }
    if (measurements.length == 3) {
        sum = measurements.reduce((prev, curr) => curr + prev, 0);

        if (lastSum !== null && lastSum < sum) {
          increases++;
        }
        lastSum = sum;
    }

   
  });

  await events.once(rl, "close");

  fs.writeFileSync('data.out', increases.toString());

  console.log(increases);
})();
