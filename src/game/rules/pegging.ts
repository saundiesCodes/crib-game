import { GameState, PlayerId } from "../types";

export function legalMoves(state: GameState, playerId: PlayerId): string[] {
  const limit = 31 - state.pile.count;
  return state.players[playerId].hand
    .filter((card) => card.value <= limit)
    .map((card) => card.id);
}

export function canPlayCard(state: GameState, playerId: PlayerId, cardId: string): boolean {
  return legalMoves(state, playerId).includes(cardId);
}
