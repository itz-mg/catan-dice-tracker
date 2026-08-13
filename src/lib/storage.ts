import { openDB, IDBPDatabase } from 'idb';

export type Roll = {
  id: string;
  gameId: string;
  value: number;
  timestamp: number;
  playerIndex?: number;
};

export type Game = {
  id: string;
  name: string;
  playerCount: number;
  players: string[];
  createdAt: number;
  updatedAt: number;
  endedAt?: number;
  isActive: boolean;
};

interface CatanDB extends IDBPDatabase {
  // We're dynamically casting since idb typescript support requires explicit schema mapping
}

const DB_NAME = 'catan-dice-tracker';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('games')) {
        const gameStore = db.createObjectStore('games', { keyPath: 'id' });
        gameStore.createIndex('createdAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains('rolls')) {
        const rollStore = db.createObjectStore('rolls', { keyPath: 'id' });
        rollStore.createIndex('gameId', 'gameId');
        rollStore.createIndex('timestamp', 'timestamp');
      }
    },
  });
}

// Generate a simple UUID-like string
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function createGame(name: string, playerCount: number, players: string[]): Promise<Game> {
  const db = await getDB();
  const now = Date.now();
  const game: Game = {
    id: generateId(),
    name,
    playerCount,
    players,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  };
  
  // Deactivate all other games first
  const tx = db.transaction(['games'], 'readwrite');
  const store = tx.objectStore('games');
  const allGames = await store.getAll();
  for (const g of allGames) {
    if (g.isActive) {
      g.isActive = false;
      await store.put(g);
    }
  }
  
  await store.put(game);
  await tx.done;
  
  return game;
}

export async function getGame(id: string): Promise<Game | undefined> {
  const db = await getDB();
  return db.get('games', id);
}

export async function getAllGames(): Promise<Game[]> {
  const db = await getDB();
  const games = await db.getAllFromIndex('games', 'createdAt');
  return games.reverse(); // newest first
}

export async function updateGame(id: string, updates: Partial<Game>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('games', 'readwrite');
  const store = tx.objectStore('games');
  const game = await store.get(id);
  if (game) {
    await store.put({ ...game, ...updates, updatedAt: Date.now() });
  }
  await tx.done;
}

export async function deleteGame(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['games', 'rolls'], 'readwrite');
  await tx.objectStore('games').delete(id);
  
  const rollStore = tx.objectStore('rolls');
  const gameIndex = rollStore.index('gameId');
  let cursor = await gameIndex.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function addRoll(gameId: string, value: number, playerIndex?: number): Promise<Roll> {
  const db = await getDB();
  const roll: Roll = {
    id: generateId(),
    gameId,
    value,
    timestamp: Date.now(),
    playerIndex,
  };
  
  const tx = db.transaction(['rolls', 'games'], 'readwrite');
  await tx.objectStore('rolls').put(roll);
  
  const gameStore = tx.objectStore('games');
  const game = await gameStore.get(gameId);
  if (game) {
    game.updatedAt = Date.now();
    await gameStore.put(game);
  }
  
  await tx.done;
  return roll;
}

export async function getRollsForGame(gameId: string): Promise<Roll[]> {
  const db = await getDB();
  const tx = db.transaction('rolls', 'readonly');
  const index = tx.objectStore('rolls').index('gameId');
  const rolls = await index.getAll(IDBKeyRange.only(gameId));
  return rolls.sort((a, b) => a.timestamp - b.timestamp);
}

export async function deleteLastRoll(gameId: string): Promise<Roll | undefined> {
  const db = await getDB();
  const tx = db.transaction(['rolls', 'games'], 'readwrite');
  const index = tx.objectStore('rolls').index('gameId');
  
  const rolls = await index.getAll(IDBKeyRange.only(gameId));
  if (rolls.length === 0) return undefined;
  
  rolls.sort((a, b) => a.timestamp - b.timestamp);
  const lastRoll = rolls[rolls.length - 1];
  
  await tx.objectStore('rolls').delete(lastRoll.id);
  
  const gameStore = tx.objectStore('games');
  const game = await gameStore.get(gameId);
  if (game) {
    game.updatedAt = Date.now();
    await gameStore.put(game);
  }
  
  await tx.done;
  return lastRoll;
}

export async function getActiveGame(): Promise<Game | undefined> {
  const db = await getDB();
  const games = await db.getAll('games');
  return games.find(g => g.isActive);
}

export async function exportGameData(gameId: string): Promise<{game: Game, rolls: Roll[]}> {
  const db = await getDB();
  const game = await db.get('games', gameId);
  const tx = db.transaction('rolls', 'readonly');
  const index = tx.objectStore('rolls').index('gameId');
  const rolls = await index.getAll(IDBKeyRange.only(gameId));
  
  if (!game) throw new Error("Game not found");
  
  return { game, rolls: rolls.sort((a, b) => a.timestamp - b.timestamp) };
}
