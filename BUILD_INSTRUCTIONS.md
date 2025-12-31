# Stack Tower - Build & Publish Guide

## Quick Start (Test in Browser)

```bash
cd stack-tower
npx serve www
```
Then open http://localhost:3000 in your browser.

## Build Android APK

### Step 1: Install Dependencies

```bash
cd stack-tower
npm install
```

### Step 2: Initialize Capacitor for Android

```bash
npx cap init "Stack Tower" com.yourgame.stacktower --web-dir www
npx cap add android
```

### Step 3: Build APK

**Option A: Using Android Studio (Recommended)**
```bash
npx cap open android
```
Then in Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)

**Option B: Command Line (requires Android SDK)**
```bash
npx cap sync android
cd android
./gradlew assembleRelease
```
APK will be at: `android/app/build/outputs/apk/release/`

## Set Up AdMob for Monetization

### 1. Create AdMob Account
- Go to https://admob.google.com
- Sign up with your Google account
- Accept the terms and conditions

### 2. Create Your App in AdMob
- Click "Apps" > "Add App"
- Select "Android"
- Enter "Stack Tower" as app name
- Copy your App ID (looks like: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX)

### 3. Create Ad Units
Create these ad units in AdMob:
- **Interstitial**: For between-game ads
- **Rewarded Video**: For "watch ad to continue" feature

Copy both Ad Unit IDs.

### 4. Update Your App
Edit `www/js/ads.js` and replace the test IDs:
```javascript
this.config = {
    appId: 'YOUR-APP-ID',
    interstitialId: 'YOUR-INTERSTITIAL-ID',
    rewardedId: 'YOUR-REWARDED-ID'
};
```

### 5. Update AndroidManifest.xml
Add to `android/app/src/main/AndroidManifest.xml` inside `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="YOUR-APP-ID"/>
```

## Publish to Google Play Store

### Prerequisites
1. **Google Play Developer Account** - $25 one-time fee
   - Sign up at https://play.google.com/console
2. **Privacy Policy** - Required for all apps
   - Use free generator: https://app-privacy-policy-generator.firebaseapp.com

### Create Store Listing Assets

**Required:**
- App Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: At least 2 phone screenshots (min 320px, max 3840px)
- Short description: Up to 80 characters
- Full description: Up to 4000 characters

**Suggested descriptions:**

Short: "Stack blocks perfectly to build the tallest tower!"

Full:
```
Stack Tower is an addictive hyper-casual game that tests your timing skills!

HOW TO PLAY:
- Tap to drop the sliding block
- Stack blocks as precisely as possible
- Perfect stacks keep full width
- Misaligned parts fall off
- Game ends when blocks become too small

FEATURES:
- Simple one-tap gameplay
- Beautiful color-changing blocks
- Satisfying particle effects
- Track your high score
- Watch ads to continue playing

Can you beat your high score? Download now and start stacking!
```

### Upload to Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in app details
4. Upload your signed APK/AAB
5. Complete store listing with assets
6. Set up pricing (Free with ads)
7. Complete content rating questionnaire
8. Submit for review

## Generate Signed APK for Release

### Create Keystore (one-time)
```bash
keytool -genkey -v -keystore stack-tower.keystore -alias stacktower -keyalg RSA -keysize 2048 -validity 10000
```
**IMPORTANT: Keep this keystore file safe! You need it for all future updates.**

### Sign Your APK
In Android Studio:
1. Build > Generate Signed Bundle / APK
2. Select APK
3. Choose your keystore
4. Build Release

## Estimated Earnings

Hyper-casual games typically earn:
- **eCPM (earnings per 1000 ad views)**: $1-10 depending on region
- **Daily Active Users needed for $100/day**: ~10,000-100,000

Tips to increase earnings:
- Show interstitial ads every 3-5 games
- Use rewarded videos for extra lives/continues
- Focus on user retention to increase daily sessions

## Troubleshooting

**Build fails:**
- Ensure Android SDK is installed
- Check that ANDROID_HOME environment variable is set
- Run `npx cap sync android` after any web changes

**Ads not showing:**
- Use test IDs during development
- Check AdMob dashboard for policy violations
- Ensure device has internet connection

**App rejected:**
- Review Google Play policies
- Ensure privacy policy URL is valid
- Check for copyright issues in assets
