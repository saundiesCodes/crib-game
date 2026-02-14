import React from "react";
import styles from "./Scoreboard.module.css";

function Scoreboard({ scores, playTo }) {
  return (
    <div className={styles.scoreboard}>
      <div className={styles.row}>Player: {scores.player}</div>
      <div className={styles.row}>Computer: {scores.comp}</div>
      <div className={styles.target}>Target: {playTo}</div>
    </div>
  );
}

export default Scoreboard;
