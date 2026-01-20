// API Service for fetching SPL data
// Live data URL from GitHub Pages
const LIVE_DATA_URL = 'https://ajithmogaveerasooral.github.io/spl-sooral-cricket-board/data/spl_data.json';

// Fallback to local data
import localData from '../data/spl_data.json';

// Fetch with timeout to prevent hanging
const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};

export const fetchSPLData = async () => {
    try {
        // Try to fetch live data from the website with timeout
        const response = await fetchWithTimeout(LIVE_DATA_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
            },
        }, 10000);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Loaded live data from GitHub Pages');
        return data;
    } catch (error) {
        console.warn('⚠️ Could not fetch live data, using local fallback:', error.message);
        // Always return local data on error - this ensures the app works offline
        return localData;
    }
};
