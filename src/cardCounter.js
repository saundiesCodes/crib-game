import { scoreHand } from "./game/scoring/handScore";

export function cardCounter(cards) {
  const score = scoreHand(cards);
  return score;
}

export { scoreHand };
