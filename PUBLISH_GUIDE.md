# Stack Tower - Ghid Complet Publicare Google Play

## PASUL 1: Creează Cont Google Play Developer (5 minute)

1. Deschide: https://play.google.com/console
2. Click **Get Started**
3. Plătește taxa: **$25** (o singură dată, pe viață)
4. Completează datele personale
5. Așteaptă verificarea (câteva ore - 2 zile)

---

## PASUL 2: Configurează AdMob (10 minute)

### 2.1 Creează cont AdMob
1. Deschide: https://admob.google.com
2. Loghează-te cu contul Google
3. Acceptă termenii

### 2.2 Adaugă aplicația
1. Click **Apps** → **Add App**
2. Selectează **Android**
3. "Is the app listed on Google Play?" → **No** (pentru acum)
4. App name: **Stack Tower**
5. Click **Add App**
6. **COPIAZĂ APP ID** (ex: ca-app-pub-XXXXX~XXXXX)

### 2.3 Creează Ad Units
1. Click pe app → **Ad Units** → **Add Ad Unit**
2. Creează **Interstitial**:
   - Name: "Game Over Interstitial"
   - **COPIAZĂ AD UNIT ID**
3. Creează **Rewarded**:
   - Name: "Continue Rewarded"
   - **COPIAZĂ AD UNIT ID**

### 2.4 Actualizează codul
Editează `www/js/ads.js` și înlocuiește:
```javascript
this.config = {
    appId: 'PUNE_APP_ID_AICI',
    interstitialId: 'PUNE_INTERSTITIAL_ID_AICI',
    rewardedId: 'PUNE_REWARDED_ID_AICI'
};
```

---

## PASUL 3: Creează Aplicația în Play Console (15 minute)

### 3.1 Start
1. Deschide: https://play.google.com/console
2. Click **Create app**

### 3.2 Detalii aplicație
```
App name: Stack Tower
Default language: English (United States)
App or game: Game
Free or paid: Free
```
✅ Accept declarations
Click **Create app**

---

## PASUL 4: Store Listing (Copy-Paste Direct)

### 4.1 Main store listing

**Short description (copiază exact):**
```
Stack blocks perfectly to build the tallest tower! Simple tap gameplay.
```

**Full description (copiază exact):**
```
🏗️ STACK TOWER - The Ultimate Stacking Challenge!

Test your timing and precision in this addictive hyper-casual game! Tap to drop sliding blocks and build the tallest tower possible.

🎮 SIMPLE ONE-TAP GAMEPLAY
• Tap anywhere to drop the block
• Time your taps perfectly
• Easy to learn, hard to master!

⭐ COMBO SYSTEM
• Stack perfectly to build combos
• 3x Combo = GREAT! (+2 points)
• 5x Combo = AMAZING! (+3 points)
• 7x Combo = INSANE! (+4 points)
• 10x Combo = LEGENDARY! (+5 points)

✨ SATISFYING EFFECTS
• Colorful rainbow blocks
• Particle effects on perfect stacks
• Screen shake feedback
• Smooth animations

🏆 FEATURES
• Track your high score
• Progressive difficulty
• Watch ads to continue
• Beautiful minimalist design
• Works on all devices

🎯 CHALLENGE YOURSELF
Can you reach 50 blocks? 100? How long can you keep your combo going?

Download now and start stacking! 🚀
```

### 4.2 Graphics (din Downloads)
- **App icon**: icon_512.png (512x512)
- **Feature graphic**: feature_graphic.png (1024x500)
- **Screenshots** (minim 2):
  - screenshot_1_start.png
  - screenshot_2_gameplay.png
  - screenshot_3_perfect.png
  - screenshot_4_gameover.png

---

## PASUL 5: Content Rating

1. Go to **Policy** → **App content** → **Content rating**
2. Start questionnaire
3. Răspunsuri:
   - Violence: **No**
   - Sexual content: **No**
   - Language: **No**
   - Controlled substances: **No**
   - User interaction: **No** (single player)
4. Submit → Rating: **Everyone**

---

## PASUL 6: Privacy & Ads

### 6.1 Privacy Policy
1. Go to **Policy** → **App content** → **Privacy policy**
2. URL: `https://aduadu321.github.io/stack-tower/privacy-policy.html`

### 6.2 Ads Declaration
1. Go to **Policy** → **App content** → **Ads**
2. Select: **Yes, my app contains ads**

### 6.3 Data Safety
1. Go to **Policy** → **App content** → **Data safety**
2. Does your app collect data? → **Yes**
3. Data types:
   - Device identifiers (for ads) → Collected, shared with AdMob
4. Complete the form

---

## PASUL 7: Pricing & Distribution

1. Go to **Monetize** → **Pricing**
2. Select: **Free**
3. Countries: Select all (sau doar cele dorite)

---

## PASUL 8: Upload APK

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload: **StackTower.apk** (din Downloads)
4. Release name: `1.0`
5. Release notes:
```
Initial release of Stack Tower!
- Simple tap-to-stack gameplay
- Combo system with bonuses
- Beautiful visual effects
- High score tracking
```
6. Click **Review release**
7. Click **Start rollout to Production**

---

## PASUL 9: Submit for Review

1. Verifică toate secțiunile sunt complete (verde ✓)
2. Click **Submit for review**
3. Așteaptă 1-7 zile pentru aprobare

---

## După Publicare

### Link-ul aplicației tale:
```
https://play.google.com/store/apps/details?id=com.stacktower.game
```

### Pentru update-uri:
1. Modifică codul
2. Mărește `versionCode` în `android/app/build.gradle`
3. Push pe GitHub
4. Descarcă noul APK
5. Upload în Play Console

---

## Troubleshooting

**App rejected?**
- Verifică privacy policy URL funcționează
- Verifică nu ai conținut copiat
- Citește feedback-ul de la Google

**Ads nu funcționează?**
- Folosește test IDs în development
- Verifică AdMob dashboard pentru erori
- Așteaptă 1-2 ore după creare ad units

---

## Estimare Venit

| Daily Users | Ads/zi/user | eCPM | Venit/zi |
|-------------|-------------|------|----------|
| 1,000 | 3 | $2 | $6 |
| 10,000 | 3 | $2 | $60 |
| 100,000 | 3 | $2 | $600 |

**Sfaturi pentru creștere:**
1. Adaugă pe social media
2. Fă video pe TikTok/YouTube
3. Cere review-uri de la utilizatori
4. Update-uri regulate cu features noi
