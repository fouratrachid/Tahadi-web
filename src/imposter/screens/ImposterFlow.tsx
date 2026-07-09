import type { Nav } from '@/App';
import { useImposterStore } from '@/imposter/store/imposterStore';
import { ImposterHomeScreen } from '@/imposter/screens/ImposterHome';
import { ImposterSetupScreen } from '@/imposter/screens/ImposterSetup';
import { RevealScreen } from '@/imposter/screens/Reveal';
import { DiscussionScreen } from '@/imposter/screens/Discussion';
import { VotingScreen } from '@/imposter/screens/Voting';
import { CaughtScreen } from '@/imposter/screens/Caught';
import { ResultScreen } from '@/imposter/screens/Result';

/** Phase router for the Imposter module — mirrors GameFlow's role in the trivia game. */
export function ImposterFlow({ nav }: { nav: Nav }) {
  const phase = useImposterStore((s) => s.phase);

  if (phase === 'setup') return <ImposterSetupScreen />;
  if (phase === 'reveal') return <RevealScreen />;
  if (phase === 'discussion') return <DiscussionScreen />;
  if (phase === 'voting') return <VotingScreen />;
  if (phase === 'caught') return <CaughtScreen />;
  if (phase === 'result') return <ResultScreen nav={nav} />;
  return <ImposterHomeScreen nav={nav} />;
}
