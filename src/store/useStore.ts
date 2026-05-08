import { create } from 'zustand';

export type GameStateEnum = 'menu' | 'playing' | 'hangar' | 'loadout' | 'settings' | 'gameover' | 'victory';

interface GameStore {
  gameState: GameStateEnum;
  setGameState: (state: GameStateEnum) => void;
  health: number;
  score: number;
  combo: number;
  comboTimer: number;
  gameOver: boolean;
  cameraShake: number;
  hitStop: number;
  paused: boolean;
  togglePause: () => void;
  addScore: (points: number) => void;
  addCombo: () => void;
  resetCombo: () => void;
  tickCombo: (delta: number) => void;
  takeDamage: (amount: number) => void;
  resetGame: () => void;
  playerPos: [number, number, number];
  setPlayerPos: (pos: [number, number, number]) => void;
  addShake: (amount: number) => void;
  setCameraShake: (amount: number) => void;
  triggerHitStop: (duration: number) => void;
  tickHitStop: (delta: number) => void;
  missiles: number;
  maxMissiles: number;
  fireMissile: () => boolean;
  reloadMissile: () => void;

  // Life system
  lives: number;
  maxLives: number;
  invulnerable: boolean;
  invulnerableTimer: number;
  respawning: boolean;
  tickInvulnerability: (delta: number) => void;

  // Stats tracking
  enemiesDestroyed: number;
  highestCombo: number;
  missionTime: number;
  tickMissionTime: (delta: number) => void;
  addEnemyKill: () => void;

  // Respawn
  respawnPlayer: () => void;
  returnToMenu: () => void;
}

export const useStore = create<GameStore>((set, get) => ({
  gameState: 'menu',
  setGameState: (state) => set({ gameState: state }),
  health: 100,
  score: 0,
  combo: 1,
  comboTimer: 0,
  gameOver: false,
  cameraShake: 0,
  hitStop: 0,
  paused: false,
  togglePause: () => set((state) => ({ paused: !state.paused })),
  missiles: 4,
  maxMissiles: 4,
  playerPos: [0, 5, 0],
  setPlayerPos: (pos) => set({ playerPos: pos }),
  addShake: (amount) => set((state) => ({ cameraShake: Math.min(state.cameraShake + amount, 2.0) })),
  setCameraShake: (amount) => set({ cameraShake: amount }),
  triggerHitStop: (duration) => set({ hitStop: duration }),
  tickHitStop: (delta) => set((state) => ({ hitStop: Math.max(0, state.hitStop - delta) })),
  fireMissile: () => {
    const { missiles } = get();
    if (missiles > 0) {
      set({ missiles: missiles - 1 });
      return true;
    }
    return false;
  },
  reloadMissile: () => set((state) => ({ missiles: Math.min(state.missiles + 1, state.maxMissiles) })),
  addCombo: () => set((state) => {
    const newCombo = Math.min(state.combo + 1, 10);
    return { 
      combo: newCombo, 
      comboTimer: 3.0,
      highestCombo: Math.max(state.highestCombo, newCombo)
    };
  }),
  resetCombo: () => set({ combo: 1, comboTimer: 0 }),
  tickCombo: (delta) => set((state) => {
    if (state.combo <= 1) return state;
    const newTimer = state.comboTimer - delta;
    if (newTimer <= 0) {
      return { combo: 1, comboTimer: 0 };
    }
    return { comboTimer: newTimer };
  }),
  addScore: (points) => set((state) => {
    const newScore = state.score + (points * state.combo);
    // Trigger victory at 25k points for now as a mission milestone
    if (newScore >= 25000 && state.gameState === 'playing') {
      return { score: newScore, gameState: 'victory', gameOver: true };
    }
    return { score: newScore };
  }),

  takeDamage: (amount) => set((state) => {
    // Can't take damage while invulnerable
    if (state.invulnerable) return state;

    const newHealth = Math.max(0, state.health - amount);
    
    if (newHealth === 0) {
      const newLives = state.lives - 1;
      
      if (newLives <= 0) {
        // True game over — all lives lost
        return {
          health: 0,
          lives: 0,
          gameOver: true,
          gameState: 'gameover',
          cameraShake: 3.0,
          combo: 1,
          comboTimer: 0,
        };
      } else {
        // Lost a life — trigger respawn
        return {
          health: 0,
          lives: newLives,
          respawning: true,
          cameraShake: 2.0,
          combo: 1,
          comboTimer: 0,
        };
      }
    }
    
    return { 
      health: newHealth,
      cameraShake: Math.min(state.cameraShake + 1.0, 3.0),
      combo: 1,
      comboTimer: 0
    };
  }),

  // Life system
  lives: 3,
  maxLives: 3,
  invulnerable: false,
  invulnerableTimer: 0,
  respawning: false,
  
  tickInvulnerability: (delta) => set((state) => {
    if (!state.invulnerable) return state;
    const newTimer = state.invulnerableTimer - delta;
    if (newTimer <= 0) {
      return { invulnerable: false, invulnerableTimer: 0 };
    }
    return { invulnerableTimer: newTimer };
  }),

  // Stats
  enemiesDestroyed: 0,
  highestCombo: 0,
  missionTime: 0,
  
  tickMissionTime: (delta) => set((state) => {
    if (state.gameState !== 'playing' || state.gameOver || state.paused) return state;
    return { missionTime: state.missionTime + delta };
  }),
  
  addEnemyKill: () => set((state) => ({ enemiesDestroyed: state.enemiesDestroyed + 1 })),

  // Respawn player with invulnerability
  respawnPlayer: () => set((state) => ({
    health: 100,
    respawning: false,
    invulnerable: true,
    invulnerableTimer: 3.0, // 3 seconds of invulnerability
    missiles: state.maxMissiles,
    cameraShake: 0,
  })),

  // Return to main menu
  returnToMenu: () => set({
    gameState: 'menu',
    health: 100,
    score: 0,
    combo: 1,
    comboTimer: 0,
    gameOver: false,
    cameraShake: 0,
    hitStop: 0,
    paused: false,
    missiles: 4,
    lives: 3,
    invulnerable: false,
    invulnerableTimer: 0,
    respawning: false,
    enemiesDestroyed: 0,
    highestCombo: 0,
    missionTime: 0,
    playerPos: [0, 5, 0],
  }),

  // Full game reset (start mission)
  resetGame: () => set({ 
    gameState: 'playing', 
    health: 100, 
    score: 0, 
    combo: 1, 
    comboTimer: 0, 
    gameOver: false, 
    cameraShake: 0, 
    hitStop: 0, 
    paused: false,
    missiles: 4,
    lives: 3,
    invulnerable: false,
    invulnerableTimer: 0,
    respawning: false,
    enemiesDestroyed: 0,
    highestCombo: 0,
    missionTime: 0,
    playerPos: [0, 5, 0],
  })
}));
