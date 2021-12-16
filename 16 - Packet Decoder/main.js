const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data1.in"),
    output: process.stdout,
    terminal: false,
  });

  let packet;

  rl.on("line", (line) => {
    const bytes = [];
    for (let i = 0; i < line.length; i++) {
      const byte = parseInt(line[i], 16).toString(2);
      if (byte.length < 4) {
        bytes.push(`${"0".repeat(4 - byte.length)}${byte}`);
      } else {
        bytes.push(byte);
      }
    }
    packet = bytes.join("");
  });

  await events.once(rl, "close");

  function calculateVersionNumbers(packet) {
    const packetTree = formPacketTree(packet);

    return packetTree.reduce((prev, curr) => prev + sumDeep(curr), 0);

    function sumDeep(node) {
      return (
        node.version +
        node.subPackets.reduce((prev, curr) => prev + sumDeep(curr), 0)
      );
    }

    function findSubPacketLength(startIndex, packet, packets) {
      let subIndex = startIndex;
      for (let subPacket = 0; subPacket < packets; subPacket++) {
        subIndex += 3;
        const subtype = parseInt(
          packet.substring(subIndex, (subIndex += 3)),
          2
        );
        switch (subtype) {
          case 4:
            let isLast = false;
            while (!isLast) {
              if (packet[subIndex] === "0") {
                isLast = true;
              }
              subIndex += 5;
            }
            break;
          default:
            const subLengthIndex = packet[subIndex++] == "1";
            const subLength = parseInt(
              packet.substring(
                subIndex,
                (subIndex += subLengthIndex ? 11 : 15)
              ),
              2
            );
            if (!subLengthIndex) {
              subIndex += subLength;
            } else {
              subIndex += findSubPacketLength(subIndex, packet, subLength);
            }
            break;
        }
      }
      return subIndex - startIndex;
    }

    function formPacketTree(packet) {
      const adjacent = [];

      let i = 0;
      while (i + 7 < packet.length) {
        const version = parseInt(packet.substring(i, (i += 3)), 2);
        const type = parseInt(packet.substring(i, (i += 3)), 2);
        const newPacket = {
          version,
          type,
          subPackets: [],
        };

        switch (type) {
          case 4: {
            let isLast = false;
            const numbers = [];
            while (!isLast) {
              if (packet[i] === "0") {
                isLast = true;
              }
              numbers.push(parseInt(packet.substring(i + 1, (i += 5)), 2));
            }
            newPacket.literal = numbers.join("");
            break;
          }
          default:
            const lengthIndex = packet[i++] == "1";
            let length = parseInt(
              packet.substring(i, (i += lengthIndex ? 11 : 15)),
              2
            );

            if (lengthIndex) {
              const subIndex = findSubPacketLength(i, packet, length);

              newPacket.subPackets.push(
                ...formPacketTree(packet.substring(i, (i += subIndex)))
              );
            } else {
              newPacket.subPackets.push(
                ...formPacketTree(packet.substring(i, (i += length)))
              );
            }
            break;
        }
        adjacent.push(newPacket);
      }

      return adjacent;
    }
  }

  let resultPart1 = calculateVersionNumbers(packet);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
