import { useEffect, useState } from 'react';

import { initSound } from '@/lib/soundManager';
import { ImposterFlow } from '@/imposter/screens/ImposterFlow';
import { GameFlow } from '@/screens/GameFlow';
import { HistoryScreen } from '@/screens/History';
import { HomeScreen } from '@/screens/Home';
import { PacksScreen } from '@/screens/Packs';
import { SettingsScreen } from '@/screens/Settings';
import { SetupScreen } from '@/screens/Setup';

export type Screen = 'home' | 'setup' | 'game' | 'packs' | 'history' | 'settings' | 'imposter';

export interface Nav {
  go: (screen: Screen) => void;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  useEffect(() => {
    initSound();
  }, []);

  const nav: Nav = { go: setScreen };

  return (
    <div className="min-h-dvh">
      {screen === 'home' && <HomeScreen nav={nav} />}
      {screen === 'setup' && <SetupScreen nav={nav} />}
      {screen === 'game' && <GameFlow nav={nav} />}
      {screen === 'packs' && <PacksScreen nav={nav} />}
      {screen === 'history' && <HistoryScreen nav={nav} />}
      {screen === 'settings' && <SettingsScreen nav={nav} />}
      {screen === 'imposter' && <ImposterFlow nav={nav} />}
    </div>
  );
}
