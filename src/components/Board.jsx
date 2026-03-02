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
  const [peggingNotice, setPeggingNotice] = useState(null);
  const [noticePileSnapshot, setNoticePileSnapshot] = useState(null);
  const [isPeggingPause, setIsPeggingPause] = useState(false);
  const canContinueFromDiscard = gameState.discarded.player && gameState.discarded.comp;
  const isPeggingComplete =
    gameState.players.player.hand.length === 0 &&
    gameState.players.comp.hand.length === 0;

  const playerLegalMoves = useMemo(
    () => legalMoves(gameState, "player"),
    [gameState]
  );

  useEffect(() => {
    if (!state.matches("pegging")) return undefined;
    if (isPeggingPause) return undefined;
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
  }, [state, gameState, send, isPeggingPause]);

  useEffect(() => {
    if (!state.matches("pegging")) return undefined;
    if (isPeggingPause) return undefined;
    if (gameState.turnId !== "player") return undefined;
    if (playerLegalMoves.length > 0) return undefined;

    const timer = setTimeout(() => {
      send({ type: "PASS", playerId: "player" });
    }, 450);

    return () => clearTimeout(timer);
  }, [state, gameState.turnId, playerLegalMoves.length, isPeggingPause, send]);

  useEffect(() => {
    if (!state.matches("pegging")) return undefined;
    if (!gameState.lastPeggingScore) return undefined;

    setPeggingNotice(gameState.lastPeggingScore);
    if (gameState.lastPeggingScore.pileCards && typeof gameState.lastPeggingScore.pileCount === "number") {
      setNoticePileSnapshot({
        cards: gameState.lastPeggingScore.pileCards,
        count: gameState.lastPeggingScore.pileCount
      });
    } else {
      setNoticePileSnapshot(null);
    }
    setIsPeggingPause(true);

    const pauseTimer = setTimeout(() => {
      setIsPeggingPause(false);
    }, 1000);
    const clearTimer = setTimeout(() => {
      setPeggingNotice(null);
      setNoticePileSnapshot(null);
    }, 1400);

    return () => {
      clearTimeout(pauseTimer);
      clearTimeout(clearTimer);
    };
  }, [state, gameState.lastPeggingScore?.id]);

  useEffect(() => {
    if (state.matches("pegging")) return;
    setPeggingNotice(null);
    setNoticePileSnapshot(null);
    setIsPeggingPause(false);
  }, [state]);

  useEffect(() => {
    if (!state.matches("discard")) return undefined;
    if (!canContinueFromDiscard) return undefined;
    const timer = setTimeout(() => {
      send({ type: "DISCARD_COMPLETE" });
    }, 400);
    return () => clearTimeout(timer);
  }, [state, canContinueFromDiscard, send]);

  useEffect(() => {
    if (!state.matches("pegging")) return undefined;
    if (!isPeggingComplete) return undefined;
    if (isPeggingPause) return undefined;

    const timer = setTimeout(() => {
      send({ type: "PEGGING_ROUND_END" });
    }, 100);
    return () => clearTimeout(timer);
  }, [state, isPeggingComplete, isPeggingPause, send]);

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
    if (isPeggingPause) return;
    send({ type: "PLAY_CARD", playerId: "player", cardId: card.id });
  };

  const renderMenu = () => (
    <Menu
      onStart={() => send({ type: "START_GAME", settings: { playTo } })}
    >
      <Settings playTo={playTo} onChange={setPlayTo} />
    </Menu>
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

    const displayedPile = state.matches("pegging") && noticePileSnapshot
      ? noticePileSnapshot
      : { cards: gameState.pile.cards, count: gameState.pile.count };

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
              {gameState.cutCard ? <Card card={gameState.cutCard} disabled dimmed={false} /> : null}
            </div>
            <div className={styles.pileControlsRow}>
              <Pile cards={displayedPile.cards} count={displayedPile.count} />
            </div>
            <AnimatePresence mode="wait">
              {state.matches("pegging") && peggingNotice && (
                <motion.div
                  key={`notice-${peggingNotice.id}`}
                  className={styles.peggingNotice}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {peggingNotice.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={styles.centerColumn}>
            <Scoreboard
              scores={gameState.scores}
              playTo={settings.playTo}
              peggingNotice={state.matches("pegging") ? peggingNotice : null}
            />
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
          <div className={styles.playerControlsRow}>
            <Hand
              cards={gameState.players.player.hand}
              selectedIds={selectedDiscard}
              disabledIds={state.matches("pegging")
                ? gameState.players.player.hand
                    .map((card) => card.id)
                    .filter((id) => isPeggingPause || !playerLegalMoves.includes(id))
                : []}
              onCardClick={state.matches("discard") ? toggleDiscard : handlePlayCard}
            />
            {state.matches("discard") && (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={selectedDiscard.length !== 2 || gameState.discarded.player}
                onClick={handleDiscard}
              >
                Discard
              </button>
            )}
          </div>
        </div>
      </div>
  );
  };

  const phaseKey = state.value.toString();
  let overlay = null;
  if (state.matches("menu")) overlay = renderMenu();
  if (state.matches("scoreHands")) overlay = renderScoreHands();
  if (state.matches("gameOver")) overlay = renderGameOver();

  return (
    <div className={styles.board}>
      {renderGameplay()}
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
