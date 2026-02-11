export function cardCounter(cards){ 
    const score = scoreHand(cards);

    console.log("SCORE", score);
    return score;
}

function countOfAKinds(cards) {
    const rankCounts = {}; // Object to track occurrences of each rank
    let fourOfAKind = 0;
    let threeOfAKind = 0;
    let pairCount = 0; // Counter for pairs

    cards.forEach(card => {
        rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    });

    Object.values(rankCounts).forEach(count => {
        if(count === 4){ 
            fourOfAKind += Math.floor(count / 4)
        } else if(count === 3){ 
            threeOfAKind += Math.floor(count / 3)
        } else { 
            pairCount += Math.floor(count / 2); 
        }
    });
    const counts = { 
        "pairs": pairCount,
        "threeOfAKind": threeOfAKind,
        "fourOfAKind": fourOfAKind
    }

    return counts;
}

function countingFlushes(cards) {
    let suitCounts = {}; 
    let fiveCardFlushes = 0;
    let fourCardFlushes = 0;
    const hasCompCard = cards.some(card => card.handOwner === "Comp");

    cards.forEach(card => {
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });

    if (!hasCompCard) {
        for (let count of Object.values(suitCounts)) {
            if (count >= 5) {
                fiveCardFlushes = 1;
                break; 
            }
        }
    }

    if (fiveCardFlushes === 0) {
        suitCounts = {}; 
        const playerCards = cards.filter(card => card.handOwner === 'Player' || card.handOwner === 'Comp');

        playerCards.forEach(card => {
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
        });

        for (let count of Object.values(suitCounts)) {
            if (count === 4) {
                fourCardFlushes = 1;
                break;
            }
        }
    }

    return { 
        "Five card flushes": fiveCardFlushes,
        "Four card flushes": fourCardFlushes
    };
}


function countFifteenCombinations(cards) {
    const values = cards.map(card => card.value);
    let count = 0;

    // Generate all subsets using bitwise operations
    const numSubsets = 1 << values.length; // 2^n subsets

    for (let i = 1; i < numSubsets; i++) {
        let sum = 0;

        for (let j = 0; j < values.length; j++) {
            if (i & (1 << j)) { // Check if the j-th card is included
                sum += values[j];
            }
        }

        if (sum === 15) {
            count++;
        }
    }

    return count;
}

function countRuns(cards) {
    const ranks = cards.map(card => rankToValue(card.rank));
    let maxRunLength = 0;
    let runCount = 0;

    const numSubsets = 1 << ranks.length;
    for (let i = 0; i < numSubsets; i++) {
        const subset = [];
        for (let j = 0; j < ranks.length; j++) {
            if (i & (1 << j)) {
                subset.push(ranks[j]);
            }
        }
        if (subset.length < 3) continue;

        subset.sort((a, b) => a - b);
        let isRun = true;
        for (let k = 1; k < subset.length; k++) {
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
        "runLength": maxRunLength,
        "runCount": runCount,
        "points": points
    };
}

function countNobs(cards) {
    const cut = cards.find(card => card.handOwner === "Cut");
    if (!cut) {
        return 0;
    }

    const hasNobs = cards.some(card => (
        card.handOwner !== "Cut" &&
        card.rank === "J" &&
        card.suit === cut.suit
    ));

    return hasNobs ? 1 : 0;
}

function rankToValue(rank) {
    if (typeof rank === "number") return rank;
    const parsed = parseInt(rank, 10);
    if (!Number.isNaN(parsed)) return parsed;
    const map = { "A": 1, "J": 11, "Q": 12, "K": 13 };
    return map[rank];
}

export function scoreHand(cards) {
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
        "pairs": counts.pairs,
        "threeOfAKind": counts.threeOfAKind,
        "fourOfAKind": counts.fourOfAKind,
        "fifteens": fifteens,
        "runs": runs,
        "flushes": flushes,
        "nobs": nobs,
        "points": {
            "pairs": pairPoints,
            "threeOfAKind": threePoints,
            "fourOfAKind": fourPoints,
            "fifteens": fifteenPoints,
            "runs": runs.points,
            "flushes": flushPoints,
            "nobs": nobs
        },
        "total": total
    };
}
