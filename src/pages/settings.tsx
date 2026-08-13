import React from 'react';
import { Monitor, Trash2, Info, Moon } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useGame } from '@/hooks/useGame';
import { Navigation } from '@/components/Navigation';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { currentGame, resetCurrentGame } = useGame();
  const [, setLocation] = useLocation();

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      try {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        }
        localStorage.clear();
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background safe-top safe-pb-nav text-white">
      <div className="pt-4 px-4 pb-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
        
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 pl-2">Display</h2>
          <div className="glass-strong rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">StandBy Mode</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Landscape numpad and live roll distribution</div>
                </div>
              </div>
              <Switch 
                checked={settings.tableMode}
                aria-label="Toggle StandBy Mode"
                onCheckedChange={(checked) => {
                  if (checked && !currentGame) {
                    window.alert('Start a game before entering StandBy Mode.');
                    return;
                  }
                  updateSettings({ tableMode: checked });
                  if (checked) setLocation('/');
                }}
              />
            </div>
            <div className="h-[1px] w-full bg-white/5" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Keep Screen Awake</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Prevent display from sleeping while active</div>
                </div>
              </div>
              <Switch 
                checked={settings.wakeLock}
                onCheckedChange={(checked) => updateSettings({ wakeLock: checked })}
              />
            </div>
          </div>
        </div>

        {currentGame && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 pl-2">Current Game</h2>
            <div className="glass-strong rounded-2xl p-4">
              <div className="font-medium mb-1">{currentGame.name}</div>
              <div className="text-xs text-zinc-400 mb-4">{currentGame.playerCount} Players</div>
              
              <Button 
                variant="outline" 
                className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                onClick={resetCurrentGame}
              >
                Reset Rolls
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 pl-2">Data & App</h2>
          <div className="glass-strong rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Info className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="font-medium text-sm">App Version</div>
              </div>
              <div className="text-xs text-zinc-500 font-mono">1.0.0</div>
            </div>
            <div className="h-[1px] w-full bg-white/5" />
            <div className="p-4">
              <Button 
                variant="ghost" 
                className="w-full h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20"
                onClick={handleClearData}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-zinc-500 font-medium">
            {navigator.onLine ? 'Online' : 'Offline Mode Active'}
          </div>
        </div>

      </div>

      <Navigation />
    </div>
  );
}
