import { assign, createMachine } from "xstate";
import { applyEvent, createEmptyGameState, createInitialGameState, isPeggingComplete, scoreHands, startNextHand } from "../game/engine";
import { GameEvent, GameState, Settings } from "../game/types";

export type CribbageContext = {
  gameState: GameState;
  settings: Settings;
};

const DEFAULT_SETTINGS: Settings = { playTo: 121 };

export const cribbageMachine = createMachine(
  {
    id: "cribbage",
    initial: "menu",
    context: {
      gameState: createEmptyGameState(),
      settings: DEFAULT_SETTINGS
    },
    states: {
      menu: {
        on: {
          START_GAME: {
            target: "deal",
            actions: assign(({ event, context }) => {
              const settings = event.type === "START_GAME" && event.settings ? event.settings : context.settings;
              return {
                settings,
                gameState: createInitialGameState(settings)
              };
            })
          }
        }
      },
      deal: {
        always: "discard"
      },
      discard: {
        on: {
          DISCARD: {
            actions: assign(({ event, context }) => ({
              gameState: applyEvent(context.gameState, event as GameEvent)
            }))
          },
          DISCARD_COMPLETE: "pegging"
        }
      },
      pegging: {
        on: {
          PLAY_CARD: {
            actions: assign(({ event, context }) => ({
              gameState: applyEvent(context.gameState, event as GameEvent)
            }))
          },
          PASS: {
            actions: assign(({ event, context }) => ({
              gameState: applyEvent(context.gameState, event as GameEvent)
            }))
          }
        },
        always: {
          target: "scoreHands",
          guard: "peggingComplete"
        }
      },
      scoreHands: {
        entry: assign(({ context }) => ({
          gameState: scoreHands(context.gameState)
        })),
        on: {
          SCORE_COMPLETE: [
            {
              target: "gameOver",
              guard: "hasWinner"
            },
            {
              target: "deal",
              actions: assign(({ context }) => ({
                gameState: startNextHand(context.gameState, context.settings)
              }))
            }
          ]
        }
      },
      gameOver: {
        on: {
          RESTART: {
            target: "menu",
            actions: assign(() => ({
              gameState: createEmptyGameState()
            }))
          }
        }
      }
    }
  },
  {
    guards: {
      peggingComplete: ({ context }) => isPeggingComplete(context.gameState),
      hasWinner: ({ context }) =>
        context.gameState.scores.player >= context.settings.playTo ||
        context.gameState.scores.comp >= context.settings.playTo
    }
  }
);
