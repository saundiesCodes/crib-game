import { scoreHand } from "./game/scoring/handScore";

describe("scoreHand", () => {
    test("scores a hand with only fifteens", () => {
        const cardsNoPairs = [
            { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "10", value: 10, handOwner: "Player", faceUp: true },
            { suit: "diamonds", rank: "2", value: 2, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "3", value: 3, handOwner: "Player", faceUp: true },
            { suit: "clubs", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
        ];

        const score = scoreHand(cardsNoPairs);
        expect(score.total).toBe(8);
        expect(score.fifteens).toBe(4);
    });

    test("scores two pairs plus fifteens", () => {
        const cardsTwoPairs = [
            { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "hearts", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "diamonds", rank: "2", value: 2, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "2", value: 2, handOwner: "Player", faceUp: true },
            { suit: "clubs", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
        ];

        const score = scoreHand(cardsTwoPairs);
        expect(score.total).toBe(8);
        expect(score.points.pairs).toBe(4);
        expect(score.points.fifteens).toBe(4);
    });

    test("scores three of a kind plus fifteens", () => {
        const cardsThreeOfAKind = [
            { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "hearts", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "diamonds", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "2", value: 2, handOwner: "Player", faceUp: true },
            { suit: "clubs", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
        ];

        const score = scoreHand(cardsThreeOfAKind);
        expect(score.total).toBe(14);
        expect(score.points.threeOfAKind).toBe(6);
        expect(score.fifteens).toBe(4);
    });

    test("scores flush, run, and fifteen", () => {
        const cardsFlush = [
            { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "4", value: 4, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "3", value: 3, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "2", value: 2, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
        ];

        const score = scoreHand(cardsFlush);
        expect(score.total).toBe(13);
        expect(score.points.flushes).toBe(5);
        expect(score.points.runs).toBe(4);
    });

    test("scores double run from a pair", () => {
        const cardsDoubleRun = [
            { suit: "spades", rank: "3", value: 3, handOwner: "Player", faceUp: true },
            { suit: "hearts", rank: "4", value: 4, handOwner: "Player", faceUp: true },
            { suit: "diamonds", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "clubs", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "9", value: 9, handOwner: "Cut", faceUp: true }
        ];

        const score = scoreHand(cardsDoubleRun);
        expect(score.runs.points).toBe(6);
        expect(score.runs.runLength).toBe(3);
        expect(score.runs.runCount).toBe(2);
    });

    test("scores nobs", () => {
        const cardsNobs = [
            { suit: "hearts", rank: "J", value: 10, handOwner: "Player", faceUp: true },
            { suit: "clubs", rank: "2", value: 2, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "6", value: 6, handOwner: "Player", faceUp: true },
            { suit: "diamonds", rank: "9", value: 9, handOwner: "Player", faceUp: true },
            { suit: "hearts", rank: "4", value: 4, handOwner: "Cut", faceUp: true }
        ];

        const score = scoreHand(cardsNobs);
        expect(score.nobs).toBe(1);
    });

    test("scores the maximum 29-point hand", () => {
        const cardsTwentyNine = [
            { suit: "hearts", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "diamonds", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "clubs", rank: "5", value: 5, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "J", value: 10, handOwner: "Player", faceUp: true },
            { suit: "spades", rank: "5", value: 5, handOwner: "Cut", faceUp: true }
        ];

        const score = scoreHand(cardsTwentyNine);
        expect(score.total).toBe(29);
        expect(score.fifteens).toBe(8);
        expect(score.points.fifteens).toBe(16);
        expect(score.points.fourOfAKind).toBe(12);
        expect(score.nobs).toBe(1);
    });
});
