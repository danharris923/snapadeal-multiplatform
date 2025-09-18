import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { User, UserStats, Achievement } from '../types';
import { theme } from '../utils/theme';
import { gamificationService, ACHIEVEMENTS, LEVEL_THRESHOLDS } from '../services/gamification';

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user.id]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const stats = await gamificationService.getUserStats(user.id);
      setUserStats(stats);

      // Add unlocked status to achievements
      const achievementsWithStatus = ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: stats?.achievements.includes(achievement.id) || false,
      }));
      setAchievements(achievementsWithStatus);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressToNextLevel = () => {
    if (!userStats) return { current: 0, needed: 0, percentage: 0 };

    const currentLevel = userStats.level;
    const currentPoints = userStats.points;

    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return { current: currentPoints, needed: 0, percentage: 100 };
    }

    const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || 0;
    const pointsInCurrentLevel = currentPoints - currentLevelThreshold;
    const pointsNeededForLevel = nextLevelThreshold - currentLevelThreshold;
    const percentage = (pointsInCurrentLevel / pointsNeededForLevel) * 100;

    return {
      current: pointsInCurrentLevel,
      needed: pointsNeededForLevel,
      percentage: Math.min(percentage, 100),
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userStats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  const progress = getProgressToNextLevel();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.email?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.levelText}>Level {userStats.level}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.deals_posted}</Text>
          <Text style={styles.statLabel}>Deals Posted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.total_upvotes_received}</Text>
          <Text style={styles.statLabel}>Upvotes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${userStats.total_deals_value.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Savings Shared</Text>
        </View>
      </View>

      {/* Level Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <Text style={styles.progressText}>
            {progress.needed > 0 ? `${progress.current}/${progress.needed}` : 'Max Level!'}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
        </View>
        {progress.needed > 0 && (
          <Text style={styles.progressSubtext}>
            {progress.needed - progress.current} points to Level {userStats.level + 1}
          </Text>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementUnlocked,
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={[
                styles.achievementName,
                !achievement.unlocked && styles.achievementLocked,
              ]}>
                {achievement.name}
              </Text>
              <Text style={[
                styles.achievementDescription,
                !achievement.unlocked && styles.achievementLocked,
              ]}>
                {achievement.description}
              </Text>
              {achievement.unlocked && (
                <View style={styles.achievementPoints}>
                  <Text style={styles.achievementPointsText}>
                    +{achievement.points_reward} pts
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    fontSize: theme.fontSize.md,
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.destructive,
    fontSize: theme.fontSize.md,
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.foreground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  userInfo: {
    flex: 1,
  },
  email: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  levelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedForeground,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  progressSection: {
    marginBottom: theme.spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.foreground,
  },
  progressSubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
  achievementsSection: {
    marginBottom: theme.spacing.xl,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    opacity: 0.5,
  },
  achievementUnlocked: {
    opacity: 1,
    borderColor: theme.colors.foreground,
  },
  achievementIcon: {
    fontSize: 30,
    marginBottom: theme.spacing.xs,
  },
  achievementName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementPoints: {
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  achievementPointsText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.semibold,
  },
});