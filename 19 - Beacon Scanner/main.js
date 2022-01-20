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
      scanner = { beacons: [], scannerId: Number(match[1]) };
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
            const matchCount = beacon1.distances.filter((d) =>
              beacon2.distances.some((b) => b == d)
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

  let resultPart1 = findUniqueBeacons(scanners);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
