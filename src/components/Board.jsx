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
import Card from "./Card";
import CribIcon from "./CribIcon";
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

  useEffect(() => {
    if (!state.matches("discard")) return undefined;
    if (!canContinueFromDiscard) return undefined;
    const timer = setTimeout(() => {
      send({ type: "DISCARD_COMPLETE" });
    }, 400);
    return () => clearTimeout(timer);
  }, [state, canContinueFromDiscard, send]);

  const toggleDiscard = (card) => {
    if (gameState.discarded.player) return;
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

  const renderDiscardControls = () => (
    <div className={styles.actionBar}>
      <div>
        <h2>Discard to Crib</h2>
        <p>Select two cards to discard.</p>
      </div>
      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={selectedDiscard.length !== 2 || gameState.discarded.player}
          onClick={handleDiscard}
        >
          Discard
        </button>
      </div>
    </div>
  );

  const renderPeggingControls = () => (
    <div className={styles.actionBar}>
      <div>
        <h2>Pegging</h2>
        <p>Play a card or call Go.</p>
      </div>
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
  );

  const renderScoreHands = () => (
    <div className={styles.phaseOverlay}>
      <div className={styles.phaseCard}>
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
      <div className={styles.phaseOverlay}>
        <div className={styles.phaseCard}>
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

  const renderGameplay = () => {
    const compCards = gameState.players.comp.hand.map((card) => ({
      ...card,
      faceUp: false
    }));
    const cribCards = gameState.crib.map((card) => ({
      ...card,
      faceUp: state.matches("scoreHands")
    }));

    return (
      <div className={styles.table}>
        <div className={styles.topArea}>
          <div className={styles.playerLabel}>
            Computer
            {gameState.dealerId === "comp" && (
              <span className={styles.cribBadge} title="Computer's crib">
                <CribIcon size={16} />
              </span>
            )}
          </div>
          <Hand cards={compCards} backVariant="deepBlue" />
        </div>
        <div className={styles.centerArea}>
          <div className={styles.centerColumn}>
            <div className={styles.cutCardBlock}>
              <div className={styles.centerLabel}>Cut Card</div>
              {gameState.cutCard ? <Card card={gameState.cutCard} disabled /> : null}
            </div>
            <Pile cards={gameState.pile.cards} count={gameState.pile.count} />
          </div>
          <div className={styles.centerColumn}>
            <Scoreboard scores={gameState.scores} playTo={settings.playTo} />
            <Crib cards={cribCards} />
          </div>
        </div>
        <div className={styles.bottomArea}>
          <div className={styles.playerLabel}>
            You
            {gameState.dealerId === "player" && (
              <span className={styles.cribBadge} title="Your crib">
                <CribIcon size={16} />
              </span>
            )}
          </div>
          <Hand
            cards={gameState.players.player.hand}
            selectedIds={selectedDiscard}
            disabledIds={state.matches("pegging")
              ? gameState.players.player.hand
                  .map((card) => card.id)
                  .filter((id) => !playerLegalMoves.includes(id))
              : []}
            onCardClick={state.matches("discard") ? toggleDiscard : handlePlayCard}
          />
        </div>
      </div>
    );
  };

  const phaseKey = state.value.toString();
  let overlay = null;
  let actionBar = null;
  if (state.matches("menu")) overlay = renderMenu();
  if (state.matches("discard")) actionBar = renderDiscardControls();
  if (state.matches("pegging")) actionBar = renderPeggingControls();
  if (state.matches("scoreHands")) overlay = renderScoreHands();
  if (state.matches("gameOver")) overlay = renderGameOver();

  return (
    <div className={styles.board}>
      {renderGameplay()}
      {actionBar}
      <AnimatePresence mode="wait">
        {overlay && (
          <motion.div
            key={phaseKey}
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Board;
