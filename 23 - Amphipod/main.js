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
    const roomLocationMap = {};
    const roomEntrances = [];
    const rooms = [];

    for (let i = 0, r = 0; i < maze[2].length; i++) {
      if (maze[2][i] !== "#") {
        roomLocationMap[r++] = i - 1;
        roomEntrances.push(i - 1);
        rooms.push([maze[2][i], maze[3][i]]);
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

        const targetRoom = amphipodTargetRoomMap[amphipod];
        const roomLookup = getRoomLookup(rooms[targetRoom]);
        const roomKeys = Object.keys(roomLookup);

        if (
          roomKeys.length == 2 ||
          (roomKeys.length == 1 && typeof roomLookup[amphipod] === "undefined")
        ) {
          continue;
        }

        const entrance = roomLocationMap[targetRoom];
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

        const lastOpenSpace = rooms[targetRoom].lastIndexOf(0);
        movementCost += (lastOpenSpace + 1) * priceMap[amphipod];

        const newMap = copyMap(currentMap);

        newMap[0][h] = 0;
        newMap[1][targetRoom][lastOpenSpace] = amphipod;

        const newCost = movementCost + currentCost;
        const oldCost = states[[newMap[0], newMap[1]]] || Number.MAX_VALUE;
        if (newCost < oldCost) {
          states[[newMap[0], newMap[1]]] = newCost;
          queue.push(newMap);
        }
      }

      for (let r = 0; r < rooms.length; r++) {
        let steps = 0;
        const currentRoom = rooms[r];
        const isSecondSlotCorrect = amphipodTargetRoomMap[currentRoom[1]] == r;
        const isFirstSlotCorrect = amphipodTargetRoomMap[currentRoom[0]] == r;
        const isFirstSlotEmpty = currentRoom[0] == 0;
        const isSecondSlotEmpty = currentRoom[1] == 0;

        if (
          (isFirstSlotCorrect && isSecondSlotCorrect) ||
          (isFirstSlotEmpty && isSecondSlotEmpty) ||
          (isFirstSlotEmpty && isSecondSlotCorrect)
        )
          continue;

        let amphipod;
        const roomCopy = [...currentRoom];

        if (currentRoom[0]) {
          amphipod = currentRoom[0];
          roomCopy[0] = 0;
          steps++;
        } else {
          amphipod = currentRoom[1];
          roomCopy[1] = 0;
          steps += 2;
        }

        let stepsLeft = steps;
        let newPosition = roomLocationMap[r] - 1;
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

        let stepsRight = steps;
        newPosition = roomLocationMap[r] + 1;
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

    function getRoomLookup(room) {
      return room.reduce((prev, curr) => {
        if (!curr) return prev;
        prev[curr] = (prev[curr] ?? 0) + 1;
        return prev;
      }, {});
    }

    return leastEnergy;
  }

  let resultPart1 = calculateShortestAlignment(maze);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
