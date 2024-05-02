import React, { useState } from "react";
import Hand from "./Hand";
import Card from "./Card";

function Deck() {
    const [playerHand, setPlayerHand] = useState([]);
    const [compHand, setCompHand] = useState([]);

    const FACEVALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
    const SUITS = ["spades", "diamonds", "clubs", "hearts"];

    function freshDeck() {
        return SUITS.flatMap(suit => {
            return FACEVALUES.map(faceValue => {
                const cardObj = { 
                    suit,
                    rank: faceValue
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
        console.log("SHUFFLED DECK", deck);
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
        setPlayerHand(pHand);
        setCompHand(cHand);
    }
    return (
      <>
        <Hand cards={playerHand} />
        <Hand cards={compHand} />
        <button onClick={() => dealCards(deck)}>
            Deal Deck
        </button>
      </>
    );
  }

  export default Deck;