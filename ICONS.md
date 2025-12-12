# Icon Generation Guide for Kanbaneo

The SVG icon is provided at `assets/icon.svg`. You need to convert it to platform-specific formats.

## Required Icon Files

| Platform | Format | Sizes | Location |
|----------|--------|-------|----------|
| Windows | `.ico` | 16, 32, 48, 64, 128, 256px | `assets/icon.ico` |
| macOS | `.icns` | 16, 32, 64, 128, 256, 512, 1024px | `assets/icon.icns` |
| iOS | `.png` | Multiple sizes | `ios/App/App/Assets.xcassets/` |
| Android | `.png` | Multiple sizes | `android/app/src/main/res/` |
| Web/PWA | `.png` | 192, 512px | `assets/` |

---

## Quick Generation Methods

### Option 1: Online Converters (Easiest)

1. **For Windows .ico:**
   - Go to https://convertio.co/svg-ico/
   - Upload `assets/icon.svg`
   - Download and save as `assets/icon.ico`

2. **For macOS .icns:**
   - Go to https://cloudconvert.com/svg-to-icns
   - Upload `assets/icon.svg`
   - Download and save as `assets/icon.icns`

3. **For PNG (all platforms):**
   - Go to https://svgtopng.com/
   - Upload `assets/icon.svg`
   - Generate at sizes: 16, 32, 48, 64, 128, 192, 256, 512, 1024px

---

### Option 2: Using ImageMagick (Command Line)

```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt install imagemagick

# Generate PNGs at various sizes
magick assets/icon.svg -resize 16x16 assets/icon-16.png
magick assets/icon.svg -resize 32x32 assets/icon-32.png
magick assets/icon.svg -resize 48x48 assets/icon-48.png
magick assets/icon.svg -resize 64x64 assets/icon-64.png
magick assets/icon.svg -resize 128x128 assets/icon-128.png
magick assets/icon.svg -resize 256x256 assets/icon-256.png
magick assets/icon.svg -resize 512x512 assets/icon-512.png
magick assets/icon.svg -resize 1024x1024 assets/icon-1024.png

# Generate Windows .ico (multi-resolution)
magick assets/icon.svg -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico

# Generate main PNG for Electron
magick assets/icon.svg -resize 512x512 assets/icon.png
```

---

### Option 3: Using Electron-Icon-Builder

```bash
# Install the tool
npm install -g electron-icon-builder

# Generate all icons from a 1024x1024 PNG
electron-icon-builder --input=assets/icon-1024.png --output=assets/
```

---

## iOS Icons (After running `npx cap add ios`)

Place these PNGs in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

| Filename | Size | Purpose |
|----------|------|---------|
| icon-20.png | 20x20 | iPad Notifications |
| icon-20@2x.png | 40x40 | iPhone Notifications |
| icon-20@3x.png | 60x60 | iPhone Notifications |
| icon-29.png | 29x29 | iPad Settings |
| icon-29@2x.png | 58x58 | iPhone Settings |
| icon-29@3x.png | 87x87 | iPhone Settings |
| icon-40.png | 40x40 | iPad Spotlight |
| icon-40@2x.png | 80x80 | iPhone Spotlight |
| icon-40@3x.png | 120x120 | iPhone Spotlight |
| icon-60@2x.png | 120x120 | iPhone App |
| icon-60@3x.png | 180x180 | iPhone App |
| icon-76.png | 76x76 | iPad App |
| icon-76@2x.png | 152x152 | iPad App |
| icon-83.5@2x.png | 167x167 | iPad Pro |
| icon-1024.png | 1024x1024 | App Store |

---

## Android Icons (After running `npx cap add android`)

Place these PNGs in `android/app/src/main/res/`:

| Folder | Size | Density |
|--------|------|---------|
| mipmap-mdpi/ | 48x48 | 1x |
| mipmap-hdpi/ | 72x72 | 1.5x |
| mipmap-xhdpi/ | 96x96 | 2x |
| mipmap-xxhdpi/ | 144x144 | 3x |
| mipmap-xxxhdpi/ | 192x192 | 4x |

Each folder needs:
- `ic_launcher.png` - Square icon
- `ic_launcher_round.png` - Round icon (Android 7.1+)
- `ic_launcher_foreground.png` - Adaptive icon foreground

---

## Automated Script

Save this as `generate-icons.js` and run with `node generate-icons.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

const sizes = [16, 20, 29, 32, 40, 48, 60, 64, 72, 76, 80, 87, 96, 120, 128, 144, 152, 167, 180, 192, 256, 512, 1024];

// Create icons directory if needed
if (!fs.existsSync('assets/icons')) {
    fs.mkdirSync('assets/icons', { recursive: true });
}

// Generate each size
sizes.forEach(size => {
    try {
        execSync(`magick assets/icon.svg -resize ${size}x${size} assets/icons/icon-${size}.png`);
        console.log(`Generated: icon-${size}.png`);
    } catch (e) {
        console.error(`Failed: icon-${size}.png`);
    }
});

// Generate .ico for Windows
try {
    execSync('magick assets/icon.svg -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico');
    console.log('Generated: icon.ico');
} catch (e) {
    console.error('Failed to generate .ico');
}

console.log('Done! Now generate .icns on macOS or use an online converter.');
```

---

## Verification

After generating icons, verify they exist:

```bash
# Check Windows icon
ls -la assets/icon.ico

# Check PNG
ls -la assets/icon.png

# Check all generated sizes
ls -la assets/icons/
```

Then rebuild your apps:
```bash
npm run build:win      # Windows
npm run build:mac      # macOS
npx cap sync           # iOS/Android
```
