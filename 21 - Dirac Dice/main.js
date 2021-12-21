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
      let newPosition = (step + p1Position) % 10 || 10;
      p1Score += newPosition;
      p1Position = newPosition;

      if (p1Score >= 1000) break;

      roll = rollDeterministicDice();
      step = roll % 10;
      newPosition = (step + p2Position) % 10 || 10;
      p2Score += newPosition;
      p2Position = newPosition;
    }

    return rollCount * Math.min(p1Score, p2Score);
  }

  function simulateQuantumGame(p1Position, p2Position) {
    const diceOutcomes = [1, 2, 3];
    const diceSums = {};
    const winPoints = 21;
    const memo = [];

    for (const r1 of diceOutcomes) {
      for (const r2 of diceOutcomes) {
        for (const r3 of diceOutcomes) {
          diceSums[r1 + r2 + r3] = (diceSums[r1 + r2 + r3] ?? 0) + 1;
        }
      }
    }

    function simulateWins(p1Score, p2Score, p1Position, p2Position, p1Turn) {
      const memoizedWin =
        memo[[p1Score, p2Score, p1Position, p2Position, p1Turn]];

      if (typeof memoizedWin !== "undefined") return memoizedWin;

      if (p1Score >= winPoints) {
        memo[[p1Score, p2Score, p1Position, p2Position, p1Turn]] = [1, 0];
        return [1, 0];
      }
      if (p2Score >= winPoints) {
        memo[[p1Score, p2Score, p1Position, p2Position, p1Turn]] = [0, 1];
        return [0, 1];
      }

      let winCount = [0, 0];

      for (let diceSum = 3; diceSum <= 9; diceSum++) {
        let thisWin;
        if (p1Turn) {
          const newPosition = (p1Position + diceSum) % 10 || 10;
          thisWin = simulateWins(
            p1Score + newPosition,
            p2Score,
            newPosition,
            p2Position,
            !p1Turn
          );
        } else {
          const newPosition = (p2Position + diceSum) % 10 || 10;
          thisWin = simulateWins(
            p1Score,
            p2Score + newPosition,
            p1Position,
            newPosition,
            !p1Turn
          );
        }
        winCount = [
          winCount[0] + diceSums[diceSum] * thisWin[0],
          winCount[1] + diceSums[diceSum] * thisWin[1],
        ];
      }

      memo[[p1Score, p2Score, p1Position, p2Position, p1Turn]] = winCount;
      return winCount;
    }

    const wins = simulateWins(0, 0, p1Position, p2Position, true);
    return Math.max(wins[0], wins[1]);
  }

  let resultPart1 = simulateDeterministicGame(player1Position, player2Position);
  let resultPart2 = simulateQuantumGame(player1Position, player2Position);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
