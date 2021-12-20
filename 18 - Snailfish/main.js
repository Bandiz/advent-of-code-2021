const events = require("events");
const fs = require("fs");
const readline = require("readline");

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream("data.in"),
    output: process.stdout,
    terminal: false,
  });

  const numbers = [];

  rl.on("line", (line) => {
    const pairs = JSON.parse(line);
    numbers.push(pairs);
  });

  await events.once(rl, "close");

  function combineNumbers(number1, number2) {
    if (number1.length == 0) {
      return number2;
    }
    const newPair = [number1, number2];
    number1.push(newPair);
    number2.push(newPair);

    return newPair;
  }

  function sumNumbers(pair) {
    while (true) {
      let exploded = checkDepth(pair);

      if (exploded) {
        continue;
      }
      let wasSplit = split(pair);

      if (wasSplit) {
        continue;
      }
      if (!exploded && !wasSplit) break;
    }
    return pair;
  }

  function explode(pair) {
    const [left, right, parent] = pair;

    explodeLeft(pair, left);
    explodeRight(pair, right);

    if (pair === parent[0]) {
      parent.shift();
      parent.unshift(0);
    } else {
      parent.splice(1, 1, 0);
    }

    function explodeLeft(parent, value) {
      const [, , parentParent] = parent;

      if (typeof parentParent === "undefined") {
        return;
      }

      const [left, right] = parentParent;

      switch (parent) {
        case left:
          if (typeof left === "number") {
            parentParent[0] += value;
          } else {
            explodeLeft(parentParent, value);
          }
          break;
        case right:
          if (typeof right === "number") {
            parentParent[1] += value;
          } else if (typeof parentParent[0] === "number") {
            parentParent[0] += value;
          } else {
            addDeepRight(parentParent[0], value);
          }
          break;
      }
    }

    function explodeRight(parent, value) {
      const [, , parentParent] = parent;

      if (typeof parentParent === "undefined") {
        return;
      }

      const [left, right] = parentParent;

      switch (parent) {
        case right:
          if (typeof right === "number") {
            parentParent[1] += value;
          } else {
            explodeRight(parentParent, value);
          }
          break;
        case left:
          if (typeof left === "number") {
            parentParent[0] += value;
          } else if (typeof parentParent[1] === "number") {
            parentParent[1] += value;
          } else {
            addDeepLeft(parentParent[1], value);
          }
          break;
      }
    }

    function addDeepLeft(parentParent, value) {
      if (typeof parentParent === "undefined") return;
      const [left] = parentParent;
      if (typeof left === "object") {
        addDeepLeft(left, value);
      } else {
        parentParent[0] += value;
      }
    }

    function addDeepRight(parentParent, value) {
      if (typeof parentParent === "undefined") return;
      const [, right] = parentParent;
      if (typeof right === "object") {
        addDeepRight(right, value);
      } else {
        parentParent[1] += value;
      }
    }
  }

  function split(pair) {
    const [left, right] = pair;
    let splitOccured = false;

    if (typeof left === "object") {
      splitOccured = split(left);
    } else if (left > 9) {
      pair[0] = createPair(left, pair);
      return true;
    }

    if (splitOccured) return true;

    if (typeof right === "object") {
      splitOccured = split(right);
    } else if (right > 9) {
      pair[1] = createPair(right, pair);
      return true;
    }
    return splitOccured;

    function createPair(value, parent) {
      const splitLeft = Math.floor(value / 2);
      const splitRight = Math.round(value / 2);
      const newPair = [splitLeft, splitRight, parent];
      return newPair;
    }
  }

  function checkDepth(pair, depth = 1) {
    if (depth == 5) {
      explode(pair);
      return true;
    }

    const [left, right] = pair;
    let exploded = false;

    if (typeof left === "object") {
      exploded = checkDepth(left, depth + 1);
    }

    if (exploded) return true;

    if (typeof right === "object") {
      exploded = checkDepth(right, depth + 1);
    }
    return exploded;
  }

  function sumSnailfishNumbers(numbers) {
    return numbers.reduce(
      (prev, curr) => sumNumbers(combineNumbers(prev, curr)),
      []
    );
  }

  function addParentLinks(root) {
    function setParent(child, parent) {
      child.forEach((pair) => {
        if (typeof pair === "object") setParent(pair, child);
      });
      if (parent) child.push(parent);
    }
    root.forEach((pair) => {
      if (typeof pair === "object") setParent(pair, root);
    });
  }

  const numbersCopy = JSON.parse(JSON.stringify(numbers));
  numbers.forEach((pairs) => addParentLinks(pairs));

  const sum = sumSnailfishNumbers(numbers);

  function calculateMagnitude(root) {
    if (typeof root === "number") {
      return root;
    }

    const [left, right] = root;

    return calculateMagnitude(left) * 3 + calculateMagnitude(right) * 2;
  }

  function findLargestMagnitude(numbers) {
    let largestMagnitude = 0;

    for (let n1 = 0; n1 < numbers.length; n1++) {
      for (let n2 = n1 + 1; n2 < numbers.length; n2++) {
        let magnitude = getPairMagnitude(numbers, n1, n2);
        if (magnitude > largestMagnitude) largestMagnitude = magnitude;

        magnitude = getPairMagnitude(numbers, n2, n1);
        if (magnitude > largestMagnitude) largestMagnitude = magnitude;
      }
    }
    return largestMagnitude;

    function getPairMagnitude(numbers, n1, n2) {
      const number1 = JSON.parse(JSON.stringify(numbers[n1]));
      const number2 = JSON.parse(JSON.stringify(numbers[n2]));
      addParentLinks(number1);
      addParentLinks(number2);

      const sum = sumNumbers(combineNumbers(number1, number2));
      return calculateMagnitude(sum);
    }
  }

  let resultPart1 = calculateMagnitude(sum);
  let resultPart2 = findLargestMagnitude(numbersCopy);

  fs.writeFileSync(
    "data.out",
    `part 1: ${resultPart1}\npart 2: ${resultPart2}`
  );

  console.log("part 1", resultPart1);
  console.log("part 2", resultPart2);
})();
