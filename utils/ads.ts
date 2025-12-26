// Ads require a native build - gracefully handle when not available (Expo Go)
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;
let BannerAd: any = null;
let BannerAdSize: any = null;
let adsAvailable = false;

try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  adsAvailable = true;
} catch (error) {
  console.log('Google Mobile Ads not available (requires native build)');
}

// Use test IDs in development, real IDs in production
const AD_UNIT_IDS = {
  interstitial: __DEV__ && TestIds
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-3527565745537185/6234988782', // Sudoku Owl Interstitial
  banner: __DEV__ && TestIds
    ? TestIds.BANNER
    : 'ca-app-pub-3527565745537185/2176324277', // Sudoku Owl Banner
};

// Export for use in components
export { BannerAd, BannerAdSize, adsAvailable };
export const BANNER_AD_UNIT_ID = AD_UNIT_IDS.banner;

// Show interstitial every N completed games
const GAMES_BETWEEN_ADS = 3;

// Track games completed
let gamesCompleted = 0;
let interstitial: any = null;
let adLoaded = false;
let adsEnabled = true;

/**
 * Initialize the interstitial ad
 */
export function initializeAds(): void {
  if (!adsEnabled || !adsAvailable || !InterstitialAd) {
    console.log('Ads not available (requires native build)');
    return;
  }

  try {
    interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Listen for ad loaded
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      adLoaded = true;
      console.log('Interstitial ad loaded');
    });

    // Listen for ad closed - preload next one
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      adLoaded = false;
      // Preload next ad
      interstitial?.load();
    });

    // Listen for errors
    interstitial.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.log('Ad error:', error);
      adLoaded = false;
    });

    // Start loading the first ad
    interstitial.load();
  } catch (error) {
    console.log('Could not initialize ads:', error);
    adsEnabled = false;
  }
}

/**
 * Call this when a game is completed
 * Shows an ad every GAMES_BETWEEN_ADS games
 */
export async function onGameComplete(): Promise<void> {
  if (!adsEnabled || !interstitial) return;

  gamesCompleted++;

  if (gamesCompleted >= GAMES_BETWEEN_ADS && adLoaded) {
    try {
      await interstitial.show();
      gamesCompleted = 0;
    } catch (error) {
      console.log('Could not show ad:', error);
    }
  }
}

/**
 * Enable or disable ads (for premium users)
 */
export function setAdsEnabled(enabled: boolean): void {
  adsEnabled = enabled;
}

/**
 * Check if ads are enabled
 */
export function areAdsEnabled(): boolean {
  return adsEnabled;
}

/**
 * Reset the games counter (e.g., when user watches a rewarded ad)
 */
export function resetAdCounter(): void {
  gamesCompleted = 0;
}
