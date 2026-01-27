import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors, { gradients } from '../constants/colors';

// Replace with your actual Play Store package name
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ajithms98.sooralcricketboardmobile';
const APP_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID'; // Replace with your App Store ID if needed

const ForceUpdateModal = ({ visible, currentVersion, latestVersion }) => {
  const handleUpdate = async () => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    
    try {
      const canOpen = await Linking.canOpenURL(storeUrl);
      if (canOpen) {
        await Linking.openURL(storeUrl);
      }
    } catch (error) {
      console.error('Error opening store:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={gradients.header}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-download" size={48} color={colors.accent} />
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>Update Required</Text>
            <Text style={styles.message}>
              A new version of SPL is available. Please update to continue using the app.
            </Text>

            <View style={styles.versionContainer}>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Current Version:</Text>
                <Text style={styles.versionValue}>{currentVersion || '1.0.0'}</Text>
              </View>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Latest Version:</Text>
                <Text style={[styles.versionValue, styles.latestVersion]}>
                  {latestVersion || '2.0.0'}
                </Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What's New:</Text>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.featureText}>Bug fixes and improvements</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.featureText}>Enhanced performance</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.featureText}>New features added</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <LinearGradient
                colors={[colors.accent, colors.accentDark || '#D4A84B']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="download" size={20} color={colors.primaryDark} />
                <Text style={styles.updateButtonText}>Update Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  versionContainer: {
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  versionLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  versionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  latestVersion: {
    color: colors.accent,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 8,
  },
});

export default ForceUpdateModal;
