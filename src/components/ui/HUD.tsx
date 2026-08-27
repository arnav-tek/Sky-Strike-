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
  const maxLives = useStore(state => state.maxLives);
  const invulnerable = useStore(state => state.invulnerable);
  const respawning = useStore(state => state.respawning);
  const enemiesDestroyed = useStore(state => state.enemiesDestroyed);
  const highestCombo = useStore(state => state.highestCombo);
  const missionTime = useStore(state => state.missionTime);
  const bossActive = useStore(state => state.bossActive);
  const bossHealthPercent = useStore(state => state.bossHealthPercent);
  const bossName = useStore(state => state.bossName) || "UNKNOWN BOSS";
  const healthPercent = Math.max(0, health);

  const currentLevel = useStore(state => state.currentLevel);
  const levelTransitioning = useStore(state => state.levelTransitioning);
  const returnToLevelSelect = useStore(state => state.returnToLevelSelect);
  const levelStartScore = useStore(state => state.levelStartScore);

  const [gameOverTitle, setGameOverTitle] = React.useState(DEFEAT_TITLES[0]);
  const [gameOverSub, setGameOverSub] = React.useState(DEFEAT_SUBTITLES[0]);

  const [countdown, setCountdown] = React.useState(5);

  // Auto-return to level select after 5 seconds
  React.useEffect(() => {
    if (levelTransitioning) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            returnToLevelSelect();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [levelTransitioning, returnToLevelSelect]);

  const [killFlash, setKillFlash] = React.useState(0);

  React.useEffect(() => {
    if (enemiesDestroyed > 0) setKillFlash(f => f + 1);
  }, [enemiesDestroyed]);

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

  const isCritical = healthPercent <= 30;
  const isBossLevel = currentLevel % 5 === 0;
  const levelScoreTarget = 8000 + (currentLevel - 1) * 2000;
  const levelProgress = Math.min(100, (Math.max(0, score - levelStartScore) / levelScoreTarget) * 100);

  const healthBarColor = isCritical
    ? 'from-red-600 to-red-500'
    : healthPercent <= 60
      ? 'from-amber-500 to-amber-400'
      : 'from-emerald-500 to-emerald-400';

  const healthGlowColor = isCritical
    ? 'rgba(239,68,68,0.4)'
    : healthPercent <= 60
      ? 'rgba(245,158,11,0.3)'
      : 'rgba(16,185,129,0.3)';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none p-6" style={{ fontFamily: '"Rajdhani", sans-serif' }}>

      {/* ═══ CRITICAL DAMAGE VIGNETTE ═══ */}
      {isCritical && !respawning && !gameOver && (
        <div className="absolute inset-0 critical-vignette z-10" />
      )}

      {/* ═══════════════════════════════════════
          TOP BAR — Health, Score, Level Info
          ═══════════════════════════════════════ */}
      <div className="flex justify-between items-start w-full z-20">

        {/* ─── LEFT: Armor & Lives (Minimalist Vector HUD) ─── */}
        <div className="flex flex-col gap-1 w-80 pointer-events-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[11px] font-black text-emerald-400 tracking-[0.2em] flex items-center gap-1.5" style={{ fontFamily: 'Orbitron' }}>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              ARMOR
            </span>
            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${isCritical ? 'text-red-400 animate-pulse' : 'text-emerald-500/60'}`}>
              {isCritical ? 'CRITICAL' : healthPercent <= 60 ? 'WARNING' : 'SYS_OK'}
            </span>
          </div>

          {/* Bar & Percentage */}
          <div className="flex items-center gap-3">
            <div className="relative w-64 h-3.5 bg-black/45 border border-emerald-500/35 overflow-hidden">
              <div className="absolute inset-0 hud-bar-ticks z-10 opacity-30" />
              <motion.div
                className={`h-full bg-gradient-to-r ${healthBarColor} relative`}
                initial={{ width: '100%' }}
                animate={{ width: `${healthPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ boxShadow: `0 0 8px ${healthGlowColor}` }}
              />
            </div>
            <span className={`text-2xl font-extrabold tabular-nums leading-none tracking-tight ${
              isCritical ? 'text-red-400 text-glow-red' : healthPercent <= 60 ? 'text-amber-400 text-glow-amber' : 'text-emerald-400 text-glow-emerald'
            }`}>
              {Math.ceil(healthPercent)}%
            </span>
          </div>

          {/* Lives indicator (Clean solid/hollow blocks) */}
          <div className="flex items-center gap-2 mt-1 px-0.5 text-[10px] font-black tracking-[0.18em] text-emerald-400/65 uppercase">
            <span>SYS_LIVES:</span>
            <span className="text-xs font-normal tracking-wide text-emerald-400">
              {Array.from({ length: maxLives }).map((_, i) => i < lives ? '▮' : '▯').join(' ')}
            </span>
          </div>

          {/* Warnings */}
          <AnimatePresence>
            {isCritical && !respawning && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1 animate-pulse"
              >
                [ ! HULL DAMAGE INTEGRITY EXCEEDED ! ]
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ─── CENTER: Level + Mission info (Tactical Vector Strip) ─── */}
        <div className="pointer-events-auto flex items-center gap-5 px-6 py-2.5 bg-black/35 border-x border-b border-sky-500/20 rounded-b-md shadow-lg">
          {/* Stage */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-sky-400/60 uppercase tracking-wider">STAGE:</span>
            <span className="text-lg font-black text-amber-400 text-glow-amber tabular-nums leading-none" style={{ fontFamily: 'Orbitron' }}>
              {currentLevel.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="text-sky-500/20">|</div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-sky-400/60 uppercase tracking-wider">
              {isBossLevel ? 'OBJ:' : 'SECURED:'}
            </span>
            {isBossLevel ? (
              <span className="text-xs font-black text-red-400 uppercase tracking-wider animate-pulse">[ ELIMINATE RAID BOSS ]</span>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-28 h-1.5 bg-sky-950/40 border border-sky-500/25 overflow-hidden">
                  <motion.div
                    className="h-full bg-sky-400"
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs font-bold text-sky-300 tabular-nums leading-none">{Math.floor(levelProgress)}%</span>
              </div>
            )}
          </div>

          <div className="text-sky-500/20">|</div>

          {/* Time */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-sky-400/60 uppercase tracking-wider">TIME:</span>
            <span className="text-sm font-black text-slate-100 tabular-nums leading-none">{formatTime(missionTime)}</span>
          </div>

          <div className="text-sky-500/20">|</div>

          {/* Kills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-sky-400/60 uppercase tracking-wider">KILLS:</span>
            <span className="text-sm font-black text-red-400 text-glow-red tabular-nums leading-none">{enemiesDestroyed}</span>
          </div>
        </div>


        {/* ─── RIGHT: Score & Combo (Digital Telemetry) ─── */}
        <div className="flex flex-col items-end w-64 pointer-events-auto">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-sky-400/70 uppercase tracking-[0.25em] mb-0.5" style={{ fontFamily: 'Orbitron' }}>
              SCORE
            </span>
            <motion.div
              key={score}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="text-4xl font-extrabold text-white text-glow-white tracking-tight tabular-nums leading-none"
              style={{ fontFamily: 'Orbitron' }}
            >
              {score.toLocaleString()}
            </motion.div>
          </div>

          {/* Combo indicator (Clean brackets) */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="mt-2.5 px-3 py-1 bg-black/45 border border-amber-500/35 rounded-sm flex items-center gap-2.5"
              >
                <span className="text-[9px] font-black text-amber-500/70 tracking-widest uppercase">
                  {combo > 5 ? 'HYPER' : 'CHAIN'}
                </span>
                <span className="text-lg font-black text-amber-400 text-glow-amber leading-none tracking-tighter" style={{ fontFamily: 'Orbitron' }}>
                  ×{combo}
                </span>
                <div className="w-1.5 h-4 bg-black/50 rounded-full overflow-hidden relative border border-amber-500/15">
                  <motion.div
                    className="absolute bottom-0 w-full bg-amber-400"
                    animate={{ height: `${(comboTimer / 3.0) * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


      {/* ═══ BOSS HEALTH BAR ═══ */}
      <AnimatePresence>
        {bossActive && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[40%] max-w-lg flex flex-col items-center z-30 pointer-events-auto"
          >
            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-1.5 animate-pulse">
              HOSTILE ENCOUNTER: {bossName}
            </span>
            <div className="w-full h-3 bg-black/65 border border-red-500/30 overflow-hidden shadow-[0_0_8px_rgba(239,68,68,0.2)]">
              <motion.div
                className="h-full bg-red-600 relative"
                animate={{ width: `${bossHealthPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          BOTTOM BAR — Weapons + Radar
          ═══════════════════════════════════════ */}
      <div className="flex justify-between items-end w-full z-20 mt-auto">

        {/* ─── LEFT BOTTOM: Clean Vector Radar ─── */}
        <div className="pointer-events-auto w-34 h-34 bg-black/35 backdrop-blur-none rounded-full border border-emerald-500/30 overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-[85%] h-px bg-emerald-500/8" /></div>
          <div className="absolute inset-0 flex items-center justify-center"><div className="h-[85%] w-px bg-emerald-500/8" /></div>
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-[60%] h-[60%] rounded-full border border-emerald-500/5" /></div>
          {/* Sweep */}
          <div className="absolute inset-0 flex items-center justify-center radar-sweep">
            <div className="w-px h-16 bg-gradient-to-b from-emerald-500/60 to-transparent origin-bottom" style={{ transformOrigin: 'bottom center', position: 'absolute', bottom: '50%' }} />
          </div>
          {/* Player dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_4px_#10b981]" />
          </div>
          <div className="absolute bottom-2">
            <span className="text-[8px] font-black text-emerald-400/40 uppercase tracking-widest">RADAR</span>
          </div>
        </div>


        {/* ─── CENTER BOTTOM: Telemetry Controls overlay ─── */}
        <div className="flex items-center gap-3.5 bg-black/35 border border-white/5 rounded-full px-5 py-1.5 backdrop-blur-none opacity-40 hover:opacity-100 transition-all duration-200 mb-1 select-none pointer-events-auto">
          <div className="flex items-center gap-1">
            <kbd className="text-[9px] font-black text-slate-300 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">WASD</kbd>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">MOVE</span>
          </div>
          <div className="text-white/10 text-xs">|</div>
          <div className="flex items-center gap-1">
            <kbd className="text-[9px] font-black text-slate-300 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">L-CLICK</kbd>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">FIRE</span>
          </div>
          <div className="text-white/10 text-xs">|</div>
          <div className="flex items-center gap-1">
            <kbd className="text-[9px] font-black text-slate-300 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">SPACE</kbd>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">ATGM</span>
          </div>
          <div className="text-white/10 text-xs">|</div>
          <div className="flex items-center gap-1">
            <kbd className="text-[9px] font-black text-slate-300 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">PAUSE</span>
          </div>
        </div>


        {/* ─── RIGHT BOTTOM: Clean Tactical Weapons Selector ─── */}
        <div className="border border-emerald-500/20 bg-black/45 p-4 rounded-sm flex flex-col gap-2.5 w-72 pointer-events-auto shadow-md">
          {/* Primary */}
          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
            <div className="flex flex-col text-left">
              <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-wider">CANNON PRIMARY</span>
              <span className="text-xs font-black text-white uppercase tracking-tight italic">[ 30MM 2A42 AUTOCANNON ]</span>
            </div>
            <span className="text-xs font-black text-emerald-400/70 tracking-widest">∞</span>
          </div>

          {/* Secondary */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-wider">ORDNANCE ATGM</span>
                <span className="text-xs font-black text-white uppercase tracking-tight italic">[ 9K121 VIKHR ROCKETS ]</span>
              </div>
              <span className="text-sm font-black text-amber-400 text-glow-amber tabular-nums">{missiles}</span>
            </div>
            
            {/* Missile pips (Sleek block text) */}
            <div className="flex gap-1 select-none text-[10px] leading-none tracking-normal font-black text-amber-500">
              {Array.from({ length: maxMissiles }).map((_, i) => i < missiles ? '▮' : '▯').join(' ')}
            </div>
          </div>
        </div>
      </div>


      {/* ═══ OVERLAYS ═══ */}
      <div className="absolute inset-0 flex items-center justify-center z-40">
        <AnimatePresence>
          {/* Respawning */}
          {respawning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-auto"
            >
              <div className="px-12 py-6 bg-black/90 border border-red-500/30 rounded flex flex-col items-center shadow-2xl">
                <h2 className="text-4xl font-extrabold text-red-500 uppercase tracking-widest text-glow-red" style={{ fontFamily: 'Orbitron' }}>
                  AIRCRAFT DESTROYED
                </h2>
                <span className="mt-3.5 text-xs font-black text-white/50 tracking-[0.25em] uppercase animate-pulse">
                  RECONSTITUTING COMBAT CELL...
                </span>
              </div>
            </motion.div>
          )}

          {/* Invulnerability (Shield Active) */}
          {invulnerable && !respawning && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute top-[18%] px-6 py-2 bg-black/45 border border-cyan-400/50 rounded shadow-[0_0_12px_rgba(34,211,238,0.15)] pointer-events-none"
            >
              <span className="text-xs font-black text-cyan-300 tracking-[0.3em] uppercase text-glow-sky animate-pulse">
                [ SHIELDS ACTIVE ]
              </span>
            </motion.div>
          )}

          {/* Level transition */}
          {levelTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/96 flex flex-col items-center justify-center p-8 pointer-events-auto"
            >
              <div className="absolute inset-0 hud-scanlines opacity-20" />

              <div className="h-px bg-amber-500/35 w-80 mb-8" />

              <div className="relative flex flex-col items-center gap-2 mb-10 text-center">
                <span className="text-emerald-400/60 font-black uppercase tracking-[0.5em] text-xs">
                  MISSION ACCOMPLISHED
                </span>
                <h1
                  className="text-6xl font-black text-amber-400 text-glow-amber tracking-tight uppercase italic leading-none"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  SECTOR {currentLevel} CLEAR
                </h1>
                <p className="text-white/30 uppercase tracking-[0.18em] text-xs mt-1.5">TACTICAL AREA SECURED • RETRIEVING DATA</p>
              </div>

              {/* Stats card grid */}
              <div className="w-full max-w-xl grid grid-cols-2 gap-4 mb-10 pointer-events-auto">
                <StatCard label="TACTICAL SCORE" value={score.toLocaleString()} color="text-white" highlight />
                <StatCard label="MISSION TIME" value={formatTime(missionTime)} color="text-sky-400" />
                <SelectableStatCard label="ENEMIES DESTROYED" value={enemiesDestroyed.toString()} color="text-red-400" />
                <SelectableStatCard label="MAX MULTIPLIER" value={`${highestCombo}×`} color="text-amber-400" />
              </div>

              <div className="h-px bg-amber-500/20 w-80 mb-8" />

              <div className="flex flex-col items-center gap-3.5 w-full max-w-xs pointer-events-auto">
                <button
                  onClick={() => {
                    audioManager.playUIClick();
                    returnToLevelSelect();
                  }}
                  className="w-full py-3.5 text-sm font-black tracking-[0.15em] uppercase rounded border border-emerald-500 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 transition-all duration-200 cursor-pointer"
                >
                  CONTINUE OPERATION
                </button>
                
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 text-center">
                  Auto-returning to Mission Control in <span className="text-amber-400 font-bold tabular-nums">{countdown}</span>s...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ═══ KILL FLASH ═══ */}
      <AnimatePresence>
        {killFlash > 0 && (
          <motion.div
            key={killFlash}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay z-30"
          />
        )}
      </AnimatePresence>


      {/* ═══ GAME OVER / VICTORY ═══ */}
      <AnimatePresence>
        {(gameOver || gameState === 'victory') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950/96 flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="absolute inset-0 hud-scanlines opacity-20" />

            <div className={`h-px ${gameState === 'victory' ? 'bg-emerald-500/35' : 'bg-red-500/35'} w-80 mb-8`} />

            <div className="relative flex flex-col items-center gap-2 mb-10 text-center">
              <span className={`${gameState === 'victory' ? 'text-emerald-400/60' : 'text-sky-400/60'} font-black uppercase tracking-[0.5em] text-xs`}>
                {gameState === 'victory' ? "MISSION DEBRIEFING" : "TACTICAL CRITICAL STATUS"}
              </span>
              <h1
                className={`text-6xl font-black ${gameState === 'victory' ? 'text-emerald-400 text-glow-emerald' : 'text-red-500 text-glow-red'} tracking-tight uppercase italic leading-none`}
                style={{ fontFamily: 'Orbitron' }}
              >
                {gameOverTitle}
              </h1>
              <p className="text-white/30 uppercase tracking-[0.18em] text-xs mt-1.5">{gameOverSub}</p>
            </div>

            <div className="w-full max-w-xl grid grid-cols-2 gap-4 mb-10">
              <StatCard label="FINAL SCORE" value={score.toLocaleString()} color="text-white" highlight />
              <StatCard label="ELAPSED TIME" value={formatTime(missionTime)} color="text-sky-400" />
              <SelectableStatCard label="ENEMIES DESTROYED" value={enemiesDestroyed.toString()} color="text-red-400" />
              <SelectableStatCard label="MAX MULTIPLIER" value={`${highestCombo}×`} color="text-amber-400" />
            </div>

            <div className={`h-px ${gameState === 'victory' ? 'bg-emerald-500/20' : 'bg-red-500/20'} w-80 mb-8`} />

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={resetGame}
                className={`py-3.5 text-sm font-black tracking-[0.15em] uppercase rounded border transition-all duration-200 ${
                  gameState === 'victory'
                    ? 'border-emerald-500 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400'
                    : 'border-red-500 bg-red-950/20 hover:bg-red-900/30 text-red-400'
                }`}
              >
                REDEPLOY FOR MISSION
              </button>
              <button
                onClick={returnToMenu}
                className="py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 text-xs font-bold tracking-[0.15em] uppercase rounded border border-white/8 hover:border-white/12 transition-all duration-200"
              >
                RETURN TO COCKPIT HANGAR
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function StatCard({ label, value, color, highlight = false }: { label: string, value: string, color: string, highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`relative flex flex-col p-4 bg-black/65 border rounded shadow-md ${
        highlight ? 'border-white/20' : 'border-white/5'
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25 mb-1.5">{label}</span>
      <span className={`text-2xl font-black tabular-nums tracking-tight ${color}`} style={{ fontFamily: 'Orbitron' }}>
        {value}
      </span>
    </motion.div>
  );
}

function SelectableStatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="relative flex flex-col p-4 bg-black/65 border border-white/5 rounded shadow-md"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25 mb-1.5">{label}</span>
      <span className={`text-2xl font-black tabular-nums tracking-tight ${color}`} style={{ fontFamily: 'Orbitron' }}>
        {value}
      </span>
    </motion.div>
  );
}
