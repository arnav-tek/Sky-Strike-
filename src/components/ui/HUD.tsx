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
  const bossActive = useStore(state => state.bossActive);
  const bossHealthPercent = useStore(state => state.bossHealthPercent);
  const bossName = useStore(state => state.bossName) || "UNKNOWN BOSS";
  const healthPercent = Math.max(0, health);

  const currentLevel = useStore(state => state.currentLevel);
  const levelTransitioning = useStore(state => state.levelTransitioning);
  const startNextLevel = useStore(state => state.startNextLevel);
  const levelStartScore = useStore(state => state.levelStartScore);

  const [gameOverTitle, setGameOverTitle] = React.useState(DEFEAT_TITLES[0]);
  const [gameOverSub, setGameOverSub] = React.useState(DEFEAT_SUBTITLES[0]);

  // Auto-advance to next level after 3 seconds
  React.useEffect(() => {
    if (levelTransitioning) {
      const timer = setTimeout(() => { startNextLevel(); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [levelTransitioning, startNextLevel]);

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
  const levelScoreTarget = 2000 + (currentLevel - 1) * 500;
  const levelProgress = Math.min(100, (Math.max(0, score - levelStartScore) / levelScoreTarget) * 100);

  const healthBarColor = isCritical
    ? 'from-red-700 via-red-500 to-red-400'
    : healthPercent <= 60
      ? 'from-amber-600 via-amber-500 to-amber-400'
      : 'from-emerald-600 via-emerald-500 to-emerald-400';

  const healthGlowColor = isCritical
    ? 'rgba(239,68,68,0.5)'
    : healthPercent <= 60
      ? 'rgba(245,158,11,0.4)'
      : 'rgba(16,185,129,0.4)';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none" style={{ fontFamily: '"Rajdhani", sans-serif' }}>

      {/* ═══ CRITICAL DAMAGE VIGNETTE ═══ */}
      {isCritical && !respawning && !gameOver && (
        <div className="absolute inset-0 critical-vignette z-10" />
      )}

      {/* ═══════════════════════════════════════
          TOP BAR — Health, Score, Level Info
          ═══════════════════════════════════════ */}
      <div className="flex justify-between items-start p-5 pb-0 z-20">

        {/* ─── LEFT: Health + Lives ─── */}
        <div className="flex flex-col gap-2 min-w-[340px]">

          {/* Lives row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white/35 uppercase tracking-[0.15em] mr-1">LIVES</span>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="relative">
                <div
                  className={`w-6 h-6 rounded transition-all duration-300 ${
                    i < lives
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                      : 'bg-white/8 border border-white/10'
                  }`}
                />
                {i < lives && (
                  <div className="absolute inset-0 rounded bg-emerald-400/30 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Health bar */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1">
              <span className="text-xs font-bold text-emerald-400/70 uppercase tracking-[0.2em] mb-1 ml-0.5" style={{ fontFamily: 'Orbitron' }}>
                HULL INTEGRITY
              </span>
              <div
                className={`relative w-full h-7 bg-black/70 rounded overflow-hidden border ${
                  isCritical ? 'border-red-500/50 border-pulse-red' : 'border-white/10'
                }`}
              >
                {/* Tick overlay */}
                <div className="absolute inset-0 hud-bar-ticks z-10" />
                {/* Health fill */}
                <motion.div
                  className={`h-full bg-gradient-to-r ${healthBarColor} relative`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${healthPercent}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ boxShadow: `0 0 14px ${healthGlowColor}` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </motion.div>
              </div>
            </div>
            {/* Health percentage */}
            <div className={`text-4xl font-black tabular-nums leading-none ${
              isCritical ? 'text-red-400 text-glow-red' : healthPercent <= 60 ? 'text-amber-400 text-glow-amber' : 'text-emerald-400 text-glow-emerald'
            }`}>
              {Math.ceil(healthPercent)}
              <span className="text-lg font-bold opacity-50">%</span>
            </div>
          </div>

          {/* Warning messages */}
          <AnimatePresence>
            {isCritical && !respawning && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-1"
              >
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-red-400 font-bold text-sm uppercase tracking-[0.15em]">⚠ CRITICAL DAMAGE</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ─── CENTER: Level + Mission info ─── */}
        <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/8">
          {/* Stage badge */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-white/35 tracking-[0.15em] font-bold">STAGE</span>
            <span className="text-3xl font-black text-amber-400 leading-none tabular-nums" style={{ fontFamily: 'Orbitron' }}>{currentLevel}</span>
          </div>

          <div className="w-px h-10 bg-white/10" />

          {/* Level progress / Boss indicator */}
          <div className="flex flex-col min-w-[140px]">
            <span className="text-[10px] uppercase text-white/35 tracking-[0.15em] font-bold">
              {isBossLevel ? 'OBJECTIVE' : 'PROGRESS'}
            </span>
            {isBossLevel ? (
              <span className="text-base font-bold text-red-400 uppercase tracking-wider">DEFEAT BOSS</span>
            ) : (
              <div className="flex items-center gap-2.5 mt-1">
                <div className="flex-1 h-2.5 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-sky-400 rounded-full progress-stripes"
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-sm font-bold text-sky-400/80 tabular-nums">{Math.floor(levelProgress)}%</span>
              </div>
            )}
          </div>

          <div className="w-px h-10 bg-white/10" />

          {/* Mission timer */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-white/35 tracking-[0.15em] font-bold">TIME</span>
            <span className="text-xl font-bold text-white/75 tabular-nums leading-none">{formatTime(missionTime)}</span>
          </div>

          <div className="w-px h-10 bg-white/10" />

          {/* Kills counter */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-white/35 tracking-[0.15em] font-bold">KILLS</span>
            <span className="text-xl font-bold text-red-400 tabular-nums leading-none">{enemiesDestroyed}</span>
          </div>
        </div>


        {/* ─── RIGHT: Score + Combo ─── */}
        <div className="flex flex-col items-end min-w-[240px]">
          <span className="text-xs font-bold text-sky-400/60 uppercase tracking-[0.25em] mr-1" style={{ fontFamily: 'Orbitron' }}>SCORE</span>
          <motion.div
            key={score}
            initial={{ y: -8, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-5xl font-black text-white tracking-tight tabular-nums leading-none text-glow-white"
            style={{ fontFamily: 'Orbitron' }}
          >
            {score.toLocaleString()}
          </motion.div>

          {/* Combo indicator */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                initial={{ x: 30, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 30, opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3 mt-3"
              >
                {/* Combo timer bar */}
                <div className="w-2 h-14 bg-white/8 rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute bottom-0 w-full bg-amber-400 rounded-full"
                    animate={{ height: `${(comboTimer / 3.0) * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-amber-400/60 uppercase tracking-[0.15em]">
                    {combo > 5 ? 'DOMINANCE' : 'CHAIN'}
                  </span>
                  <div className="text-4xl font-black text-amber-400 leading-none text-glow-amber" style={{ fontFamily: 'Orbitron' }}>
                    ×{combo}
                  </div>
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
            className="absolute top-[90px] left-1/2 -translate-x-1/2 w-[45%] max-w-xl flex flex-col items-center z-30"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-black text-red-400 uppercase tracking-[0.4em]" style={{ fontFamily: 'Orbitron' }}>
                {bossName}
              </span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div className="w-full h-5 bg-black/70 border border-red-900/40 rounded overflow-hidden boss-bar-glow">
              <motion.div
                className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 relative"
                animate={{ width: `${bossHealthPercent}%` }}
                transition={{ duration: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          BOTTOM BAR — Weapons + Radar
          ═══════════════════════════════════════ */}
      <div className="flex justify-between items-end p-5 pt-0 z-20">

        {/* ─── LEFT BOTTOM: Radar ─── */}
        <div className="relative w-32 h-32 bg-black/50 backdrop-blur-sm rounded-full border border-emerald-500/20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-px bg-emerald-500/15" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-px bg-emerald-500/15" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border border-emerald-500/10" />
          </div>
          {/* Sweep */}
          <div className="absolute inset-0 flex items-center justify-center radar-sweep">
            <div className="w-px h-14 bg-gradient-to-b from-emerald-400/60 to-transparent origin-bottom" style={{ transformOrigin: 'bottom center', position: 'absolute', bottom: '50%' }} />
          </div>
          {/* Player dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-[9px] font-bold text-emerald-400/40 uppercase tracking-wider">RADAR</span>
          </div>
        </div>


        {/* ─── CENTER BOTTOM: Controls ─── */}
        <div className="flex items-center gap-4 opacity-35 mb-3">
          <div className="flex items-center gap-1.5">
            <kbd className="text-xs font-bold text-white/60 bg-white/8 border border-white/10 rounded px-2 py-1">W A S D</kbd>
            <span className="text-xs text-white/40">MOVE</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <kbd className="text-xs font-bold text-white/60 bg-white/8 border border-white/10 rounded px-2 py-1">CLICK</kbd>
            <span className="text-xs text-white/40">FIRE</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <kbd className="text-xs font-bold text-white/60 bg-white/8 border border-white/10 rounded px-2 py-1">SPACE</kbd>
            <span className="text-xs text-white/40">MISSILE</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <kbd className="text-xs font-bold text-white/60 bg-white/8 border border-white/10 rounded px-2 py-1">ESC</kbd>
            <span className="text-xs text-white/40">PAUSE</span>
          </div>
        </div>


        {/* ─── RIGHT BOTTOM: Weapons ─── */}
        <div className="flex flex-col items-end gap-3">

          {/* Primary weapon */}
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-white/8">
            <div className="w-1.5 h-8 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <div className="text-right">
              <div className="text-[10px] font-bold text-white/35 uppercase tracking-[0.12em]">PRIMARY</div>
              <div className="text-lg font-black text-white/90 uppercase tracking-tight leading-none">2A42 CANNON</div>
            </div>
            <div className="text-sm font-bold text-emerald-400/70 uppercase ml-1">∞</div>
          </div>

          {/* Secondary weapon + missiles */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-white/8">
              <div className="w-1.5 h-8 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <div className="text-right">
                <div className="text-[10px] font-bold text-white/35 uppercase tracking-[0.12em]">SECONDARY <span className="text-amber-400/50">[SPACE]</span></div>
                <div className="text-lg font-black text-white/90 uppercase tracking-tight leading-none">VIKHR ATGMs</div>
              </div>
              <div className="text-xl font-black text-amber-400 tabular-nums ml-2">{missiles}</div>
            </div>
            {/* Missile pips */}
            <div className="flex gap-1.5 mr-1">
              {Array.from({ length: maxMissiles }).map((_, i) => (
                <div
                  key={i}
                  className={`w-7 h-2.5 rounded-sm transition-all duration-200 ${
                    i < missiles
                      ? 'bg-amber-500 missile-pill-active'
                      : 'bg-white/8 border border-white/5'
                  }`}
                />
              ))}
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
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="px-14 py-6 bg-red-950/30 backdrop-blur-lg border-y-2 border-red-500/70 relative">
                <div className="absolute inset-0 hud-scanlines" />
                <h2 className="text-6xl font-black text-red-500 uppercase tracking-tight text-glow-red relative z-10" style={{ fontFamily: 'Orbitron' }}>
                  AIRCRAFT DESTROYED
                </h2>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-5 text-xl font-bold text-white/60 tracking-[0.5em] uppercase"
              >
                REDEPLOYING...
              </motion.div>
            </motion.div>
          )}

          {/* Invulnerability */}
          {invulnerable && !respawning && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-[18%] px-6 py-2.5 bg-sky-500/15 backdrop-blur-sm border border-sky-400/40 rounded-full"
            >
              <span className="text-sky-300 font-bold uppercase tracking-[0.25em] text-sm">
                SHIELDS ACTIVE
              </span>
            </motion.div>
          )}

          {/* Level transition */}
          {levelTransitioning && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
            >
              <div className="relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.6 }}
                  className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-8"
                />
                <h2 className="text-7xl font-black text-amber-400 uppercase tracking-tight text-glow-amber text-center" style={{ fontFamily: 'Orbitron' }}>
                  LEVEL {currentLevel} COMPLETE
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-8"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-xl font-bold text-emerald-400/80 tracking-[0.6em] uppercase"
              >
                AREA SECURED • ADVANCING...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ═══ KILL FLASH ═══ */}
      <AnimatePresence>
        {killFlash > 0 && (
          <motion.div
            key={killFlash}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
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
            className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-lg flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="absolute inset-0 hud-scanlines opacity-30" />

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '320px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`h-px ${gameState === 'victory' ? 'bg-emerald-500' : 'bg-red-500'} mb-10`}
            />

            <div className="relative flex flex-col items-center gap-3 mb-12 text-center">
              <span className={`${gameState === 'victory' ? 'text-emerald-400/60' : 'text-sky-400/60'} font-bold uppercase tracking-[0.6em] text-sm`}>
                {gameState === 'victory' ? "MISSION SUCCESSFUL" : "MISSION FAILED"}
              </span>
              <h1
                className={`text-7xl font-black ${gameState === 'victory' ? 'text-emerald-400 text-glow-emerald' : 'text-red-500 text-glow-red'} tracking-tight uppercase`}
                style={{ fontFamily: 'Orbitron' }}
              >
                {gameOverTitle}
              </h1>
              <p className="text-white/40 uppercase tracking-[0.15em] text-base mt-1">{gameOverSub}</p>
            </div>

            <div className="w-full max-w-2xl grid grid-cols-2 gap-5 mb-12">
              <StatCard label="FINAL SCORE" value={score.toLocaleString()} color="text-white" highlight />
              <StatCard label="FLIGHT TIME" value={formatTime(missionTime)} color="text-sky-400" />
              <StatCard label="TARGETS DESTROYED" value={enemiesDestroyed.toString()} color="text-red-400" />
              <StatCard label="MAX CHAIN" value={`${highestCombo}×`} color="text-amber-400" />
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '320px' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className={`h-px ${gameState === 'victory' ? 'bg-emerald-500/50' : 'bg-red-500/50'} mb-10`}
            />

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <button
                onClick={resetGame}
                className={`py-4 text-base font-black tracking-[0.2em] uppercase rounded-lg transition-all duration-300 ${
                  gameState === 'victory'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/50'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 hover:shadow-red-800/50'
                }`}
              >
                RETRY MISSION
              </button>
              <button
                onClick={returnToMenu}
                className="py-4 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-sm font-bold tracking-[0.15em] uppercase rounded-lg border border-white/8 hover:border-white/15 transition-all duration-300"
              >
                RETURN TO BASE
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`relative flex flex-col p-5 bg-white/3 border rounded-xl overflow-hidden ${
        highlight ? 'border-white/15 ring-1 ring-white/10' : 'border-white/5'
      }`}
    >
      {highlight && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />
        </>
      )}
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/25 mb-1.5">{label}</span>
      <span className={`text-3xl font-black tabular-nums ${color}`} style={{ fontFamily: 'Orbitron' }}>
        {value}
      </span>
    </motion.div>
  );
}
