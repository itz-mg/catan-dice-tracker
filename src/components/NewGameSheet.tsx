import React, { useState } from 'react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewGameSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartGame: (name: string, playerCount: number, players: string[]) => void;
}

export function NewGameSheet({ open, onOpenChange, onStartGame }: NewGameSheetProps) {
  const [name, setName] = useState(`Game ${new Date().toLocaleDateString()}`);
  const [playerCount, setPlayerCount] = useState(3);
  const [players, setPlayers] = useState<string[]>(['', '', '', '', '', '']);

  const handleStart = () => {
    onStartGame(
      name.trim() || 'Catan Game',
      playerCount,
      players.slice(0, playerCount).map((p, i) => p.trim() || `Player ${i + 1}`)
    );
    onOpenChange(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-zinc-950 flex flex-col rounded-t-[2rem] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 outline-none">
          <div className="p-4 bg-zinc-900/50 rounded-t-[2rem] flex-1 overflow-y-auto safe-bottom">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />
            <div className="max-w-md mx-auto px-4">
              <Drawer.Title className="text-2xl font-bold mb-6 text-white tracking-tight">New Game</Drawer.Title>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Game Name</label>
                  <Input 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-black/50 border-white/10 text-white h-12 text-lg rounded-xl focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Number of Players</label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setPlayerCount(num)}
                        className={`flex-1 h-12 rounded-xl text-lg font-medium transition-all ${
                          playerCount === num 
                            ? 'bg-primary text-primary-foreground scale-[0.98]' 
                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-sm font-medium text-zinc-400">Player Names (Optional)</label>
                  {Array.from({ length: playerCount }).map((_, i) => (
                    <Input
                      key={i}
                      placeholder={`Player ${i + 1}`}
                      value={players[i]}
                      onChange={e => {
                        const newPlayers = [...players];
                        newPlayers[i] = e.target.value;
                        setPlayers(newPlayers);
                      }}
                      className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary"
                    />
                  ))}
                </div>

                <div className="pt-6 pb-12">
                  <Button 
                    onClick={handleStart}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
