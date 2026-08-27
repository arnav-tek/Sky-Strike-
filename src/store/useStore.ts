import { create } from 'zustand';

export type GameStateEnum = 'menu' | 'playing' | 'hangar' | 'loadout' | 'settings' | 'gameover' | 'victory' | 'level_select';

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
  
  bossActive: boolean;
  bossHealthPercent: number;
  bossName: string;
  setBossState: (active: boolean, healthPercent: number, name?: string) => void;
  playSessionId: number;

  // Level Progression
  currentLevel: number;
  maxUnlockedLevel: number;
  levelTransitioning: boolean;
  levelTimer: number;
  levelStartScore: number;
  tickLevelTimer: (delta: number) => void;
  completeLevel: () => void;
  startNextLevel: () => void;
  startLevel: (level: number) => void;
  returnToLevelSelect: () => void;

  // Arcade power-ups
  weaponPower: number;
  upgradeWeapon: () => void;
  resetWeaponPower: () => void;
  shieldActive: boolean;
  shieldTimer: number;
  activateShield: (duration: number) => void;
  tickPowerups: (delta: number) => void;

  // Helicopter Selection
  selectedHelicopter: 'ka50' | 'mi28' | 'ah64';
  selectHelicopter: (type: 'ka50' | 'mi28' | 'ah64') => void;

  // Progression & Meta-game
  scrap: number;
  addScrap: (amount: number) => void;
  maxHealthLevel: number;
  fireRateLevel: number;
  buyUpgrade: (type: 'health' | 'fireRate') => boolean;
}

const getStoredLevel = () => {
  try {
    const stored = localStorage.getItem('skystrike_max_level');
    return stored ? parseInt(stored, 10) : 1;
  } catch (e) {
    return 1;
  }
};

const getStoredHelicopter = (): 'ka50' | 'mi28' | 'ah64' => {
  try {
    const stored = localStorage.getItem('skystrike_selected_helo');
    return (stored === 'ka50' || stored === 'mi28' || stored === 'ah64') ? stored : 'ka50';
  } catch (e) {
    return 'ka50';
  }
};

const getStoredNumber = (key: string, defaultValue: number) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const useStore = create<GameStore>((set, get) => ({
  gameState: 'menu',
  playSessionId: 0,
  setGameState: (state) => set({ gameState: state }),
  health: 100,
  score: 0,
  levelStartScore: 0,
  combo: 1,
  comboTimer: 0,
  bossActive: false,
  bossHealthPercent: 100,
  bossName: "UNKNOWN",
  weaponPower: 1,
  shieldActive: false,
  shieldTimer: 0,
  setBossState: (active, hp, name) => set((state) => ({ bossActive: active, bossHealthPercent: hp, bossName: name || state.bossName })),
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
    if (state.levelTransitioning || state.gameOver) return state;
    const newScore = state.score + (points * state.combo);
    return { score: newScore };
  }),

  takeDamage: (amount) => set((state) => {
    // Can't take damage while invulnerable, shieldActive, respawning, or game over
    if (state.invulnerable || state.shieldActive || state.respawning || state.gameOver) return state;

    const newHealth = Math.max(0, state.health - amount);
    
    if (newHealth === 0) {
      const newLives = state.lives - 1;
      
      if (newLives <= 0) {
        // True game over — all lives lost
        return {
          health: 0,
          lives: 0,
          respawning: false,
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
      invulnerable: true,
      invulnerableTimer: 1.0, // 1 second of invulnerability on taking damage
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
  
  addEnemyKill: () => set((state) => {
    // Reward 1 scrap per kill, scaling slightly with combo
    const scrapEarned = 1 + Math.floor(state.combo / 5);
    const newScrap = state.scrap + scrapEarned;
    try { localStorage.setItem('skystrike_scrap', newScrap.toString()); } catch (e) {}
    
    return { 
      enemiesDestroyed: state.enemiesDestroyed + 1,
      scrap: newScrap
    };
  }),

  // Respawn player with invulnerability
  respawnPlayer: () => set((state) => ({
    health: 100 + (state.maxHealthLevel - 1) * 10,
    respawning: false,
    invulnerable: true,
    invulnerableTimer: 3.0, // 3 seconds of invulnerability
    missiles: state.maxMissiles,
    cameraShake: 0,
  })),

  // Return to main menu
  returnToMenu: () => set((state) => ({
    gameState: 'menu',
    health: 100 + (state.maxHealthLevel - 1) * 10,
    score: 0,
    levelStartScore: 0,
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
    currentLevel: 1,
    levelTransitioning: false,
    levelTimer: 0,
    weaponPower: 1,
    shieldActive: false,
    shieldTimer: 0,
  })),

  // Full game reset (start mission from highest unlocked level)
  resetGame: () => set((state) => ({ 
    gameState: 'playing', 
    health: 100 + (state.maxHealthLevel - 1) * 10, 
    score: 0, 
    levelStartScore: 0,
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
    bossActive: false,
    bossHealthPercent: 100,
    playSessionId: state.playSessionId + 1,
    currentLevel: state.maxUnlockedLevel,
    levelTransitioning: false,
    levelTimer: 0,
    weaponPower: 1,
    shieldActive: false,
    shieldTimer: 0,
  })),

  startLevel: (level) => set((state) => ({ 
    gameState: 'playing', 
    health: 100 + (state.maxHealthLevel - 1) * 10, 
    score: 0, 
    levelStartScore: 0,
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
    bossActive: false,
    bossHealthPercent: 100,
    playSessionId: state.playSessionId + 1,
    currentLevel: level,
    levelTransitioning: false,
    levelTimer: 0,
  })),

  // Level Progression System
  currentLevel: 1,
  maxUnlockedLevel: getStoredLevel(),
  levelTransitioning: false,
  levelTimer: 0,
  
  tickLevelTimer: (delta) => set((state) => {
    if (state.gameState !== 'playing' || state.paused || state.levelTransitioning || state.gameOver) return state;
    return { levelTimer: state.levelTimer + delta };
  }),

  completeLevel: () => set((state) => {
    if (state.currentLevel >= 30) {
      // Beat the final level!
      return { gameState: 'victory', gameOver: true, levelTransitioning: false };
    }
    
    const newMax = Math.max(state.maxUnlockedLevel, state.currentLevel + 1);
    if (newMax > state.maxUnlockedLevel) {
      try {
        localStorage.setItem('skystrike_max_level', newMax.toString());
      } catch (e) {
        console.warn("Could not save level progression");
      }
    }

    // Standard level transition
    return { levelTransitioning: true, maxUnlockedLevel: newMax };
  }),

  startNextLevel: () => set((state) => ({
    currentLevel: state.currentLevel + 1,
    levelTransitioning: false,
    levelTimer: 0,
    health: 100 + (state.maxHealthLevel - 1) * 10,
    score: state.score, // Preserve score
    levelStartScore: state.score, // Set starting score for this level
    missiles: state.maxMissiles,
    invulnerable: true,
    invulnerableTimer: 3.0,
    cameraShake: 0,
  })),
  returnToLevelSelect: () => set((state) => ({
    gameState: 'level_select',
    health: 100 + (state.maxHealthLevel - 1) * 10,
    score: 0,
    levelStartScore: 0,
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
    levelTransitioning: false,
    levelTimer: 0,
    bossActive: false,
    bossHealthPercent: 100,
    weaponPower: 1,
    shieldActive: false,
    shieldTimer: 0,
  })),
  upgradeWeapon: () => set((state) => ({ weaponPower: Math.min(state.weaponPower + 1, 3) })),
  resetWeaponPower: () => set({ weaponPower: 1 }),
  activateShield: (duration) => set({ shieldActive: true, shieldTimer: duration }),
  tickPowerups: (delta) => set((state) => {
    if (!state.shieldActive) return state;
    const nextTimer = state.shieldTimer - delta;
    if (nextTimer <= 0) {
      return { shieldActive: false, shieldTimer: 0 };
    }
    return { shieldTimer: nextTimer };
  }),
  selectedHelicopter: getStoredHelicopter(),
  selectHelicopter: (type) => {
    try {
      localStorage.setItem('skystrike_selected_helo', type);
    } catch (e) {
      console.warn("Could not save selected helicopter");
    }
    set({ selectedHelicopter: type });
  },

  scrap: getStoredNumber('skystrike_scrap', 0),
  maxHealthLevel: getStoredNumber('skystrike_health_level', 1),
  fireRateLevel: getStoredNumber('skystrike_firerate_level', 1),
  addScrap: (amount) => set((state) => {
    const newScrap = state.scrap + amount;
    try { localStorage.setItem('skystrike_scrap', newScrap.toString()); } catch (e) {}
    return { scrap: newScrap };
  }),
  buyUpgrade: (type) => {
    const state = get();
    let cost = 0;
    
    if (type === 'health') {
      cost = state.maxHealthLevel * 100;
      if (state.maxHealthLevel >= 10 || state.scrap < cost) return false;
      try { localStorage.setItem('skystrike_scrap', (state.scrap - cost).toString()); } catch (e) {}
      try { localStorage.setItem('skystrike_health_level', (state.maxHealthLevel + 1).toString()); } catch (e) {}
      set({ scrap: state.scrap - cost, maxHealthLevel: state.maxHealthLevel + 1 });
      return true;
    } 
    
    if (type === 'fireRate') {
      cost = state.fireRateLevel * 150;
      if (state.fireRateLevel >= 10 || state.scrap < cost) return false;
      try { localStorage.setItem('skystrike_scrap', (state.scrap - cost).toString()); } catch (e) {}
      try { localStorage.setItem('skystrike_firerate_level', (state.fireRateLevel + 1).toString()); } catch (e) {}
      set({ scrap: state.scrap - cost, fireRateLevel: state.fireRateLevel + 1 });
      return true;
    }
    
    return false;
  },
}));
