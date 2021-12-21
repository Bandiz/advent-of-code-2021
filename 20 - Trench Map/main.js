const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  let cypher;
  const sourceImage = [];

  let ln = 0;

  rl.on("line", (line) => {
    if (!ln) {
      ln++;
      cypher = line;
    } else if (line) {
      sourceImage.push(line.split(""));
    }
  });

  await events.once(rl, "close");

  function enhanceImage(cypher, sourceImage, steps) {
    let enhancedImage = [];
    let image = sourceImage;

    for (let step = 0; step < steps; step++) {
      for (let y = -1; y < image.length + 1; y++) {
        const row = [];

        for (let x = -1; x < image[0].length + 1; x++) {
          const bin = [];

          for (let yy = y - 1; yy <= y + 1; yy++) {
            for (let xx = x - 1; xx <= x + 1; xx++) {
              if (image[yy]?.[xx]) {
                bin.push(image[yy][xx] === "#" ? "1" : "0");
              } else {
                bin.push(step % 2 ? (cypher[0] === "#" ? "1" : "0") : "0");
              }
            }
          }
          row.push(cypher[parseInt(bin.join(""), 2)]);
        }
        enhancedImage.push(row);
      }

      image = enhancedImage;
      enhancedImage = [];
    }

    return image.reduce(
      (prev, curr) =>
        prev + curr.reduce((prev, curr) => prev + (curr === "#" ? 1 : 0), 0),
      0
    );
  }

  let resultPart1 = enhanceImage(cypher, sourceImage, 2);
  let resultPart2 = enhanceImage(cypher, sourceImage, 50);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
