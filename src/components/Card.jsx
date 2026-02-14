import React from "react";
import styles from "./Card.module.css";

const SUIT_LABELS = {
  spades: "S",
  hearts: "H",
  diamonds: "D",
  clubs: "C"
};

function Card({ card, onClick, disabled = false, selected = false }) {
  const suitLabel = SUIT_LABELS[card.suit] ?? "?";
  const className = [
    styles.card,
    styles[card.suit],
    selected ? styles.selected : "",
    disabled ? styles.disabled : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick?.(card)}
      disabled={disabled}
    >
      <div className={styles.rank}>{card.rank}</div>
      <div className={styles.suit}>{suitLabel}</div>
    </button>
  );
}

export default Card;
