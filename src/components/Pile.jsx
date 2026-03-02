import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import styles from "./Pile.module.css";

function Pile({ cards, count }) {
  return (
    <div className={styles.pile}>
      <div className={styles.count}>Count: {count}</div>
      <div className={styles.cards}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card card={card} disabled dimmed={false} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Pile;
