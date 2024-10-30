const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Создаем пользователя
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password123', // В реальном приложении пароль должен быть захеширован
      name: 'Test User',
    },
  });

  // Создаем треки
  const tracks = [
    {
      title: 'Трек 1',
      artist: 'Исполнитель 1',
      duration: 180,
      audioFile: 'uploads/audio/track1.mp3',
      imageFile: 'uploads/images/55telerave igor 4.21.webp',
      // Оставляем характеристики пустыми или null
      tempo: null,
      chromaMean: null,
      spectralCentroidMean: null,
    },
    {
      title: 'Трек 2',
      artist: 'Исполнитель 2',
      duration: 240,
      audioFile: 'uploads/audio/track2.mp3',
      imageFile: 'uploads/images/59telerave igor 4.21.webp',
      tempo: null,
      chromaMean: null,
      spectralCentroidMean: null,
    },
    {
      title: 'Трек 3',
      artist: 'Исполнитель 3',
      duration: 200,
      audioFile: 'uploads/audio/track3.mp3',
      imageFile: 'uploads/images/76telerave igor 4.21.webp',
      tempo: null,
      chromaMean: null,
      spectralCentroidMean: null,
    }
  ];

  for (const trackData of tracks) {
    await prisma.track.create({
      data: {
        ...trackData,
        userId: user.id,
      },
    });
  }

  console.log('Seed data added successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });