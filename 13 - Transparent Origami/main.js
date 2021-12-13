const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const paper = {};
  const instructions = [];
  const paperLimits = {
    maxX: 0,
    maxY: 0,
  };
  let separator = 0;

  rl.on("line", (line) => {
    if (!line) {
      separator++;
    } else if (separator) {
      const [axis, offset] = line.substring(11).split("=");
      instructions.push({ axis, offset: Number.parseInt(offset) });
    } else {
      const [x, y] = line.split(",").map(Number);
      if (typeof paper[y] === "undefined") {
        paper[y] = [x];
      } else {
        paper[y].push(x);
      }
      if (x > paperLimits.maxX) {
        paperLimits.maxX = x;
      }
      if (y > paperLimits.maxY) {
        paperLimits.maxY = y;
      }
    }
  });

  await events.once(rl, "close");

  console.log(paper);
  console.log(instructions);

  function foldByAxisY(paper, paperLimits, offset) {
    const { maxY } = paperLimits;

    delete paper[offset];

    for (let y1 = offset + 1, y2 = offset - 1; y1 <= maxY; y1++, y2--) {
      if (typeof paper[y1] === "undefined") {
        delete paper[y1];
        continue;
      }
      if (typeof paper[y2] === "undefined") {
        paper[y2] = paper[y1];
        delete paper[y1];
        continue;
      }
      for (const x of paper[y1]) {
        if (paper[y2].includes(x)) continue;
        paper[y2].push(x);
      }
      delete paper[y1];
    }
    const i = paperLimits.maxY % 2 == 0 ? 1 : 0;
    paperLimits.maxY = Math.floor(paperLimits.maxY / 2) - i;
  }

  function foldByAxisX(paper, paperLimits, offset) {
    const { maxX } = paperLimits;
    for (const y in paper) {
      for (let x1 = offset + 1, x2 = offset - 1; x1 <= maxX; x1++, x2--) {
        if (!paper[y].includes(x1)) continue;

        const oppositeValue = maxX - x1;
        paper[y].splice(paper[y].indexOf(x1), 1);

        if (paper[y].includes(oppositeValue)) continue;

        paper[y].push(oppositeValue);
      }
    }
    const i = paperLimits.maxX % 2 == 0 ? 1 : 0;
    paperLimits.maxX = Math.floor(paperLimits.maxX / 2) - i;
  }

  function executeInstruction(paper, paperLimits, instruction) {
    const { axis, offset } = instruction;
    if (axis === "y") {
      foldByAxisY(paper, paperLimits, offset);
    } else {
      foldByAxisX(paper, paperLimits, offset);
    }
  }

  function calculateFirstFoldPoints(paper, paperLimits, instructions) {
    const instruction = instructions.shift();
    executeInstruction(paper, paperLimits, instruction);

    return Object.values(paper).reduce((prev, curr) => prev + curr.length, 0);
  }

  function finishInstructions(paper, paperLimits, instructions) {
    for (const instruction of instructions) {
      executeInstruction(paper, paperLimits, instruction);
    }
    return `\n${printPaper(paper, paperLimits)}`;
  }

  function printPaper(paper, paperLimits) {
    const { maxX, maxY } = paperLimits;
    const lines = [];
    for (let y = 0; y <= maxY; y++) {
      const line = [];
      for (let x = 0; x <= maxX; x++) {
        typeof paper[y] === "undefined" || !paper[y].includes(x)
          ? line.push(".")
          : line.push("#");
      }
      lines.push(line.join(""));
    }
    return lines.join("\n");
  }

  let resultPart1 = calculateFirstFoldPoints(paper, paperLimits, instructions);
  let resultPart2 = finishInstructions(paper, paperLimits, instructions);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
