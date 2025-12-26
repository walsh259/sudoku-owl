import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts';
import { spacing, fontSize, borderRadius } from '../constants/theme';
import { useStatsStore, useGameStore, formatTimeDisplay } from '../store';
import { Difficulty } from '../types';
import DailyCalendar from '../components/DailyCalendar';

// Rewarded ad handling (placeholder - needs native build)
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;
let rewardedAdsAvailable = false;

try {
  const ads = require('react-native-google-mobile-ads');
  RewardedAd = ads.RewardedAd;
  RewardedAdEventType = ads.RewardedAdEventType;
  TestIds = ads.TestIds;
  rewardedAdsAvailable = true;
} catch (error) {
  console.log('Rewarded ads not available (requires native build)');
}

const REWARDED_AD_UNIT_ID = __DEV__ && TestIds
  ? TestIds?.REWARDED
  : 'ca-app-pub-3527565745537185/XXXXXXXXXX'; // Replace with real ID

export default function StatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<'stats' | 'daily'>('stats');

  // Set initial tab from URL parameter
  useEffect(() => {
    if (tab === 'daily') {
      setActiveTab('daily');
    }
  }, [tab]);

  const {
    gamesPlayed,
    gamesWon,
    currentStreak,
    bestStreak,
    totalScore,
    getWinRate,
    getBestTimeFormatted,
    getAverageTimeFormatted,
    getImprovementTrend,
    getGamesCountByDifficulty,
    getTotalPlayTime,
    getHighScore,
    getMilestones,
    resetStats,
  } = useStatsStore();

  const { startDailyChallenge } = useGameStore();

  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all your statistics? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetStats,
        },
      ]
    );
  };

  const handleSelectDate = (date: string) => {
    // Start the daily challenge for the selected date
    startDailyChallenge(date);
    router.push('/game');
  };

  const handleWatchAdForDate = (date: string) => {
    if (!rewardedAdsAvailable) {
      // For development/Expo Go, just allow playing
      Alert.alert(
        'Ad Unavailable',
        'Rewarded ads require a native build. In the full app, you would watch a short ad to unlock missed days.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Play Anyway (Dev)',
            onPress: () => {
              // Start the daily challenge for that specific date
              startDailyChallenge(date);
              router.push('/game');
            },
          },
        ]
      );
      return;
    }

    // Load and show rewarded ad
    try {
      const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        // User watched the ad - unlock the day
        startDailyChallenge(date);
        router.push('/game');
      });

      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewarded.show();
      });

      rewarded.load();
    } catch (error) {
      console.log('Could not load rewarded ad:', error);
      Alert.alert('Error', 'Could not load ad. Please try again.');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↑';
      case 'declining': return '↓';
      case 'steady': return '→';
      default: return '';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return colors.success;
      case 'declining': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const milestones = getMilestones();
  const achievedCount = milestones.filter(m => m.achieved).length;
  const totalPlayTime = getTotalPlayTime();

  const renderStatsTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Overview Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{gamesPlayed}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Played</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{gamesWon}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Won</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{getWinRate()}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Win Rate</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{formatTotalTime(totalPlayTime)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Time</Text>
          </View>
        </View>
      </View>

      {/* Streak Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Streaks</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, styles.statItemWide, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Streak</Text>
          </View>
          <View style={[styles.statItem, styles.statItemWide, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{bestStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Streak</Text>
          </View>
        </View>
      </View>

      {/* Score */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Score</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, styles.statItemWide, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalScore.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Points</Text>
          </View>
          <View style={[styles.statItem, styles.statItemWide, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{getHighScore()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Game</Text>
          </View>
        </View>
      </View>

      {/* Times by Difficulty */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Times by Difficulty</Text>
        <View style={[styles.timesContainer, { backgroundColor: colors.surface }]}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff, index) => {
            const trend = getImprovementTrend(diff);
            const gamesCount = getGamesCountByDifficulty(diff);
            const diffColors = {
              easy: '#4CAF50',
              medium: '#FF9800',
              hard: '#F44336',
            };

            return (
              <View
                key={diff}
                style={[
                  styles.timeRow,
                  { borderLeftColor: diffColors[diff] },
                  index > 0 && { borderTopWidth: 1, borderTopColor: colors.gridLine },
                ]}
              >
                <View style={styles.timeRowLeft}>
                  <Text style={[styles.difficultyLabel, { color: colors.text }]}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                  <Text style={[styles.gamesCount, { color: colors.textSecondary }]}>
                    {gamesCount} games
                  </Text>
                </View>
                <View style={styles.timeRowRight}>
                  <View style={styles.timeColumn}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Best</Text>
                    <Text style={[styles.timeValue, { color: colors.primary }]}>
                      {getBestTimeFormatted(diff)}
                    </Text>
                  </View>
                  <View style={styles.timeColumn}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Avg</Text>
                    <View style={styles.avgWithTrend}>
                      <Text style={[styles.timeValue, { color: colors.text }]}>
                        {getAverageTimeFormatted(diff)}
                      </Text>
                      {trend !== 'none' && (
                        <Text style={[styles.trendIcon, { color: getTrendColor(trend) }]}>
                          {getTrendIcon(trend)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Milestones */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Milestones</Text>
          <Text style={[styles.milestoneCount, { color: colors.textSecondary }]}>
            {achievedCount}/{milestones.length}
          </Text>
        </View>
        <View style={styles.milestonesGrid}>
          {milestones.map((milestone) => (
            <View
              key={milestone.id}
              style={[
                styles.milestoneItem,
                { backgroundColor: colors.surface },
                milestone.achieved && [styles.milestoneAchieved, { borderColor: colors.success }],
              ]}
            >
              <Text style={styles.milestoneEmoji}>
                {milestone.achieved ? '🏆' : '🔒'}
              </Text>
              <Text
                style={[
                  styles.milestoneTitle,
                  { color: milestone.achieved ? colors.text : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {milestone.title}
              </Text>
              <Text
                style={[styles.milestoneDesc, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {milestone.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: colors.error }]}
        onPress={handleResetStats}
      >
        <Text style={[styles.resetButtonText, { color: colors.buttonText }]}>Reset Statistics</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderDailyTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Challenges</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Complete the daily puzzle to build your streak. Missed a day? Watch an ad to unlock it!
        </Text>
      </View>

      <DailyCalendar
        onSelectDate={handleSelectDate}
        onWatchAdForDate={handleWatchAdForDate}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'stats' && [styles.tabActive, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('stats')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'stats' ? colors.buttonText : colors.textSecondary },
            ]}
          >
            Statistics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'daily' && [styles.tabActive, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('daily')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'daily' ? colors.buttonText : colors.textSecondary },
            ]}
          >
            Daily Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'stats' ? renderStatsTab() : renderDailyTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  tabActive: {},
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  milestoneCount: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItemWide: {
    minWidth: '45%',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  timesContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  timeRowLeft: {
    flex: 1,
  },
  timeRowRight: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timeColumn: {
    alignItems: 'center',
    minWidth: 60,
  },
  difficultyLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  gamesCount: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  timeLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  avgWithTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendIcon: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  milestoneItem: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  milestoneAchieved: {
    borderWidth: 2,
  },
  milestoneEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  milestoneTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  milestoneDesc: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 14,
  },
  resetButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  resetButtonText: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
