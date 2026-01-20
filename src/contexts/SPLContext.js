import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSPLData } from '../services/api';
import { calculateRanksPointsBased, calculateLeader, sortPlayersByName } from '../utils/calculations';

const SPLContext = createContext();

export const useSPL = () => {
    const context = useContext(SPLContext);
    if (!context) {
        throw new Error('useSPL must be used within a SPLProvider');
    }
    return context;
};

export const SPLProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [players, setPlayers] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [rankedPlayers, setRankedPlayers] = useState([]);
    const [rankings, setRankings] = useState({
        topBatter: null,
        topBowler: null,
        topAllrounder: null,
        battingSorted: [],
        bowlingSorted: [],
        allrounderSorted: []
    });
    const [leaders, setLeaders] = useState({
        topBatter: null,
        topBowler: null,
        highestSixHitter: null
    });
    const [stats, setStats] = useState({
        totalTournaments: 0,
        totalMatches: 0,
        totalPlayers: 0
    });

    const refreshData = async () => {
        try {
            setLoading(true);
            const result = await fetchSPLData();
            
            if (result) {
                setData(result);
                setPlayers(result.players || []);
                setTournaments(result.tournaments || []);
                setAnnouncements(result.announcements || []);

                const rankingsResult = calculateRanksPointsBased(result.players || []);
                setRankings(rankingsResult);
                setRankedPlayers(sortPlayersByName(rankingsResult.rankedPlayers));

                const leadersResult = calculateLeader(rankingsResult.rankedPlayers);
                setLeaders(leadersResult);

                const totalTournaments = result.tournaments?.length || 0;
                const totalMatches = (result.tournaments || [])
                    .reduce((sum, t) => sum + (t.matches?.length || 0), 0);
                const totalPlayers = result.players?.length || 0;
                setStats({ totalTournaments, totalMatches, totalPlayers });
            }
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const value = {
        loading,
        error,
        data,
        players,
        tournaments,
        announcements,
        rankedPlayers,
        rankings,
        leaders,
        stats,
        refreshData
    };

    return (
        <SPLContext.Provider value={value}>
            {children}
        </SPLContext.Provider>
    );
};
