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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CameraService, ImageResult } from '../services/camera';
import { theme } from '../utils/theme';
import { supabase } from '../services/supabase';
import { gamificationService } from '../services/gamification';
import { DEAL_CATEGORIES, getAllStoreNames } from '../data/canadianData';

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

  const categories = DEAL_CATEGORIES;
  const majorStores = getAllStoreNames();

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

  const handleSubmit = async () => {
    if (!title || !store) {
      Alert.alert('Error', 'Please fill in at least the title and store');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'You must be signed in to submit a deal');
        return;
      }

      const priceNum = price ? parseFloat(price) : null;
      const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
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
        image_url: imageUri || null,
        submitted_by: user.id,
        is_active: true,
      };

      const { error } = await supabase
        .from('deals')
        .insert([dealData]);

      if (error) {
        Alert.alert('Error', 'Failed to submit deal: ' + error.message);
      } else {
        // Award points for posting deal
        const dealValue = originalPriceNum && priceNum ? originalPriceNum - priceNum : 0;
        await gamificationService.awardDealPostPoints(user.id, dealValue);

        Alert.alert(
          'Success!',
          'Your deal has been submitted successfully! Points awarded!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
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
          <Text style={styles.title}>Share a Deal</Text>
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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={store}
                onValueChange={(itemValue) => setStore(itemValue)}
                style={styles.picker}
                dropdownIconColor={theme.colors.foreground}
                mode="dropdown"
              >
                <Picker.Item label="Select a store..." value="" />
                {majorStores.map((storeName) => (
                  <Picker.Item key={storeName} label={storeName} value={storeName} />
                ))}
                <Picker.Item label="Other (please specify below)" value="other" />
              </Picker>
            </View>
            {store === 'other' && (
              <TextInput
                style={[styles.input, { marginTop: theme.spacing.sm }]}
                placeholder="Enter store name"
                value={store === 'other' ? '' : store}
                onChangeText={setStore}
                placeholderTextColor={theme.colors.mutedForeground}
              />
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
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.input,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: theme.colors.foreground,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
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
    borderRadius: theme.borderRadius.md,
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
  submitButton: {
    backgroundColor: theme.colors.foreground,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.foreground,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
});