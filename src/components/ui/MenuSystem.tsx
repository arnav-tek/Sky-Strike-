import React from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../../audio/AudioManager';

export default function MenuSystem() {
  const gameState = useStore(state => state.gameState);
  const setGameState = useStore(state => state.setGameState);
  const resetGame = useStore(state => state.resetGame);
  const returnToMenu = useStore(state => state.returnToMenu);
  const paused = useStore(state => state.paused);
  const togglePause = useStore(state => state.togglePause);
  const missionTime = useStore(state => state.missionTime);

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

  const VICTORY_TITLES = ["MISSION COMPLETE", "TARGET ELIMINATED", "OPERATION SUCCESSFUL", "AREA SECURED"];
  const VICTORY_SUBTITLES = ["Enemy forces neutralized.", "Mission objectives completed successfully.", "Combat zone secured."];

  if ((gameState === 'playing' && !paused) || gameState === 'gameover' || gameState === 'victory') return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center z-50" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent"></div>

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="pointer-events-auto flex flex-col gap-6 ml-24"
          >
            <div className="mb-8">
              <h1 className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" style={{ fontFamily: 'Orbitron' }}>
                SKY STRIKE
              </h1>
              <div className="flex items-center gap-3">
                 <div className="h-[2px] w-8 bg-emerald-500" />
                 <p className="text-slate-400 tracking-[0.5em] uppercase text-xs font-bold">Arcade Combat Operations</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <MenuButton onClick={() => { audioManager.init(); resetGame(); audioManager.playUIClick(); }} label="START MISSION" primary />
              <MenuButton onClick={() => { audioManager.init(); setGameState('hangar'); audioManager.playUIClick(); }} label="HANGAR" />
              <MenuButton onClick={() => { audioManager.init(); setGameState('loadout'); audioManager.playUIClick(); }} label="LOADOUT" />
              <MenuButton onClick={() => { audioManager.init(); setGameState('settings'); audioManager.playUIClick(); }} label="SETTINGS" />
              <MenuButton onClick={() => { audioManager.init(); audioManager.playUIClick(); }} label="LEADERBOARD" disabled />
              <MenuButton onClick={() => { window.close(); }} label="EXIT" />
            </div>
            
            <div className="mt-12 opacity-30">
               <div className="text-[10px] text-white uppercase tracking-[0.2em] font-bold">System Status: Optimal</div>
               <div className="flex gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-10 h-0.5 bg-emerald-500" />
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {gameState === 'hangar' && (
          <motion.div 
            key="hangar"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="pointer-events-auto absolute inset-12 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-10 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-widest text-emerald-500" style={{ fontFamily: 'Orbitron' }}>HANGAR</h2>
                <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">AIRCRAFT MAINTENANCE & TUNING</p>
              </div>
              <button 
                onClick={() => { setGameState('menu'); audioManager.playUIClick(); }} 
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white uppercase tracking-widest text-xs font-bold transition-all border border-white/10 rounded"
              >
                RETURN TO MENU
              </button>
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-12">
              <div className="col-span-1 flex flex-col gap-6">
                <h3 className="text-slate-400 uppercase tracking-[0.2em] text-xs font-black border-l-4 border-emerald-500 pl-3">ACTIVE AIRCRAFT</h3>
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all group">
                  <div className="text-2xl font-black text-white uppercase" style={{ fontFamily: 'Orbitron' }}>KA-52 ALLIGATOR</div>
                  <div className="text-emerald-500 text-xs font-bold mb-6 tracking-widest">ATTACK HELICOPTER</div>
                  <div className="flex flex-col gap-4">
                    <StatBar label="ARMOR" value={85} />
                    <StatBar label="SPEED" value={70} />
                    <StatBar label="DISPLAY" value={55} />
                  </div>
                </div>
                
                <div className="p-6 bg-emerald-600/10 border border-emerald-500/20 rounded-xl">
                   <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-2">Upgrade Status</p>
                   <p className="text-sm text-slate-300">New engine components available in 1500 credits.</p>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center justify-center bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent"></div>
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                       <div className="w-8 h-8 border border-emerald-500/40 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-slate-500 uppercase tracking-[0.4em] text-sm font-bold">Neural Link Synchronized</p>
                    <p className="text-slate-600 text-[10px] mt-2">Visualizing frame Ka-52-XPR</p>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'loadout' && (
          <motion.div 
            key="loadout"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="pointer-events-auto absolute inset-y-12 right-12 w-[450px] bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
              <h2 className="text-3xl font-black uppercase tracking-widest text-emerald-500" style={{ fontFamily: 'Orbitron' }}>LOADOUT</h2>
              <button onClick={() => { setGameState('menu'); audioManager.playUIClick(); }} className="text-slate-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-all underline underline-offset-4">RETURN TO MENU</button>
            </div>
            
            <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
              <LoadoutSlot type="PRIMARY" name="VULCAN CANNON" desc="High fire rate, medium damage." />
              <LoadoutSlot type="SECONDARY" name="HELLFIRE MISSILES" desc="Guided anti-armor missiles." />
              <LoadoutSlot type="SUPPORT" name="L-140 FLARES" desc="Infrared countermeasure system." />
              <LoadoutSlot type="EXPERIMENTAL" name="PULSE RAIL" desc="High-voltage kinetic energy weapon." locked />
            </div>
            
            <div className="mt-auto pt-8 border-t border-white/5">
               <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Total Weight</span>
                  <span className="text-xl font-bold text-white">82%</span>
               </div>
            </div>
          </motion.div>
        )}

        {gameState === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-slate-950/98 backdrop-blur-3xl border border-white/10 rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-emerald-500 mb-10 border-b border-white/10 pb-6" style={{ fontFamily: 'Orbitron' }}>SETTINGS</h2>
            
            <div className="flex flex-col gap-8">
              <SettingsRow label="AUDIO" control={<input type="range" className="w-64 accent-emerald-500 bg-white/10 h-1 rounded-full appearance-none" />} />
              <SettingsRow label="CONTROLS" control={<input type="range" className="w-64 accent-emerald-500 bg-white/10 h-1 rounded-full appearance-none" />} />
              <SettingsRow label="GRAPHICS" control={
                <select className="bg-slate-900 border border-white/10 text-white rounded px-4 py-2 outline-none focus:border-emerald-500 transition-colors">
                  <option>Standard</option>
                  <option>Enhanced</option>
                  <option>High Fidelity</option>
                  <option>Ultra-Res</option>
                </select>
              } />
              <SettingsRow label="DISPLAY" control={
                <div className="w-12 h-6 bg-white/10 rounded-full relative p-1 cursor-pointer">
                   <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                </div>
              } />
            </div>

            <div className="mt-12 flex justify-end gap-4">
               <button onClick={() => { setGameState('menu'); audioManager.playUIClick(); }} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-[0.2em] font-black text-xs rounded transition-all shadow-lg shadow-emerald-900/20">
                RETURN TO MENU
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Menu Overlay */}
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900/90 border border-white/10 p-12 rounded-3xl w-[400px] shadow-2xl flex flex-col gap-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-emerald-500" style={{ fontFamily: 'Orbitron' }}>MISSION PAUSED</h2>
                <div className="h-1 w-12 bg-emerald-500 mx-auto mt-2" />
              </div>
              
              <MenuButton onClick={() => { togglePause(); audioManager.playUIClick(); }} label="RESUME" primary />
              <MenuButton onClick={() => { resetGame(); audioManager.playUIClick(); }} label="RESTART MISSION" />
              <MenuButton onClick={() => { setGameState('settings'); togglePause(); audioManager.playUIClick(); }} label="SETTINGS" />
              <MenuButton onClick={() => { returnToMenu(); audioManager.playUIClick(); }} label="RETURN TO MENU" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Loading Overlay (Simulated) */}
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
            <motion.div 
              animate={{ scale: [0.95, 1, 0.95] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-2xl font-black text-emerald-500 uppercase tracking-[0.4em]"
              style={{ fontFamily: 'Orbitron' }}
            >
              PREPARING MISSION...
            </motion.div>
            <div className="w-64 h-1 bg-white/5 mt-6 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.0 }}
              />
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest mt-4">INITIALIZING SYSTEMS...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ label, onClick, primary = false, disabled = false }: { label: string, onClick: () => void, primary?: boolean, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex items-center w-96 py-4 px-8 transition-all duration-300 ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:pl-10'}`}
    >
      <div className={`absolute inset-0 transition-all duration-300 skew-x-[-15deg] ${primary ? 'bg-emerald-600/20 border border-emerald-500/50 group-hover:bg-emerald-600/40' : 'bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20'}`}></div>
      {primary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>}
      <span className={`relative text-xl uppercase font-bold tracking-[0.2em] transition-all duration-300 ${primary ? 'text-emerald-400 group-hover:text-white group-hover:scale-105' : 'text-slate-400 group-hover:text-white'}`}>
        {label}
      </span>
      {!disabled && (
         <div className="ml-auto relative opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
               <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
            </svg>
         </div>
      )}
    </button>
  );
}

function StatBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-emerald-500">{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
        />
      </div>
    </div>
  );
}

function LoadoutSlot({ type, name, desc, locked = false }: { type: string, name: string, desc: string, locked?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 p-5 bg-white/5 border rounded-xl transition-all group ${locked ? 'opacity-40 border-transparent grayscale' : 'border-white/5 hover:border-emerald-500/30 hover:bg-white/10 cursor-pointer'}`}>
      <div className="flex justify-between items-center">
         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">{type}</span>
         {locked && <span className="text-[10px] font-bold text-white/40 uppercase">Locked</span>}
      </div>
      <span className="text-xl font-bold text-white uppercase tracking-tighter" style={{ fontFamily: 'Orbitron' }}>{name}</span>
      <span className="text-xs text-slate-500 leading-relaxed tracking-wide">{desc}</span>
    </div>
  );
}

function SettingsRow({ label, control }: { label: string, control: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400 uppercase tracking-widest text-xs font-black">{label}</span>
      {control}
    </div>
  );
}
