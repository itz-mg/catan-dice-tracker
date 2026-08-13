import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, Download, Plus } from 'lucide-react';
import { getAllGames, deleteGame, exportGameData, Game } from '@/lib/storage';
import { useGame } from '@/hooks/useGame';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { NewGameSheet } from '@/components/NewGameSheet';

import { useLocation } from 'wouter';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const { startNewGame } = useGame();
  const [, setLocation] = useLocation();

  const loadGames = async () => {
    try {
      const g = await getAllGames();
      setGames(g);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      await deleteGame(id);
      loadGames();
    }
  };

  const handleExport = async (id: string, format: 'json' | 'csv') => {
    try {
      const data = await exportGameData(id);
      
      let blob: Blob;
      let filename: string;
      
      if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = `catan-game-${id}.json`;
      } else {
        const header = 'Roll ID,Value,Timestamp,Player\n';
        const rows = data.rolls.map(r => 
          `${r.id},${r.value},${new Date(r.timestamp).toISOString()},${r.playerIndex !== undefined ? data.game.players[r.playerIndex] : ''}`
        ).join('\n');
        blob = new Blob([header + rows], { type: 'text/csv' });
        filename = `catan-game-${id}.csv`;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleStartGame = async (name: string, playerCount: number, players: string[]) => {
    await startNewGame(name, playerCount, players);
    setLocation('/');
  };

  if (loading) return <div className="h-[100dvh] bg-background" />;

  return (
    <div className="h-[100dvh] flex flex-col bg-background safe-top safe-pb-nav text-white">
      <div className="pt-4 px-4 pb-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <Button size="icon" variant="ghost" className="glass rounded-full h-10 w-10 text-white" onClick={() => setShowNew(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {games.length === 0 ? (
          <div className="text-center text-zinc-500 mt-20">No saved games.</div>
        ) : (
          games.map((game) => (
            <div key={game.id} className="glass-strong rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{game.name}</h3>
                  <div className="text-xs text-zinc-400 font-medium mt-1">
                    {format(game.createdAt, 'MMM d, yyyy • h:mm a')}
                  </div>
                </div>
                {game.isActive && (
                  <span className="px-2.5 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full border border-primary/30">
                    Active
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300" onClick={() => handleExport(game.id, 'json')}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-300" onClick={() => handleDelete(game.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs font-medium text-zinc-500">
                  {game.playerCount} Players
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <NewGameSheet open={showNew} onOpenChange={setShowNew} onStartGame={handleStartGame} />
      <Navigation />
    </div>
  );
}
