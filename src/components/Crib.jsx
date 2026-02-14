import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Card from "./Card";
import styles from "./Crib.module.css";

function Crib({ cards }) {
  return (
    <div className={styles.crib}>
      <div className={styles.title}>Crib</div>
      <div className={styles.cards}>
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Card card={card} disabled />
            </motion.div>
          ))}
        </AnimatePresence>
        {cards.length === 0 && <div className={styles.placeholder}>No cards yet</div>}
      </div>
    </div>
  );
}

export default Crib;
