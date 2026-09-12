import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../hooks/useSettings';
import { loadRecentLogs } from '../services/storage';
import { DayLog } from '../types';
import { textStyles, fontSize } from '../theme/typography';
import { palette } from '../theme/colors';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logDate = new Date(date);
  logDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function HistoryScreen() {
  const { settings, loading: settingsLoading } = useSettings();
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const recent = await loadRecentLogs(30);
    setLogs(recent);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (settingsLoading || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  // Filter logs that have actual data
  const logsWithData = logs.filter((l) => l.entries.length > 0);

  // Calculate statistics ONLY from days with recorded data
  const totalIntakeAllTime = logsWithData.reduce(
    (acc, l) => acc + l.entries.reduce((sum, e) => sum + e, 0),
    0
  );
  const averageDailyMl = logsWithData.length > 0 ? Math.round(totalIntakeAllTime / logsWithData.length) : 0;

  // Count goals met (using current goal as approximation - acceptable for V1)
  const goalsMetCount = logsWithData.filter((l) => {
    const dayTotal = l.entries.reduce((sum, e) => sum + e, 0);
    return dayTotal >= settings.dailyGoalMl;
  }).length;

  // Empty state for new users
  const hasAnyData = logsWithData.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>History</Text>

        {!hasAnyData ? (
          // Empty State
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💧</Text>
            <Text style={styles.emptyTitle}>No hydration history yet</Text>
            <Text style={styles.emptySubtitle}>Start tracking today and build your streak</Text>
          </View>
        ) : (
          <>
            {/* Summary Stats - Compact */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Last 30 Days</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{(totalIntakeAllTime / 1000).toFixed(1)} L</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{averageDailyMl} ml</Text>
                <Text style={styles.statLabel}>Daily Avg</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{goalsMetCount}</Text>
                <Text style={styles.statLabel}>Goals Met</Text>
              </View>
            </View>

            {/* Day List - Compact, no heavy cards */}
            <View style={styles.listContainer}>
              {logs.map((log) => {
                const dayTotal = log.entries.reduce((sum, e) => sum + e, 0);

                // Skip days with zero intake to avoid visual clutter
                if (dayTotal === 0) return null;

                const progress = Math.min(dayTotal / settings.dailyGoalMl, 1);
                const goalMet = dayTotal >= settings.dailyGoalMl;

                return (
                  <View key={log.date} style={styles.logRow}>
                    {/* Date & Drinks */}
                    <View style={styles.logInfo}>
                      <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                      <Text style={styles.logSub}>
                        {log.entries.length} {log.entries.length === 1 ? 'drink' : 'drinks'}
                      </Text>
                    </View>

                    {/* Mini Progress Bar */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progress * 100}%`,
                              backgroundColor: goalMet ? '#22C55E' : '#1A73E8',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.logAmount, goalMet && styles.logAmountMet]}>
                        {dayTotal} ml
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.navy900,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: palette.navy900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  title: {
    ...textStyles.headingLarge,
    color: palette.white,
    marginBottom: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: palette.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Summary
  summaryRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Stats Grid (Simplified)
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: palette.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Day List (Compact Rows, No Heavy Cards)
  listContainer: {
    gap: 8,
    marginTop: 8,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logInfo: {
    width: 120,
  },
  logDate: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.white,
    marginBottom: 2,
  },
  logSub: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.4)',
  },

  // Mini Progress
  progressSection: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  logAmount: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  logAmountMet: {
    color: '#22C55E',
  },
});
