import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../utils/theme';

interface PrivacyScreenProps {
  navigation: any;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Effective Date: September 17, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            SnapADeal ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. This policy complies with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable Canadian provincial privacy laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. INFORMATION WE COLLECT</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account, post a deal, or contact us. This may include:
          </Text>
          <Text style={styles.bulletPoint}>• Email address and username</Text>
          <Text style={styles.bulletPoint}>• Profile information (optional)</Text>
          <Text style={styles.bulletPoint}>• Deal submissions and user-generated content</Text>
          <Text style={styles.bulletPoint}>• Location data (with your permission)</Text>
          <Text style={styles.bulletPoint}>• Device information and usage statistics</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. HOW WE USE YOUR INFORMATION</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.bulletPoint}>• Send you deal alerts based on your preferences and location</Text>
          <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
          <Text style={styles.bulletPoint}>• Respond to your comments, questions, and requests</Text>
          <Text style={styles.bulletPoint}>• Monitor and analyze trends, usage, and activities</Text>
          <Text style={styles.bulletPoint}>• Detect, investigate, and prevent fraudulent transactions and abuse</Text>
          <Text style={styles.bulletPoint}>• Personalize and improve your experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. LOCATION INFORMATION</Text>
          <Text style={styles.paragraph}>
            With your consent, we may collect and process information about your actual location. We use various technologies to determine location, including IP address, GPS, and other sensors. You can disable location services through your device settings, but this may limit certain features of the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. SHARING OF INFORMATION</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners and trusted affiliates.
          </Text>
          <Text style={styles.paragraph}>
            We may disclose your information:
          </Text>
          <Text style={styles.bulletPoint}>• To comply with any court order, law, or legal process</Text>
          <Text style={styles.bulletPoint}>• To enforce our Terms of Service</Text>
          <Text style={styles.bulletPoint}>• If we believe disclosure is necessary to protect rights, property, or safety</Text>
          <Text style={styles.bulletPoint}>• With your consent or at your direction</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. DATA RETENTION</Text>
          <Text style={styles.paragraph}>
            We retain personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need personal information, we will securely delete or destroy it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. DATA SECURITY</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. CHILDREN'S PRIVACY</Text>
          <Text style={styles.paragraph}>
            Our App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from your child, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. YOUR PRIVACY RIGHTS</Text>
          <Text style={styles.paragraph}>
            Under Canadian privacy laws, you have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal information we hold</Text>
          <Text style={styles.bulletPoint}>• Request correction of inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Request deletion of your personal information</Text>
          <Text style={styles.bulletPoint}>• Object to or restrict certain processing</Text>
          <Text style={styles.bulletPoint}>• Data portability (receive your data in a structured format)</Text>
          <Text style={styles.bulletPoint}>• Withdraw consent at any time</Text>
          <Text style={styles.paragraph}>
            To exercise these rights, please contact us using the information below.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. COOKIES AND TRACKING</Text>
          <Text style={styles.paragraph}>
            We may use cookies and similar tracking technologies to track activity on our App and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. AFFILIATE DISCLOSURE</Text>
          <Text style={styles.paragraph}>
            SnapADeal participates in various affiliate marketing programs, which means we may earn commissions on purchases made through links in our app. We are a participant in affiliate programs including, but not limited to:
          </Text>
          <Text style={styles.bulletPoint}>• Amazon Associates Program</Text>
          <Text style={styles.bulletPoint}>• Rakuten Advertising</Text>
          <Text style={styles.bulletPoint}>• ShopStyle Collective</Text>
          <Text style={styles.bulletPoint}>• Other retail affiliate networks</Text>
          <Text style={styles.paragraph}>
            When you click on affiliate links and make a purchase, we may receive a commission at no additional cost to you. These affiliate relationships do not influence our deal selection or recommendations - we only share deals we believe are valuable to our community.
          </Text>
          <Text style={styles.paragraph}>
            When you leave our app through an affiliate link, cookies may be placed on your device by our affiliate partners to track your purchase and attribute the commission. These third-party cookies are governed by the respective affiliate partner's privacy policy.
          </Text>
          <Text style={styles.paragraph}>
            We are required by the Federal Trade Commission (FTC) and similar regulatory bodies to disclose these affiliate relationships. This disclosure is provided in accordance with consumer protection laws and advertising standards.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. THIRD-PARTY SERVICES</Text>
          <Text style={styles.paragraph}>
            Our App may contain links to third-party websites or services that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. INTERNATIONAL DATA TRANSFERS</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and maintained on computers located outside of your province, territory, or country where the data protection laws may differ. Your consent to this Privacy Policy represents your agreement to such transfers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. CHANGES TO THIS PRIVACY POLICY</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to review this Privacy Policy periodically for any changes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. PRIVACY OFFICER</Text>
          <Text style={styles.paragraph}>
            We have designated a Privacy Officer who is responsible for compliance with this Privacy Policy and Canadian privacy laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. CONTACT US</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            SnapADeal Privacy Officer{'\n'}
            Toronto, Ontario, Canada{'\n'}
            privacy@finderskeepers.app{'\n'}
            1-888-DEALS-CA
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. COMPLAINTS</Text>
          <Text style={styles.paragraph}>
            If you have a complaint about our privacy practices, please contact our Privacy Officer first. If you are not satisfied with our response, you have the right to lodge a complaint with the Privacy Commissioner of Canada or your provincial privacy commissioner.
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