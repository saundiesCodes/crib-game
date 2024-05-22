import React, {useState, useEffect} from "react";
import Card from "./Card";
import styles from "./Hand.module.css"

function Hand({cards}) {
  const [cribCardsSelected, setCribCardsSelected] = useState([]);
  const [selectedLimitReached, setSelectedLimitReached] = useState(false);
  const [cribCardsDiscarded, setCribCardsDiscarded] = useState(false);

  function cardsAreEqual(card1, card2) {
    return card1.rank === card2.rank && card1.suit === card2.suit;
  }

  function handleSelectedCardExternal(card){ 
    const arrayCopy = [...cribCardsSelected];
    const arrayHasCard = arrayCopy.some(existingCard => cardsAreEqual(existingCard, card));
    if(!selectedLimitReached && !arrayHasCard){ 
      arrayCopy.push(card);
      setCribCardsSelected(arrayCopy);
    }

    if(arrayHasCard){ 
      const newArray = arrayCopy.filter(existingCard => !cardsAreEqual(existingCard, card));
      setCribCardsSelected(newArray);
    }

    if(arrayHasCard && selectedLimitReached){ 
      const newArray = arrayCopy.filter(existingCard => !cardsAreEqual(existingCard, card));
      setCribCardsSelected(newArray);
      setSelectedLimitReached(false);
    }
  }

  useEffect(() => {
    console.log("CRIB CARDS SELECTED ARRAY", cribCardsSelected);
    if(cribCardsSelected.length === 2){ 
      console.log(cribCardsSelected);
      setSelectedLimitReached(true);
    } else { 
      setSelectedLimitReached(false);
    }
  }, [cribCardsSelected])

    return (
    <div className={styles.hand}>
      {cards.map((card, index) => (
        <Card key={index} 
        suit={card.suit} 
        rank={card.rank} 
        handleSelectExternal={handleSelectedCardExternal}
        selectedLimitReached={selectedLimitReached}
        handOwner={card.handOwner}
        />
      ))}
    </div>
    );
  }

  export default Hand;