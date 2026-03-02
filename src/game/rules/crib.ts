import { GameState, PlayerId } from "../types";

export function canDiscard(state: GameState, playerId: PlayerId, cardIds: string[]): boolean {
  if (cardIds.length !== 2) return false;
  const hand = state.players[playerId].hand;
  const idsInHand = new Set(hand.map((card) => card.id));
  return cardIds.every((id) => idsInHand.has(id));
}
