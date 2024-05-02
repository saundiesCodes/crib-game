import React, { useState } from "react";
import styles from './Card.module.css';

function Card({ rank, value, suit }) {

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

    return (
    <div className={`${styles.card} ${styles[suit]}`}>
      <div className={styles.rankTop}>{rank}</div>
      <div className={styles.suitTop}>{getSuitIcon(suit)}</div> 

      <div className={styles.centerSuit}>{getSuitIcon(suit)}</div>
      <div className={styles.rankBottom}>{rank}</div>
      <div className={styles.suitBottom}>{getSuitIcon(suit)}</div> 
    </div>
    );
  }

  export default Card;