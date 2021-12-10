const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const lines = [];

  rl.on("line", (line) => {
    lines.push(line);
  });

  await events.once(rl, "close");

  function isOpener(symbol) {
    return symbol == "(" || symbol == "[" || symbol == "{" || symbol == "<";
  }

  function getCloser(symbol) {
    switch (symbol) {
      case "(":
        return ")";
      case "[":
        return "]";
      case "{":
        return "}";
      case "<":
        return ">";
    }
    throw new Error(`Unexpected input: '${symbol}'`);
  }

  function scoreErrors(lines) {
    const illegalCharCount = {
      ")": 0,
      "]": 0,
      "}": 0,
      ">": 0,
    };

    for (let line = 0; line < lines.length; line++) {
      const nextCloser = [];
      for (let i = 0; i < lines[line].length; i++) {
        if (isOpener(lines[line][i])) {
          nextCloser.push(getCloser(lines[line][i]));
          continue;
        }
        if (nextCloser[nextCloser.length - 1] !== lines[line][i]) {
          illegalCharCount[lines[line][i]]++;
          break;
        } else {
          nextCloser.pop();
        }
      }
    }

    return (
      illegalCharCount[")"] * 3 +
      illegalCharCount["]"] * 57 +
      illegalCharCount["}"] * 1197 +
      illegalCharCount[">"] * 25137
    );
  }

  function scoreCompletion(lines) {
    let scores = [];

    for (let line = 0; line < lines.length; line++) {
      const nextCloser = [];
      let isValid = true;
      for (let i = 0; i < lines[line].length; i++) {
        if (isOpener(lines[line][i])) {
          nextCloser.push(getCloser(lines[line][i]));
          continue;
        }
        if (nextCloser[nextCloser.length - 1] !== lines[line][i]) {
          isValid = false;
          break;
        } else {
          nextCloser.pop();
        }
      }
      if (isValid) {
        const score = nextCloser
          .reverse()
          .reduce(
            (prev, curr) =>
              5 * prev +
              (curr == ")" ? 1 : curr == "]" ? 2 : curr == "}" ? 3 : 4),
            0
          );
        scores.push(score);
      }
    }
    scores.sort((a, b) => a - b);

    return scores[Math.floor(scores.length / 2)];
  }

  let resultPart1 = scoreErrors(lines);
  let resultPart2 = scoreCompletion(lines);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
