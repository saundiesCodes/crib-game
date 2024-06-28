import React, { useState, useEffect } from "react";
import Hand from "./Hand";
import Card from "./Card";
import styles from "./Deck.module.css"

function Deck() {
    const [playerHand, setPlayerHand] = useState([]);
    const [compHand, setCompHand] = useState([]);
    const [hasBeenDealt, setHasBeenDealt] = useState(false);
    const [cutCard, setCutCard] = useState({});
    const [cribCards, setCribCards] = useState([]);
    const [pileCards, setPileCards] = useState([]);
    const [pileCount, setPileCount] = useState(0);
    const [playerPlayed, setPlayerPlayed] = useState(false);

    const FACEVALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const SUITS = ["spades", "diamonds", "clubs", "hearts"];

    const getValue = (faceValue) => {
        switch (faceValue) {
            case "A":
                return 1;
            case "10":
            case "J":
            case "Q":
            case "K":
                return 10;
            default:
                return parseInt(faceValue);
        }
    }

    const handleDiscardCribCards = cards => {
        setCribCards(prevCribCards => [...prevCribCards, ...cards]);
    }

    const handlePlayPileCard = card => {
        setPlayerPlayed(true);
        setPileCards(prevPileCards => [...prevPileCards, ...card]);
    }

    const handleCompPlayPileCard = card => {
        setPlayerPlayed(false);
        setPileCards(prevPileCards => [...prevPileCards, ...card]);
    }

    function freshDeck() {
        return SUITS.flatMap(suit => {
            return FACEVALUES.map(faceValue => {
                const cardObj = {
                    suit,
                    rank: faceValue,
                    value: getValue(faceValue)
                }
                return cardObj;
            })
        })
    }

    const deck = freshDeck();

    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const oldValue = deck[newIndex];
            deck[newIndex] = deck[i];
            deck[i] = oldValue;
        }
    }

    function dealCards(deck) {
        shuffleDeck(deck)
        const pHand = [];
        const cHand = [];
        for (let i = deck.length - 1; i > 39; i -= 2) {
            pHand.push(deck[i]);
            deck.pop();
            cHand.push(deck[(i - 1)]);
            deck.pop();
        }

        let updatedpHand = pHand.map(card => {
            card.handOwner = "Player";
            card.faceUp = true;
            return card;
        });

        let updatedcHand = cHand.map(card => {
            card.handOwner = "Comp";
            card.faceUp = false;
            return card;
        });

        setPlayerHand(updatedpHand);
        setCompHand(updatedcHand);
        const cut = cutDeck(deck);
        cut.faceUp = true;
        setCutCard(cut);
        setHasBeenDealt(true);
    }

    function cutDeck(deck) {
        const cutIndex = Math.floor(Math.random() * deck.length);
        return deck[cutIndex];

    }

    function getCompCribIndexes(max) {
        let firstIndex;
        let secondIndex = -1;
        let indexes = [];

        firstIndex = Math.floor(Math.random() * max);
        indexes.push(firstIndex);
        do {
            secondIndex = Math.floor(Math.random() * max);
        }
        while (secondIndex === firstIndex);
        indexes.push(secondIndex);
        return indexes;
    }

    function getCompPileIndex(max) {
        const indexNum = Math.floor(Math.random() * max);
        return indexNum;
    }

    useEffect(() => {
        if (cribCards.length === 2) {
            const pHandSansCrib = playerHand.filter(handCard => {
                return !cribCards.some(cribCard => handCard.rank === cribCard.rank && handCard.suit === cribCard.suit);
            });
            const cribIndexes = getCompCribIndexes(5);
            const compCribCards = [compHand[cribIndexes[0]], compHand[cribIndexes[1]]];
            handleDiscardCribCards(compCribCards);
            setPlayerHand(pHandSansCrib);
        }
        const cHandSansCrib = compHand.filter(handCard => {
            return !cribCards.some(cribCard => handCard.rank === cribCard.rank && handCard.suit === cribCard.suit);
        });
        setCompHand(cHandSansCrib);
    }, [cribCards]);

    useEffect(() => {
        if (playerPlayed) {
            const newPHand = playerHand.filter(handCard => {
                return !pileCards.some(pileCard => handCard.rank === pileCard.rank && handCard.suit === pileCard.suit);
            });
            setPlayerHand(newPHand);
        } else {
            const newCHand = compHand.filter(handCard => {
                return !pileCards.some(pileCard => handCard.rank === pileCard.rank && handCard.suit === pileCard.suit);
            });
            setCompHand(newCHand);
        }

        let count = 0;
        pileCards.forEach(card => { 
            count = count + card.value;
        })
        setPileCount(count);
    }, [pileCards]);

    useEffect(() => {
        let timer;
        if (playerPlayed) {
            timer = setTimeout(() => {
                const compPileCard = compHand[getCompPileIndex(compHand.length)];
                compPileCard.faceUp = true;
                const cpcArray = [];
                cpcArray.push(compPileCard);
                handleCompPlayPileCard(cpcArray);
            }, 1000);
        }

        // Cleanup function to clear the timeout if the component unmounts
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [playerPlayed]);

    return (
        <div className={styles.deckContainer}>
            <div className={styles.compHand}>
                <Hand
                    cards={compHand}
                    handleDiscardCribCards={handleDiscardCribCards}
                />
            </div>
            {!hasBeenDealt &&
                <div className={styles.buttonContainer}>
                    <button onClick={() => dealCards(deck)}>Deal Deck</button>
                </div>
            }
            {hasBeenDealt &&
                <div className={styles.cutCard}>
                    <Card suit={cutCard.suit} rank={cutCard.rank} value={cutCard.value} faceUp={cutCard.faceUp} />
                    {/* CHANGE THIS TO A PILE COMPONENT */}
                    {pileCards.length > 0 &&
                        <>
                        <div className={styles.pileDiv}>
                            {pileCards.map(card => (
                                <Card
                                    suit={card.suit}
                                    rank={card.rank}
                                    value={card.value}
                                    faceUp={card.faceUp} />
                            ))}
                        </div><div className={styles.countDiv}>{pileCount}</div>
                        </>
                    }
                </div>
            }
           <div className={styles.playerHandContainer}>
    <div className={styles.handAndScore}>
        <div className={styles.playerHand}>
            <Hand
                cards={playerHand}
                handleDiscardCribCards={handleDiscardCribCards}
                handlePlayPileCard={handlePlayPileCard}
            />
        </div>
        <div className={styles.playerScore}>
            {pileCount}/121
        </div>
    </div>
</div>
</div>
    );

}

export default Deck;
