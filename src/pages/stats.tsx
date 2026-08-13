import React, { useMemo, useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { useGame } from '@/hooks/useGame';
import { calcStats, getExpectedRolls, DICE_VALUES } from '@/lib/catan';
import { Navigation } from '@/components/Navigation';

export default function StatsPage() {
  const { currentGame, rolls, loading } = useGame();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const stats = useMemo(() => calcStats(rolls), [rolls]);

  if (loading) return <div className="h-[100dvh] bg-background" />;
  if (!currentGame) return <div className="h-[100dvh] bg-background"><Navigation /></div>;

  const screens = ['Overview', 'Distribution', 'Timeline', 'Heat Map'];

  return (
    <div className="h-[100dvh] flex flex-col bg-background safe-top safe-pb-nav text-white">
      {/* Header & Tabs */}
      <div className="pt-4 px-4 pb-2 z-10 bg-background/80 backdrop-blur-md sticky top-0 shrink-0">
        <h1 className="text-2xl font-bold mb-4 tracking-tight">Statistics</h1>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl glass">
          {screens.map((name, i) => (
            <button
              key={name}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedIndex === i 
                  ? 'bg-white/10 text-primary shadow-sm' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Swipeable Content */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          <div className="flex-[0_0_100%] min-w-0 px-4 pt-4 pb-8 overflow-y-auto no-scrollbar">
            <OverviewScreen stats={stats} />
          </div>
          <div className="flex-[0_0_100%] min-w-0 px-4 pt-4 pb-8 overflow-y-auto no-scrollbar">
            <DistributionScreen stats={stats} />
          </div>
          <div className="flex-[0_0_100%] min-w-0 px-4 pt-4 pb-8 overflow-y-auto no-scrollbar">
            <TimelineScreen rolls={rolls} players={currentGame.players} />
          </div>
          <div className="flex-[0_0_100%] min-w-0 px-4 pt-4 pb-8 overflow-y-auto no-scrollbar">
            <HeatMapScreen stats={stats} />
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}

function OverviewScreen({ stats }: { stats: ReturnType<typeof calcStats> }) {
  return (
    <div className="grid grid-cols-2 gap-3 pb-6">
      <StatCard label="Total Rolls" value={stats.total} highlight />
      <StatCard label="Average" value={stats.avg} />
      <StatCard label="Most Common" value={stats.mostCommon} />
      <StatCard label="Least Common" value={stats.leastCommon} />
      <div className="col-span-2 glass-strong rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-400 mb-1">Number of 7s</div>
          <div className="text-4xl font-bold text-primary">{stats.sevenCount}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-zinc-400 mb-1">Frequency</div>
          <div className="text-2xl font-bold text-white">{stats.sevenPercent}%</div>
          <div className="text-[10px] text-zinc-500 mt-1">Expected: ~16.7%</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col justify-center">
      <div className="text-xs font-medium text-zinc-400 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function DistributionScreen({ stats }: { stats: ReturnType<typeof calcStats> }) {
  if (stats.total === 0) return <div className="text-center text-zinc-500 mt-20">No rolls yet</div>;

  const data = DICE_VALUES.map(val => {
    const actual = stats.distribution[val];
    const expected = getExpectedRolls(stats.total, val);
    return {
      value: val,
      actual,
      expected: Number(expected.toFixed(1)),
      diff: actual - expected
    };
  });

  return (
    <div className="h-[400px] w-full glass-strong rounded-2xl p-4 flex flex-col">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Actual vs Expected Probability</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis dataKey="value" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#27272a', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                let fill = '#3f3f46'; // muted
                if (entry.value === 7) fill = '#f97316'; // primary
                else if (entry.diff > entry.expected * 0.2) fill = '#fb923c'; // over-indexed
                else if (entry.diff < -entry.expected * 0.2) fill = '#27272a'; // under-indexed
                
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-4 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> 7s</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> Over</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-zinc-600" /> Under</div>
      </div>
    </div>
  );
}

function TimelineScreen({ rolls, players }: { rolls: any[], players: string[] }) {
  if (rolls.length === 0) return <div className="text-center text-zinc-500 mt-20">No rolls yet</div>;

  const reversed = [...rolls].reverse();

  return (
    <div className="space-y-3 pb-12">
      {reversed.map((r, i) => {
        const rollNum = rolls.length - i;
        const playerName = r.playerIndex !== undefined ? players[r.playerIndex] : null;
        const isSeven = r.value === 7;
        const isHighProb = r.value === 6 || r.value === 8;
        
        return (
          <div key={r.id} className="glass rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold
                ${isSeven ? 'bg-primary text-primary-foreground' : isHighProb ? 'bg-white/15 text-orange-200' : 'bg-white/5 text-white'}
              `}>
                {r.value}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Roll #{rollNum}</div>
                {playerName && <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{playerName}</div>}
              </div>
            </div>
            <div className="text-xs text-zinc-500 font-medium">
              {format(r.timestamp, 'h:mm:ss a')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeatMapScreen({ stats }: { stats: ReturnType<typeof calcStats> }) {
  // A catan-like hex layout visualization approximation
  // Row 1: 2, 3, 4
  // Row 2: 5, 6, 7, 8
  // Row 3: 9, 10, 11, 12
  
  if (stats.total === 0) return <div className="text-center text-zinc-500 mt-20">No rolls yet</div>;

  const renderCell = (val: number) => {
    const actual = stats.distribution[val];
    const expected = getExpectedRolls(stats.total, val);
    const diff = actual - expected;
    const ratio = expected > 0 ? actual / expected : 1;
    
    // Determine color intensity based on ratio
    let bgColor = 'bg-zinc-800'; // near expected
    if (ratio > 1.5) bgColor = 'bg-emerald-600/40 border-emerald-500/50';
    else if (ratio > 1.1) bgColor = 'bg-emerald-500/20 border-emerald-500/30';
    else if (ratio < 0.5) bgColor = 'bg-rose-600/40 border-rose-500/50';
    else if (ratio < 0.9) bgColor = 'bg-rose-500/20 border-rose-500/30';
    
    if (val === 7) {
      bgColor = 'bg-primary/20 border-primary/40';
    }

    return (
      <div key={val} className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center border border-white/5 transition-colors ${bgColor}`}>
        <span className="text-2xl font-bold text-white mb-1">{val}</span>
        <div className="flex flex-col items-center text-[10px] font-medium leading-tight">
          <span className="text-white">{actual}</span>
          <span className="text-zinc-500">/ {expected.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="glass-strong rounded-3xl p-6 space-y-4">
        <div className="flex gap-4 px-4">{[2, 3, 4].map(renderCell)}</div>
        <div className="flex gap-4">{[5, 6, 7, 8].map(renderCell)}</div>
        <div className="flex gap-4 px-4">{[9, 10, 11, 12].map(renderCell)}</div>
      </div>
      
      <div className="glass rounded-xl p-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/50" /> Cold</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-zinc-800 border border-white/5" /> Expected</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" /> Hot</div>
      </div>
    </div>
  );
}
