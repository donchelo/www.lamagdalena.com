import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const STORIES_DIR = 'public/assets/stories';
const MAX_WIDTH = 2000;
const JPEG_QUALITY = 80;

async function optimizeImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

    const tmpPath = filePath + '.tmp';
    
    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        let pipeline = image;
        if (metadata.width > MAX_WIDTH) {
            pipeline = pipeline.resize(MAX_WIDTH);
        }

        if (ext === '.png') {
            pipeline = pipeline.png({ quality: JPEG_QUALITY, palette: true });
        } else {
            pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true });
        }

        await pipeline.toFile(tmpPath);
        
        const originalSize = (await fs.stat(filePath)).size;
        const optimizedSize = (await fs.stat(tmpPath)).size;

        if (optimizedSize < originalSize) {
            await fs.rename(tmpPath, filePath);
            console.log(`Optimized: ${filePath} (${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(optimizedSize / 1024 / 1024).toFixed(2)}MB)`);
        } else {
            await fs.unlink(tmpPath);
            console.log(`Skipped (already optimized): ${filePath}`);
        }
    } catch (error) {
        console.error(`Error optimizing ${filePath}:`, error);
        if (await fs.stat(tmpPath).catch(() => false)) {
            await fs.unlink(tmpPath);
        }
    }
}

async function walkDir(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const res = path.join(dir, file.name);
        if (file.isDirectory()) {
            await walkDir(res);
        } else {
            await optimizeImage(res);
        }
    }
}

console.log('Starting image optimization...');
walkDir(STORIES_DIR)
    .then(() => console.log('Optimization complete!'))
    .catch(err => console.error('Optimization failed:', err));
