import React from "react";
import Card from "./Card";
import styles from "./Hand.module.css"

function Hand({cards}) {
    // console.log(cards);
    return (
    <div className={styles.hand}>
      {cards.map((card, index) => (
        <Card key={index} suit={card.suit} rank={card.rank} />
      ))}
    </div>
    );
  }

  export default Hand;