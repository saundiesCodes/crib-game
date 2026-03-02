export type Suit = "spades" | "diamonds" | "clubs" | "hearts";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type PlayerId = "player" | "comp";
export type Phase = "menu" | "setup" | "deal" | "discard" | "pegging" | "scoreHands" | "gameOver";

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
  faceUp?: boolean;
  owner?: PlayerId | "cut" | "crib" | "pile";
  handOwner?: string;
};

export type PlayerState = {
  hand: Card[];
};

export type PileState = {
  cards: Card[];
  count: number;
  passed: Record<PlayerId, boolean>;
  lastPlayer: PlayerId | null;
};

export type PeggingScoreEvent = {
  id: number;
  playerId: PlayerId;
  points: number;
  text: string;
  pileCards?: Card[];
  pileCount?: number;
};

export type GameState = {
  deck: Card[];
  players: Record<PlayerId, PlayerState>;
  crib: Card[];
  cutCard: Card | null;
  pile: PileState;
  scores: Record<PlayerId, number>;
  dealerId: PlayerId;
  turnId: PlayerId;
  phase: Phase;
  discarded: Record<PlayerId, boolean>;
  handForScoring: Record<PlayerId, Card[]>;
  peggingEventCounter: number;
  lastPeggingScore: PeggingScoreEvent | null;
};

export type Settings = {
  playTo: number;
};

export type StartGameEvent = {
  type: "START_GAME";
  settings?: Settings;
};

export type DiscardEvent = {
  type: "DISCARD";
  playerId: PlayerId;
  cardIds: string[];
};

export type PlayCardEvent = {
  type: "PLAY_CARD";
  playerId: PlayerId;
  cardId: string;
};

export type PassEvent = {
  type: "PASS";
  playerId: PlayerId;
};

export type ScoreCompleteEvent = {
  type: "SCORE_COMPLETE";
};

export type PeggingRoundEndEvent = {
  type: "PEGGING_ROUND_END";
};

export type RestartEvent = {
  type: "RESTART";
};

export type GameEvent =
  | StartGameEvent
  | DiscardEvent
  | PlayCardEvent
  | PassEvent
  | PeggingRoundEndEvent
  | ScoreCompleteEvent
  | RestartEvent;
