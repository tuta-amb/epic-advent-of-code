import { getStdin } from "stdin";

const input = await getStdin({ exitOnEnter: false });

const getWinners = (winning: number[], selected: number[]) =>
  selected.filter(number => winning.includes(number));

interface Card {
  winning: number[];
  selected: number[];
  processed: boolean;
  number: number;
}

const parsed = input.split("\n").map(line =>
  line
    // Get numbers section
    .split(": ")[1]
    // Split the winning and selected numbers
    .split(" | ")
    .map(section =>
      section
        // Split into list of numbers
        .split(" ")
        // Remove empty
        .filter(number => number)
        // Parse number
        .map(number => Number.parseInt(number))
    )
);

// Pretty self-explanatory
const part1 = parsed
  .map(([winning, selected]) => {
    const winners = getWinners(winning, selected);
    if (winners.length === 0) return 0;
    else if (winners.length === 1) return 1;
    else return Math.pow(2, winners.length - 1);
  })
  .reduce((a, b) => a + b, 0);

// Part 2
const originalCards = parsed.map<Card>(([winning, selected], i) => ({
  winning,
  selected,
  processed: false,
  number: i + 1
}));

// idk why structuredclone uses <any> typings
const clone = <T>(val: T): T => structuredClone(val);
let part2 = clone(originalCards);
let lastLength: number;
do {
  lastLength = part2.length;
  part2 = part2.reduce(
    (totalCards, { processed, selected, winning, number }, i) =>
      processed
        ? totalCards
        : totalCards.with(i, { winning, selected, processed: true, number }).concat(
            getWinners(winning, selected)
              .map((_, u) => originalCards[u + number] || null)
              .filter(e => e)
          ),
    clone(part2)
  );
} while (part2.length !== lastLength);

console.log("Part 1:", part1);
console.log("Part 2:", part2.length);
