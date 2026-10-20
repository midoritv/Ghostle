import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameState } from './hooks/useGameState';
import SongCard from './components/SongCard';
import ResultsScreen from './components/ResultsScreen';
import GhostleLogo from './components/GhostleLogo';
import './index.css';

function GhostDivider() {
  return (
    <div className="flex items-center gap-3 w-full max-w-sm opacity-20">
      <div className="flex-1 h-px bg-[#7b6ee0]" />
      <span className="text-[#7b6ee0] text-xs">✦</span>
      <div className="flex-1 h-px bg-[#7b6ee0]" />
    </div>
  );
}

function SongStepper({ total, displayIndex, songStates }) {
  return (
    <div className="flex gap-3 items-center justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const ss = songStates[i];
        const isCurrent = i === displayIndex;
        return (
          <motion.div
            key={i}
            animate={{ scale: isCurrent ? 1.25 : 1 }}
            className={[
              'w-3 h-3 rounded-full border transition-colors duration-300',
              ss?.solved  ? 'bg-emerald-600 border-emerald-500' :
              ss?.failed  ? 'bg-red-900 border-red-700' :
              isCurrent   ? 'bg-[#7b6ee0] border-[#7b6ee0]' :
                            'bg-neutral-800 border-neutral-700',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

export default function App() {
  // ALL hooks unconditionally at the top — never inside conditions
  const { state, submitGuess } = useGameState();

  const [displayIndex, setDisplayIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // On first load: if today's game is already finished, jump to results
  useEffect(() => {
    if (state.finished) {
      setShowResults(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived values — computed from state, not stored in state
  const song      = state.songs?.[displayIndex];
  const songState = state.songStates?.[displayIndex];
  const isLast    = displayIndex === (state.songs?.length ?? 1) - 1;

  const handleSubmit = (guess) => {
    if (!songState || songState.solved || songState.failed) return;
    submitGuess(guess, displayIndex);
  };

  const handleNext = () => {
    if (isLast) {
      setShowResults(true);
    } else {
      setDisplayIndex(i => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="w-full border-b border-neutral-800/50 sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center relative">
          <GhostleLogo />
          {!showResults && (
            <div className="absolute right-4">
              <SongStepper
                total={3}
                displayIndex={displayIndex}
                songStates={state.songStates ?? []}
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 gap-6">
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              <ResultsScreen
                songStates={state.songStates}
                songs={state.songs}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`song-${displayIndex}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-sm"
            >
              {song && songState && (
                <SongCard
                  song={song}
                  songState={songState}
                  attemptIndex={songState.attempts.length}
                  onSubmit={handleSubmit}
                  onNext={handleNext}
                  songNumber={displayIndex + 1}
                  isLast={isLast}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!showResults && <GhostDivider />}

        {!showResults && (
          <details className="w-full max-w-sm">
            <summary className="cursor-pointer text-neutral-700 text-xs uppercase tracking-widest text-center select-none hover:text-neutral-500 transition-colors">
              Jak grać?
            </summary>
            <div className="mt-3 text-neutral-600 text-xs leading-relaxed space-y-1 px-2">
              <p>👻 Odgadnij 3 piosenki Ghost dziennie.</p>
              <p>▶ Naciśnij Play aby usłyszeć krótki fragment.</p>
              <p>🔍 Wpisz tytuł i wybierz z listy podpowiedzi.</p>
              <p>⬛ Pomiń próbę, by odblokować dłuższy fragment.</p>
              <p>🟩 Zielony = trafione, 🟥 Czerwony = pudło.</p>
              <p>📋 Po zakończeniu skopiuj wynik i podziel się!</p>
            </div>
          </details>
        )}
      </main>

      <footer className="w-full border-t border-neutral-800/30 py-3 text-center">
        <p className="text-neutral-800 text-xs tracking-wider">
          GHOSTLE — Fan project · Ghost™ należy do Ghost B.C.
        </p>
      </footer>
    </div>
  );
}
