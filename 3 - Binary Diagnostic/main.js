const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const readings = [];

  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    const bits = line.split("").map(Number);
    readings.push(bits);
  });

  await events.once(rl, "close");

  function splitReadings(startPosition, filteredReadings) {
    const positiveReadings = [];
    const negativeReadings = [];
    filteredReadings.forEach((x) => {
      if (x[startPosition] > 0) {
        positiveReadings.push(x);
      } else {
        negativeReadings.push(x);
      }
    });
    return { positiveReadings, negativeReadings };
  }

  function findOxygenGenRating(startPosition = 0, filteredReadings = readings) {
    if (startPosition > 11) {
      return "";
    }
    const { positiveReadings, negativeReadings } =
      splitReadings(startPosition, filteredReadings);

    if (positiveReadings.length == 1 && negativeReadings.length == 1) {
      return "1";
    }

    return (
      `${positiveReadings.length >= negativeReadings.length ? "1" : "0"}` +
      findOxygenGenRating(
        startPosition + 1,
        positiveReadings.length >= negativeReadings.length
          ? positiveReadings
          : negativeReadings
      )
    );
  }

  function findCO2ScrubberRating(
    startPosition = 0,
    filteredReadings = readings
  ) {
    const { positiveReadings, negativeReadings } =
      splitReadings(startPosition, filteredReadings);

    if (positiveReadings.length == 1 && negativeReadings.length == 1) {
      return negativeReadings[0].join("");
    }

    return findCO2ScrubberRating(
      startPosition + 1,
      negativeReadings.length <= positiveReadings.length
        ? negativeReadings
        : positiveReadings
    );
  }

  let oxygenRating = parseInt(findOxygenGenRating(), 2);
  let scrubberRating = parseInt(findCO2ScrubberRating(), 2);

  let result = oxygenRating * scrubberRating;

  fs.writeFileSync("data.out", result.toString());

  console.log(result);
})();
