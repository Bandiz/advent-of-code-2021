const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const scanners = [];
  let scanner;

  rl.on("line", (line) => {
    if (!line) {
      scanners.push(scanner);
      delete scanner;
      return;
    }
    const match = line.match(/--- scanner (\d+) ---/);
    if (match) {
      scanner = { beacons: [], scannerId: Number(match[1]), connections: {} };
    } else {
      const [x, y, z] = line.split(",").map(Number);
      const newBeacon = {
        x,
        y,
        z,
        id: scanner.beacons.length,
        distances: [],
        matches: {},
      };

      for (const beacon of scanner.beacons) {
        const distance = getDistance(beacon, newBeacon);
        beacon.distances.push(distance);
        newBeacon.distances.push(distance);
      }

      scanner.beacons.push(newBeacon);
    }
  });

  function getDistance(b1, b2) {
    return Math.sqrt(
      Math.pow(b1.x - b2.x, 2) +
        Math.pow(b1.y - b2.y, 2) +
        Math.pow(b1.z - b2.z, 2)
    );
  }

  await events.once(rl, "close");

  function findUniqueBeacons(scanners) {
    const overlaps = new Set();
    let beacons = 0;

    for (let s1 = 0; s1 < scanners.length; s1++) {
      const beacons1 = scanners[s1].beacons;
      for (const beacon1 of beacons1) {
        for (let s2 = s1 + 1; s2 < scanners.length; s2++) {
          const beacons2 = scanners[s2].beacons;
          let maxMatches = 0;

          for (const beacon2 of beacons2) {
            const matchCount = beacon1.distances.filter((d1) =>
              beacon2.distances.some((d2) => d2 == d1)
            ).length;

            if (matchCount > 0) {
              beacon1.matches[s2] = beacon1.matches[s2] ?? [];
              beacon1.matches[s2].push({
                scanner: s2,
                beacon: beacon2.id,
                matchCount,
              });
              beacon2.matches[s1] = beacon2.matches[s1] ?? [];
              beacon2.matches[s1].push({
                scanner: s1,
                beacon: beacon1.id,
                matchCount,
              });
              maxMatches = Math.max(maxMatches, matchCount);
            }
          }

          let matches = beacon1.matches[s2];

          if (!matches) continue;

          matches = matches.filter((m) => m.matchCount === maxMatches);
          beacon1.matches[s2] = matches;

          if (matches.length == 1) {
            const match = matches[0];
            const pair = `${match.scanner}:${match.beacon}`;
            overlaps.add(pair);
            const beacon2 = scanners[match.scanner].beacons[match.beacon];
            scanners[s1].connections[s2] = scanners[s1].connections[s2] ?? [];
            scanners[s1].connections[s2].push([beacon1, beacon2]);
            scanners[s2].connections[s1] = scanners[s2].connections[s1] ?? [];
            scanners[s2].connections[s1].push([beacon2, beacon1]);
          }
        }

        const pair = `${s1}:${beacon1.id}`;
        if (!overlaps.has(pair)) {
          overlaps.add(pair);
          beacons++;
        }
      }
    }

    return beacons;
  }

  function findLargestManhattanDistance(scanners) {
    let distance = 0;
    const visited = [0];
    const queue = Object.entries(scanners[0].connections)
      .filter((overlap) => overlap[1].length >= 12)
      .map(([scannerId, connections]) => [
        Number(scannerId),
        connections.slice(0, 3),
      ]);
    scanners[0].origin = { x: 0, y: 0, z: 0 };

    while (queue.length) {
      const [scannerId, connections] = queue.pop();
      const scanner = scanners[scannerId];

      Object.entries(scanner.connections)
        .map(([scannerId, connections]) => [Number(scannerId), connections])
        .filter(
          (overlap) => !visited.includes(overlap[0]) && overlap[1].length >= 12
        )
        .forEach(([scannerId, connections]) => {
          queue.push([scannerId, connections.slice(0, 3)]);
        });

      for (const currentRotation of [
        ({ x, y, z }) => ({ x: x, y: y, z: z }),
        ({ x, y, z }) => ({ x: y, y: z, z: x }),
        ({ x, y, z }) => ({ x: z, y: x, z: y }),
        ({ x, y, z }) => ({ x: -x, y: z, z: y }),
        ({ x, y, z }) => ({ x: z, y: y, z: -x }),
        ({ x, y, z }) => ({ x: y, y: -x, z: z }),
        ({ x, y, z }) => ({ x: x, y: z, z: -y }),
        ({ x, y, z }) => ({ x: z, y: -y, z: x }),
        ({ x, y, z }) => ({ x: -y, y: x, z: z }),
        ({ x, y, z }) => ({ x: x, y: -z, z: y }),
        ({ x, y, z }) => ({ x: -z, y: y, z: x }),
        ({ x, y, z }) => ({ x: y, y: x, z: -z }),
        ({ x, y, z }) => ({ x: -x, y: -y, z: z }),
        ({ x, y, z }) => ({ x: -y, y: z, z: -x }),
        ({ x, y, z }) => ({ x: z, y: -x, z: -y }),
        ({ x, y, z }) => ({ x: -x, y: y, z: -z }),
        ({ x, y, z }) => ({ x: y, y: -z, z: -x }),
        ({ x, y, z }) => ({ x: -z, y: -x, z: y }),
        ({ x, y, z }) => ({ x: x, y: -y, z: -z }),
        ({ x, y, z }) => ({ x: -y, y: -z, z: x }),
        ({ x, y, z }) => ({ x: -z, y: x, z: -y }),
        ({ x, y, z }) => ({ x: -x, y: -z, z: -y }),
        ({ x, y, z }) => ({ x: -z, y: -y, z: -x }),
        ({ x, y, z }) => ({ x: -y, y: -x, z: -z }),
      ]) {
        let [[b1, cb1], [b2, cb2], [b3, cb3]] = connections;

        let rotatedP1 = currentRotation(cb1);
        let rotatedP2 = currentRotation(cb2);
        let rotatedP3 = currentRotation(cb3);

        let originP1 = {
          x: (b1.normalized?.x ?? b1.x) - rotatedP1.x,
          y: (b1.normalized?.y ?? b1.y) - rotatedP1.y,
          z: (b1.normalized?.z ?? b1.z) - rotatedP1.z,
        };
        let originP2 = {
          x: (b2.normalized?.x ?? b2.x) - rotatedP2.x,
          y: (b2.normalized?.y ?? b2.y) - rotatedP2.y,
          z: (b2.normalized?.z ?? b2.z) - rotatedP2.z,
        };
        let originP3 = {
          x: (b3.normalized?.x ?? b3.x) - rotatedP3.x,
          y: (b3.normalized?.y ?? b3.y) - rotatedP3.y,
          z: (b3.normalized?.z ?? b3.z) - rotatedP3.z,
        };

        if (
          originP1.x === originP2.x &&
          originP2.x === originP3.x &&
          originP1.y === originP2.y &&
          originP2.y === originP3.y &&
          originP1.z === originP2.z &&
          originP2.z === originP3.z
        ) {
          scanner.origin = originP1;
          scanner.rotation = currentRotation;
          visited.push(scannerId);

          for (const beacon of scanner.beacons) {
            const { x, y, z } = currentRotation(beacon);
            beacon.normalized = {
              x: originP1.x + x,
              y: originP1.y + y,
              z: originP1.z + z,
            };
          }

          break;
        }
      }
    }

    for (let s1 = 0; s1 < scanners.length; s1++) {
      const scanner1 = scanners[s1].origin;
      for (let s2 = s1 + 1; s2 < scanners.length; s2++) {
        const scanner2 = scanners[s2].origin;

        distance = Math.max(
          distance,
          Math.abs(
            Math.max(scanner1.x, scanner2.x) - Math.min(scanner1.x, scanner2.x)
          ) +
            Math.abs(
              Math.max(scanner1.y, scanner2.y) -
                Math.min(scanner1.y, scanner2.y)
            ) +
            Math.abs(
              Math.max(scanner1.z, scanner2.z) -
                Math.min(scanner1.z, scanner2.z)
            )
        );
      }
    }

    return distance;
  }

  let resultPart1 = findUniqueBeacons(scanners);
  let resultPart2 = findLargestManhattanDistance(scanners);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
