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
app.use('/images', express.static(path.join(__dirname, '..', 'uploads', 'images')));
app.use('/audio', express.static(path.join(__dirname, '..', 'uploads', 'audio')));

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

  try {
    const randomIndex = Math.floor(Math.random() * unplayed.length);
    const nextTrackId = unplayed[randomIndex];
    
    const track = await prisma.track.findUnique({
      where: { id: nextTrackId }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Получаем случайное изображение только если его еще нет для этого трека
    let imageFilename;
    const existingTrack = session.played.find(item => item.trackId === track.id);
    if (existingTrack) {
      imageFilename = existingTrack.imageFilename;
    } else {
      imageFilename = await getRandomImage();
    }
    
    // Сохраняем в истории
    session.played.push({
      trackId: track.id,
      imageFilename
    });
    session.currentIndex++;

    res.json({
      id: track.id,
      title: path.basename(track.filename, '.mp3'),
      artist: 'Unknown Artist',
      audioFile: `/audio/${track.filename}`,
      imageFile: `/images/${imageFilename}`
    });

  } catch (error) {
    console.error('Error getting next track:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const MAX_HISTORY = 10;  // Ограничение истории

app.get('/api/track/:sessionId/prev', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  if (session.currentIndex <= 0) {
    return res.status(404).json({ error: 'No previous tracks' });
  }

  // Очистка старой истории
  if (session.played.length > MAX_HISTORY) {
    session.played = session.played.slice(-MAX_HISTORY);
    session.currentIndex = Math.min(session.currentIndex, MAX_HISTORY - 1);
  }

  try {
    session.currentIndex--;
    const prevItem = session.played[session.currentIndex];
    
    const track = await prisma.track.findUnique({
      where: { id: prevItem.trackId }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    res.json({
      id: track.id,
      title: path.basename(track.filename, '.mp3'),
      artist: 'Unknown Artist',
      audioFile: `/audio/${track.filename}`,
      imageFile: `/images/${prevItem.imageFilename}`
    });

  } catch (error) {
    console.error('Error getting previous track:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Оптимизация: Мемоизация форматирования трека
const trackFormatCache = new Map();
function formatTrack(track) {
  const cacheKey = track.id;
  if (!trackFormatCache.has(cacheKey)) {
    trackFormatCache.set(cacheKey, {
      id: track.id,
      title: path.basename(track.filename, '.mp3'),
      audioFile: `/audio/${track.filename}`,
      imageFile: `/images/${path.basename(track.filename, '.mp3')}.webp`
    });
  }
  return trackFormatCache.get(cacheKey);
}

const getRandomImage = async () => {
  try {
    const images = await prisma.image.findMany();
    if (images.length === 0) {
      console.error('No images in database');
      return null;
    }
    const randomImage = images[Math.floor(Math.random() * images.length)];
    console.log('Selected image filename:', randomImage.filename);
    return randomImage.filename;
  } catch (error) {
    console.error('Error getting random image:', error);
    return null;
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));