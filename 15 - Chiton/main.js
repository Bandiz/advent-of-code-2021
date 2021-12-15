const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const maze = [];

  rl.on("line", (line) => {
    maze.push(line.split("").map(Number));
  });

  await events.once(rl, "close");

  function getLowestScore(maze) {
    const end = { x: maze[0].length - 1, y: maze.length - 1 };
    const path = [];
    const minHeap = [];

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        minHeap.push({ x, y, value: Number.MAX_VALUE });
      }
    }
    minHeap[0].value = 0;

    while (minHeap.length > 0) {
      const start = minHeap.shift();
      const { x, y } = start;
      const right =
          x + 1 == maze[y].length
            ? null
            : minHeap.find((p) => p.x == x + 1 && p.y == y),
        left = x - 1 < 0 ? null : minHeap.find((p) => p.x == x - 1 && p.y == y),
        up = y - 1 < 0 ? null : minHeap.find((p) => p.x == x && p.y == y - 1),
        down =
          y + 1 == maze.length
            ? null
            : minHeap.find((p) => p.x == x && p.y == y + 1);
      const adjacentNodes = [right, left, up, down].filter(Boolean);

      adjacentNodes.forEach((node) => {
        if (start.value + maze[node.y][node.x] < node.value) {
          node.value = start.value + maze[node.y][node.x];
        }

        minHeap.splice(minHeap.indexOf(node), 1);

        let inserted = false;

        for (let i = 0; i < minHeap.length; i++) {
          if (minHeap[i].value > node.value) {
            minHeap.splice(i, 0, node);
            inserted = true;
            break;
          }
        }

        if (!inserted) minHeap.push(node);
      });
      path.push(start);
    }

    return path.find((p) => p.x == end.x && p.y == end.y).value;
  }

  let resultPart1 = getLowestScore(maze);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
