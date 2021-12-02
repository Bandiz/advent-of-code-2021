const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  let dx = 0,
    dy = 0,
    aim = 0;
  const commands = {
    forward: (x) => {
      dx += x;
      dy += aim * x;
    },
    up: (y) => {
      aim -= y;
    },
    down: (y) => {
      aim += y;
    },
  };

  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    const [command, amount] = line.split(" ");
    commands[command](Number(amount));
  });

  await events.once(rl, "close");

  let result = dx * dy;
  fs.writeFileSync("data.out", result.toString());

  console.log("x", dx);
  console.log("y", dy);
  console.log(result);
})();
