import React from "react";
import styles from "./Menu.module.css";

function Menu({ onStart, children }) {
  return (
    <div className={styles.menu}>
      <h1 className={styles.title}>Cribbage</h1>
      <p className={styles.subtitle}>Clean-slate architecture demo</p>
      {children}
      <button className={styles.startButton} onClick={onStart} type="button">
        Start Game
      </button>
    </div>
  );
}

export default Menu;
