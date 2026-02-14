import React, { useEffect, useMemo, useState } from "react";
import { useMachine } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import { cribbageMachine } from "../machines/cribbageMachine";
import { legalMoves } from "../game/rules/pegging";
import { choosePeggingPlay } from "../game/ai/basic";
import Menu from "./Menu";
import Settings from "./Settings";
import Hand from "./Hand";
import Pile from "./Pile";
import Scoreboard from "./Scoreboard";
import Crib from "./Crib";
import styles from "./Board.module.css";

function Board() {
  const [state, send] = useMachine(cribbageMachine);
  const { gameState, settings } = state.context;
  const [playTo, setPlayTo] = useState(settings.playTo);
  const [selectedDiscard, setSelectedDiscard] = useState([]);
  const canContinueFromDiscard = gameState.discarded.player && gameState.discarded.comp;

  const playerLegalMoves = useMemo(
    () => legalMoves(gameState, "player"),
    [gameState]
  );

  useEffect(() => {
    if (!state.matches("pegging")) return undefined;
    if (gameState.turnId !== "comp") return undefined;

    const timer = setTimeout(() => {
      const compMove = choosePeggingPlay(gameState, "comp");
      if (compMove) {
        send({ type: "PLAY_CARD", playerId: "comp", cardId: compMove });
      } else {
        send({ type: "PASS", playerId: "comp" });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [state, gameState, send]);

  const toggleDiscard = (card) => {
    setSelectedDiscard((prev) => {
      if (prev.includes(card.id)) {
        return prev.filter((id) => id !== card.id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, card.id];
    });
  };

  const handleDiscard = () => {
    send({ type: "DISCARD", playerId: "player", cardIds: selectedDiscard });
    setSelectedDiscard([]);
  };

  const handlePlayCard = (card) => {
    send({ type: "PLAY_CARD", playerId: "player", cardId: card.id });
  };

  const renderMenu = () => (
    <Menu
      onStart={() => send({ type: "START_GAME", settings: { playTo } })}
    >
      <Settings playTo={playTo} onChange={setPlayTo} />
    </Menu>
  );

  const renderDeal = () => (
    <div className={styles.phase}>
      <div className={styles.column}>
        <h2>Deal Cards</h2>
        <p>Ready to deal the hands and reveal the cut card.</p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => send({ type: "DEAL_COMPLETE" })}
        >
          Deal
        </button>
      </div>
      <div className={styles.column}>
        <Scoreboard scores={gameState.scores} playTo={settings.playTo} />
      </div>
    </div>
  );

  const renderDiscard = () => (
    <div className={styles.phase}>
      <div className={styles.column}>
        <h2>Discard to Crib</h2>
        <p>Select two cards to discard.</p>
        <Hand
          cards={gameState.players.player.hand}
          selectedIds={selectedDiscard}
          onCardClick={toggleDiscard}
        />
        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={selectedDiscard.length !== 2}
            onClick={handleDiscard}
          >
            Discard
          </button>
          {canContinueFromDiscard && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => send({ type: "DISCARD_COMPLETE" })}
            >
              Continue
            </button>
          )}
        </div>
      </div>
      <div className={styles.column}>
        <Scoreboard scores={gameState.scores} playTo={settings.playTo} />
        <Crib cards={gameState.crib} />
        <div className={styles.infoBox}>Computer has {gameState.players.comp.hand.length} cards.</div>
      </div>
    </div>
  );

  const renderPegging = () => (
    <div className={styles.phase}>
      <div className={styles.column}>
        <h2>Pegging</h2>
        <Pile cards={gameState.pile.cards} count={gameState.pile.count} />
        {playerLegalMoves.length === 0 && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => send({ type: "PASS", playerId: "player" })}
          >
            Go
          </button>
        )}
      </div>
      <div className={styles.column}>
        <Scoreboard scores={gameState.scores} playTo={settings.playTo} />
        <div className={styles.infoBox}>Your hand</div>
        <Hand
          cards={gameState.players.player.hand}
          disabledIds={gameState.players.player.hand
            .map((card) => card.id)
            .filter((id) => !playerLegalMoves.includes(id))}
          onCardClick={handlePlayCard}
        />
        <div className={styles.infoBox}>Computer cards: {gameState.players.comp.hand.length}</div>
      </div>
    </div>
  );

  const renderScoreHands = () => (
    <div className={styles.phase}>
      <div className={styles.column}>
        <h2>Hand Scoring</h2>
        <p>Hands have been scored. Review totals.</p>
        <Scoreboard scores={gameState.scores} playTo={settings.playTo} />
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => send({ type: "SCORE_COMPLETE" })}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderGameOver = () => {
    const winner = gameState.scores.player >= gameState.scores.comp ? "Player" : "Computer";
    return (
      <div className={styles.phase}>
        <div className={styles.column}>
          <h2>Game Over</h2>
          <p>{winner} wins.</p>
          <Scoreboard scores={gameState.scores} playTo={settings.playTo} />
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => send({ type: "RESTART" })}
          >
            Restart
          </button>
        </div>
      </div>
    );
  };

  const phaseKey = state.value.toString();
  let content = null;
  if (state.matches("menu")) content = renderMenu();
  if (state.matches("deal")) content = renderDeal();
  if (state.matches("discard")) content = renderDiscard();
  if (state.matches("pegging")) content = renderPegging();
  if (state.matches("scoreHands")) content = renderScoreHands();
  if (state.matches("gameOver")) content = renderGameOver();

  return (
    <div className={styles.board}>
      <AnimatePresence mode="wait">
        <motion.div
          key={phaseKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Board;
