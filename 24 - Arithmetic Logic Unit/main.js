const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const commands = [];
  const programs = [];
  let currentProgram = [];

  rl.on("line", (line) => {
    const parts = line.split(" ");
    const command = { type: parts[0] };

    switch (parts[0]) {
      case "inp":
        if (currentProgram.length) {
          programs.push(currentProgram);
          currentProgram = [];
        }
        command.op1 = parts[1];
        break;
      default:
        command.op2 = parseOperand(parts[2]);
        command.op1 = parts[1];
        break;
    }
    currentProgram.push(command);
    commands.push(command);

    function parseOperand(value) {
      return isNaN(value) ? value : parseInt(value);
    }
  });

  await events.once(rl, "close");

  programs.push(currentProgram);

  function findLargestMONAD(restraints) {
    const numbers = new Array(9).fill().map((_, i) => i + 1);
    const maxMonad = new Array(14).fill(0);

    restraints.forEach(({ left, right, value }) => {
      const rightValue = numbers
        .filter((n) => n + value >= 1 && n + value <= 9)
        .reduce((a, b) => Math.max(a, b));
      const leftValue = rightValue + value;
      maxMonad[left] = leftValue;
      maxMonad[right] = rightValue;
    });

    return maxMonad.join("");
  }

  function findSmallestMONAD(restraints) {
    const numbers = new Array(9).fill().map((_, i) => i + 1);
    const minMonad = new Array(14).fill(0);

    restraints.forEach(({ left, right, value }) => {
      const rightValue = numbers
        .filter((n) => n + value >= 1 && n + value <= 9)
        .reduce((a, b) => Math.min(a, b));
      const leftValue = rightValue + value;
      minMonad[left] = leftValue;
      minMonad[right] = rightValue;
    });

    return minMonad.join("");
  }

  function getRestraints(programs) {
    const stack = [];
    const restraints = [];

    for (let p = 0; p < programs.length; p++) {
      const program = programs[p];
      const isPush = program[4].op2 == 1;
      const x = program[5].op2;
      const y = program[15].op2;

      if (isPush) {
        stack.push({ y, p });
      } else {
        const head = stack.pop();
        restraints.push({ left: p, right: head.p, value: head.y + x });
      }
    }

    return restraints;
  }

  const restraints = getRestraints(programs);

  let resultPart1 = findLargestMONAD(restraints);
  let resultPart2 = findSmallestMONAD(restraints);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
