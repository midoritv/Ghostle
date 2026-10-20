/**
 * fetch-previews.mjs
 * Uzupełnia src/data/songs.json o pole preview_url z Deezer API.
 * Nie wymaga żadnego klucza ani konta.
 * Uruchom: node scripts/fetch-previews.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SONGS_PATH = path.join(__dirname, '../src/data/songs.json');

// Ghost's Deezer artist ID — narrows search results
const GHOST_ARTIST_ID = 8506054;

async function searchDeezer(title, album) {
  const q = encodeURIComponent(`${title} Ghost`);
  const url = `https://api.deezer.com/search?q=${q}&limit=20`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Deezer HTTP ${res.status}`);
  const data = await res.json();
  const tracks = data.data ?? [];

  // Filter to Ghost artist only
  const ghostTracks = tracks.filter((t) => t.artist?.id === GHOST_ARTIST_ID);
  const pool = ghostTracks.length > 0 ? ghostTracks : tracks;

  if (pool.length === 0) return null;

  const albumNorm = album.toLowerCase();
  const titleNorm = title.toLowerCase();

  // Priority 1: exact title + matching album + has preview
  const perfect = pool.find(
    (t) =>
      t.title.toLowerCase() === titleNorm &&
      t.album?.title.toLowerCase().includes(albumNorm.split(' ')[0]) &&
      t.preview
  );
  if (perfect) return perfect.preview;

  // Priority 2: exact title + has preview
  const exactTitle = pool.find(
    (t) => t.title.toLowerCase() === titleNorm && t.preview
  );
  if (exactTitle) return exactTitle.preview;

  // Priority 3: any match with preview (studio version preferred over live)
  const studio = pool.find(
    (t) => t.preview && !t.title.toLowerCase().includes('live')
  );
  if (studio) return studio.preview;

  // Priority 4: any with preview
  const anyPreview = pool.find((t) => t.preview);
  return anyPreview?.preview ?? null;
}

async function main() {
  console.log('🎵 Ghostle — pobieranie Deezer preview URLs\n');

  const raw = await fs.readFile(SONGS_PATH, 'utf-8');
  const songs = JSON.parse(raw);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const song of songs) {
    if (song.missing) {
      skipped++;
      continue;
    }

    if (song.preview_url && song.preview_url.startsWith('https://')) {
      console.log(`  ↷ Już ma URL: "${song.title}"`);
      skipped++;
      continue;
    }

    process.stdout.write(`  Szukam: "${song.title}"… `);

    try {
      const preview = await searchDeezer(song.title, song.album);

      if (preview) {
        song.preview_url = preview;
        updated++;
        console.log('✓');
      } else {
        song.preview_url = null;
        failed++;
        console.log('✗ brak preview');
      }
    } catch (err) {
      song.preview_url = null;
      failed++;
      console.log(`✗ błąd: ${err.message}`);
    }

    // Deezer rate limit: ~50 req/s, 200ms gap is safe
    await new Promise((r) => setTimeout(r, 220));
  }

  await fs.writeFile(SONGS_PATH, JSON.stringify(songs, null, 2), 'utf-8');

  console.log(`\n✅ Gotowe!`);
  console.log(`   Zaktualizowano: ${updated}`);
  console.log(`   Pominięto:      ${skipped}`);
  console.log(`   Brak preview:   ${failed}`);

  if (failed > 0) {
    console.log('\nPiosenki bez preview:');
    songs
      .filter((s) => !s.missing && !s.preview_url)
      .forEach((s) => console.log(`  - ${s.title} (${s.album})`));
  }
}

main().catch((err) => {
  console.error('\n❌ Błąd:', err.message);
  process.exit(1);
});
