import { motion } from 'framer-motion';
import { ATTEMPT_DURATIONS, MAX_ATTEMPTS } from '../hooks/useGameState';

/**
 * Displays a row of attempt blocks showing:
 * - empty (future attempts)
 * - skipped (grey)
 * - wrong (red)
 * - correct (green)
 * Also shows the duration that will unlock after each attempt.
 */
export default function AttemptTracker({ attempts = [], solved = false, failed = false }) {
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-sm">
      <div className="flex gap-2 justify-center">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
          const attempt = attempts[i];
          const isFuture = !attempt;
          const isSkipped = attempt?.skipped;
          const isCorrect = attempt?.correct;
          const isWrong = attempt && !attempt.skipped && !attempt.correct;

          let bg = 'bg-neutral-800 border-neutral-700';
          let icon = null;

          if (isCorrect) {
            bg = 'bg-emerald-700 border-emerald-500';
            icon = '✓';
          } else if (isWrong) {
            bg = 'bg-red-900 border-red-700';
            icon = '✗';
          } else if (isSkipped) {
            bg = 'bg-neutral-700 border-neutral-500';
            icon = '→';
          }

          return (
            <motion.div
              key={i}
              initial={false}
              animate={attempt ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`
                relative flex items-center justify-center
                w-12 h-12 rounded border-2 text-sm font-bold
                ${bg}
              `}
              title={attempt?.guess ?? (isFuture ? `${ATTEMPT_DURATIONS[i]}s` : 'Pominięto')}
            >
              {icon && (
                <span className={isCorrect ? 'text-emerald-300' : isWrong ? 'text-red-300' : 'text-neutral-300'}>
                  {icon}
                </span>
              )}
              {isFuture && (
                <span className="text-neutral-500 text-xs">{ATTEMPT_DURATIONS[i]}s</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Attempt label */}
      <p className="text-neutral-500 text-xs tracking-wider uppercase">
        {solved
          ? 'Odgadnięto!'
          : failed
          ? 'Nie udało się'
          : `Próba ${attempts.length + 1} / ${MAX_ATTEMPTS}`}
      </p>
    </div>
  );
}
