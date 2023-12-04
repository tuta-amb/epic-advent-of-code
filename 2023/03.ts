import { getStdin } from "stdin";

/*****************
 * Setup & Utils *
 *****************/
const input = await getStdin({ exitOnEnter: false });

type Input = string[][];
type YX = [number, number];
interface FullNumber {
  number: string;
  coords: YX[];
}

// Offsets from the center character
// prettier-ignore
const offsets: YX[] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0,  -1],          [0,  1],
  [1,  -1], [1,  0], [1,  1],
];

function checkNumber(char: string) {
  return char ? char.match(/\d/) !== null : false;
}

const parsed: Input = input.split("\n").map(line => line.split(""));

/**********
 * Part 1 *
 **********/
function checkPartNumber(location: YX, text: Input) {
  function checkBounds(yx: YX) {
    return (
      yx[0] >= text.length ||
      yx[1] >= text[0].length ||
      yx[0] <= -1 ||
      yx[1] <= -1
    );
  }

  // Check location is not out of bounds
  if (checkBounds(location)) return false;

  const surrounding = offsets
    .map(offset => {
      // Apply offset and return
      const coords = location.map((coord, i) => coord + offset[i]) as YX;
      // Check that the offset is not out of bounds
      if (checkBounds(coords)) return null;
      return text[coords[0]][coords[1]];
    })
    .filter(e => e !== null) as string[];

  // True only if char is number AND has surrounding symbol
  return (
    surrounding.some(char => char.match(/\d|\./) === null) &&
    checkNumber(text[location[0]][location[1]])
  );
}

const part1 = parsed
  .flatMap((line, y) =>
    line
      .reduce(
        (reducer, char, x) => {
          // Numbers are at max 3 digits long, so we have 5 cases
          // a) The current char is one
          const isCurrentPartNumber = checkPartNumber([y, x], parsed);
          // b) The left one is
          const left = checkPartNumber([y, x - 1], parsed);
          // c) The far left is, however the left one must still be a number
          const leftNum = checkNumber(line[x - 1]);
          const farLeft = checkPartNumber([y, x - 2], parsed) && leftNum;
          // d) The right one is
          const right = checkPartNumber([y, x + 1], parsed);
          // c) The far right is, however the right one must still be a number
          const rightNum = checkNumber(line[x + 1]);
          const farRight = checkPartNumber([y, x + 2], parsed) && rightNum;

          // Combine them
          const isPartNumber =
            ((left || farLeft || right || farRight) && checkNumber(char)) ||
            isCurrentPartNumber;

          if (isPartNumber) {
            reducer[reducer.length - 1] += char;
          } else if (reducer[reducer.length - 1] !== "") {
            // Add a blank one once the number is finished
            reducer.push("");
          }
          return reducer;
        },
        [""]
      )
      // Remove empty strings
      // this is hack, i'm not sure why there are so many empty strings
      .filter(e => e)
      .map(e => Number.parseInt(e))
  )
  .reduce((reducer, val) => reducer + val, 0);

/**********
 * Part 2 *
 **********/
const blank: FullNumber = { number: "", coords: [] };
const numbers = parsed.flatMap((line, y) =>
  line
    .reduce<FullNumber[]>(
      (reduce, char, x) => {
        const reducer = structuredClone(reduce);
        const last = reducer[reducer.length - 1].number;

        if (checkNumber(char)) {
          reducer[reducer.length - 1].coords.push([y, x]);
          reducer[reducer.length - 1].number += char;
          return reducer;
        } else if (last !== "") {
          return reducer.concat(blank);
        } else {
          return reducer;
        }
      },
      [blank]
    )
    .filter(e => e.number)
);

const part2 = parsed
  .map((line, y) =>
    line.reduce((sum, char, x) => {
      if (char !== "*") return sum;

      const neighborNumbers: Set<FullNumber> = new Set();
      offsets.forEach(([offsetY, offsetX]) => {
        const checkY = offsetY + y,
          checkX = offsetX + x;
        if (!checkNumber(parsed[checkY][checkX])) return;
        neighborNumbers.add(
          numbers.find(number =>
            number.coords.some(
              coord => coord[0] === checkY && coord[1] === checkX
            )
          ) || blank
        );
        console.log("line", y, "checking", [offsetY, offsetX]);
      });

      if (neighborNumbers.size < 2) return sum;

      return (
        sum + Array.from(neighborNumbers).reduce((a, b) => a * Number.parseInt(b.number), 1)
      );
    }, 0)
  )
  .reduce((a, b) => a + b, 0);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
