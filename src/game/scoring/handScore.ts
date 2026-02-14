import { Card } from "../types";

export function scoreHand(cards: Card[]) {
  const counts = countOfAKinds(cards);
  const fifteens = countFifteenCombinations(cards);
  const flushes = countingFlushes(cards);
  const runs = countRuns(cards);
  const nobs = countNobs(cards);

  const pairPoints = counts.pairs * 2;
  const threePoints = counts.threeOfAKind * 6;
  const fourPoints = counts.fourOfAKind * 12;
  const fifteenPoints = fifteens * 2;
  const flushPoints = flushes["Five card flushes"] ? 5 : (flushes["Four card flushes"] ? 4 : 0);
  const total = pairPoints + threePoints + fourPoints + fifteenPoints + flushPoints + runs.points + nobs;

  return {
    pairs: counts.pairs,
    threeOfAKind: counts.threeOfAKind,
    fourOfAKind: counts.fourOfAKind,
    fifteens,
    runs,
    flushes,
    nobs,
    points: {
      pairs: pairPoints,
      threeOfAKind: threePoints,
      fourOfAKind: fourPoints,
      fifteens: fifteenPoints,
      runs: runs.points,
      flushes: flushPoints,
      nobs
    },
    total
  };
}

function countOfAKinds(cards: Card[]) {
  const rankCounts: Record<string, number> = {};
  let fourOfAKind = 0;
  let threeOfAKind = 0;
  let pairCount = 0;

  cards.forEach((card) => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  Object.values(rankCounts).forEach((count) => {
    if (count === 4) {
      fourOfAKind += Math.floor(count / 4);
    } else if (count === 3) {
      threeOfAKind += Math.floor(count / 3);
    } else {
      pairCount += Math.floor(count / 2);
    }
  });

  return {
    pairs: pairCount,
    threeOfAKind,
    fourOfAKind
  };
}

function countingFlushes(cards: Card[]) {
  const owners = cards.map((card) => getOwnerLabel(card));
  const isCrib = owners.includes("crib");
  const cutCard = cards.find((card) => getOwnerLabel(card) === "cut");
  const handCards = cards.filter((card) => getOwnerLabel(card) !== "cut");

  let fiveCardFlushes = 0;
  let fourCardFlushes = 0;

  if (isCrib) {
    const suit = handCards[0]?.suit;
    if (suit && handCards.every((card) => card.suit === suit) && cutCard?.suit === suit) {
      fiveCardFlushes = 1;
    }
  } else {
    const suit = handCards[0]?.suit;
    if (suit && handCards.every((card) => card.suit === suit)) {
      fourCardFlushes = 1;
      if (cutCard?.suit === suit) {
        fiveCardFlushes = 1;
      }
    }
  }

  return {
    "Five card flushes": fiveCardFlushes,
    "Four card flushes": fourCardFlushes
  };
}

function countFifteenCombinations(cards: Card[]) {
  const values = cards.map((card) => card.value);
  let count = 0;
  const numSubsets = 1 << values.length;

  for (let i = 1; i < numSubsets; i += 1) {
    let sum = 0;

    for (let j = 0; j < values.length; j += 1) {
      if (i & (1 << j)) {
        sum += values[j];
      }
    }

    if (sum === 15) {
      count += 1;
    }
  }

  return count;
}

function countRuns(cards: Card[]) {
  const ranks = cards.map((card) => rankToValue(card.rank));
  let maxRunLength = 0;
  let runCount = 0;

  const numSubsets = 1 << ranks.length;
  for (let i = 0; i < numSubsets; i += 1) {
    const subset: number[] = [];
    for (let j = 0; j < ranks.length; j += 1) {
      if (i & (1 << j)) {
        subset.push(ranks[j]);
      }
    }

    if (subset.length < 3) continue;

    subset.sort((a, b) => a - b);
    let isRun = true;
    for (let k = 1; k < subset.length; k += 1) {
      if (subset[k] !== subset[k - 1] + 1) {
        isRun = false;
        break;
      }
    }

    if (!isRun) continue;

    if (subset.length > maxRunLength) {
      maxRunLength = subset.length;
      runCount = 1;
    } else if (subset.length === maxRunLength) {
      runCount += 1;
    }
  }

  const points = maxRunLength >= 3 ? maxRunLength * runCount : 0;
  return {
    runLength: maxRunLength,
    runCount,
    points
  };
}

function countNobs(cards: Card[]) {
  const cut = cards.find((card) => getOwnerLabel(card) === "cut");
  if (!cut) return 0;

  const hasNobs = cards.some(
    (card) =>
      getOwnerLabel(card) !== "cut" &&
      card.rank === "J" &&
      card.suit === cut.suit &&
      card !== cut
  );

  return hasNobs ? 1 : 0;
}

function rankToValue(rank: string): number {
  const parsed = Number(rank);
  if (!Number.isNaN(parsed)) return parsed;
  const map: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return map[rank] ?? 0;
}

function getOwnerLabel(card: Card): string {
  if (card.owner) return card.owner;
  if (!card.handOwner) return "";
  const normalized = card.handOwner.toLowerCase();
  if (normalized === "player") return "player";
  if (normalized === "comp") return "comp";
  if (normalized === "cut") return "cut";
  if (normalized === "crib") return "crib";
  return normalized;
}
