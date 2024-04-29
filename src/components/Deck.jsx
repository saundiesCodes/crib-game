import React, { useState } from "react";

function Deck() {

    const FACEVALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
    const SUITS = ["spades", "diamonds", "clubs", "hearts"];

    function freshDeck() {
        return SUITS.flatMap(suit => {
            return FACEVALUES.map(faceValue => {
                const cardObj = { 
                    suit,
                    faceValue
                }
                return cardObj;
            })
        })
    }

    const deck = freshDeck();
    console.log(deck);

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
        let playerHand = [];
        let compHand = [];
        for(let i = deck.length -1; i > 39; i-=2) {
            playerHand.push(deck[i]);
            deck.pop();
            compHand.push(deck[(i-1)]);
            deck.pop();
        }
        console.log("Player's hand is: ");
        console.log(playerHand);
        console.log("Computer's Hand is: ");
        console.log(compHand);
    }
    return (
      <>
        <button onClick={() => shuffleDeck(deck)}>
            Shuffle Deck
        </button>
        <button onClick={() => dealCards(deck)}>
            Deal Deck
        </button>
      </>
    );
  }

  export default Deck;