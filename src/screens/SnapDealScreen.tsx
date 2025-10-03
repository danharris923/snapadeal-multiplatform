import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CameraService, ImageResult } from '../services/camera';
import { theme } from '../utils/theme';
import { supabase } from '../services/supabase';
import { gamificationService } from '../services/gamification';
import { contentModerationService } from '../services/contentModeration';
import { DEAL_CATEGORIES, getAllStoreNames } from '../data/canadianData';
import RNFS from 'react-native-fs';

interface SnapDealScreenProps {
  navigation: any;
}

export const SnapDealScreen: React.FC<SnapDealScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [store, setStore] = useState('');
  const [category, setCategory] = useState('');
  const [dealUrl, setDealUrl] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeSuggestions, setStoreSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = DEAL_CATEGORIES;
  const majorStores = getAllStoreNames();

  const handleStoreInputChange = (text: string) => {
    setStore(text);
    if (text.length > 0) {
      const filtered = majorStores.filter(storeName =>
        storeName.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setStoreSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectStoreSuggestion = (storeName: string) => {
    setStore(storeName);
    setShowSuggestions(false);
  };

  const handleImagePicker = async () => {
    try {
      const result = await CameraService.showImagePicker();
      if (result) {
        setImageUri(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadImageToSupabase = async (localUri: string, userId: string): Promise<string | null> => {
    try {
      const fileExt = localUri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Read file as base64 using react-native-fs
      const fileBase64 = await RNFS.readFile(localUri, 'base64');

      // Convert base64 to Uint8Array
      const binaryString = atob(fileBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { data, error } = await supabase.storage
        .from('deal-images')
        .upload(filePath, bytes, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (error) {
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('deal-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title || !store) {
      Alert.alert('Error', 'Please fill in the title and store');
      return;
    }

    // Require either price or discount percentage
    const priceNum = price ? parseFloat(price) : null;
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
    const hasDiscount = originalPriceNum && priceNum && originalPriceNum > priceNum;

    if (!priceNum && !hasDiscount) {
      Alert.alert('Error', 'Please enter either a sale price or both original and sale prices to show a discount');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'You must be signed in to submit a deal');
        setIsSubmitting(false);
        return;
      }

      // Get user reputation for rate limiting
      const userStats = await gamificationService.getUserStats(user.id);
      const userReputation = userStats?.points || 0;

      // Validate submission (rate limiting, spam check, etc.)
      const validation = await contentModerationService.validateDealSubmission(
        user.id,
        title,
        description,
        dealUrl,
        userReputation
      );

      if (!validation.allowed) {
        Alert.alert('Unable to Submit', validation.message || 'Please try again later');
        setIsSubmitting(false);
        return;
      }

      // Upload image to Supabase storage if present
      let uploadedImageUrl = null;
      if (imageUri) {
        uploadedImageUrl = await uploadImageToSupabase(imageUri, user.id);
        if (!uploadedImageUrl) {
          Alert.alert('Warning', 'Failed to upload image, but deal will be submitted without it');
        }
      }

      const discountPercentage =
        priceNum && originalPriceNum && originalPriceNum > priceNum
          ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
          : null;

      const dealData = {
        title,
        description: description || null,
        price: priceNum,
        original_price: originalPriceNum,
        discount_percentage: discountPercentage,
        store,
        category: category || null,
        deal_url: dealUrl || null,
        image_url: uploadedImageUrl || null,
        submitted_by: user.id,
        is_active: true,
      };

      const { error } = await supabase
        .from('deals')
        .insert([dealData]);

      if (error) {
        console.error('Error submitting deal:', error);
        Alert.alert('Error', 'Failed to submit deal: ' + error.message);
      } else {
        // Record post for rate limiting
        await contentModerationService.recordPost(user.id);

        // Award points for posting deal
        const dealValue = originalPriceNum && priceNum ? originalPriceNum - priceNum : 0;
        try {
          await gamificationService.awardDealPostPoints(user.id, dealValue);
          console.log(`✅ Points awarded to user ${user.id} for deal value $${dealValue}`);
        } catch (pointsError) {
          console.error('Error awarding points (non-critical):', pointsError);
          // Don't block the success flow if points fail
        }

        Alert.alert(
          'Success!',
          'Your deal has been submitted successfully! Points awarded!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Unexpected error during deal submission:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SnapADeal</Text>
          <Text style={styles.subtitle}>Help others find great deals</Text>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.label}>Deal Photo</Text>
          <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageButtonText}>Add Photo</Text>
                <Text style={styles.imageHelpText}>Tap to select an image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deal Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50% off Premium Coffee Beans"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={theme.colors.mutedForeground}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store *</Text>
            <TextInput
              style={styles.input}
              placeholder="Start typing store name..."
              value={store}
              onChangeText={handleStoreInputChange}
              onFocus={() => {
                if (store.length > 0) {
                  const filtered = majorStores.filter(storeName =>
                    storeName.toLowerCase().includes(store.toLowerCase())
                  ).slice(0, 5);
                  setStoreSuggestions(filtered);
                  setShowSuggestions(filtered.length > 0);
                }
              }}
              placeholderTextColor={theme.colors.mutedForeground}
            />
            {showSuggestions && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={storeSuggestions}
                  keyExtractor={(item) => item}
                  style={styles.suggestionsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectStoreSuggestion(item)}
                    >
                      <Text style={styles.suggestionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
              <Text style={styles.label}>Sale Price</Text>
              <TextInput
                style={styles.input}
                placeholder="9.99"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.mutedForeground}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: theme.spacing.sm }]}>
              <Text style={styles.label}>Original Price</Text>
              <TextInput
                style={styles.input}
                placeholder="19.99"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.mutedForeground}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor={theme.colors.foreground}
                mode="dropdown"
              >
                <Picker.Item label="Select a category..." value="" />
                {categories.map((categoryName) => (
                  <Picker.Item key={categoryName} label={categoryName} value={categoryName} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us more about this deal..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={theme.colors.mutedForeground}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deal URL (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://store.com/deal"
              value={dealUrl}
              onChangeText={setDealUrl}
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.mutedForeground}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Deal'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  photoSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedForeground,
  },
  form: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.input,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.input,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: theme.colors.foreground,
    backgroundColor: 'transparent',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.input,
  },
  imagePlaceholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.input,
  },
  imageButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  imageHelpText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  suggestionsContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.borderRadius.sm,
    borderBottomRightRadius: theme.borderRadius.sm,
    ...theme.shadows.md,
  },
  suggestionItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
});