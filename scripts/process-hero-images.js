const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'Fotos gif', 'baner', 'Banner-20260217T003308Z-3-001', 'Banner');
const outputDir = path.join(__dirname, '..', 'src', 'assets', 'hero');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function processImages() {
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    console.log(`Found ${imageFiles.length} images to process.`);

    for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const outputFileName = path.parse(file).name + '.webp';
        const outputPath = path.join(outputDir, outputFileName);

        console.log(`Processing: ${file} -> ${outputFileName}`);

        try {
            await sharp(inputPath)
                .resize({ width: 2400, withoutEnlargement: true }) // High quality for large screens
                .webp({ quality: 80 })
                .toFile(outputPath);
            console.log(`Successfully processed: ${outputFileName}`);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }
}

processImages();
