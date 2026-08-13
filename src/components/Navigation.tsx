import { Link, useLocation } from 'wouter';
import { Dices, BarChart2, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation({ hidden }: { hidden?: boolean }) {
  const [location] = useLocation();

  if (hidden) return null;

  const tabs = [
    { href: '/', icon: Dices, label: 'Tracker' },
    { href: '/stats', icon: BarChart2, label: 'Stats' },
    { href: '/games', icon: History, label: 'Games' },
    { href: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom bg-black/80 backdrop-blur-xl border-t border-white/10">
      <div className="flex justify-around items-center h-[68px] px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location === tab.href;
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center justify-center gap-1 h-full">
              <Icon 
                size={24} 
                className={cn("transition-colors duration-200", isActive ? "text-primary" : "text-zinc-500")}
              />
              <span className={cn("text-[10px] font-medium transition-colors duration-200", isActive ? "text-primary" : "text-zinc-500")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
