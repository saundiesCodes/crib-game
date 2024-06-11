import React, { useState, useEffect } from "react";
import styles from './Card.module.css';

function Card({ rank, value, suit, handleSelectCribExternal, selectedLimitReached, handOwner, cribCardsDiscarded, isSelected, handleSelectPileExternal }) {
  const [selected, setSelected] = useState(isSelected);

  useEffect(() => {
    setSelected(isSelected);
  }, [isSelected]);

  function getSuitIcon(suit) {
    switch (suit) {
      case 'spades':
        return '♠';
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      default:
        return 'Unknown suit';
    }
  }

  const handleSelectCribCardInternal = () => {
    if (handOwner === 'Player' && !cribCardsDiscarded) {
      const card = {
        suit,
        rank,
        value,
        handOwner
      };

      if (!selectedLimitReached && !selected) {
        setSelected(true);
        handleSelectCribExternal(card);
      }

      if ((!selectedLimitReached && selected) || (selectedLimitReached && selected)) {
        setSelected(false);
        handleSelectCribExternal(card);
      }
    }
  };

  const handleSelectPileCardInternal = () => {
    if (handOwner === 'Player' && cribCardsDiscarded) {
      const card = {
        suit,
        rank,
        value,
        handOwner
      };

      if (!selectedLimitReached && !selected) {
        setSelected(true);
        handleSelectPileExternal(card);
      }

      if ((!selectedLimitReached && selected) || (selectedLimitReached && selected)) {
        setSelected(false);
        handleSelectPileExternal(card);
      }
    }
  };

  return handOwner !== 'Comp' ? (
    <div
      className={`${styles.card} ${styles[suit]} ${selected ? styles.selected : styles.unselected}`}
      onClick={!cribCardsDiscarded ? handleSelectCribCardInternal : handleSelectPileCardInternal}
    >
      <div className={styles.rankTop}>{rank}</div>
      <div className={styles.suitTop}>{getSuitIcon(suit)}</div>
      <div className={styles.centerSuit}>{getSuitIcon(suit)}</div>
      <div className={styles.rankBottom}>{rank}</div>
      <div className={styles.suitBottom}>{getSuitIcon(suit)}</div>
    </div>
  ) : (
    <div className={styles.cardBack}>
      <div className={styles.backPattern}></div>
    </div>
  );
};

export default Card;
