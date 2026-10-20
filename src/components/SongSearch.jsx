import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAvailableSongs } from '../utils/dailySongs';

const availableSongs = getAvailableSongs();

/**
 * Search combobox with autocomplete dropdown.
 *
 * Props:
 *  onSubmit(title: string) - called when user picks a song
 *  onSkip()               - called when user clicks Skip
 *  disabled               - disable input and buttons
 *  mustPlayFirst          - show hint but don't block (just guide user)
 */
export default function SongSearch({ onSubmit, onSkip, disabled = false, mustPlayFirst = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim().length > 0
    ? availableSongs.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = useCallback((title) => {
    setQuery(title);
    setOpen(false);
    setHighlighted(-1);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) {
      if (e.key === 'Enter') handleSubmit();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0) {
        handleSelect(filtered[highlighted].title);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const el = listRef.current.children[highlighted];
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted]);

  return (
    <div className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlighted(-1);
            }}
            onFocus={() => query.trim() && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Wpisz tytuł piosenki…"
            className={[
              'w-full px-4 py-3 rounded-lg bg-neutral-900 border text-white',
              'placeholder-neutral-600 text-sm focus:outline-none',
              'transition-all duration-200',
              disabled
                ? 'border-neutral-800 cursor-not-allowed opacity-50'
                : 'border-neutral-700 focus:border-[#7b6ee0] focus:shadow-[0_0_10px_rgba(123,110,224,0.2)]',
            ].join(' ')}
            autoComplete="off"
            aria-label="Wyszukaj piosenkę"
          />

          <AnimatePresence>
            {open && filtered.length > 0 && (
              <motion.ul
                ref={listRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-1 rounded-lg overflow-y-auto max-h-52 bg-neutral-900 border border-neutral-700 shadow-xl shadow-black/60"
                role="listbox"
              >
                {filtered.map((song, i) => (
                  <li
                    key={song.title}
                    onMouseDown={() => handleSelect(song.title)}
                    className={[
                      'px-4 py-2.5 cursor-pointer text-sm transition-colors duration-100',
                      i === highlighted
                        ? 'bg-red-950 text-[#7b6ee0]'
                        : 'text-neutral-300 hover:bg-neutral-800',
                    ].join(' ')}
                    role="option"
                    aria-selected={i === highlighted}
                  >
                    <span className="font-medium">{song.title}</span>
                    <span className="ml-2 text-neutral-500 text-xs">{song.album}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className={[
            'px-4 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider',
            'transition-all duration-200',
            disabled || !query.trim()
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              : 'bg-[#7b6ee0] text-neutral-950 hover:brightness-110 cursor-pointer',
          ].join(' ')}
        >
          OK
        </button>
      </form>

      <button
        type="button"
        onClick={onSkip}
        disabled={disabled}
        className={[
          'mt-2 w-full py-2 rounded-lg text-sm tracking-wider uppercase',
          'transition-all duration-200 border',
          disabled
            ? 'border-neutral-800 text-neutral-700 cursor-not-allowed'
            : 'border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 cursor-pointer',
        ].join(' ')}
      >
        Pomiń →
      </button>

      {mustPlayFirst && (
        <p className="text-center text-neutral-600 text-xs mt-2">
          ↑ Odtwórz fragment, aby usłyszeć piosenkę
        </p>
      )}
    </div>
  );
}
