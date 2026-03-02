import { chooseDiscard } from "./ai/basic";
import { createDeck, dealHands, shuffleDeck } from "./deck";
import { canDiscard } from "./rules/crib";
import { canPlayCard } from "./rules/pegging";
import { scoreHand } from "./scoring/handScore";
import { Card, GameEvent, GameState, PlayerId, Settings } from "./types";

const DEFAULT_SETTINGS: Settings = {
  playTo: 121
};

export function createEmptyGameState(): GameState {
  return {
    deck: [],
    players: {
      player: { hand: [] },
      comp: { hand: [] }
    },
    crib: [],
    cutCard: null,
    pile: {
      cards: [],
      count: 0,
      passed: { player: false, comp: false },
      lastPlayer: null
    },
    scores: { player: 0, comp: 0 },
    dealerId: "player",
    turnId: "player",
    phase: "menu",
    discarded: { player: false, comp: false },
    handForScoring: { player: [], comp: [] },
    peggingEventCounter: 0,
    lastPeggingScore: null
  };
}

export function createInitialGameState(
  settings: Settings = DEFAULT_SETTINGS,
  rng: () => number = Math.random
): GameState {
  return dealNewHand({
    settings,
    rng,
    dealerId: "player",
    scores: { player: 0, comp: 0 }
  });
}

export function startNextHand(
  state: GameState,
  settings: Settings = DEFAULT_SETTINGS,
  rng: () => number = Math.random
): GameState {
  const nextDealer = toggleTurn(state.dealerId);
  return dealNewHand({
    settings,
    rng,
    dealerId: nextDealer,
    scores: { ...state.scores }
  });
}

function dealNewHand({
  settings,
  rng,
  dealerId,
  scores
}: {
  settings: Settings;
  rng: () => number;
  dealerId: PlayerId;
  scores: { player: number; comp: number };
}): GameState {
  const deck = shuffleDeck(createDeck(), rng);
  const { playerHand, compHand, remainingDeck } = dealHands(deck);
  const cutCard = remainingDeck.pop() ?? null;

  const preparedPlayerHand = playerHand.map((card) => ({
    ...card,
    owner: "player",
    handOwner: "Player",
    faceUp: true
  }));
  const preparedCompHand = compHand.map((card) => ({
    ...card,
    owner: "comp",
    handOwner: "Comp",
    faceUp: false
  }));
  const preparedCut = cutCard
    ? { ...cutCard, owner: "cut", handOwner: "Cut", faceUp: true }
    : null;

  const nonDealer: PlayerId = dealerId === "player" ? "comp" : "player";

  return {
    deck: remainingDeck,
    players: {
      player: { hand: preparedPlayerHand },
      comp: { hand: preparedCompHand }
    },
    crib: [],
    cutCard: preparedCut,
    pile: {
      cards: [],
      count: 0,
      passed: { player: false, comp: false },
      lastPlayer: null
    },
    scores,
    dealerId,
    turnId: nonDealer,
    phase: "discard",
    discarded: { player: false, comp: false },
    handForScoring: { player: [], comp: [] },
    peggingEventCounter: 0,
    lastPeggingScore: null
  };
}

export function applyEvent(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "START_GAME":
      return createInitialGameState(event.settings ?? DEFAULT_SETTINGS);
    case "DISCARD":
      return applyDiscard(state, event.playerId, event.cardIds);
    case "PLAY_CARD":
      return applyPlayCard(state, event.playerId, event.cardId);
    case "PASS":
      return applyPass(state, event.playerId);
    case "RESTART":
      return createInitialGameState(DEFAULT_SETTINGS);
    case "SCORE_COMPLETE":
      return state;
    default:
      return state;
  }
}

export function isPeggingComplete(state: GameState): boolean {
  const playerEmpty = state.players.player.hand.length === 0;
  const compEmpty = state.players.comp.hand.length === 0;
  return playerEmpty && compEmpty;
}

export function scoreHands(state: GameState): GameState {
  if (!state.cutCard) return state;
  const playerCards = [...state.handForScoring.player, state.cutCard];
  const compCards = [...state.handForScoring.comp, state.cutCard];
  const cribCards = [...state.crib, state.cutCard];
  if (playerCards.length < 5 || compCards.length < 5) return state;

  const playerScore = scoreHand(playerCards).total;
  const compScore = scoreHand(compCards).total;
  const cribScore = cribCards.length === 5 ? scoreHand(cribCards).total : 0;

  return {
    ...state,
    scores: {
      player:
        state.scores.player +
        playerScore +
        (state.dealerId === "player" ? cribScore : 0),
      comp:
        state.scores.comp +
        compScore +
        (state.dealerId === "comp" ? cribScore : 0)
    }
  };
}

function applyDiscard(state: GameState, playerId: PlayerId, cardIds: string[]): GameState {
  if (state.discarded[playerId]) return state;
  if (!canDiscard(state, playerId, cardIds)) return state;

  let nextState = removeCardsToCrib(state, playerId, cardIds);

  if (!nextState.discarded.comp) {
    const compHandIds = nextState.players.comp.hand.map((card) => card.id);
    const compDiscard = chooseDiscard(compHandIds);
    nextState = removeCardsToCrib(nextState, "comp", compDiscard);
  }

  if (nextState.discarded.player && nextState.discarded.comp) {
    nextState = {
      ...nextState,
      handForScoring: {
        player: nextState.players.player.hand,
        comp: nextState.players.comp.hand
      }
    };
  }

  return nextState;
}

function removeCardsToCrib(state: GameState, playerId: PlayerId, cardIds: string[]): GameState {
  const hand = state.players[playerId].hand;
  const remaining = hand.filter((card) => !cardIds.includes(card.id));
  const discardedCards = hand
    .filter((card) => cardIds.includes(card.id))
    .map((card) => ({ ...card, owner: "crib", handOwner: "Crib" }));

  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { hand: remaining }
    },
    crib: [...state.crib, ...discardedCards],
    discarded: {
      ...state.discarded,
      [playerId]: true
    }
  };
}

function applyPlayCard(state: GameState, playerId: PlayerId, cardId: string): GameState {
  if (!canPlayCard(state, playerId, cardId)) return state;

  const hand = state.players[playerId].hand;
  const card = hand.find((c) => c.id === cardId);
  if (!card) return state;

  const remaining = hand.filter((c) => c.id !== cardId);
  const newCount = state.pile.count + card.value;
  const pileCards = [...state.pile.cards, { ...card, owner: "pile", faceUp: true }];
  const reset = newCount === 31;
  const peggingScore = calculatePeggingScore(pileCards, newCount);
  const otherPlayer = toggleTurn(playerId);
  const handsEmptyAfterPlay =
    remaining.length === 0 && state.players[otherPlayer].hand.length === 0;
  const lastCardPoints = handsEmptyAfterPlay && newCount !== 31 ? 1 : 0;
  const reasons = lastCardPoints
    ? [...peggingScore.reasons, { label: "Last card", points: 1 }]
    : peggingScore.reasons;
  const totalPeggingPoints = peggingScore.points + lastCardPoints;
  const hasPeggingPoints = totalPeggingPoints > 0;
  const nextEventCounter = hasPeggingPoints ? state.peggingEventCounter + 1 : state.peggingEventCounter;
  const shouldResetPile = reset || handsEmptyAfterPlay;
  const snapshotCards = shouldResetPile ? pileCards.map((pileCard) => ({ ...pileCard })) : undefined;
  const snapshotCount = shouldResetPile ? newCount : undefined;

  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { hand: remaining }
    },
    pile: shouldResetPile
      ? { cards: [], count: 0, passed: { player: false, comp: false }, lastPlayer: null }
      : {
          cards: pileCards,
          count: newCount,
          passed: { ...state.pile.passed, [playerId]: false },
          lastPlayer: playerId
        },
    scores: {
      ...state.scores,
      [playerId]: state.scores[playerId] + totalPeggingPoints
    },
    peggingEventCounter: nextEventCounter,
    lastPeggingScore: hasPeggingPoints
      ? {
          id: nextEventCounter,
          playerId,
          points: totalPeggingPoints,
          text: describePeggingScore(reasons),
          pileCards: snapshotCards,
          pileCount: snapshotCount
        }
      : null,
    turnId: toggleTurn(playerId)
  };
}

function applyPass(state: GameState, playerId: PlayerId): GameState {
  const passed = { ...state.pile.passed, [playerId]: true };
  const bothPassed = passed.player && passed.comp;
  const lastPlayer = state.pile.lastPlayer;
  const shouldAwardGo = bothPassed && state.pile.count > 0 && state.pile.count !== 31 && lastPlayer;
  const nextEventCounter = shouldAwardGo ? state.peggingEventCounter + 1 : state.peggingEventCounter;

  return {
    ...state,
    pile: bothPassed
      ? { cards: [], count: 0, passed: { player: false, comp: false }, lastPlayer: null }
      : { ...state.pile, passed },
    scores: shouldAwardGo
      ? { ...state.scores, [lastPlayer]: state.scores[lastPlayer] + 1 }
      : state.scores,
    peggingEventCounter: nextEventCounter,
    lastPeggingScore:
      shouldAwardGo && lastPlayer
        ? { id: nextEventCounter, playerId: lastPlayer, points: 1, text: "Go for 1" }
        : null,
    turnId: toggleTurn(playerId)
  };
}

function toggleTurn(playerId: PlayerId): PlayerId {
  return playerId === "player" ? "comp" : "player";
}

function calculatePeggingScore(
  pileCards: Card[],
  count: number
): { points: number; reasons: { label: string; points: number }[] } {
  const reasons: { label: string; points: number }[] = [];
  if (count === 15) reasons.push({ label: "15", points: 2 });
  if (count === 31) reasons.push({ label: "31", points: 2 });

  const pairPoints = scorePairs(pileCards);
  if (pairPoints === 2) reasons.push({ label: "Pair", points: 2 });
  if (pairPoints === 6) reasons.push({ label: "Trips", points: 6 });
  if (pairPoints === 12) reasons.push({ label: "Quads", points: 12 });

  const runPoints = scorePeggingRun(pileCards);
  if (runPoints >= 3) reasons.push({ label: `Run of ${runPoints}`, points: runPoints });

  const points = reasons.reduce((total, reason) => total + reason.points, 0);
  return { points, reasons };
}

function describePeggingScore(reasons: { label: string; points: number }[]): string {
  if (reasons.length === 0) return "";
  return reasons.map((reason) => `${reason.label} for ${reason.points}`).join(" + ");
}

function scorePairs(pileCards: Card[]): number {
  const last = pileCards[pileCards.length - 1];
  if (!last) return 0;
  let streak = 1;
  for (let i = pileCards.length - 2; i >= 0; i -= 1) {
    if (pileCards[i].rank === last.rank) {
      streak += 1;
    } else {
      break;
    }
  }
  if (streak === 2) return 2;
  if (streak === 3) return 6;
  if (streak >= 4) return 12;
  return 0;
}

function scorePeggingRun(pileCards: Card[]): number {
  const maxCheck = Math.min(pileCards.length, 7);
  for (let len = maxCheck; len >= 3; len -= 1) {
    const slice = pileCards.slice(pileCards.length - len);
    const values = slice.map((card) => rankToValue(card.rank));
    const unique = new Set(values);
    if (unique.size !== values.length) continue;
    const sorted = [...unique].sort((a, b) => a - b);
    if (sorted[sorted.length - 1] - sorted[0] + 1 === len) {
      return len;
    }
  }
  return 0;
}

function rankToValue(rank: string): number {
  const parsed = Number(rank);
  if (!Number.isNaN(parsed)) return parsed;
  const map: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return map[rank] ?? 0;
}
