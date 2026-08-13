import { useState, useEffect, useCallback } from 'react';
import { 
  getActiveGame, 
  getRollsForGame, 
  addRoll as dbAddRoll, 
  deleteLastRoll as dbDeleteLastRoll,
  createGame,
  updateGame,
  Game,
  Roll
} from '../lib/storage';

export function useGame() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActiveGame = useCallback(async () => {
    try {
      const game = await getActiveGame();
      if (game) {
        setCurrentGame(game);
        const gameRolls = await getRollsForGame(game.id);
        setRolls(gameRolls);
      } else {
        setCurrentGame(null);
        setRolls([]);
      }
    } catch (e) {
      console.error("Failed to load active game", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveGame();
  }, [loadActiveGame]);

  const addRoll = useCallback(async (value: number) => {
    if (!currentGame) return;
    
    // Determine player index
    const currentPlayerIndex = rolls.length % Math.max(1, currentGame.playerCount);
    
    try {
      const newRoll = await dbAddRoll(currentGame.id, value, currentPlayerIndex);
      setRolls(prev => [...prev, newRoll]);
    } catch (e) {
      console.error("Failed to add roll", e);
    }
  }, [currentGame, rolls.length]);

  const undoLastRoll = useCallback(async () => {
    if (!currentGame || rolls.length === 0) return;
    try {
      const deleted = await dbDeleteLastRoll(currentGame.id);
      if (deleted) {
        setRolls(prev => prev.slice(0, -1));
      }
    } catch (e) {
      console.error("Failed to undo roll", e);
    }
  }, [currentGame, rolls.length]);

  const startNewGame = useCallback(async (name: string, playerCount: number, players: string[]) => {
    try {
      const game = await createGame(name, playerCount, players);
      setCurrentGame(game);
      setRolls([]);
    } catch (e) {
      console.error("Failed to start new game", e);
    }
  }, []);

  const resetCurrentGame = useCallback(async () => {
    if (!currentGame) return;
    // Keep game metadata, delete all rolls by effectively setting active game's rolls to 0
    // To do this cleanly, we can just delete and recreate the game with same metadata
    try {
      // Create identical new game and it auto-deactivates the old one
      const newGame = await createGame(currentGame.name, currentGame.playerCount, currentGame.players);
      setCurrentGame(newGame);
      setRolls([]);
    } catch (e) {
      console.error("Failed to reset game", e);
    }
  }, [currentGame]);

  const endGame = useCallback(async () => {
    if (!currentGame) return;
    try {
      await updateGame(currentGame.id, { isActive: false, endedAt: Date.now() });
      setCurrentGame(null);
      setRolls([]);
    } catch (e) {
      console.error("Failed to end game", e);
    }
  }, [currentGame]);

  return {
    currentGame,
    rolls,
    loading,
    addRoll,
    undoLastRoll,
    startNewGame,
    resetCurrentGame,
    endGame,
    refreshGame: loadActiveGame
  };
}
