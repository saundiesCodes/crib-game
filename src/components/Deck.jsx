import React, { useState, useEffect} from "react";
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

    const FACEVALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const SUITS = ["spades", "diamonds", "clubs", "hearts"];

    const getValue = (faceValue) => { 
        switch(faceValue){ 
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
        for(let i = deck.length - 1; i > 0; i--){
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
        for(let i = deck.length -1; i > 39; i-=2) {
            pHand.push(deck[i]);
            deck.pop();
            cHand.push(deck[(i-1)]);
            deck.pop();
        }

        let updatedpHand = pHand.map(card => {
            card.handOwner = "Player"; 
            return card;
        });

        let updatedcHand = cHand.map(card => {
            card.handOwner = "Comp"; 
            return card;
        });

        console.log("PLAYER HAND", pHand);

        setPlayerHand(updatedpHand);
        setCompHand(updatedcHand);
        const cut = cutDeck(deck);
        setCutCard(cut);
        setHasBeenDealt(true);
    }

    function cutDeck(deck){ 
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
            console.log(secondIndex);
          }
          while (secondIndex === firstIndex);
        indexes.push(secondIndex);
        return indexes;
      }

    useEffect(() => {
        if(cribCards.length === 2){ 
            const pHandSansCrib = playerHand.filter(handCard => {
                return !cribCards.some(cribCard => handCard.rank === cribCard.rank && handCard.suit === cribCard.suit);
            });
            const cribIndexes = getCompCribIndexes(5);
            const compCribCards = [compHand[cribIndexes[0]], compHand[cribIndexes[1]]];
            handleDiscardCribCards(compCribCards);
            console.log(cribIndexes);
            console.log(pHandSansCrib);
            setPlayerHand(pHandSansCrib);
        }
        console.log(cribCards);
        const cHandSansCrib = compHand.filter(handCard => {
            return !cribCards.some(cribCard => handCard.rank === cribCard.rank && handCard.suit === cribCard.suit);
        });
        setCompHand(cHandSansCrib);
    }, [cribCards]);

    useEffect(() => {
    const newPHand = playerHand.filter(handCard => {
        return !pileCards.some(pileCard => handCard.rank === pileCard.rank && handCard.suit === pileCard.suit);
    });
    setPlayerHand(newPHand);
    }, [pileCards]);
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
                <Card suit={cutCard.suit} rank={cutCard.rank} value={cutCard.value} />
                {pileCards.length > 0 && 
                    pileCards.map(card => (
                        <Card 
                            suit={card.suit}
                            rank={card.rank}
                            value={card.value}
                            handOwner={card.handOwner}
                        />
                    ))
                }
            </div>
            }
            <div className={styles.playerHand}>
                <Hand 
                    cards={playerHand} 
                    handleDiscardCribCards={handleDiscardCribCards}
                    handlePlayPileCard={handlePlayPileCard}
                />
            </div>
        </div>
    );
       
}

  export default Deck;