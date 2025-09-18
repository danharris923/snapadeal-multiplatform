import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { User } from '../types';
import { theme } from '../utils/theme';

interface SimpleUserProfileProps {
  user: User;
}

export const SimpleUserProfile: React.FC<SimpleUserProfileProps> = ({ user }) => {
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
          <Text style={styles.levelText}>Level 1</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Deals Posted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Upvotes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>$0</Text>
          <Text style={styles.statLabel}>Savings Shared</Text>
        </View>
      </View>

      {/* Simple message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Profile loading... Start posting deals to earn points and level up!
        </Text>
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
  messageContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    textAlign: 'center',
    lineHeight: 22,
  },
});