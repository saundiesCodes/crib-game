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
    let suitCounts = {}; // Object to track occurrences of each rank
    let fiveCardFlushes = 0;
    let fourCardFlushes = 0;

    const playerCards = cards.filter(card => { 
        return card.handOwner === 'Player'
    })

    console.log("Player Cards", playerCards);

    playerCards.forEach(card => {
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });

    Object.values(suitCounts).forEach(count => {
        if(count === 4){ 
            fourCardFlushes += Math.floor(count / 4)
        } 
    });

    if(fourCardFlushes > 0){ 

        cards.forEach(card => {
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
        });
    }
    const flush = { 
        "Four card flushes": fourCardFlushes
    }

    return flush;
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
