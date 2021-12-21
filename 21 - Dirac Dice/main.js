const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  let player1Position;
  let player2Position;

  rl.on("line", (line) => {
    const [player, position] = line.match(/(\d)/g);
    if (player === "1") {
      player1Position = parseInt(position);
    }
    if (player === "2") {
      player2Position = parseInt(position);
    }
  });

  await events.once(rl, "close");

  function simulateDeterministicGame(p1Position, p2Position) {
    let detDicePos = 1;
    let rollCount = 0;
    let p1Score = 0;
    let p2Score = 0;

    function rollDeterministicDice() {
      rollCount += 3;
      const roll1 = detDicePos++;
      if (detDicePos > 100) detDicePos = 1;
      const roll2 = detDicePos++;
      if (detDicePos > 100) detDicePos = 1;
      const roll3 = detDicePos++;
      if (detDicePos > 100) detDicePos = 1;
      return roll1 + roll2 + roll3;
    }

    while (p1Score < 1000 && p2Score < 1000) {
      let roll = rollDeterministicDice();
      let step = roll % 10;
      let newPosition = (step + p1Position) % 10;
      newPosition ||= 10;
      p1Score += newPosition;
      p1Position = newPosition;

      if (p1Score >= 1000) break;

      roll = rollDeterministicDice();
      step = roll % 10;
      newPosition = (step + p2Position) % 10;
      newPosition ||= 10;
      p2Score += newPosition;
      p2Position = newPosition;
    }

    return rollCount * Math.min(p1Score, p2Score);
  }

  let resultPart1 = simulateDeterministicGame(player1Position, player2Position);
  let resultPart2 = 0;

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
