import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Card from "./Card";
import styles from "./Hand.module.css";

function Hand({ cards, selectedIds = [], disabledIds = [], onCardClick }) {
  return (
    <div className={styles.hand}>
      <AnimatePresence mode="popLayout">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              card={card}
              onClick={onCardClick}
              selected={selectedIds.includes(card.id)}
              disabled={disabledIds.includes(card.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Hand;
