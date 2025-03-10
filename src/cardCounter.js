export function cardCounter(cards){ 
    const counts = countOfAKinds(cards);
    const fifteens = countFifteenCombinations(cards);
    const flushes = countingFlushes(cards);

    console.log("COUNTS", counts);
    console.log("FIFTEENS", fifteens);
    console.log("FLUSHES", flushes);
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
