import React from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../../audio/AudioManager';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const DEFEAT_TITLES = ["MISSION FAILED", "AIRCRAFT DESTROYED", "OPERATION LOST", "COMBAT FAILURE", "PILOT DOWN"];
const DEFEAT_SUBTITLES = ["Your helicopter was destroyed in combat.", "Enemy forces overwhelmed your position.", "Mission objectives failed.", "Return to base and rearm."];
const VICTORY_TITLES = ["MISSION COMPLETE", "TARGET ELIMINATED", "OPERATION SUCCESSFUL", "AREA SECURED"];
const VICTORY_SUBTITLES = ["Enemy forces neutralized.", "Mission objectives completed successfully.", "Combat zone secured."];

export default function HUD() {
  const gameState = useStore(state => state.gameState);
  const health = useStore(state => state.health);
  const score = useStore(state => state.score);
  const gameOver = useStore(state => state.gameOver);
  const resetGame = useStore(state => state.resetGame);
  const returnToMenu = useStore(state => state.returnToMenu);
  const combo = useStore(state => state.combo);
  const comboTimer = useStore(state => state.comboTimer);
  const missiles = useStore(state => state.missiles);
  const maxMissiles = useStore(state => state.maxMissiles);
  const lives = useStore(state => state.lives);
  const invulnerable = useStore(state => state.invulnerable);
  const respawning = useStore(state => state.respawning);
  const enemiesDestroyed = useStore(state => state.enemiesDestroyed);
  const highestCombo = useStore(state => state.highestCombo);
  const missionTime = useStore(state => state.missionTime);
  const healthPercent = Math.max(0, health);
  
  const [gameOverTitle, setGameOverTitle] = React.useState(DEFEAT_TITLES[0]);
  const [gameOverSub, setGameOverSub] = React.useState(DEFEAT_SUBTITLES[0]);

  React.useEffect(() => {
    if (gameOver || gameState === 'victory') {
      audioManager.playGameOver();
      if (gameState === 'victory') {
        setGameOverTitle(VICTORY_TITLES[Math.floor(Math.random() * VICTORY_TITLES.length)]);
        setGameOverSub(VICTORY_SUBTITLES[Math.floor(Math.random() * VICTORY_SUBTITLES.length)]);
      } else {
        setGameOverTitle(DEFEAT_TITLES[Math.floor(Math.random() * DEFEAT_TITLES.length)]);
        setGameOverSub(DEFEAT_SUBTITLES[Math.floor(Math.random() * DEFEAT_SUBTITLES.length)]);
      }
    }
  }, [gameOver, gameState]);

  if (gameState !== 'playing' && gameState !== 'gameover' && gameState !== 'victory') return null;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between select-none" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
      
      {/* ─── TOP SECTION ─── */}
      <div className="flex justify-between items-start">
        
        {/* Left Wing: Status & Health */}
        <div className="relative">
          <div className="flex flex-col gap-1">
            {/* Lives Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i < lives ? [1, 1.2, 1] : 0.8,
                      opacity: i < lives ? 1 : 0.2,
                      filter: i < lives ? 'drop-shadow(0 0 5px #10b981)' : 'none'
                    }}
                    className="w-4 h-4"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </motion.div>
                ))}
              </div>
              <div className="h-[2px] w-12 bg-emerald-500/30 ml-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500" 
                  animate={{ x: ['-100%', '100%'] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} 
                />
              </div>
            </div>

            {/* Health Bar */}
            <div className="flex items-end gap-3 h-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1 ml-1" style={{ fontFamily: 'Orbitron' }}>HULL INTEGRITY</span>
                <div className="relative w-64 h-5 bg-black/60 border-l-4 border-emerald-500 clip-path-slant-r">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-black/40 h-full" />
                    ))}
                  </div>
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    initial={{ width: '100%' }}
                    animate={{ width: `${healthPercent}%` }}
                    style={{ backgroundColor: healthPercent <= 30 ? '#ef4444' : '' }}
                  />
                </div>
              </div>
              <div className="text-3xl font-black italic text-emerald-400 tabular-nums drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                {Math.ceil(healthPercent)}%
              </div>
            </div>

            {/* Warning Messages */}
            <div className="flex flex-col gap-1 mt-1">
              <AnimatePresence>
                {healthPercent <= 30 && (
                  <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                  >
                      <div className="w-2 h-2 bg-red-500 animate-ping rounded-full" />
                      <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest">WARNING: CRITICAL DAMAGE</span>
                  </motion.div>
                )}
                {missionTime % 60 > 50 && missionTime % 60 < 58 && (
                   <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                   >
                      <div className="w-2 h-2 bg-amber-500 animate-pulse rounded-full" />
                      <span className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">BOSS TARGET INBOUND</span>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sub-status */}
            <div className="flex gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase text-white/40 tracking-widest">MISSION TIME</span>
                <span className="text-sm font-bold text-white/80 tabular-nums">{formatTime(missionTime)}</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase text-white/40 tracking-widest">TARGETS ELIMINATED</span>
                <span className="text-sm font-bold text-red-500 tabular-nums">{enemiesDestroyed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Wing: Score & Combo */}
        <div className="text-right relative">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.3em] mb-1 mr-1" style={{ fontFamily: 'Orbitron' }}>SORTIE SCORE</span>
            <motion.div 
              key={score}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              style={{ fontFamily: 'Orbitron' }}
            >
              {score.toLocaleString()}
            </motion.div>

            <AnimatePresence>
              {combo > 1 && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  className="mt-4 flex flex-col items-end"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{combo > 5 ? 'AIR DOMINANCE' : 'TARGET CHAIN'}</div>
                      <div className="text-3xl font-black text-amber-400 italic" style={{ fontFamily: 'Orbitron' }}>x{combo}</div>
                    </div>
                    <div className="w-1.5 h-12 bg-amber-500/20 rounded-full relative overflow-hidden">
                      <motion.div 
                        className="absolute bottom-0 w-full bg-amber-400" 
                        animate={{ height: `${(comboTimer / 3.0) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mt-1">COMBAT STREAK</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM SECTION ─── */}
      <div className="flex justify-between items-end">
        <div className="relative w-48 h-24 border-l-2 border-b-2 border-white/20 rounded-bl-xl p-3">
           <span className="text-[8px] uppercase text-white/50 tracking-widest">STAY IN THE FIGHT</span>
        </div>

        <div className="flex flex-col items-end gap-4 mr-4">
          <div className="flex items-center gap-4 bg-black/40 p-2 px-4 border-r-4 border-emerald-500 clip-path-slant-l">
            <div className="text-right">
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">PRIMARY</div>
              <div className="text-lg font-bold text-white uppercase tracking-tighter">VULCAN CANNON</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 bg-black/40 p-2 px-4 border-r-4 border-amber-500 clip-path-slant-l">
              <div className="text-right">
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">SECONDARY [SPACE]</div>
                <div className="text-lg font-bold text-white uppercase tracking-tighter">HELLFIRE MISSILES</div>
              </div>
            </div>
            <div className="flex gap-1.5 mr-2">
              {Array.from({ length: maxMissiles }).map((_, i) => (
                <div key={i} className={`w-5 h-1.5 rounded-sm border border-white/5 ${i < missiles ? 'bg-amber-500' : 'bg-white/5'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── OVERLAYS ─── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {respawning && (
            <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center">
              <div className="px-10 py-4 bg-red-600/20 backdrop-blur-md border-y-2 border-red-500 skew-x-[-20deg]">
                <h2 className="text-6xl font-black text-red-500 italic uppercase tracking-tighter skew-x-[20deg]" style={{ fontFamily: 'Orbitron' }}>AIRCRAFT DESTROYED</h2>
              </div>
              <div className="mt-4 text-xl font-bold text-white tracking-[0.5em] uppercase">REDEPLOYING...</div>
            </motion.div>
          )}
          {invulnerable && !respawning && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="absolute top-[20%] px-6 py-2 bg-sky-500/20 border border-sky-400 rounded-full">
              <span className="text-sky-400 font-bold uppercase tracking-[0.3em] text-xs">AIRCRAFT REPAIRED - STAY IN THE FIGHT</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(gameOver || gameState === 'victory') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 pointer-events-auto">
            <div className="relative flex flex-col items-center gap-2 mb-12 text-center">
              <span className={`${gameState === 'victory' ? 'text-emerald-400' : 'text-sky-400'} font-bold uppercase tracking-[0.8em] text-xs`}>
                {gameState === 'victory' ? "MISSION SUCCESSFUL" : "MISSION FAILED"}
              </span>
              <h1 className={`text-7xl font-black ${gameState === 'victory' ? 'text-emerald-500' : 'text-red-600'} tracking-tighter uppercase italic`} style={{ fontFamily: 'Orbitron' }}>
                {gameOverTitle}
              </h1>
              <p className="text-white/60 uppercase tracking-widest text-xs mt-2">{gameOverSub}</p>
            </div>

            <div className="w-full max-w-xl grid grid-cols-2 gap-6 mb-12">
              <StatCard label="FINAL SCORE" value={score.toLocaleString()} color="text-white" highlight />
              <StatCard label="FLIGHT TIME" value={formatTime(missionTime)} color="text-sky-400" />
              <StatCard label="TARGETS DESTROYED" value={enemiesDestroyed.toString()} color="text-red-500" />
              <StatCard label="MAX CHAIN" value={`${highestCombo}x`} color="text-amber-500" />
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <button onClick={resetGame} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-[0.3em] uppercase text-sm rounded shadow-lg shadow-emerald-900/20">RETRY MISSION</button>
              <button onClick={returnToMenu} className="py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold tracking-[0.2em] uppercase text-xs rounded border border-white/10">RETURN TO BASE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .clip-path-slant-r { clip-path: polygon(0% 0%, 95% 0%, 100% 100%, 0% 100%); }
        .clip-path-slant-l { clip-path: polygon(5% 0%, 100% 0%, 100% 100%, 0% 100%); }
      `}} />
    </div>
  );
}

function StatCard({ label, value, color, highlight = false }: { label: string, value: string, color: string, highlight?: boolean }) {
  return (
    <div className={`flex flex-col p-4 bg-black/40 border border-white/5 rounded-xl ${highlight ? 'ring-1 ring-white/20' : ''}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</span>
      <span className={`text-2xl font-black tabular-nums ${color}`} style={{ fontFamily: 'Orbitron' }}>{value}</span>
    </div>
  );
}
