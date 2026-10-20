import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Shown after a song is solved or failed.
 * Displays album cover, song title, win/lose animation, and a "Next" button.
 *
 * Props:
 *  song        - { title, album, album_cover }
 *  solved      - bool
 *  attempts    - array of attempt objects
 *  onNext      - called when user clicks the next button (null = last song, go to results)
 *  isLast      - bool, shows "Zobacz wyniki" instead of "Następna →"
 */
export default function SongReveal({ song, solved, attempts, onNext, isLast = false }) {
  const [particles, setParticles] = useState([]);

  // Spawn confetti particles on win
  useEffect(() => {
    if (!solved) return;
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 0.8 + Math.random() * 0.6,
        color: ['#7b6ee0', '#fff', '#8a0303', '#7b6ee0', '#e8d48b'][i % 5],
        size: 6 + Math.random() * 8,
      }))
    );
  }, [solved]);

  const guessCount = solved ? attempts.length : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-5 w-full max-w-sm relative"
    >
      {/* Win particles */}
      <AnimatePresence>
        {solved && particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, x: `${p.x}%`, scale: 1 }}
            animate={{ opacity: 0, y: -120, scale: 0.4 }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            className="absolute top-0 pointer-events-none rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color, left: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={[
          'w-full py-2 rounded-lg text-center text-sm font-semibold tracking-widest uppercase',
          solved
            ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
            : 'bg-red-950/60 text-red-400 border border-red-800',
        ].join(' ')}
      >
        {solved
          ? guessCount === 1 ? '🎉 Pierwsza próba!' : `✓ Odgadnięto za ${guessCount}. razem`
          : '✗ Nie udało się tym razem'}
      </motion.div>

      {/* Album cover */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotateY: 90 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ delay: 0.15, duration: 0.55, type: 'spring' }}
        className="relative"
      >
        {song.album_cover ? (
          <img
            src={song.album_cover}
            alt={`${song.album} okładka`}
            className={[
              'w-48 h-48 rounded-xl object-cover shadow-2xl',
              solved
                ? 'ring-2 ring-[#7b6ee0] shadow-[0_0_30px_rgba(123,110,224,0.4)]'
                : 'ring-2 ring-red-800 shadow-[0_0_20px_rgba(138,3,3,0.5)] grayscale brightness-75',
            ].join(' ')}
          />
        ) : (
          <div className="w-48 h-48 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-600 text-4xl">
            🎵
          </div>
        )}

        {/* Overlay icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 300 }}
          className={[
            'absolute -bottom-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg',
            solved ? 'bg-emerald-600' : 'bg-red-900 border border-red-700',
          ].join(' ')}
        >
          {solved ? '✓' : '✗'}
        </motion.div>
      </motion.div>

      {/* Song info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p
          className="text-white text-xl font-bold tracking-wide"
          style={{ fontFamily: '"Cinzel", Georgia, serif' }}
        >
          {song.title}
        </p>
        <p className="text-neutral-400 text-sm mt-1">{song.album}</p>
      </motion.div>

      {/* Next button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="mt-1 w-full py-3 rounded-lg font-semibold text-sm uppercase tracking-widest border-2 border-[#7b6ee0] text-[#7b6ee0] hover:bg-[#7b6ee0] hover:text-neutral-950 transition-all duration-200 cursor-pointer"
      >
        {isLast ? 'Zobacz wyniki →' : 'Następna piosenka →'}
      </motion.button>
    </motion.div>
  );
}
