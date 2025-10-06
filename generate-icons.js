const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon sizes for Android
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

console.log('Checking for sharp package...');
try {
  require('sharp');
  console.log('Sharp is available!');
} catch (e) {
  console.log('Installing sharp...');
  execSync('npm install sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

async function generateIcons() {
  const sourceIcon = path.join(__dirname, 'icon.png');

  if (!fs.existsSync(sourceIcon)) {
    console.error('icon.png not found!');
    process.exit(1);
  }

  console.log('Generating Android launcher icons...');

  for (const [folder, size] of Object.entries(sizes)) {
    const outputDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', folder);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'ic_launcher.png');
    const outputRoundFile = path.join(outputDir, 'ic_launcher_round.png');

    await sharp(sourceIcon)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(outputFile);

    await sharp(sourceIcon)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(outputRoundFile);

    console.log(`✓ Generated ${folder}/ic_launcher.png and ic_launcher_round.png (${size}x${size})`);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('Now rebuild your app with: cd android && ./gradlew clean && ./gradlew installDebug');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
