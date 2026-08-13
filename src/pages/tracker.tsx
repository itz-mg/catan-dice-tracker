import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Maximize2, Minimize, RotateCcw, RotateCw } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGame } from '@/hooks/useGame';
import { useSettings } from '@/hooks/useSettings';
import { useWakeLock } from '@/hooks/useWakeLock';
import { calcStats, DICE_VALUES, PIPS_COUNT } from '@/lib/catan';
import { NewGameSheet } from '@/components/NewGameSheet';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackerPage() {
  const { currentGame, rolls, loading, addRoll, undoLastRoll, resetCurrentGame, startNewGame } = useGame();
  const { settings, updateSettings } = useSettings();
  const [showNewGame, setShowNewGame] = useState(false);
  const [lastTapped, setLastTapped] = useState<number | null>(null);
  
  // Timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!currentGame || !currentGame.isActive) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - currentGame.createdAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentGame]);

  // Initial elapsed set
  useEffect(() => {
    if (currentGame) {
      setElapsed(Math.floor((Date.now() - currentGame.createdAt) / 1000));
    }
  }, [currentGame]);

  const isTableMode = settings.tableMode;
  useWakeLock(settings.wakeLock || isTableMode);

  // Layout for dice grid
  const row1 = [2, 3, 4];
  const row2 = [5, 6, 7, 8];
  const row3 = [9, 10, 11, 12];
  
  const handleRoll = useCallback((val: number) => {
    addRoll(val);
    setLastTapped(val);
    if ('vibrate' in navigator) navigator.vibrate(50);
    setTimeout(() => setLastTapped(null), 300);
  }, [addRoll]);

  const currentPlayer = useMemo(() => {
    if (!currentGame || currentGame.playerCount <= 1) return null;
    const index = rolls.length % currentGame.playerCount;
    return currentGame.players[index] || `Player ${index + 1}`;
  }, [currentGame, rolls.length]);

  if (loading) {
    return <div className="h-[100dvh] bg-background" />;
  }

  if (!currentGame) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center bg-background safe-pb-nav">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-sm w-full">
          <div className="w-24 h-24 mx-auto bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/30 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
            <span className="text-5xl font-bold text-primary">7</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Catan Tracker</h1>
          <p className="text-zinc-400">Keep track of every roll, analyze distributions, and never miss a turn.</p>
          <Button 
            onClick={() => setShowNewGame(true)} 
            className="w-full h-14 text-lg rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-8"
          >
            Start New Game
          </Button>
        </motion.div>
        <NewGameSheet open={showNewGame} onOpenChange={setShowNewGame} onStartGame={startNewGame} />
        <Navigation />
      </div>
    );
  }

  const lastRoll = rolls.length > 0 ? rolls[rolls.length - 1] : null;
  if (isTableMode) {
    return (
      <StandbyScreen
        currentGame={currentGame}
        rolls={rolls}
        lastRoll={lastRoll}
        lastTapped={lastTapped}
        onRoll={handleRoll}
        onExit={() => updateSettings({ tableMode: false })}
      />
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      {!isTableMode && (
        <header className="safe-top glass-strong z-10 flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white tracking-wide">{currentGame.name}</span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
              {currentPlayer ? `${currentPlayer}'S TURN` : 'SINGLE PLAYER'}
            </span>
          </div>
            <div className="flex items-center gap-3 text-right">
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-enter-standby"
                aria-label="Enter StandBy mode"
                onClick={() => updateSettings({ tableMode: true })}
                className="h-10 w-10 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-500 font-medium">ROLLS</span>
              <span className="text-base font-bold text-white leading-none">{rolls.length}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col items-end w-12">
              <span className="text-xs text-zinc-500 font-medium">TIME</span>
              <span className="text-base font-bold text-primary leading-none">{formatTime(elapsed)}</span>
            </div>
          </div>
        </header>
      )}

      {/* Table Mode Compact Header */}
      {isTableMode && (
        <header className="safe-top absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pointer-events-none">
          <div className="glass px-3 py-1.5 rounded-full flex items-center gap-3">
            <span className="text-xs font-bold text-white">Roll #{rolls.length + 1}</span>
            <span className="text-[10px] font-medium text-primary uppercase">{currentPlayer || formatTime(elapsed)}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => updateSettings({ tableMode: false })}
            className="rounded-full bg-black/40 glass pointer-events-auto hover:bg-white/10 w-10 h-10"
          >
            <Minimize className="w-4 h-4 text-zinc-300" />
          </Button>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col justify-center px-2 py-4 z-10 gap-4 ${!isTableMode ? 'safe-pb-nav max-w-lg mx-auto w-full' : 'safe-bottom landscape:flex-row landscape:px-8'}`}>
        
        {/* Last Roll Display - Landscape it moves to a side panel if needed, but flex-col keeps it top for portrait */}
        <div className={`flex flex-col items-center justify-center shrink-0 ${isTableMode ? 'h-24' : 'h-32 mt-4'}`}>
          <AnimatePresence mode="popLayout">
            {lastRoll ? (
              <motion.div
                key={lastRoll.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col items-center"
              >
                <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-1">
                  LAST ROLL
                </span>
                <div className={`font-bold tracking-tighter leading-none ${lastRoll.value === 7 ? 'text-primary' : 'text-white'} ${isTableMode ? 'text-6xl' : 'text-7xl'}`}>
                  {lastRoll.value}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-zinc-600"
              >
                <div className="text-xl font-medium">Ready to roll</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dice Grid */}
        <div className={`flex-1 flex flex-col justify-center gap-3 ${isTableMode && 'landscape:w-full landscape:h-full landscape:py-4'}`}>
          <div className="flex gap-3 justify-center landscape:flex-1">
            {row1.map(val => <DiceButton key={val} value={val} onClick={() => handleRoll(val)} isActive={lastTapped === val} isTableMode={isTableMode} />)}
          </div>
          <div className="flex gap-3 justify-center landscape:flex-1">
            {row2.map(val => <DiceButton key={val} value={val} onClick={() => handleRoll(val)} isActive={lastTapped === val} isTableMode={isTableMode} />)}
          </div>
          <div className="flex gap-3 justify-center landscape:flex-1">
            {row3.map(val => <DiceButton key={val} value={val} onClick={() => handleRoll(val)} isActive={lastTapped === val} isTableMode={isTableMode} />)}
          </div>
        </div>

        {/* Quick Actions */}
        {!isTableMode && (
          <div className="flex justify-center gap-4 mt-6 shrink-0">
            <Button variant="ghost" className="glass h-12 px-6 rounded-2xl text-zinc-300 hover:text-white hover:bg-white/10" onClick={undoLastRoll} disabled={rolls.length === 0}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button variant="ghost" className="glass h-12 px-6 rounded-2xl text-zinc-300 hover:text-white hover:bg-white/10" onClick={resetCurrentGame}>
              <RotateCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        )}
      </main>

      <Navigation hidden={isTableMode} />
    </div>
  );
}

// Extracted for performance
const DiceButton = React.memo(({ value, onClick, isActive, isTableMode }: { value: number, onClick: () => void, isActive: boolean, isTableMode: boolean }) => {
  const pips = PIPS_COUNT[value];
  const isSeven = value === 7;
  const isHighProb = value === 6 || value === 8;

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`relative flex-1 flex flex-col items-center justify-center rounded-2xl overflow-hidden touch-manipulation transition-colors duration-200
        ${isTableMode ? 'min-h-24' : 'h-24'}
        ${isActive ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}
        ${isSeven ? 'border border-primary/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border border-white/10'}
        ${isHighProb ? 'border-orange-500/20 bg-orange-500/5' : ''}
      `}
      style={{
        boxShadow: isActive ? 'inset 0 0 20px rgba(255,255,255,0.1)' : undefined
      }}
    >
      <div className={`text-4xl font-bold leading-none mb-1 ${isSeven ? 'text-primary' : isHighProb ? 'text-orange-200' : 'text-white'}`}>
        {value}
      </div>
      <div className="flex gap-[3px] justify-center items-center h-2 opacity-60">
        {Array.from({ length: pips }).map((_, i) => (
          <div key={i} className={`w-[5px] h-[5px] rounded-full ${isSeven ? 'bg-primary' : 'bg-white'}`} />
        ))}
      </div>
    </motion.button>
  );
});

type StandbyScreenProps = {
  currentGame: NonNullable<ReturnType<typeof useGame>['currentGame']>;
  rolls: ReturnType<typeof useGame>['rolls'];
  lastRoll: ReturnType<typeof useGame>['rolls'][number] | null;
  lastTapped: number | null;
  onRoll: (value: number) => void;
  onExit: () => void;
};

function StandbyScreen({ currentGame, rolls, lastRoll, lastTapped, onRoll, onExit }: StandbyScreenProps) {
  const stats = useMemo(() => calcStats(rolls), [rolls]);
  const chartData = useMemo(
    () => DICE_VALUES.map((value) => ({ value: String(value), count: stats.distribution[value] })),
    [stats.distribution],
  );

  return (
    <div className="standby-screen no-select" data-testid="screen-standby">
      <div className="standby-glow standby-glow-one" />
      <div className="standby-glow standby-glow-two" />

      <header className="standby-header safe-top">
        <div className="standby-last-roll" data-testid="text-standby-last-roll" aria-live="polite">
          <span>LAST ROLL</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.strong
              key={lastRoll?.id ?? 'empty'}
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              {lastRoll?.value ?? '—'}
            </motion.strong>
          </AnimatePresence>
        </div>
        <button
          type="button"
          className="standby-exit"
          data-testid="button-exit-standby"
          aria-label="Exit StandBy mode"
          onClick={onExit}
        >
          <Minimize className="h-4 w-4" />
        </button>
      </header>

      <main className="standby-content">
        <section className="standby-numpad" aria-label="Dice roll numpad">
          <div className="standby-section-heading">
            <span>ROLL DICE</span>
            <span className="standby-roll-count" data-testid="text-standby-roll-count">
              {rolls.length} {rolls.length === 1 ? 'ROLL' : 'ROLLS'}
            </span>
          </div>
          <div className="standby-dice-grid">
            {DICE_VALUES.map((value) => (
              <StandbyDiceButton
                key={value}
                value={value}
                isActive={lastTapped === value}
                onClick={() => onRoll(value)}
              />
            ))}
          </div>
        </section>

        <section className="standby-chart-panel" aria-label="Roll distribution chart">
          <div className="standby-section-heading">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              DISTRIBUTION
            </span>
            <span className="standby-chart-caption">ACTUAL ROLLS</span>
          </div>
          <div className="standby-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 2, left: -22, bottom: 0 }}>
                <XAxis
                  dataKey="value"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,.48)', fontSize: 11 }}
                  dy={8}
                />
                <YAxis hide allowDecimals={false} domain={[0, (dataMax: number) => Math.max(1, dataMax + 1)]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,.04)' }}
                  contentStyle={{
                    background: 'rgba(20,20,25,.92)',
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 14,
                    color: '#fff',
                    fontSize: 12,
                  }}
                  formatter={(count: number) => [count, 'Rolls']}
                  labelFormatter={(label) => `Dice ${label}`}
                />
                <Bar dataKey="count" radius={[8, 8, 3, 3]} animationDuration={500} maxBarSize={38}>
                  {chartData.map(({ value }) => (
                    <Cell
                      key={value}
                      fill={value === '7' ? '#ffad42' : value === '6' || value === '8' ? '#d98a4d' : 'rgba(255,255,255,.3)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="standby-chart-footer">
            <span>2</span>
            <span>7 is most likely</span>
            <span>12</span>
          </div>
        </section>
      </main>

    </div>
  );
}

const StandbyDiceButton = React.memo(function StandbyDiceButton({
  value,
  onClick,
  isActive,
}: {
  value: number;
  onClick: () => void;
  isActive: boolean;
}) {
  const isSeven = value === 7;
  const isHighProb = value === 6 || value === 8;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      data-testid={`button-standby-dice-${value}`}
      aria-label={`Roll ${value}`}
      className={`standby-die-button ${isSeven ? 'standby-die-seven' : ''} ${isHighProb ? 'standby-die-high' : ''} ${isActive ? 'standby-die-active' : ''}`}
    >
      <span>{value}</span>
      <i>
        {Array.from({ length: PIPS_COUNT[value] }).map((_, index) => (
          <b key={index} />
        ))}
      </i>
    </motion.button>
  );
});
