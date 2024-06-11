import React, { useState, useEffect } from "react";
import Card from "./Card";
import styles from "./Hand.module.css";

function Hand({ cards, handleDiscardCribCards, handlePlayPileCard }) {
  const [cribCardsSelected, setCribCardsSelected] = useState([]);
  const [pileCardSelected, setPileCardSelected] = useState([]);
  const [selectedLimitReached, setSelectedLimitReached] = useState(false);
  const [cribCardsDiscarded, setCribCardsDiscarded] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  function cardsAreEqual(card1, card2) {
    return card1.rank === card2.rank && card1.suit === card2.suit;
  }

  function handleSelectedCribCardExternal(card) {
    const arrayCopy = [...cribCardsSelected];
    const arrayHasCard = arrayCopy.some(existingCard => cardsAreEqual(existingCard, card));
    if (!selectedLimitReached && !arrayHasCard) {
      arrayCopy.push(card);
      setCribCardsSelected(arrayCopy);
      setSelectedCards(prevSelected => [...prevSelected, card]);
    }

    if (arrayHasCard) {
      const newArray = arrayCopy.filter(existingCard => !cardsAreEqual(existingCard, card));
      setCribCardsSelected(newArray);
      setSelectedCards(prevSelected => prevSelected.filter(existingCard => !cardsAreEqual(existingCard, card)));
    }

    if (arrayHasCard && selectedLimitReached) {
      const newArray = arrayCopy.filter(existingCard => !cardsAreEqual(existingCard, card));
      setCribCardsSelected(newArray);
      setSelectedCards(prevSelected => prevSelected.filter(existingCard => !cardsAreEqual(existingCard, card)));
      setSelectedLimitReached(false);
    }
  }

  function handleSelectedPileCardExternal(card) {
    const arrayCopy = [];
    let arrayHasCard;

    if(selectedCards.length > 0){
      arrayHasCard = selectedCards.some(existingCard => cardsAreEqual(existingCard, card));
    }

    if (!selectedLimitReached && !arrayHasCard) {
      arrayCopy.push(card);
      setPileCardSelected(arrayCopy);
      setSelectedCards(arrayCopy);
      setSelectedLimitReached(true);
    }

    if (arrayHasCard && selectedLimitReached) {
      setPileCardSelected([]);
      setSelectedCards([]);
      setSelectedLimitReached(false);
    }
  }

  const discardCardsToCrib = (cards) => {
    handleDiscardCribCards(cards);
    setCribCardsSelected([]);
    setSelectedLimitReached(false);
    setCribCardsDiscarded(true);
    setSelectedCards([]);
  };

  const handlePlayPileCardInternal = (card) => {
    handlePlayPileCard(card);
    setSelectedLimitReached(false);
    setSelectedCards([]);
  };

  useEffect(() => {
    if (!cribCardsDiscarded && cribCardsSelected.length === 2) {
      setSelectedLimitReached(true);
    }

    if(cribCardsDiscarded && cribCardsSelected.length === 1){ 
      setSelectedLimitReached(true);
    }
  }, [cribCardsSelected, cribCardsDiscarded, selectedLimitReached]);

  return (
    <div className={styles.container}>
      <div className={styles.hand}>
        {cards.map((card, index) => (
          <Card
            key={index}
            suit={card.suit}
            rank={card.rank}
            value={card.value}
            handleSelectCribExternal={handleSelectedCribCardExternal}
            handleSelectPileExternal={handleSelectedPileCardExternal}
            selectedLimitReached={selectedLimitReached}
            handOwner={card.handOwner}
            cribCardsDiscarded={cribCardsDiscarded}
            isSelected={selectedCards.some(selectedCard => cardsAreEqual(selectedCard, card))}
          />
        ))}
      </div>
      {(selectedLimitReached && !cribCardsDiscarded) && (
        <button onClick={() => discardCardsToCrib(cribCardsSelected)} className={styles.button}>Discard to Crib</button>
      )}
      {(selectedLimitReached && cribCardsDiscarded) && (
        <button onClick={() => handlePlayPileCardInternal(pileCardSelected)} className={styles.button}>Play Card</button>
      )}
    </div>
  );
}

export default Hand;
