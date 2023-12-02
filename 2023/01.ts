// NOTE: I lost my work to part one, so this is just part two.
import { getStdin } from "stdin";

const input = await getStdin({ exitOnEnter: false });
const numbers = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

// Convert each line to digits
const answer = input
  .split("\n")
  .map(line =>
    // Replace each word with its digit
    Object.entries(numbers).reduce(
      // Sometimes, we have "oneight", and this should become "18"
      // Therefore, we must have name+number+name to match the "eight" and other possiblities
      (reducer, [name, number]) =>
           reducer.replaceAll(name, `${name}${number}${name}`),
      line
    )
  )
  // Parse into number
  .map(line => line.match(/\d/g) as RegExpMatchArray)
  .map(line => parseInt(`${line[0]}${line[line.length - 1] ?? line[0]}`))

  .reduce((reducer, line) => reducer + line, 0);

console.log("Answer:", answer);
