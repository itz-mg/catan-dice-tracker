import { useEffect } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import TrackerPage from '@/pages/tracker';
import StatsPage from '@/pages/stats';
import GamesPage from '@/pages/games';
import SettingsPage from '@/pages/settings';
import NotFound from '@/pages/not-found';
import { InstallGate } from '@/components/InstallGate';

function Router() {
  return (
    <Switch>
      <Route path="/" component={TrackerPage} />
      <Route path="/stats" component={StatsPage} />
      <Route path="/games" component={GamesPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <InstallGate>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </InstallGate>
  );
}

export default App;
