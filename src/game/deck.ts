import { Card, Rank, Suit } from "./types";

const SUITS: Suit[] = ["spades", "diamonds", "clubs", "hearts"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function rankToValue(rank: Rank): number {
  if (rank === "A") return 1;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  return Number(rank);
}

export function createDeck(): Card[] {
  let index = 0;
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${rank}-${suit}-${index++}`,
      suit,
      rank,
      value: rankToValue(rank)
    }))
  );
}

export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function dealHands(deck: Card[]): {
  playerHand: Card[];
  compHand: Card[];
  remainingDeck: Card[];
} {
  const remainingDeck = [...deck];
  const playerHand: Card[] = [];
  const compHand: Card[] = [];

  for (let i = 0; i < 6; i += 1) {
    const playerCard = remainingDeck.pop();
    const compCard = remainingDeck.pop();
    if (playerCard) playerHand.push(playerCard);
    if (compCard) compHand.push(compCard);
  }

  return { playerHand, compHand, remainingDeck };
}
