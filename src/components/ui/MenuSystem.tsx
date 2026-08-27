import React from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../../audio/AudioManager';
import { Canvas } from '@react-three/fiber';
import HelicopterModel from '../models/HelicopterModel';
import { HELICOPTER_TEMPLATES } from '../../constants';


export default function MenuSystem() {
  const gameState = useStore(state => state.gameState);
  const setGameState = useStore(state => state.setGameState);
  const resetGame = useStore(state => state.resetGame);
  const returnToMenu = useStore(state => state.returnToMenu);
  const paused = useStore(state => state.paused);
  const togglePause = useStore(state => state.togglePause);
  const missionTime = useStore(state => state.missionTime);
  const startLevel = useStore(state => state.startLevel);
  const maxUnlockedLevel = useStore(state => state.maxUnlockedLevel);
  
  const selectedHelicopter = useStore(state => state.selectedHelicopter);
  const selectHelicopter = useStore(state => state.selectHelicopter);

  const scrap = useStore(state => state.scrap);
  const maxHealthLevel = useStore(state => state.maxHealthLevel);
  const fireRateLevel = useStore(state => state.fireRateLevel);
  const buyUpgrade = useStore(state => state.buyUpgrade);

  const activeTemplate = HELICOPTER_TEMPLATES[selectedHelicopter] || HELICOPTER_TEMPLATES.ka50;


  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing') {
        togglePause();
        audioManager.playUIClick();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [gameState, togglePause]);

  // Handle Music Themes based on Game State
  React.useEffect(() => {
    if (gameState === 'menu' || gameState === 'hangar' || gameState === 'loadout' || gameState === 'settings') {
      audioManager.playMenuMusic();
    } else if (gameState === 'playing' && !paused) {
      audioManager.playGameplayMusic();
    } else if (gameState === 'playing' && paused) {
      // Potentially lower music volume or pause, but let's keep it playing at lower gain
    } else if (gameState === 'gameover' || gameState === 'victory') {
      // Keep playing current or fade out
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [gameState, paused]);

  if ((gameState === 'playing' && !paused) || gameState === 'gameover' || gameState === 'victory') return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center z-50 overflow-hidden" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
      {/* HUD Scanline Overlay */}
      <div className="hud-scanlines absolute inset-0 opacity-[0.03] pointer-events-none z-[100]" />
      
      {/* Cyber Digital Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:45px_45px] pointer-events-none opacity-60" />

      {/* Dark overlay for contrast - softened gradient to make environment look vibrant and clear */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent"></div>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════
            MAIN MENU
            ═══════════════════════════════════════ */}
        {gameState === 'menu' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="pointer-events-auto flex flex-col gap-6 ml-20 relative z-20"
          >
            {/* Game title */}
            <div className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-8xl font-black italic tracking-tighter text-white text-glow-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                SKY STRIKE
              </motion.h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-center gap-3 mt-3"
              >
                <div className="h-[2px] w-12 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-slate-400 tracking-[0.4em] uppercase text-sm font-bold">Arcade Combat Operations</p>
              </motion.div>
              
              {/* Sleek active helicopter selector feedback */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.85, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mt-4 text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs border border-emerald-500/20 bg-emerald-950/30 px-3.5 py-1.5 rounded-md w-fit"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#10b981]" />
                ACTIVE FRAME: {activeTemplate.name}
              </motion.div>
            </div>

            {/* Menu buttons */}
            <div className="flex flex-col gap-4">
              <MenuButton onClick={() => { audioManager.init(); resetGame(); audioManager.playUIClick(); }} label="START MISSION" primary />
              <MenuButton onClick={() => { audioManager.init(); setGameState('level_select'); audioManager.playUIClick(); }} label="SELECT MISSION" />
              <MenuButton onClick={() => { audioManager.init(); setGameState('hangar'); audioManager.playUIClick(); }} label="HANGAR" />
              <MenuButton onClick={() => { audioManager.init(); setGameState('loadout'); audioManager.playUIClick(); }} label="LOADOUT" />
              <MenuButton onClick={() => { audioManager.init(); setGameState('settings'); audioManager.playUIClick(); }} label="SETTINGS" />
              <MenuButton onClick={() => { audioManager.init(); audioManager.playUIClick(); }} label="LEADERBOARD" disabled />
              <MenuButton onClick={() => { window.close(); }} label="EXIT" />
            </div>

            {/* System status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ delay: 0.6 }}
              className="mt-10"
            >
              <div className="text-xs text-white uppercase tracking-[0.15em] font-bold">System Status: Operational</div>
              <div className="flex gap-1 mt-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ width: 0 }}
                    animate={{ width: 32 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="h-0.5 bg-emerald-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}


        {/* ═══════════════════════════════════════
            LEVEL SELECT
            ═══════════════════════════════════════ */}
        {gameState === 'level_select' && (
          <motion.div 
            key="level_select"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="pointer-events-auto absolute inset-10 bg-slate-950/92 backdrop-blur-xl border border-white/8 rounded-2xl p-8 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/8 pb-5">
              <div>
                <h2 className="text-4xl font-black italic text-white" style={{ fontFamily: 'Orbitron' }}>SELECT MISSION</h2>
                <p className="text-emerald-400/70 font-bold tracking-[0.15em] text-sm mt-1 uppercase">Highest Clearance: Level {maxUnlockedLevel}</p>
              </div>
              <button 
                onClick={() => { setGameState('menu'); audioManager.playUIClick(); }}
                className="px-6 py-2.5 border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all uppercase font-bold tracking-[0.1em] text-sm rounded-lg"
              >
                ← Back
              </button>
            </div>

            {/* Level grid */}
            <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
              <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 30 }).map((_, i) => {
                  const levelNum = i + 1;
                  const isUnlocked = levelNum <= maxUnlockedLevel;
                  const isBoss = levelNum % 5 === 0;
                  
                  return (
                    <button
                      key={levelNum}
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (isUnlocked) {
                          audioManager.init();
                          startLevel(levelNum);
                          audioManager.playUIClick();
                        }
                      }}
                      className={`
                        relative h-24 flex flex-col items-center justify-center rounded-lg border transition-all duration-200
                        ${isUnlocked 
                          ? (isBoss 
                              ? 'border-red-500/40 bg-red-950/20 hover:bg-red-900/40 text-red-100 hover:border-red-400 hover:scale-[1.03]' 
                              : 'border-emerald-500/20 bg-emerald-950/10 hover:bg-emerald-900/30 text-emerald-100 hover:border-emerald-400 hover:scale-[1.03]')
                          : 'border-white/5 bg-white/3 text-white/15 cursor-not-allowed'}
                      `}
                    >
                      <span className="text-3xl font-black" style={{ fontFamily: 'Orbitron' }}>
                        {levelNum}
                      </span>
                      {isBoss && isUnlocked && (
                        <span className="text-[10px] text-red-400 font-bold tracking-[0.12em] mt-1 uppercase">BOSS</span>
                      )}
                      {!isUnlocked && (
                        <span className="absolute bottom-2 text-[10px] opacity-40 tracking-wider">LOCKED</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}


        {/* ═══════════════════════════════════════
            HANGAR
            ═══════════════════════════════════════ */}
        {gameState === 'hangar' && (
          <motion.div 
            key="hangar"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="pointer-events-auto absolute inset-10 bg-slate-950/92 backdrop-blur-xl border border-white/8 rounded-2xl p-8 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/8 pb-5">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-[0.1em] text-emerald-400" style={{ fontFamily: 'Orbitron' }}>COCKPIT HANGAR</h2>
                <p className="text-slate-500 text-sm uppercase tracking-[0.12em] mt-1">Select and Tune Combat Frame</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest">AVAILABLE SCRAP</span>
                  <span className="text-2xl font-black text-white" style={{ fontFamily: 'Orbitron' }}>{scrap} <span className="text-emerald-500 text-sm">¢</span></span>
                </div>
                <button 
                  onClick={() => { setGameState('menu'); audioManager.playUIClick(); }} 
                  className="px-6 py-2.5 border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all uppercase font-bold tracking-[0.1em] text-sm rounded-lg cursor-pointer"
                >
                  ← Back to Base
                </button>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-8 min-h-0">
              {/* Aircraft info & Selection Bay */}
              <div className="col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-slate-400 uppercase tracking-[0.15em] text-xs font-black border-l-3 border-emerald-500 pl-3">ACTIVE COCKPIT</h3>
                
                {/* Helicopter Details Box */}
                <div className="p-5 bg-white/4 rounded-xl border border-white/8">
                  <div className="text-2xl font-black text-white uppercase leading-tight" style={{ fontFamily: 'Orbitron' }}>
                    {activeTemplate.name}
                  </div>
                  <div className="text-xs text-emerald-400/70 font-bold mb-4 tracking-[0.15em] uppercase">
                    {activeTemplate.sub}
                  </div>
                  <div className="flex flex-col gap-3.5 mb-4">
                    <StatBar label="ARMOR RATING" value={Math.min(100, activeTemplate.stats.armor + (maxHealthLevel - 1) * 10)} />
                    <StatBar label="MAX ACCEL SPEED" value={activeTemplate.stats.speed} />
                    <StatBar label="FIREPOWER THRESHOLD" value={Math.min(100, activeTemplate.stats.firepower + (fireRateLevel - 1) * 10)} />
                    <StatBar label="AGILITY FLIGHT CONTROL" value={activeTemplate.stats.agility} />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-2.5 border-t border-white/5">
                    {activeTemplate.desc}
                  </p>
                </div>

                <h3 className="text-slate-400 uppercase tracking-[0.15em] text-xs font-black border-l-3 border-emerald-500 pl-3 mt-2">ENGINEERING BAY</h3>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { if(buyUpgrade('health')) audioManager.playUIClick(); }} className="w-full bg-white/4 border border-white/8 hover:border-emerald-500/50 p-3 rounded-lg flex justify-between items-center text-left transition-all group disabled:opacity-50" disabled={maxHealthLevel >= 10 || scrap < maxHealthLevel * 100}>
                    <div>
                      <div className="text-sm font-bold text-white uppercase tracking-wider">Reinforce Hull</div>
                      <div className="text-[10px] text-slate-400 uppercase">Level {maxHealthLevel}/10</div>
                    </div>
                    <div className="text-right">
                      {maxHealthLevel < 10 ? (
                        <div className="text-emerald-400 font-bold">{maxHealthLevel * 100} ¢</div>
                      ) : (
                        <div className="text-slate-500 font-bold text-xs uppercase">MAXED</div>
                      )}
                    </div>
                  </button>

                  <button onClick={() => { if(buyUpgrade('fireRate')) audioManager.playUIClick(); }} className="w-full bg-white/4 border border-white/8 hover:border-emerald-500/50 p-3 rounded-lg flex justify-between items-center text-left transition-all group disabled:opacity-50" disabled={fireRateLevel >= 10 || scrap < fireRateLevel * 150}>
                    <div>
                      <div className="text-sm font-bold text-white uppercase tracking-wider">Weapon Linkage</div>
                      <div className="text-[10px] text-slate-400 uppercase">Level {fireRateLevel}/10</div>
                    </div>
                    <div className="text-right">
                      {fireRateLevel < 10 ? (
                        <div className="text-emerald-400 font-bold">{fireRateLevel * 150} ¢</div>
                      ) : (
                        <div className="text-slate-500 font-bold text-xs uppercase">MAXED</div>
                      )}
                    </div>
                  </button>
                </div>
                
                {/* Selection bay options */}
                <h3 className="text-slate-400 uppercase tracking-[0.15em] text-xs font-black border-l-3 border-emerald-500 pl-3 mt-2">SELECTION BAY</h3>
                <div className="flex flex-col gap-2.5">
                  {(Object.keys(HELICOPTER_TEMPLATES) as Array<keyof typeof HELICOPTER_TEMPLATES>).map((key) => {
                    const temp = HELICOPTER_TEMPLATES[key];
                    const isSelected = selectedHelicopter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { selectHelicopter(key); audioManager.playUIClick(); }}
                        className={`w-full py-3.5 px-5 rounded-lg border text-left transition-all duration-200 cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                            : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/12'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-base font-black tracking-tight" style={{ fontFamily: 'Orbitron' }}>{temp.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{key === 'ka50' ? 'COAXIAL ROTORS' : 'SINGLE ROTOR'}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded px-2.5 py-1 uppercase tracking-wider">ACTIVE</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* 3D preview area with full Canvas */}
              <div className="col-span-2 flex flex-col bg-black/45 rounded-2xl border border-white/8 relative overflow-hidden h-full shadow-[inset_0_0_30px_rgba(0,0,0,0.85)]">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_#10b981]" />
                    <span className="text-xs font-black uppercase text-emerald-400 tracking-[0.25em]" style={{ fontFamily: 'Orbitron' }}>NEURAL LINK ESTABLISHED</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Slow-rotation 3D Telemetry active</span>
                </div>
                
                {/* Real-time 3D rotating canvas preview */}
                <div className="w-full h-full flex-1">
                  <Canvas shadows camera={{ position: [0, 1.8, 5.2], fov: 40 }}>
                    <ambientLight intensity={1.1} />
                    <directionalLight position={[10, 12, 5]} intensity={1.6} castShadow />
                    <pointLight position={[-5, 5, -5]} intensity={0.5} />
                    <group position={[0, -0.2, 0]}>
                      <HelicopterModel type={selectedHelicopter} isHangarPreview />
                    </group>
                  </Canvas>
                </div>
                
                {/* Tech overlays */}
                <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                  <div className="px-3.5 py-1.5 bg-slate-950/70 border border-white/5 rounded text-[10px] text-slate-400 font-bold uppercase tracking-wider">SECURE FRAME STORAGE</div>
                  <div className="px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse">SYS_DIAG: 100% OK</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* ═══════════════════════════════════════
            LOADOUT
            ═══════════════════════════════════════ */}
        {gameState === 'loadout' && (
          <motion.div 
            key="loadout"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="pointer-events-auto absolute inset-y-10 right-10 w-[420px] bg-slate-950/95 backdrop-blur-2xl border border-white/8 rounded-2xl p-8 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/8 pb-5">
              <h2 className="text-3xl font-black uppercase tracking-[0.12em] text-emerald-400" style={{ fontFamily: 'Orbitron' }}>LOADOUT</h2>
              <button onClick={() => { setGameState('menu'); audioManager.playUIClick(); }} className="text-slate-500 hover:text-white uppercase tracking-[0.1em] text-xs font-bold transition-all">← Back</button>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
              <LoadoutSlot type="PRIMARY" name="2A42 CANNON" desc="30mm autocannon. High fire rate, armor-piercing." />
              <LoadoutSlot type="SECONDARY" name="9K121 VIKHR" desc="Laser-guided anti-tank missiles." />
              <LoadoutSlot type="ROCKETS" name="B-8V20A PODS" desc="80mm unguided rocket pods." />
              <LoadoutSlot type="EXPERIMENTAL" name="PULSE RAIL" desc="High-voltage kinetic energy weapon." locked />
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="flex justify-between items-center bg-white/4 p-4 rounded-xl border border-white/5">
                <span className="text-xs uppercase tracking-[0.12em] text-slate-400 font-bold">Total Weight</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-lg font-black text-white tabular-nums">82%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* ═══════════════════════════════════════
            SETTINGS
            ═══════════════════════════════════════ */}
        {gameState === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] bg-slate-950/97 backdrop-blur-3xl border border-white/8 rounded-2xl p-12 shadow-2xl"
          >
            <h2 className="text-3xl font-black uppercase tracking-[0.12em] text-emerald-400 mb-10 border-b border-white/8 pb-6" style={{ fontFamily: 'Orbitron' }}>SETTINGS</h2>
            
            <div className="flex flex-col gap-7">
              <SettingsRow label="MASTER VOLUME" control={<input type="range" className="w-64 accent-emerald-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer" />} />
              <SettingsRow label="SFX VOLUME" control={<input type="range" className="w-64 accent-emerald-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer" />} />
              <SettingsRow label="SENSITIVITY" control={<input type="range" className="w-64 accent-emerald-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer" />} />
              <SettingsRow label="GRAPHICS" control={
                <select className="bg-slate-900 border border-white/10 text-white/80 rounded-lg px-5 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors cursor-pointer">
                  <option>Standard</option>
                  <option>Enhanced</option>
                  <option>High Fidelity</option>
                  <option>Ultra</option>
                </select>
              } />
              <SettingsRow label="SCREENSHAKE" control={
                <div className="w-12 h-6 bg-emerald-500/30 rounded-full relative p-0.5 cursor-pointer border border-emerald-500/30">
                  <div className="w-5 h-5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] ml-auto" />
                </div>
              } />
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={() => { setGameState('menu'); audioManager.playUIClick(); }}
                className="px-10 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-[0.15em] font-black text-sm rounded-lg transition-all shadow-lg shadow-emerald-900/25 hover:shadow-emerald-800/40"
              >
                SAVE & RETURN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          PAUSE MENU OVERLAY
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {gameState === 'playing' && paused && (
          <motion.div 
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-slate-900/95 border border-white/8 p-12 rounded-2xl w-[440px] shadow-2xl flex flex-col gap-5"
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-3xl font-black uppercase tracking-[0.15em] text-emerald-400" style={{ fontFamily: 'Orbitron' }}>
                  PAUSED
                </h2>
                <div className="h-1 w-12 bg-emerald-500 mx-auto mt-3 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              
              <MenuButton onClick={() => { togglePause(); audioManager.playUIClick(); }} label="RESUME" primary />
              <MenuButton onClick={() => { resetGame(); audioManager.playUIClick(); }} label="RESTART MISSION" />
              <MenuButton onClick={() => { setGameState('settings'); togglePause(); audioManager.playUIClick(); }} label="SETTINGS" />
              <MenuButton onClick={() => { returnToMenu(); audioManager.playUIClick(); }} label="RETURN TO MENU" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          MISSION LOADING OVERLAY (Simulated)
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {gameState === 'playing' && missionTime < 1.5 && (
          <motion.div 
            key="loading"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center"
          >
            {/* Loading text */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl font-black text-emerald-400 uppercase tracking-[0.4em]"
              style={{ fontFamily: 'Orbitron' }}
            >
              DEPLOYING...
            </motion.div>

            {/* Progress bar */}
            <div className="w-56 h-1 bg-white/5 mt-5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.0 }}
              />
            </div>

            {/* System text */}
            <div className="flex flex-col items-center gap-1 mt-4">
              <div className="text-xs text-white/20 uppercase tracking-[0.12em]">Initializing weapon systems...</div>
              <div className="text-xs text-white/15 uppercase tracking-[0.12em]">Loading combat area...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ═══════════════════════════════════════
   MenuButton — Reusable skewed menu button
   ═══════════════════════════════════════ */
function MenuButton({ label, onClick, primary = false, disabled = false }: { label: string, onClick: () => void, primary?: boolean, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex items-center w-[420px] py-4 px-8 transition-all duration-300 ${disabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer hover:pl-10'}`}
    >
      <div className={`absolute inset-0 transition-all duration-300 skew-x-[-12deg] rounded-md ${
        primary
          ? 'bg-emerald-600/20 border border-emerald-500/40 group-hover:bg-emerald-600/35 group-hover:border-emerald-400/60'
          : 'bg-white/4 border border-white/5 group-hover:bg-white/8 group-hover:border-white/15'
      }`}>
        {primary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
      </div>
      <span className={`relative text-xl uppercase font-bold tracking-[0.15em] transition-all duration-300 ${
        primary
          ? 'text-emerald-400 group-hover:text-emerald-300'
          : 'text-slate-400 group-hover:text-white/80'
      }`}>
        {label}
      </span>
      {!disabled && (
        <div className="ml-auto relative opacity-0 group-hover:opacity-60 transition-opacity duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
          </svg>
        </div>
      )}
    </button>
  );
}


/* ═══════════════════════════════════════
   StatBar — Hangar stat display
   ═══════════════════════════════════════ */
function StatBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs uppercase font-bold tracking-[0.12em] text-slate-400">
        <span>{label}</span>
        <span className="text-emerald-400 tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
        />
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════
   LoadoutSlot — Weapon slot card
   ═══════════════════════════════════════ */
function LoadoutSlot({ type, name, desc, locked = false }: { type: string, name: string, desc: string, locked?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 p-4 bg-white/4 border rounded-xl transition-all duration-200 ${
      locked
        ? 'opacity-35 border-transparent grayscale cursor-not-allowed'
        : 'border-white/5 hover:border-emerald-500/25 hover:bg-white/6 cursor-pointer'
    }`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-black text-emerald-400/70 uppercase tracking-[0.2em]">{type}</span>
        {locked && <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">LOCKED</span>}
      </div>
      <span className="text-lg font-black text-white uppercase tracking-tight leading-tight" style={{ fontFamily: 'Orbitron' }}>{name}</span>
      <span className="text-sm text-slate-500 leading-relaxed">{desc}</span>
    </div>
  );
}


/* ═══════════════════════════════════════
   SettingsRow — Settings toggle/slider row
   ═══════════════════════════════════════ */
function SettingsRow({ label, control }: { label: string, control: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-400 uppercase tracking-[0.12em] text-xs font-black">{label}</span>
      {control}
    </div>
  );
}
