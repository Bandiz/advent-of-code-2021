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
    maze.push(line);
  });

  await events.once(rl, "close");

  function calculateShortestAlignment(maze) {
    const priceMap = {
      A: 1,
      B: 10,
      C: 100,
      D: 1000,
    };
    const amphipodTargetRoomMap = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    };
    const roomEntrances = [];
    const rooms = [];

    for (let x = 0; x < maze[2].length; x++) {
      if (maze[2][x] !== "#") {
        roomEntrances.push(x - 1);
        const room = [];

        for (let y = 2; y < maze.length - 1; y++) {
          room.push(maze[y][x]);
        }

        rooms.push(room);
      }
    }

    const hallway = maze[1]
      .substring(1, maze[1].length - 1)
      .split("")
      .map((h) => (h === "." ? 0 : h));
    const map = [hallway, rooms];
    const states = { [map]: 0 };

    const queue = [map];
    let leastEnergy = Number.MAX_VALUE;

    while (queue.length) {
      const currentMap = queue.shift();
      const [hallway, rooms] = currentMap;
      const currentCost = states[[hallway, rooms]] || 0;

      const isComplete = rooms.reduce(
        (isComplete, room, rIndex) =>
          isComplete &&
          room.every((pod) => amphipodTargetRoomMap[pod] === rIndex),
        true
      );

      if (isComplete) {
        leastEnergy = Math.min(leastEnergy, currentCost);
        continue;
      }

      for (let h = 0; h < hallway.length; h++) {
        const amphipod = hallway[h];
        if (!amphipod) continue;

        const targetRoomIndex = amphipodTargetRoomMap[amphipod];
        const targetRoom = rooms[targetRoomIndex];
        const someEmpty = targetRoom.some((x) => x == 0);
        const allFull = targetRoom.every((x) => x !== 0);
        const allCorrect = targetRoom.every(
          (x) => x == 0 || amphipodTargetRoomMap[x] === targetRoomIndex
        );

        if ((someEmpty && !allCorrect) || allFull) continue;

        const entrance = roomEntrances[targetRoomIndex];
        const step = entrance > h ? 1 : -1;
        let currentPosition = h;
        let isBlocked = false;
        let movementCost = 0;

        while (currentPosition !== entrance) {
          currentPosition += step;
          if (hallway[currentPosition]) {
            isBlocked = true;
            break;
          }
          movementCost += priceMap[amphipod];
        }

        if (isBlocked) continue;

        const lastOpenSpace = rooms[targetRoomIndex].lastIndexOf(0);
        movementCost += (lastOpenSpace + 1) * priceMap[amphipod];

        const newMap = copyMap(currentMap);

        newMap[0][h] = 0;
        newMap[1][targetRoomIndex][lastOpenSpace] = amphipod;

        const newCost = movementCost + currentCost;
        const oldCost = states[[newMap[0], newMap[1]]] || Number.MAX_VALUE;
        if (newCost < oldCost) {
          states[[newMap[0], newMap[1]]] = newCost;
          queue.push(newMap);
        }
      }

      for (let r = 0; r < rooms.length; r++) {
        const currentRoom = rooms[r];
        const someEmpty = currentRoom.some((x) => x == 0);
        const allEmpty = currentRoom.every((x) => x == 0);
        const allCorrect = currentRoom.every(
          (x) => x == 0 || amphipodTargetRoomMap[x] === r
        );

        if ((someEmpty && allCorrect) || allEmpty) continue;

        const roomCopy = [...currentRoom];
        const lastEmpty = currentRoom.lastIndexOf(0);
        const amphipod = currentRoom[lastEmpty + 1];

        roomCopy[lastEmpty + 1] = 0;

        let stepsLeft = lastEmpty + 2;
        let newPosition = roomEntrances[r] - 1;
        let roomsCopy = rooms.map((room, index) =>
          index == r ? roomCopy : room
        );

        while (newPosition >= 0) {
          if (hallway[newPosition]) break;
          stepsLeft++;

          if (roomEntrances.includes(newPosition)) {
            newPosition--;
            continue;
          }

          generateNewMap(
            stepsLeft,
            hallway,
            roomsCopy,
            newPosition,
            amphipod,
            currentCost
          );

          newPosition--;
        }

        let stepsRight = lastEmpty + 2;
        newPosition = roomEntrances[r] + 1;
        roomsCopy = rooms.map((room, index) => (index == r ? roomCopy : room));

        while (newPosition < hallway.length) {
          if (hallway[newPosition]) break;

          stepsRight++;

          if (roomEntrances.includes(newPosition)) {
            newPosition++;
            continue;
          }

          generateNewMap(
            stepsRight,
            hallway,
            roomsCopy,
            newPosition,
            amphipod,
            currentCost
          );

          newPosition++;
        }
      }
    }

    function copyMap(map) {
      return [[...map[0]], map[1].map((r) => [...r])];
    }

    function generateNewMap(
      steps,
      hallway,
      rooms,
      newPosition,
      amphipod,
      currentCost
    ) {
      const newMap = [[...hallway], rooms.map((r) => [...r])];
      newMap[0][newPosition] = amphipod;

      const newCost = steps * priceMap[amphipod] + currentCost;
      const oldCost = states[[newMap[0], newMap[1]]] || Number.MAX_VALUE;
      if (newCost < oldCost) {
        states[[newMap[0], newMap[1]]] = newCost;
        queue.push(newMap);
      }
    }

    return leastEnergy;
  }

  function calculateExpandedMaze(maze) {
    const mazeCopy = structuredClone(maze);
    mazeCopy.splice(3, 0, `  #D#C#B#A#  `, `  #D#B#A#C#  `);
    return calculateShortestAlignment(mazeCopy);
  }

  let resultPart1 = calculateShortestAlignment(maze);
  let resultPart2 = calculateExpandedMaze(maze);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
