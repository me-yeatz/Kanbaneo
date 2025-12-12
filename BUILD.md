# Build Instructions for Kanbaneo

This guide explains how to build Kanbaneo for different platforms.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)
- Git

### For iOS builds:
- macOS computer
- [Xcode](https://developer.apple.com/xcode/) (latest version)
- Apple Developer Account

### For Android builds:
- [Android Studio](https://developer.android.com/studio)
- Android SDK
- Java JDK 17+

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/Kanbaneo.git
cd Kanbaneo

# Install dependencies
npm install
```

---

## Web (GitHub Pages / Any Web Host)

No build required! Simply upload these files to your web server:
- `index.html`
- `styles.css`
- `script.js`

### Deploy to GitHub Pages:
1. Go to your repository Settings
2. Navigate to "Pages"
3. Select "Deploy from a branch"
4. Choose `main` branch and `/ (root)` folder
5. Save - your site will be live at `https://yourusername.github.io/Kanbaneo`

---

## Windows Desktop (.exe)

### Build Steps:

```bash
# Install dependencies (if not done)
npm install

# Build Windows executable
npm run build:win
```

### Output:
- `dist/Kanbaneo Setup x.x.x.exe` - Installer
- `dist/Kanbaneo x.x.x.exe` - Portable version

### Requirements for building:
- Windows 10/11 (or Wine on Linux/macOS)

---

## macOS Desktop (.dmg)

### Build Steps:

```bash
# Install dependencies (if not done)
npm install

# Build macOS app (must be on macOS)
npm run build:mac
```

### Output:
- `dist/Kanbaneo-x.x.x.dmg` - Disk image
- `dist/Kanbaneo-x.x.x-mac.zip` - Zipped app

### Code Signing (Optional but recommended):
```bash
# Set environment variables before building
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="your-password"
npm run build:mac
```

---

## iOS App

### Initial Setup:

```bash
# Install dependencies
npm install

# Initialize Capacitor (first time only)
npm run cap:init

# Add iOS platform
npm run cap:add:ios

# Sync web files to iOS
npm run build:ios
```

### Build in Xcode:

```bash
# Open project in Xcode
npm run cap:open:ios
```

Then in Xcode:
1. Select your development team
2. Choose a simulator or connected device
3. Click the Play button to build and run

### Creating App Store Build:
1. In Xcode, select "Any iOS Device" as target
2. Go to Product > Archive
3. Once complete, click "Distribute App"
4. Follow the prompts for App Store submission

---

## Android App (.apk / .aab)

### Initial Setup:

```bash
# Install dependencies
npm install

# Initialize Capacitor (first time only)
npm run cap:init

# Add Android platform
npm run cap:add:android

# Sync web files to Android
npm run build:android
```

### Build in Android Studio:

```bash
# Open project in Android Studio
npm run cap:open:android
```

### Creating Debug APK:
1. In Android Studio, go to Build > Build Bundle(s) / APK(s) > Build APK(s)
2. APK will be in `android/app/build/outputs/apk/debug/`

### Creating Release APK/AAB:
1. Go to Build > Generate Signed Bundle / APK
2. Create or select a keystore
3. Choose APK or Android App Bundle
4. Select "release" build variant
5. Click Create

### Command Line Build:
```bash
cd android

# Debug APK
./gradlew assembleDebug

# Release APK (requires signing config)
./gradlew assembleRelease

# App Bundle for Play Store
./gradlew bundleRelease
```

---

## Linux Desktop (.AppImage / .deb)

### Build Steps:

```bash
# Install dependencies
npm install

# Build Linux packages
npm run build:linux
```

### Output:
- `dist/Kanbaneo-x.x.x.AppImage` - Universal Linux app
- `dist/kanbaneo_x.x.x_amd64.deb` - Debian/Ubuntu package

---

## All Platforms at Once

```bash
npm run build:all
```

> **Note:** Cross-platform building has limitations. Windows .exe can only be built on Windows (or with Wine). macOS .dmg can only be built on macOS.

---

## Troubleshooting

### "Cannot find module 'electron'"
```bash
npm install electron --save-dev
```

### iOS: "No signing certificate"
1. Open Xcode
2. Go to Preferences > Accounts
3. Add your Apple ID
4. Download certificates

### Android: "SDK location not found"
Create `android/local.properties`:
```
sdk.dir=/path/to/your/Android/Sdk
```

### Capacitor sync fails
```bash
# Clean and reinstall
rm -rf node_modules
npm install
npx cap sync
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CSC_LINK` | Path to macOS signing certificate |
| `CSC_KEY_PASSWORD` | Certificate password |
| `ANDROID_HOME` | Android SDK path |
| `JAVA_HOME` | JDK path |

---

## File Size Optimization

The app is already lightweight (~50KB), but for even smaller mobile builds:

1. Minify CSS and JS before building
2. Use `--asar` flag for Electron (default)
3. Enable ProGuard for Android release builds

---

## Questions?

Open an issue on GitHub or reach out to [@yeatz](https://github.com/yeatz)
