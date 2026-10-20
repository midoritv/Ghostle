import seedrandom from 'seedrandom';
import songs from '../data/songs.json';

/**
 * Returns today's date string in YYYY-MM-DD format (local time).
 */
export function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Picks 3 distinct songs for the given date key using a seeded RNG.
 * Only songs with missing:false are eligible.
 */
export function getDailySongs(dateKey = getTodayKey()) {
  const pool = songs.filter((s) => !s.missing);
  const rng = seedrandom(dateKey);

  // Fisher-Yates shuffle with seeded RNG
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 3);
}

/**
 * Returns all available songs (not missing) for the search combobox.
 */
export function getAvailableSongs() {
  return songs.filter((s) => !s.missing);
}
