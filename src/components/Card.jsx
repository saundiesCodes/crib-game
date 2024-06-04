import React, { useState, useEffect } from "react";
import styles from './Card.module.css';

function Card({ rank, value, suit, handleSelectExternal, selectedLimitReached, handOwner, cribCardsDiscarded, isSelected }) {
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

  const handleSelectInternal = () => {
    if (handOwner === 'Player' && !cribCardsDiscarded) {
      const card = {
        rank,
        value,
        suit
      };

      if (!selectedLimitReached && !selected) {
        setSelected(true);
        handleSelectExternal(card);
      }

      if ((!selectedLimitReached && selected) || (selectedLimitReached && selected)) {
        setSelected(false);
        handleSelectExternal(card);
      }
    }
  };

  return handOwner !== 'Comp' ? (
    <div
      className={`${styles.card} ${styles[suit]} ${selected ? styles.selected : styles.unselected}`}
      onClick={handleSelectInternal}
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
