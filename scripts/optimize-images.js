import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_ASSETS_DIR = path.resolve(__dirname, '../public/assets/blog');

async function optimizeImages() {
    if (!fs.existsSync(BLOG_ASSETS_DIR)) {
        console.error(`Directory not found: ${BLOG_ASSETS_DIR}`);
        return;
    }

    const files = fs.readdirSync(BLOG_ASSETS_DIR);
    const jpgFiles = files.filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'));

    console.log(`Found ${jpgFiles.length} JPG files to optimize in ${BLOG_ASSETS_DIR}`);

    for (const file of jpgFiles) {
        const inputPath = path.join(BLOG_ASSETS_DIR, file);
        const fileNameWithoutExt = path.parse(file).name;
        const outputPath = path.join(BLOG_ASSETS_DIR, `${fileNameWithoutExt}.webp`);

        const statsBefore = fs.statSync(inputPath);
        const sizeBeforeKB = (statsBefore.size / 1024).toFixed(2);

        console.log(`Optimizing ${file} (${sizeBeforeKB} KB)...`);

        try {
            await sharp(inputPath)
                .resize({ width: 1920, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);

            const statsAfter = fs.statSync(outputPath);
            const sizeAfterKB = (statsAfter.size / 1024).toFixed(2);
            const reduction = (((statsBefore.size - statsAfter.size) / statsBefore.size) * 100).toFixed(2);

            console.log(`✅ Success: ${fileNameWithoutExt}.webp (${sizeAfterKB} KB) - Reduced by ${reduction}%`);

            // Delete original JPG
            fs.unlinkSync(inputPath);
            console.log(`🗑️ Deleted original: ${file}`);
        } catch (error) {
            console.error(`❌ Error optimizing ${file}:`, error.message);
        }
    }
}

optimizeImages();
