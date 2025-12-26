import { useState } from 'react';
import { View, Text, Switch, StyleSheet, Linking, TouchableOpacity, Modal, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts';
import { useSettingsStore, useStatsStore } from '../store';
import { spacing, fontSize, borderRadius } from '../constants/theme';
import WinModal from '../components/WinModal';

// Lazy import StoreReview to avoid crash if native module not available
let StoreReview: typeof import('expo-store-review') | null = null;
try {
  StoreReview = require('expo-store-review');
} catch (e) {
  // Native module not available in this build
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    nightMode,
    highlightRelated,
    highlightSameNumber,
    showErrors,
    hapticFeedback,
    soundEnabled,
    toggleNightMode,
    setHighlightRelated,
    setHighlightSameNumber,
    setShowErrors,
    setHapticFeedback,
    setSoundEnabled,
  } = useSettingsStore();

  const { loadMockData } = useStatsStore();
  const [showWinModal, setShowWinModal] = useState(false);

  const handleLoadMockData = () => {
    loadMockData();
    Alert.alert('Mock Data Loaded', 'Statistics have been populated with demo data for screenshots.');
  };

  const handlePrivacyPolicy = () => {
    // TODO: Replace with actual privacy policy URL
    Linking.openURL('https://example.com/privacy');
  };

  const handleRateApp = async () => {
    // Try native review prompt first (iOS 10.3+)
    try {
      if (StoreReview && await StoreReview.hasAction()) {
        await StoreReview.requestReview();
        return;
      }
    } catch (e) {
      // StoreReview not available, fall through to URL
    }

    // Fallback to App Store page
    // Replace APP_ID with your actual App Store ID after creating the app
    const APP_ID = '6757087219';
    const storeUrl = Platform.select({
      ios: `https://apps.apple.com/app/id${APP_ID}?action=write-review`,
      default: `https://apps.apple.com/app/id${APP_ID}`,
    });
    Linking.openURL(storeUrl);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Night Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Easy on the eyes for late-night puzzling
              </Text>
            </View>
            <Switch
              value={nightMode}
              onValueChange={toggleNightMode}
              trackColor={{ false: colors.gridLine, true: colors.primaryLight }}
              thumbColor={nightMode ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Game Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Settings</Text>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Highlight Related Cells</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Highlight row, column, and box of selected cell
              </Text>
            </View>
            <Switch
              value={highlightRelated}
              onValueChange={setHighlightRelated}
              trackColor={{ false: colors.gridLine, true: colors.primaryLight }}
              thumbColor={highlightRelated ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Highlight Same Numbers</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Highlight cells with the same number
              </Text>
            </View>
            <Switch
              value={highlightSameNumber}
              onValueChange={setHighlightSameNumber}
              trackColor={{ false: colors.gridLine, true: colors.primaryLight }}
              thumbColor={highlightSameNumber ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Show Errors</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Highlight conflicting numbers
              </Text>
            </View>
            <Switch
              value={showErrors}
              onValueChange={setShowErrors}
              trackColor={{ false: colors.gridLine, true: colors.primaryLight }}
              thumbColor={showErrors ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Haptic Feedback</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Vibrate on button presses
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: colors.gridLine, true: colors.primaryLight }}
              thumbColor={hapticFeedback ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Owl sounds for hints and wins
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.gridLine, true: colors.primaryLight }}
              thumbColor={soundEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: colors.surface }]}
            onPress={handleRateApp}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>Rate Sudoku Owl</Text>
            <Text style={[styles.linkArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: colors.surface }]}
            onPress={handlePrivacyPolicy}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>Privacy Policy</Text>
            <Text style={[styles.linkArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>

          <View style={[styles.versionRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.versionLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.versionValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
        </View>

        {/* Dev Tools - Only show in development */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dev Tools</Text>

            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: colors.primary }]}
              onPress={handleLoadMockData}
            >
              <Text style={styles.devButtonText}>Load Mock Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: '#F5A623' }]}
              onPress={() => setShowWinModal(true)}
            >
              <Text style={styles.devButtonText}>Show Win Screen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with 🦉 by Gift Owl
          </Text>
        </View>
      </ScrollView>

      {/* Win Modal Preview */}
      <WinModal
        visible={showWinModal}
        onClose={() => setShowWinModal(false)}
        onNewGame={() => setShowWinModal(false)}
        onMainMenu={() => setShowWinModal(false)}
        time={289}
        difficulty="medium"
        score={285}
        isNewBestTime={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSize.sm,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  linkText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  linkArrow: {
    fontSize: fontSize.lg,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  versionLabel: {
    fontSize: fontSize.md,
  },
  versionValue: {
    fontSize: fontSize.md,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    padding: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
  },
  devButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
