import React, { useState } from "react";
import styles from './Card.module.css';

function Card({ rank, value, suit }) {
  const [selected, setSelected] = useState(false);

  function getSuitIcon(suit) {
    switch (suit) {
      case 'spades':
        return '♠'; // Description or action for Spades
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      default:
        return 'Unknown suit'; // Fallback for unknown cases
    }
  }

  const handleSelect = () => {
    setSelected(!selected);
  };

  return (
    <div
      className={`${styles.card} ${styles[suit]} ${selected ? styles.selected : ''}`}
      onClick={handleSelect}
    >
      <div className={styles.rankTop}>{rank}</div>
      <div className={styles.suitTop}>{getSuitIcon(suit)}</div>
      <div className={styles.centerSuit}>{getSuitIcon(suit)}</div>
      <div className={styles.rankBottom}>{rank}</div>
      <div className={styles.suitBottom}>{getSuitIcon(suit)}</div>
    </div>
  );
}

export default Card;
