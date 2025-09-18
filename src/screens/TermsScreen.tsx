import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../utils/theme';

interface TermsScreenProps {
  navigation: any;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: September 17, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. ACCEPTANCE OF TERMS</Text>
          <Text style={styles.paragraph}>
            By accessing and using FindersKeepers ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. These terms apply to all users of the App, including without limitation users who are browsers, customers, merchants, and/or contributors of content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. USE LICENSE</Text>
          <Text style={styles.paragraph}>
            Permission is granted to temporarily download one copy of the App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
          <Text style={styles.bulletPoint}>• Use the materials for any commercial purpose or for any public display</Text>
          <Text style={styles.bulletPoint}>• Attempt to reverse engineer any software contained in the App</Text>
          <Text style={styles.bulletPoint}>• Remove any copyright or other proprietary notations from the materials</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. USER CONTENT</Text>
          <Text style={styles.paragraph}>
            Users may post deals, reviews, comments, and other content ("User Content") so long as the content is not illegal, obscene, threatening, defamatory, invasive of privacy, infringing of intellectual property rights, or otherwise injurious to third parties or objectionable, and does not consist of or contain software viruses, political campaigning, commercial solicitation, chain letters, mass mailings, or any form of "spam."
          </Text>
          <Text style={styles.paragraph}>
            You grant FindersKeepers a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout Canada and the world in any media.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PRIVACY AND PERSONAL INFORMATION</Text>
          <Text style={styles.paragraph}>
            Your use of FindersKeepers is also governed by our Privacy Policy. By using the App, you consent to the collection and use of your personal information as outlined in the Privacy Policy, in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. PROHIBITED USES</Text>
          <Text style={styles.paragraph}>
            In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the App or its content:
          </Text>
          <Text style={styles.bulletPoint}>• For any unlawful purpose or to solicit others to perform or participate in any unlawful acts</Text>
          <Text style={styles.bulletPoint}>• To violate any international, federal, provincial, or local regulations, rules, laws, or local ordinances</Text>
          <Text style={styles.bulletPoint}>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</Text>
          <Text style={styles.bulletPoint}>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</Text>
          <Text style={styles.bulletPoint}>• To submit false or misleading information</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. DISCLAIMERS</Text>
          <Text style={styles.paragraph}>
            The information on FindersKeepers is provided on an "as is" basis. To the fullest extent permitted by law, this App:
          </Text>
          <Text style={styles.bulletPoint}>• Excludes all representations and warranties relating to this App and its contents</Text>
          <Text style={styles.bulletPoint}>• Excludes all liability for damages arising out of or in connection with your use of this App</Text>
          <Text style={styles.paragraph}>
            The deals and offers presented on this App are submitted by users and third parties. FindersKeepers does not guarantee the accuracy, completeness, or availability of any deal or offer.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. LIMITATION OF LIABILITY</Text>
          <Text style={styles.paragraph}>
            In no event shall FindersKeepers, nor any of its officers, directors, and employees, be liable to you for anything arising out of or in any way connected with your use of this App, whether such liability is under contract, tort or otherwise, and FindersKeepers, including its officers, directors, and employees shall not be liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. INDEMNIFICATION</Text>
          <Text style={styles.paragraph}>
            You hereby indemnify to the fullest extent FindersKeepers from and against any and all liabilities, costs, demands, causes of action, damages, and expenses (including reasonable attorney's fees) arising out of or in any way related to your breach of any of the provisions of these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. TERMINATION</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and bar access to the App immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. GOVERNING LAW</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. CHANGES TO TERMS</Text>
          <Text style={styles.paragraph}>
            FindersKeepers reserves the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. CONTACT INFORMATION</Text>
          <Text style={styles.paragraph}>
            Questions about the Terms of Service should be sent to us at:
          </Text>
          <Text style={styles.paragraph}>
            FindersKeepers{'\n'}
            Toronto, Ontario, Canada{'\n'}
            legal@finderskeepers.app
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  backButtonText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  lastUpdated: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  paragraph: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  bulletPoint: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    lineHeight: 22,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  bottomPadding: {
    height: theme.spacing.xl * 2,
  },
});