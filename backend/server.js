const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const sessions = new Map();

// Оптимизация: Кэширование результатов запроса к БД
const tracksCache = new Map();
async function getTracksFromCache() {
  if (!tracksCache.has('tracks')) {
    const tracks = await prisma.track.findMany();
    tracksCache.set('tracks', tracks);
  }
  return tracksCache.get('tracks');
}

app.post('/api/session', async (req, res) => {
  try {
    const sessionId = Date.now().toString();
    const tracks = await getTracksFromCache();
    sessions.set(sessionId, {
      tracks: tracks.map(t => t.id),
      played: [],
      currentIndex: -1
    });
    res.json({ sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/track/:sessionId', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.currentIndex === -1) return res.status(404).json({ error: 'No track playing' });

  const trackId = session.played[session.currentIndex].trackId;
  const track = await prisma.track.findUnique({ where: { id: trackId } });
  res.json(formatTrack(track));
});

app.get('/api/track/:sessionId/next', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const unplayed = session.tracks.filter(id => !session.played.some(item => item.trackId === id));
  if (unplayed.length === 0) return res.status(404).json({ error: 'No more tracks available' });

  const randomIndex = Math.floor(Math.random() * unplayed.length);
  const nextTrackId = unplayed[randomIndex];
  const randomImage = await prisma.image.findUnique({ where: { trackId: nextTrackId } });

  session.played.push({ trackId: nextTrackId, imageFilename: randomImage.filename });
  session.currentIndex++;

  const track = await prisma.track.findUnique({ where: { id: nextTrackId } });
  res.json({
    id: track.id,
    title: path.basename(track.filename, '.mp3'),
    artist: 'Unknown Artist',
    audioFile: `/uploads/audio/${track.filename}`,
    imageFile: `/uploads/images/${randomImage.filename}`
  });
});

app.get('/api/track/:sessionId/prev', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.currentIndex <= 0) return res.status(404).json({ error: 'No previous tracks' });

  session.currentIndex--;
  const prevItem = session.played[session.currentIndex];
  const track = await prisma.track.findUnique({ where: { id: prevItem.trackId } });

  res.json({
    id: track.id,
    title: path.basename(track.filename, '.mp3'),
    artist: 'Unknown Artist',
    audioFile: `/uploads/audio/${track.filename}`,
    imageFile: `/uploads/images/${prevItem.imageFilename}`
  });
});

// Оптимизация: Мемоизация форматирования трека
const trackFormatCache = new Map();
function formatTrack(track) {
  const cacheKey = track.id;
  if (!trackFormatCache.has(cacheKey)) {
    trackFormatCache.set(cacheKey, {
      id: track.id,
      title: path.basename(track.filename, '.mp3'),
      audioFile: `/uploads/audio/${track.filename}`,
      imageFile: `/uploads/images/${path.basename(track.filename, '.mp3')}.webp`
    });
  }
  return trackFormatCache.get(cacheKey);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));