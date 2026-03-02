import { GameState, PlayerId } from "../types";
import { legalMoves } from "../rules/pegging";

export function chooseDiscard(cardIds: string[]): string[] {
  return cardIds.slice(0, 2);
}

export function choosePeggingPlay(state: GameState, playerId: PlayerId): string | null {
  const moves = legalMoves(state, playerId);
  return moves.length > 0 ? moves[0] : null;
}
