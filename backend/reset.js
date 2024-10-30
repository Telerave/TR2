const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  try {
    // Очищаем таблицу Image
    await prisma.image.deleteMany({});
    console.log('Таблица Image очищена');
    
    // Очищаем таблицу Track
    await prisma.track.deleteMany({});
    console.log('Таблица Track очищена');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Ошибка при очистке:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

reset(); 