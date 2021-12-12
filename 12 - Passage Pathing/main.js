const events = require("events");
const fs = require("fs");
const path = require("path/posix");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const cave = {};

  rl.on("line", (line) => {
    const [a, b] = line.split("-");
    if (typeof cave[a] === "undefined") {
      cave[a] = [b];
    } else {
      cave[a].push(b);
    }
    if (typeof cave[b] === "undefined") {
      cave[b] = [a];
    } else {
      cave[b].push(a);
    }
  });

  await events.once(rl, "close");

  function calculateNumberOfPaths(cave) {
    const start = cave["start"];
    const end = "end";

    function findPaths(start, end, visitedPath = []) {
      const paths = [];
      for (const node of start) {
        if (node == "start") continue;
        if (node == end) {
          paths.push([...visitedPath, end]);
          continue;
        }
        if (visitedPath.includes(node)) {
          const isOneWay = node.charCodeAt(0) >= 97;
          if (isOneWay)
            //dead end
            continue;
        }
        const newStart = cave[node];
        paths.push(...findPaths(newStart, end, [...visitedPath, node]));
      }
      return paths;
    }

    const paths = findPaths(start, end);

    return paths.length;
  }

  console.log(cave);

  let resultPart1 = calculateNumberOfPaths(cave);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
