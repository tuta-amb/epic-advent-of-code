import { getStdin } from "stdin";

const input = await getStdin({ exitOnEnter: false });
const compare = {
  red: 12,
  green: 13,
  blue: 14,
} as Round;

type Round = { red: number; blue: number; green: number };
type RoundEntry = [keyof Round, number];
type Game = [number, Round[]];

// Result object:
// [["1", [{"red": 3, "blue": 4, "green": 5} ...more rounds]], ...more games]
const parsed = input
  .split("\n")
  // Split line into ["Game XX", "X red, X blue, ..."]
  .map(line => line.split(": "))
  .map<Game>(line => [
    // Remove all non-numerics and parse game number
    Number.parseInt(line[0].replace(/\D/g, "")),
    line[1].split("; ").map(
      value =>
        // For each game round (split by ;)
        // Convert "X red, X blue" to [["red", X], ["blue", X]]

        Object.fromEntries(
          value.split(", ").map(value => {
            const array = value.split(" ").toReversed();
            return [array[0], Number.parseInt(array[1])];
          })
        ) as Round
    ),
  ]);

const max = parsed
  // Find max of each color in a game
  .map<[number, RoundEntry[]]>(([game, rounds]) => [
    game,
    rounds.reduce(
      (max, round) =>
        // Go through each max color and compare with the current round
        max.map(
          ([color, count]) =>
            [color, Math.max(count, round[color] ?? 0)] as RoundEntry
        ),
      // Starting max values
      Object.entries({
        red: 0,
        blue: 0,
        green: 0,
      }) as RoundEntry[]
    ),
  ])

// Part 1
const answer1 = max
  // Filter out impossible games
  .filter(([_, max]) => max.every(([color, count]) => count <= compare[color]))
  // Add
  .reduce((reducer, [game, _]) => reducer + game, 0);

// Part 2
const answer2 = max
  // Find power of each game
  .map(([_, max]) => max.reduce((reducer, [_, count]) => reducer * count, 1))
  // Add
  .reduce((reducer, power) => reducer + power, 0);

console.log("Part 1:", answer1);
console.log("Part 2:", answer2);
