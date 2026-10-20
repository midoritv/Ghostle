import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioPlayer from './AudioPlayer';
import AttemptTracker from './AttemptTracker';
import SongSearch from './SongSearch';
import SongReveal from './SongReveal';
import { useFreshPreview } from '../hooks/useFreshPreview';
import { ATTEMPT_DURATIONS, MAX_ATTEMPTS } from '../hooks/useGameState';

export default function SongCard({ song, songState, attemptIndex, onSubmit, onNext, songNumber, isLast }) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const isDone = songState.solved || songState.failed;
  const duration = ATTEMPT_DURATIONS[Math.min(attemptIndex, MAX_ATTEMPTS - 1)];

  // Fetch a fresh, non-expired preview URL via Vite proxy
  // Falls back to the static URL from songs.json if proxy unavailable
  const { previewUrl, loading: previewLoading } = useFreshPreview(song?.title, song?.preview_url ?? null);

  const handleSkip = useCallback(() => onSubmit(null), [onSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm"
    >
      {/* Song number badge */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-950 border border-[#7b6ee0] flex items-center justify-center text-[#7b6ee0] text-sm font-bold">
          {songNumber}
        </div>
        <span className="text-neutral-500 text-sm uppercase tracking-widest">
          Piosenka {songNumber} z 3
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            <AttemptTracker
              attempts={songState.attempts}
              solved={false}
              failed={false}
            />

            {/* Loading indicator while fetching fresh URL */}
            {previewLoading ? (
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <span className="animate-spin text-[#7b6ee0]">⟳</span>
                Ładowanie audio…
              </div>
            ) : (
              <AudioPlayer
                previewUrl={previewUrl}
                duration={duration}
                onEnd={() => setHasPlayed(true)}
                disabled={false}
              />
            )}

            <p className="text-neutral-600 text-xs uppercase tracking-widest">
              Fragment: {duration < 1 ? `${duration * 1000}ms` : `${duration}s`}
            </p>

            <SongSearch
              onSubmit={onSubmit}
              onSkip={handleSkip}
              disabled={false}
              mustPlayFirst={!hasPlayed && attemptIndex === 0}
            />
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SongReveal
              song={song}
              solved={songState.solved}
              attempts={songState.attempts}
              onNext={onNext}
              isLast={isLast}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
