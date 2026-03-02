import React from "react";
import styles from "./Settings.module.css";

function Settings({ playTo, onChange }) {
  return (
    <div className={styles.settings}>
      <label className={styles.label} htmlFor="playTo">
        Play to
      </label>
      <input
        id="playTo"
        className={styles.input}
        type="number"
        min={61}
        max={181}
        value={playTo}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export default Settings;
