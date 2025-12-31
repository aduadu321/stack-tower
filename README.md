# Stack Tower 🏗️

An addictive hyper-casual stacking game for Android. Simple tap gameplay with satisfying combo mechanics.

## Quick Start

### Test in Browser
```bash
cd stack-tower
npx serve www
```
Open http://localhost:3000 in your browser.

### Test on Phone
Use the same command and open the URL on your phone's browser.

## Build APK

### Option 1: GitHub Actions (Recommended)

1. Push this project to GitHub
2. Go to Actions tab
3. Run "Build Android APK" workflow
4. Download the APK artifact

### Option 2: Local Build (Requires PC/Mac)

```bash
npm install
npx cap sync android
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/`

## Project Structure

```
stack-tower/
├── www/                    # Game files
│   ├── index.html         # Main HTML
│   ├── css/style.css      # Styles
│   ├── js/
│   │   ├── game.js        # Game logic
│   │   └── ads.js         # AdMob integration
│   └── privacy-policy.html
├── android/               # Android project
├── .github/workflows/     # GitHub Actions
├── icon_512.png          # App icon
├── stacktower.keystore   # Signing key (KEEP SAFE!)
└── PLAY_STORE_LISTING.md # Store assets guide
```

## Publish to Google Play

1. **Get Developer Account**: $25 at https://play.google.com/console
2. **Set Up AdMob**: Free at https://admob.google.com
3. **Host Privacy Policy**: Use GitHub Pages or Netlify
4. **Build APK**: Use GitHub Actions
5. **Upload to Play Console**: Follow PLAY_STORE_LISTING.md

## Keystore Security

⚠️ **IMPORTANT**: Keep `stacktower.keystore` safe!
- Password: `stacktower123`
- You need this file for ALL future updates
- If lost, you cannot update your app

## Customize

### Change App ID
Edit `capacitor.config.json`:
```json
{
  "appId": "com.yourname.stacktower"
}
```

### Update AdMob IDs
Edit `www/js/ads.js` with your AdMob ad unit IDs.

## License

MIT License - Free to use and modify.
