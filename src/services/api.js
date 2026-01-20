// API Service for fetching SPL data
// Live data URL from GitHub Pages
const LIVE_DATA_URL = 'https://ajithmogaveerasooral.github.io/spl-sooral-cricket-board/data/spl_data.json';

// Fallback to local data
import localData from '../data/spl_data.json';

export const fetchSPLData = async () => {
    try {
        // Try to fetch live data from the website
        const response = await fetch(LIVE_DATA_URL, {
            headers: {
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Loaded live data from GitHub Pages');
        return data;
    } catch (error) {
        console.warn('⚠️ Could not fetch live data, using local fallback:', error.message);
        return localData;
    }
};
