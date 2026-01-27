import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuration - Update these values as needed
const CONFIG = {
  // Your backend API endpoint that returns minimum required version
  // You can use Firebase Remote Config, your own API, or a simple JSON file hosted somewhere
  VERSION_CHECK_URL: 'https://your-api.com/api/app-version', // Replace with your actual endpoint
  
  // Fallback minimum version if API fails (update this when you release new mandatory versions)
  FALLBACK_MIN_VERSION: '1.0.0',
  
  // Enable/disable force update feature
  ENABLED: true,
  
  // Cache duration in milliseconds (check every 1 hour)
  CACHE_DURATION: 60 * 60 * 1000,
};

let lastCheckTime = 0;
let cachedResult = null;

/**
 * Compare two semantic version strings
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export const compareVersions = (v1, v2) => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  const maxLength = Math.max(parts1.length, parts2.length);
  
  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  
  return 0;
};

/**
 * Get the current app version
 */
export const getCurrentVersion = () => {
  // Try to get version from different sources
  const nativeVersion = Application.nativeApplicationVersion;
  const expoVersion = Constants.expoConfig?.version;
  
  return nativeVersion || expoVersion || '1.0.0';
};

/**
 * Get the current build number
 */
export const getCurrentBuildNumber = () => {
  const nativeBuild = Application.nativeBuildVersion;
  return nativeBuild || '1';
};

/**
 * Fetch minimum required version from your backend
 * 
 * Expected API response format:
 * {
 *   "minVersion": "1.2.0",
 *   "latestVersion": "1.3.0",
 *   "forceUpdate": true,
 *   "message": "Please update to get the latest features"
 * }
 */
export const fetchMinimumVersion = async () => {
  try {
    const response = await fetch(CONFIG.VERSION_CHECK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': getCurrentVersion(),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch version info');
    }
    
    const data = await response.json();
    return {
      minVersion: data.minVersion || CONFIG.FALLBACK_MIN_VERSION,
      latestVersion: data.latestVersion || data.minVersion || CONFIG.FALLBACK_MIN_VERSION,
      forceUpdate: data.forceUpdate !== false,
      message: data.message || null,
    };
  } catch (error) {
    console.log('Version check API error, using fallback:', error.message);
    // Return fallback values if API fails
    return {
      minVersion: CONFIG.FALLBACK_MIN_VERSION,
      latestVersion: CONFIG.FALLBACK_MIN_VERSION,
      forceUpdate: false,
      message: null,
    };
  }
};

/**
 * Check if an update is required
 * Returns an object with update status and version info
 */
export const checkForUpdate = async (forceCheck = false) => {
  if (!CONFIG.ENABLED) {
    return { updateRequired: false };
  }
  
  const now = Date.now();
  
  // Return cached result if within cache duration
  if (!forceCheck && cachedResult && (now - lastCheckTime) < CONFIG.CACHE_DURATION) {
    return cachedResult;
  }
  
  try {
    const currentVersion = getCurrentVersion();
    const versionInfo = await fetchMinimumVersion();
    
    const isOutdated = compareVersions(currentVersion, versionInfo.minVersion) < 0;
    
    const result = {
      updateRequired: isOutdated && versionInfo.forceUpdate,
      currentVersion,
      minVersion: versionInfo.minVersion,
      latestVersion: versionInfo.latestVersion,
      message: versionInfo.message,
    };
    
    // Cache the result
    cachedResult = result;
    lastCheckTime = now;
    
    return result;
  } catch (error) {
    console.error('Error checking for update:', error);
    return { updateRequired: false };
  }
};

/**
 * For testing purposes - simulate an update being required
 * Call this in development to test the force update modal
 */
export const simulateUpdateRequired = () => {
  return {
    updateRequired: true,
    currentVersion: '1.0.0',
    minVersion: '2.0.0',
    latestVersion: '2.0.0',
    message: 'This is a simulated update requirement for testing.',
  };
};

export default {
  checkForUpdate,
  getCurrentVersion,
  getCurrentBuildNumber,
  compareVersions,
  simulateUpdateRequired,
};
