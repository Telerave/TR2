const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Настройка CORS
const corsOptions = {
  origin: 'http://localhost:5173', // URL фронтенда
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Хранилище сессий
const sessions = new Map();

// Создание новой сессии
app.post('/api/session', async (req, res) => {
  try {
    const sessionId = Date.now().toString();
    const tracks = await prisma.track.findMany();
    
    sessions.set(sessionId, {
      tracks: tracks.map(t => t.id), // все доступные треки
      played: [], // история проигранных треков
      currentIndex: -1 // текущая позиция в истории
    });
    
    res.json({ sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение текущего трека
app.get('/api/track/:sessionId', async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (session.currentIndex === -1) {
      return res.status(404).json({ error: 'No track playing' });
    }

    const trackId = session.played[session.currentIndex];
    const track = await prisma.track.findUnique({ where: { id: trackId } });
    
    res.json(formatTrack(track));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение следующего трека
app.get('/api/track/:sessionId/next', async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Получаем непргранные треки
    const unplayed = session.tracks.filter(id => 
      !session.played.some(item => item.trackId === id)
    );
    
    if (unplayed.length === 0) {
      return res.status(404).json({ error: 'No more tracks available' });
    }
    
    // Выбираем случайный трек и изображение
    const randomIndex = Math.floor(Math.random() * unplayed.length);
    const nextTrackId = unplayed[randomIndex];
    
    const images = await prisma.image.findMany();
    const randomImageIndex = Math.floor(Math.random() * images.length);
    const randomImage = images[randomImageIndex];
    
    console.log('Next track - saving to history:', {
      trackId: nextTrackId,
      imageId: randomImage.id,
      imageFilename: randomImage.filename
    });
    
    session.played.push({
      trackId: nextTrackId,
      imageFilename: randomImage.filename
    });
    session.currentIndex++;
    
    const track = await prisma.track.findUnique({ where: { id: nextTrackId } });
    
    const formattedTrack = {
      id: track.id,
      title: path.basename(track.filename, '.mp3'),
      artist: 'Unknown Artist',
      audioFile: `/uploads/audio/${track.filename}`,
      imageFile: `/uploads/images/${randomImage.filename}`
    };

    console.log('Next track - sending:', formattedTrack);
    res.json(formattedTrack);
  } catch (error) {
    console.error('Error getting next track:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение предыдущего трека
app.get('/api/track/:sessionId/prev', async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (session.currentIndex <= 0) {
      return res.status(404).json({ error: 'No previous tracks' });
    }
    
    session.currentIndex--;
    const prevItem = session.played[session.currentIndex];
    
    const track = await prisma.track.findUnique({ where: { id: prevItem.trackId } });
    
    // Убедимся, что отправляем только имя файла, без полного пути
    const formattedTrack = {
      id: track.id,
      title: path.basename(track.filename, '.mp3'),
      artist: 'Unknown Artist',
      audioFile: `/uploads/audio/${track.filename}`,
      imageFile: `/uploads/images/${prevItem.imageFilename}`
    };

    console.log('Sending prev track:', formattedTrack);
    res.json(formattedTrack);
  } catch (error) {
    console.error('Error in getPrevTrack:', error);
    res.status(500).json({ error: error.message });
  }
});

// Вспомогательная функция форматирования трека
function formatTrack(track) {
  return {
    id: track.id,
    title: path.basename(track.filename, '.mp3'),
    audioFile: `/uploads/audio/${track.filename}`,
    imageFile: `/uploads/images/${path.basename(track.filename, '.mp3')}.webp`
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
