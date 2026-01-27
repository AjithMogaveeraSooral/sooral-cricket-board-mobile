import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPLProvider } from './src/contexts/SPLContext';
import HomeScreen from './src/screens/HomeScreen';
import TournamentsScreen from './src/screens/TournamentsScreen';
import PlayerStatsScreen from './src/screens/PlayerStatsScreen';
import ForceUpdateModal from './src/components/ForceUpdateModal';
import { checkForUpdate } from './src/services/versionCheck';
import colors, { gradients } from './src/constants/colors';

const Tab = createBottomTabNavigator();

// Custom header component with safe area support
const CustomHeader = ({ title, icon }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <LinearGradient
      colors={gradients.header}
      style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SPL</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>Sooral Premier League</Text>
          </View>
        </View>
        <View style={styles.headerIconContainer}>
          <Ionicons name={icon} size={24} color={colors.accent} />
        </View>
      </View>
    </LinearGradient>
  );
};

// Custom tab bar icon with animation effect
const TabIcon = ({ focused, iconName, color }) => (
  <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
    <Ionicons name={iconName} size={24} color={color} />
    {focused && <View style={styles.tabIndicator} />}
  </View>
);

// Main navigator component that uses safe area insets for bottom tabs
const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tournaments') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Player Stats') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <TabIcon focused={focused} iconName={iconName} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 60 + Math.max(insets.bottom, 8),
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: true,
        header: () => {
          let icon;
          if (route.name === 'Home') icon = 'home';
          else if (route.name === 'Tournaments') icon = 'trophy';
          else if (route.name === 'Player Stats') icon = 'people';
          return <CustomHeader title={route.name === 'Player Stats' ? 'Players' : route.name} icon={icon} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen}
      />
      <Tab.Screen 
        name="Player Stats" 
        component={PlayerStatsScreen}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [updateInfo, setUpdateInfo] = useState({
    updateRequired: false,
    currentVersion: '',
    latestVersion: '',
  });

  useEffect(() => {
    // Check for updates on app launch
    const checkUpdate = async () => {
      try {
        const result = await checkForUpdate();
        setUpdateInfo(result);
      } catch (error) {
        console.error('Error checking for update:', error);
      }
    };

    checkUpdate();

    // Re-check when app comes to foreground (user might have updated)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkUpdate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SPLProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <MainNavigator />
          <ForceUpdateModal
            visible={updateInfo.updateRequired}
            currentVersion={updateInfo.currentVersion}
            latestVersion={updateInfo.latestVersion}
          />
        </NavigationContainer>
      </SPLProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
});
