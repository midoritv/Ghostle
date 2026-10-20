import { useState, useEffect, useCallback } from 'react';
import { getTodayKey, getDailySongs } from '../utils/dailySongs';

export const ATTEMPT_DURATIONS = [0.2, 1, 3, 5, 8];
export const MAX_ATTEMPTS = ATTEMPT_DURATIONS.length; // 5

const STORAGE_KEY = 'ghostle_state_v3';

function buildFreshState(dateKey, dailySongs) {
  return {
    dateKey,
    songs: dailySongs,
    songStates: dailySongs.map(() => ({
      attempts: [],
      solved: false,
      failed: false,
    })),
    finished: false,
  };
}

function loadState(todayKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.dateKey !== todayKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    // Never persist full song objects (they have expiring preview URLs)
    const { songs, ...rest } = state; // eslint-disable-line no-unused-vars
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch { /* quota */ }
}

export function useGameState() {
  const todayKey = getTodayKey();
  const dailySongs = getDailySongs(todayKey);

  const [state, setState] = useState(() => {
    const saved = loadState(todayKey);
    if (saved) {
      return { ...saved, songs: dailySongs };
    }
    return buildFreshState(todayKey, dailySongs);
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const submitGuess = useCallback((guess, songIndex) => {
    setState((prev) => {
      const song      = prev.songs[songIndex];
      const songState = prev.songStates[songIndex];

      if (!song || !songState) return prev;
      if (songState.solved || songState.failed) return prev;

      const skipped = guess === null;
      const correct = !skipped && guess.trim().toLowerCase() === song.title.toLowerCase();

      const newAttempts = [
        ...songState.attempts,
        { guess: guess ?? null, skipped, correct },
      ];
      const solved = correct;
      const failed = !correct && newAttempts.length >= MAX_ATTEMPTS;

      const newSongStates = prev.songStates.map((ss, i) =>
        i === songIndex ? { ...ss, attempts: newAttempts, solved, failed } : ss
      );

      const allDone = newSongStates.every((ss) => ss.solved || ss.failed);

      return {
        ...prev,
        songStates: newSongStates,
        finished: allDone,
      };
    });
  }, []);

  return { state, submitGuess };
}
