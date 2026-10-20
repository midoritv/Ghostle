import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MAX_ATTEMPTS } from '../hooks/useGameState';
import { getTodayKey } from '../utils/dailySongs';

const EMOJI_CORRECT = '🟩';
const EMOJI_WRONG = '🟥';
const EMOJI_SKIP = '⬛';

function buildShareText(songStates, songs) {
  const dateKey = getTodayKey();
  const solved = songStates.filter((s) => s.solved).length;
  const lines = songStates.map((ss, i) => {
    const blocks = Array.from({ length: MAX_ATTEMPTS }, (_, ai) => {
      const a = ss.attempts[ai];
      if (!a) return '⬜';
      if (a.skipped) return EMOJI_SKIP;
      if (a.correct) return EMOJI_CORRECT;
      return EMOJI_WRONG;
    }).join('');
    const guessCount = ss.solved ? ss.attempts.length : '✗';
    return `${i + 1}. ${songs[i].title} — ${guessCount}/${MAX_ATTEMPTS}\n   ${blocks}`;
  });
  return `👻 Ghostle ${dateKey} — ${solved}/3\n\n${lines.join('\n\n')}`;
}

export default function ResultsScreen({ songStates, songs }) {
  const [copied, setCopied] = useState(false);
  const shareText = buildShareText(songStates, songs);
  const solved = songStates.filter((s) => s.solved).length;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareText;
      el.style.cssText = 'position:fixed;top:-9999px';
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareText]);

  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight - now;
  const hh = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
  const mm = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="flex flex-col items-center gap-8 w-full max-w-md text-center"
    >
      {/* Header */}
      <div>
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-5xl mb-3"
        >
          👻
        </motion.div>
        <h2 className="text-3xl text-[#7b6ee0] font-bold tracking-widest"
          style={{ fontFamily: '"Cinzel", Georgia, serif' }}>
          Wynik dnia
        </h2>
        <p className="text-neutral-500 mt-1 text-sm">{getTodayKey()}</p>
      </div>

      {/* Score */}
      <div className="text-6xl font-bold text-white" style={{ fontFamily: '"Cinzel", Georgia, serif' }}>
        {solved}<span className="text-neutral-600">/3</span>
      </div>

      {/* Per-song breakdown */}
      <div className="flex flex-col gap-3 w-full">
        {songStates.map((ss, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className={[
              'flex items-center justify-between px-4 py-3 rounded-lg border',
              ss.solved
                ? 'border-emerald-800/60 bg-emerald-950/20'
                : 'border-neutral-800 bg-neutral-900/40',
            ].join(' ')}
          >
            <div className="text-left">
              <p className="text-white font-medium text-sm">{songs[i]?.title}</p>
              <p className="text-neutral-500 text-xs">{songs[i]?.album}</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_ATTEMPTS }, (_, ai) => {
                const a = ss.attempts[ai];
                if (!a) return <span key={ai} className="w-5 h-5 rounded bg-neutral-800 inline-block" title="Nieużyta" />;
                if (a.correct) return <span key={ai} className="w-5 h-5 rounded bg-emerald-600 inline-block" title="Trafione" />;
                if (a.skipped) return <span key={ai} className="w-5 h-5 rounded bg-neutral-600 inline-block" title="Pominięto" />;
                return <span key={ai} className="w-5 h-5 rounded bg-red-600 inline-block" title={a.guess ?? 'Błędna odpowiedź'} />;
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Share preview */}
      <pre className="text-xs text-neutral-500 bg-neutral-900/60 rounded-lg px-4 py-3 w-full text-left whitespace-pre-wrap font-mono border border-neutral-800">
        {shareText}
      </pre>

      {/* Copy button */}
      <motion.button
        onClick={handleCopy}
        whileTap={{ scale: 0.95 }}
        className={[
          'w-full py-3 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer',
          copied
            ? 'bg-emerald-700 text-emerald-100'
            : 'bg-[#7b6ee0] text-white hover:bg-[#6a5ed0]',
        ].join(' ')}
      >
        {copied ? '✓ Skopiowano!' : '📋 Skopiuj wynik'}
      </motion.button>

      <p className="text-neutral-700 text-xs uppercase tracking-wider">
        Następna zagadka za <span className="text-neutral-500">{hh}:{mm}</span>
      </p>
    </motion.div>
  );
}
