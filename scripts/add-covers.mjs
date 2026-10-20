/**
 * add-covers.mjs
 * Dodaje pole album_cover do każdej piosenki w songs.json na podstawie Deezer API.
 * Uruchom: node scripts/add-covers.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SONGS_PATH = path.join(__dirname, '../src/data/songs.json');

// Okładki pobrane z Deezer (statyczne — wystarczy uruchomić raz)
const ALBUM_COVERS = {
  'Opus Eponymous': 'https://cdn-images.dzcdn.net/images/cover/88759caa2db95bdbcbd9aeb1c853b463/500x500-000000-80-0-0.jpg',
  'Infestissumam':  'https://cdn-images.dzcdn.net/images/cover/6a1b7487da18ddc3f1a5f5d040a989ca/500x500-000000-80-0-0.jpg',
  'Meliora':        'https://cdn-images.dzcdn.net/images/cover/ce0f59f9c7d5b114260f3af50af5dcb9/500x500-000000-80-0-0.jpg',
  'Prequelle':      'https://cdn-images.dzcdn.net/images/cover/43a420aa0b32cf1b3ef20e29dfce0c12/500x500-000000-80-0-0.jpg',
  'Impera':         'https://cdn-images.dzcdn.net/images/cover/bc48dc99554a44aaf15600627a11d23a/500x500-000000-80-0-0.jpg',
};

const raw = await fs.readFile(SONGS_PATH, 'utf-8');
const songs = JSON.parse(raw);

for (const song of songs) {
  song.album_cover = ALBUM_COVERS[song.album] ?? null;
}

await fs.writeFile(SONGS_PATH, JSON.stringify(songs, null, 2), 'utf-8');
console.log('✅ Dodano album_cover do wszystkich piosenek.');
