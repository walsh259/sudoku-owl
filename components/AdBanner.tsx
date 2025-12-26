import { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, BANNER_AD_UNIT_ID, adsAvailable } from '../utils/ads';
import { useTheme } from '../contexts';
import { fontSize } from '../constants/theme';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner' | 'adaptive';
}

export default function AdBanner({ size = 'banner' }: AdBannerProps) {
  const { colors } = useTheme();
  const [adError, setAdError] = useState(false);

  // Don't render if ads aren't available (Expo Go) or there was an error
  if (!adsAvailable || !BannerAd || !BannerAdSize || adError) {
    // Show placeholder in dev mode so layout is visible
    if (__DEV__ && !adError) {
      return (
        <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Ad Banner (requires native build)
          </Text>
        </View>
      );
    }
    return null;
  }

  // Map size prop to BannerAdSize
  const adSize = {
    banner: BannerAdSize.BANNER, // 320x50
    largeBanner: BannerAdSize.LARGE_BANNER, // 320x100
    adaptive: BannerAdSize.ANCHORED_ADAPTIVE_BANNER, // Full width, auto height
  }[size];

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('Banner ad failed to load:', error);
          setAdError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  placeholder: {
    width: 320,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  placeholderText: {
    fontSize: fontSize.xs,
  },
});
