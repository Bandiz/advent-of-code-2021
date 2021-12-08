const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const input = [];

  rl.on("line", (line) => {
    const [segmentsPart, outputPart] = line.split("|");
    const segments = segmentsPart.split(" ").filter(Boolean);
    input.push({
      segments,
      numbers: deductNumbers(segments),
      output: outputPart.split(" ").filter(Boolean),
    });
  });

  await events.once(rl, "close");

  function deductNumbers(segments) {
    const segmentMap = {};
    const undetermined5 = [];
    const undetermined6 = [];

    for (const segment of segments) {
      const segmentArr = segment.split("");
      switch (segmentArr.length) {
        case 2:
          segmentMap[1] = segmentArr;
          break;
        case 3:
          segmentMap[7] = segmentArr;
          break;
        case 4:
          segmentMap[4] = segmentArr;
          break;
        case 5:
          undetermined5.push(segmentArr);
          break;
        case 6:
          undetermined6.push(segmentArr);
          break;
        case 7:
          segmentMap[8] = segmentArr;
          break;
      }
    }

    segmentMap[3] = undetermined5.find(segment => segment.filter(x => segmentMap[1].includes(x)).length == 2);
    undetermined5.splice(undetermined5.indexOf(segmentMap[3]), 1);
    segmentMap[5] = undetermined5.find(segment => segment.filter(x => segmentMap[4].includes(x)).length == 3);
    undetermined5.splice(undetermined5.indexOf(segmentMap[5]), 1);
    segmentMap[2] = undetermined5.pop();

    segmentMap[9] = undetermined6.find(segment => segment.filter(x => segmentMap[4].includes(x)).length == 4);
    undetermined6.splice(undetermined6.indexOf(segmentMap[9]), 1);
    segmentMap[0] = undetermined6.find(segment => segment.filter(x => segmentMap[1].includes(x)).length == 2);
    undetermined6.splice(undetermined6.indexOf(segmentMap[0]), 1);
    segmentMap[6] = undetermined6.pop();

    return segmentMap;
  }

  function calculatePart1(input) {
    const searchLengths = [2, 3, 4, 7];
    let result = 0;
    for (const { output } of input) {
      for (const segment of output) {
        if (searchLengths.includes(segment.length)) {
          result++;
        }
      }
    }
    return result;
  }

  function calculatePart2(input) {
    let result = 0;

    function areEqual(array1, array2) {
      if (array1.length != array2.length) {
        return false;
      }
      for (const element of array1) {
        if (!array2.includes(element)) {
          return false;
        }
      }
      return true;
    }

    for (const { numbers, output } of input) {
      let number = output.reduce((prev, curr) => {
        for (const key in numbers) {
          if (areEqual(curr, numbers[key])) {
            return prev + key;
          }
        }
      }, "");
      console.log(number);
      result += Number.parseInt(number);
    }

    return result;
  }

  let resultPart1 = calculatePart1(input);
  let resultPart2 = calculatePart2(input);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
