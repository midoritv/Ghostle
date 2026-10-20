import { useState, useEffect } from 'react';

const GHOST_ARTIST_ID = 8506054;

// In dev, use Vite proxy (/deezer → api.deezer.com) to bypass CORS.
// In production build served from a real domain, you'd need a backend proxy.
// For local use, dev proxy is sufficient.
const DEEZER_BASE = '/deezer';

// In-memory cache: title → { url, fetchedAt }
const cache = new Map();
const CACHE_TTL_MS = 12 * 60 * 1000; // 12 min (tokens live ~15 min)

async function fetchFreshUrl(title) {
  const q = encodeURIComponent(`${title} Ghost`);
  const res = await fetch(`${DEEZER_BASE}/search?q=${q}&limit=20`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const tracks = data.data ?? [];

  const ghostTracks = tracks.filter(t => t.artist?.id === GHOST_ARTIST_ID);
  const pool = ghostTracks.length > 0 ? ghostTracks : tracks;
  const titleNorm = title.toLowerCase();

  const best =
    pool.find(t => t.title.toLowerCase() === titleNorm && t.preview && !t.title.toLowerCase().includes('live')) ??
    pool.find(t => t.title.toLowerCase() === titleNorm && t.preview) ??
    pool.find(t => t.preview && !t.title.toLowerCase().includes('live')) ??
    pool.find(t => t.preview);

  return best?.preview ?? null;
}

/**
 * Returns a fresh Deezer preview URL via Vite proxy (CORS-free).
 * Falls back to the static preview_url from songs.json if fetch fails.
 *
 * @param {string} songTitle
 * @param {string|null} staticFallback - preview_url from songs.json
 */
export function useFreshPreview(songTitle, staticFallback = null) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songTitle) return;
    let cancelled = false;
    let refreshTimer = null;

    async function load() {
      // Check memory cache first
      const cached = cache.get(songTitle);
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        if (!cancelled) { setPreviewUrl(cached.url); setLoading(false); }
        return;
      }

      try {
        const url = await fetchFreshUrl(songTitle);
        if (!cancelled) {
          cache.set(songTitle, { url, fetchedAt: Date.now() });
          setPreviewUrl(url);
          setLoading(false);
          // Schedule refresh before token expires
          refreshTimer = setTimeout(load, CACHE_TTL_MS);
        }
      } catch {
        // Proxy failed (e.g. production without backend) — use static fallback
        if (!cancelled) {
          setPreviewUrl(staticFallback);
          setLoading(false);
        }
      }
    }

    setLoading(true);
    load();

    return () => {
      cancelled = true;
      clearTimeout(refreshTimer);
    };
  }, [songTitle, staticFallback]);

  return { previewUrl, loading };
}
