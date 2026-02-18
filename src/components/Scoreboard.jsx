import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Scoreboard.module.css";

function Scoreboard({ scores, playTo, peggingNotice }) {
  const showPlayerNotice = peggingNotice?.playerId === "player";
  const showCompNotice = peggingNotice?.playerId === "comp";
  const plusLabel = peggingNotice ? `+${peggingNotice.points}` : "";

  return (
    <div className={styles.scoreboard}>
      <div className={styles.row}>
        <span>Player: {scores.player}</span>
        <AnimatePresence>
          {showPlayerNotice && (
            <motion.span
              key={`player-${peggingNotice.id}`}
              className={styles.delta}
              initial={{ opacity: 0, x: -28, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 22, y: -14, scale: 0.7 }}
              transition={{ duration: 0.45 }}
            >
              {plusLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className={styles.row}>
        <span>Computer: {scores.comp}</span>
        <AnimatePresence>
          {showCompNotice && (
            <motion.span
              key={`comp-${peggingNotice.id}`}
              className={styles.delta}
              initial={{ opacity: 0, x: -28, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 22, y: -14, scale: 0.7 }}
              transition={{ duration: 0.45 }}
            >
              {plusLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className={styles.target}>Target: {playTo}</div>
    </div>
  );
}

export default Scoreboard;
