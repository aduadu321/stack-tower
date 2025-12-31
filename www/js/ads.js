// AdMob Integration for Stack Tower
// Uses @nicholasaziz/admob-plus-capacitor plugin

class AdManager {
    constructor() {
        this.initialized = false;
        this.interstitialReady = false;
        this.rewardedReady = false;

        // Replace these with your actual AdMob IDs
        this.config = {
            // Test IDs - Replace with your real IDs before publishing
            appId: 'ca-app-pub-3940256099942544~3347511713', // Test App ID
            interstitialId: 'ca-app-pub-3940256099942544/1033173712', // Test Interstitial
            rewardedId: 'ca-app-pub-3940256099942544/5224354917' // Test Rewarded
        };

        this.init();
    }

    async init() {
        // Check if running in Capacitor
        if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
            console.log('AdManager: Running in browser - ads disabled');
            return;
        }

        try {
            // Initialize AdMob
            const { AdMob } = await import('@nicholasaziz/admob-plus-capacitor');

            await AdMob.initialize({
                testingDevices: ['YOUR_DEVICE_ID'], // Add your test device ID
                initializeForTesting: true
            });

            this.AdMob = AdMob;
            this.initialized = true;
            console.log('AdMob initialized successfully');

            // Preload ads
            this.loadInterstitial();
            this.loadRewarded();

        } catch (error) {
            console.error('AdMob initialization failed:', error);
        }
    }

    async loadInterstitial() {
        if (!this.initialized || !this.AdMob) return;

        try {
            await this.AdMob.prepareInterstitial({
                adId: this.config.interstitialId
            });
            this.interstitialReady = true;
            console.log('Interstitial ad loaded');
        } catch (error) {
            console.error('Failed to load interstitial:', error);
        }
    }

    async showInterstitial() {
        if (!this.initialized || !this.AdMob) {
            console.log('Ads not available');
            return;
        }

        if (!this.interstitialReady) {
            await this.loadInterstitial();
        }

        try {
            await this.AdMob.showInterstitial();
            this.interstitialReady = false;
            // Preload next ad
            this.loadInterstitial();
        } catch (error) {
            console.error('Failed to show interstitial:', error);
        }
    }

    async loadRewarded() {
        if (!this.initialized || !this.AdMob) return;

        try {
            await this.AdMob.prepareRewardedAd({
                adId: this.config.rewardedId
            });
            this.rewardedReady = true;
            console.log('Rewarded ad loaded');
        } catch (error) {
            console.error('Failed to load rewarded ad:', error);
        }
    }

    async showRewarded(onReward) {
        if (!this.initialized || !this.AdMob) {
            console.log('Ads not available - granting reward for testing');
            if (onReward) onReward();
            return;
        }

        if (!this.rewardedReady) {
            await this.loadRewarded();
        }

        try {
            // Listen for reward
            this.AdMob.addListener('onRewardedVideoAdReward', () => {
                console.log('User earned reward');
                if (onReward) onReward();
            });

            await this.AdMob.showRewardedAd();
            this.rewardedReady = false;
            // Preload next ad
            this.loadRewarded();
        } catch (error) {
            console.error('Failed to show rewarded ad:', error);
        }
    }
}

// Initialize ad manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.AdManager = new AdManager();
});

/*
 * SETUP INSTRUCTIONS:
 *
 * 1. Install the AdMob plugin:
 *    npm install @nicholasaziz/admob-plus-capacitor
 *
 * 2. Create an AdMob account at https://admob.google.com
 *
 * 3. Create your app and ad units in AdMob console:
 *    - Create an Android app
 *    - Create an Interstitial ad unit
 *    - Create a Rewarded ad unit
 *
 * 4. Replace the test IDs above with your real AdMob IDs:
 *    - appId: Your app's AdMob App ID
 *    - interstitialId: Your interstitial ad unit ID
 *    - rewardedId: Your rewarded ad unit ID
 *
 * 5. Add your app's AdMob App ID to android/app/src/main/AndroidManifest.xml:
 *    <meta-data
 *        android:name="com.google.android.gms.ads.APPLICATION_ID"
 *        android:value="YOUR-APP-ID"/>
 *
 * IMPORTANT: Keep test IDs during development to avoid policy violations!
 * Only switch to production IDs when you're ready to publish.
 */
