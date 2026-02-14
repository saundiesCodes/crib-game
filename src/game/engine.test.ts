import { describe, expect, test } from "vitest";
import { applyEvent, createEmptyGameState, scoreHands } from "./engine";
import { scoreHand } from "./scoring/handScore";

function makeCard(id, rank, suit, value, handOwner) {
  return {
    id,
    rank,
    suit,
    value,
    owner: handOwner ? handOwner.toLowerCase() : undefined,
    handOwner
  };
}

function baseState() {
  return {
    ...createEmptyGameState(),
    phase: "pegging",
    pile: {
      cards: [],
      count: 0,
      passed: { player: false, comp: false },
      lastPlayer: null
    }
  };
}

describe("pegging scoring", () => {
  test("scores 15 for pegging", () => {
    const state = {
      ...baseState(),
      pile: {
        cards: [makeCard("p1", "10", "spades", 10, "Player")],
        count: 10,
        passed: { player: false, comp: false },
        lastPlayer: "player"
      },
      players: {
        player: { hand: [makeCard("c1", "5", "hearts", 5, "Player")] },
        comp: { hand: [] }
      }
    };

    const next = applyEvent(state, { type: "PLAY_CARD", playerId: "player", cardId: "c1" });
    expect(next.pile.count).toBe(15);
    expect(next.scores.player).toBe(2);
  });

  test("scores pair for pegging", () => {
    const state = {
      ...baseState(),
      pile: {
        cards: [makeCard("p1", "5", "spades", 5, "Player")],
        count: 5,
        passed: { player: false, comp: false },
        lastPlayer: "player"
      },
      players: {
        player: { hand: [makeCard("c1", "5", "hearts", 5, "Player")] },
        comp: { hand: [] }
      }
    };

    const next = applyEvent(state, { type: "PLAY_CARD", playerId: "player", cardId: "c1" });
    expect(next.scores.player).toBe(2);
  });

  test("scores run for pegging", () => {
    const state = {
      ...baseState(),
      pile: {
        cards: [
          makeCard("p1", "7", "spades", 7, "Player"),
          makeCard("p2", "8", "hearts", 8, "Comp")
        ],
        count: 15,
        passed: { player: false, comp: false },
        lastPlayer: "comp"
      },
      players: {
        player: { hand: [makeCard("c1", "9", "clubs", 9, "Player")] },
        comp: { hand: [] }
      }
    };

    const next = applyEvent(state, { type: "PLAY_CARD", playerId: "player", cardId: "c1" });
    expect(next.scores.player).toBe(3);
  });

  test("awards go point when both players pass", () => {
    const state = {
      ...baseState(),
      pile: {
        cards: [makeCard("p1", "9", "spades", 9, "Player")],
        count: 9,
        passed: { player: false, comp: true },
        lastPlayer: "player"
      }
    };

    const next = applyEvent(state, { type: "PASS", playerId: "player" });
    expect(next.scores.player).toBe(1);
    expect(next.pile.count).toBe(0);
  });
});

describe("hand and crib scoring", () => {
  test("adds crib score to dealer", () => {
    const playerHand = [
      makeCard("p1", "5", "spades", 5, "Player"),
      makeCard("p2", "10", "spades", 10, "Player"),
      makeCard("p3", "2", "diamonds", 2, "Player"),
      makeCard("p4", "3", "spades", 3, "Player")
    ];
    const compHand = [
      makeCard("c1", "5", "hearts", 5, "Comp"),
      makeCard("c2", "5", "diamonds", 5, "Comp"),
      makeCard("c3", "2", "spades", 2, "Comp"),
      makeCard("c4", "K", "clubs", 10, "Comp")
    ];
    const cribCards = [
      makeCard("r1", "4", "hearts", 4, "Crib"),
      makeCard("r2", "6", "hearts", 6, "Crib"),
      makeCard("r3", "8", "hearts", 8, "Crib"),
      makeCard("r4", "9", "hearts", 9, "Crib")
    ];
    const cutCard = makeCard("cut", "K", "hearts", 10, "Cut");

    const state = {
      ...createEmptyGameState(),
      handForScoring: { player: playerHand, comp: compHand },
      crib: cribCards,
      cutCard,
      dealerId: "player"
    };

    const expectedPlayer =
      scoreHand([...playerHand, cutCard]).total +
      scoreHand([...cribCards, cutCard]).total;
    const expectedComp = scoreHand([...compHand, cutCard]).total;

    const next = scoreHands(state);
    expect(next.scores.player).toBe(expectedPlayer);
    expect(next.scores.comp).toBe(expectedComp);
  });
});
