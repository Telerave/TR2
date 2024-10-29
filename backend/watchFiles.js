const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rootDir = path.resolve(__dirname, '..');
const audioPath = path.join(rootDir, 'uploads', 'audio');
const imagesPath = path.join(rootDir, 'uploads', 'images');

async function addFile(filepath) {
  const filename = path.basename(filepath);
  const isAudio = filepath.includes('/audio/');
  
  if (filename.startsWith('.')) return;
  
  try {
    if (isAudio && filename.endsWith('.mp3')) {
      await prisma.track.create({
        data: { filename }
      });
      console.log(`Added track: ${filename}`);
    } else if (!isAudio && filename.endsWith('.webp')) {
      await prisma.image.create({
        data: { filename }
      });
      console.log(`Added image: ${filename}`);
    }
  } catch (error) {
    if (!error.code === 'P2002') {
      console.error(`Error with ${filename}:`, error);
    }
  }
}

async function scanExisting() {
  console.log('Scanning existing files...');
  
  const audioFiles = await fs.readdir(audioPath);
  const imageFiles = await fs.readdir(imagesPath);
  
  console.log('Found files:', { audioFiles, imageFiles });

  await prisma.track.deleteMany({});
  await prisma.image.deleteMany({});
  
  for (const file of audioFiles) {
    if (!file.startsWith('.') && file.endsWith('.mp3')) {
      await addFile(path.join(audioPath, file));
    }
  }
  
  for (const file of imageFiles) {
    if (!file.startsWith('.') && file.endsWith('.webp')) {
      await addFile(path.join(imagesPath, file));
    }
  }
}

scanExisting().then(() => {
  console.log('Watching for new files...');
  
  chokidar.watch([audioPath, imagesPath], {
    ignored: /(^|[\/\\])\../,
    persistent: true
  }).on('add', filepath => addFile(filepath));
});