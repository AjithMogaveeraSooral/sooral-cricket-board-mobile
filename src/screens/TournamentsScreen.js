import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    RefreshControl, 
    StyleSheet, 
    ActivityIndicator,
    TouchableOpacity,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSPL } from '../contexts/SPLContext';
import MatchCard from '../components/MatchCard';
import ScorecardModal from '../components/ScorecardModal';
import colors, { gradients } from '../constants/colors';

const TournamentChip = ({ name, isSelected, onPress, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            delay: index * 50,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    }, []);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                {isSelected ? (
                    <LinearGradient
                        colors={gradients.accent}
                        style={styles.tournamentButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="trophy" size={14} color={colors.primaryDark} />
                        <Text style={styles.tournamentButtonTextActive}>{name}</Text>
                    </LinearGradient>
                ) : (
                    <View style={[styles.tournamentButton, styles.tournamentButtonInactive]}>
                        <Text style={styles.tournamentButtonText}>{name}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const StatCard = ({ icon, label, value, subtext, color = colors.accent }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </View>
);

const TournamentsScreen = () => {
    const { tournaments, loading, error, refreshData } = useSPL();
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const tournamentNames = useMemo(() => {
        if (!tournaments || tournaments.length === 0) return [];
        return tournaments.map(t => t.name).reverse();
    }, [tournaments]);

    useEffect(() => {
        if (tournamentNames.length > 0 && !selectedTournament) {
            setSelectedTournament(tournamentNames[0]);
        }
    }, [tournamentNames, selectedTournament]);

    const matches = useMemo(() => {
        if (!tournaments || !selectedTournament) return [];
        const tournament = tournaments.find(t => t.name === selectedTournament);
        return tournament?.matches || [];
    }, [tournaments, selectedTournament]);

    // Calculate season statistics
    const seasonStats = useMemo(() => {
        if (!matches || matches.length === 0) return null;

        let totalRuns = 0;
        let totalWickets = 0;
        let totalSixes = 0;
        let totalFours = 0;
        let highestScore = { runs: 0, player: '', match: '' };
        let bestBowling = { wickets: 0, runs: 999, player: '', match: '' };
        const playerRuns = {};
        const playerWickets = {};

        matches.forEach(match => {
            const scorecard = match.detailed_scorecard;
            if (!scorecard) return;

            ['innings1', 'innings2'].forEach(inningsKey => {
                const innings = scorecard[inningsKey];
                if (!innings) return;

                // Batting stats
                (innings.batting_stats || []).forEach(batter => {
                    const runs = batter.runs || 0;
                    const fours = batter.fours || 0;
                    const sixes = batter.sixes || 0;

                    totalRuns += runs;
                    totalFours += fours;
                    totalSixes += sixes;

                    // Track player runs
                    playerRuns[batter.name] = (playerRuns[batter.name] || 0) + runs;

                    // Check for highest score
                    if (runs > highestScore.runs) {
                        highestScore = { runs, player: batter.name, match: match.teams?.join(' vs ') || '' };
                    }
                });

                // Bowling stats
                (innings.bowling_stats || []).forEach(bowler => {
                    const wickets = bowler.wickets || 0;
                    const runs = bowler.runs || 0;

                    totalWickets += wickets;

                    // Track player wickets
                    playerWickets[bowler.name] = (playerWickets[bowler.name] || 0) + wickets;

                    // Check for best bowling
                    if (wickets > bestBowling.wickets || 
                        (wickets === bestBowling.wickets && runs < bestBowling.runs)) {
                        bestBowling = { wickets, runs, player: bowler.name, match: match.teams?.join(' vs ') || '' };
                    }
                });
            });
        });

        // Find top scorer and top wicket taker
        const topScorer = Object.entries(playerRuns).sort((a, b) => b[1] - a[1])[0];
        const topWicketTaker = Object.entries(playerWickets).sort((a, b) => b[1] - a[1])[0];

        return {
            totalRuns,
            totalWickets,
            totalSixes,
            totalFours,
            highestScore,
            bestBowling,
            topScorer: topScorer ? { name: topScorer[0], runs: topScorer[1] } : null,
            topWicketTaker: topWicketTaker ? { name: topWicketTaker[0], wickets: topWicketTaker[1] } : null,
        };
    }, [matches]);

    const handleMatchPress = (match) => {
        setSelectedMatch(match);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedMatch(null);
    };

    if (loading && !tournaments) {
        return (
            <LinearGradient colors={gradients.primary} style={styles.centered}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading Tournaments...</Text>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={gradients.primary} style={styles.centered}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text style={styles.errorText}>Error: {error}</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={gradients.primary} style={styles.container}>
            {/* Tournament Selector */}
            <View style={styles.selectorContainer}>
                <View style={styles.selectorHeader}>
                    <Ionicons name="list" size={18} color={colors.accent} />
                    <Text style={styles.selectorLabel}>Select Tournament</Text>
                </View>
                <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectorScroll}
                >
                    {tournamentNames.map((name, index) => (
                        <TournamentChip
                            key={index}
                            name={name}
                            isSelected={selectedTournament === name}
                            onPress={() => setSelectedTournament(name)}
                            index={index}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Matches List */}
            <ScrollView
                style={styles.matchesList}
                contentContainerStyle={styles.matchesContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={!!loading}
                        onRefresh={refreshData}
                        tintColor={colors.accent}
                        colors={[colors.accent]}
                    />
                }
            >
                {/* Season Stats */}
                {seasonStats && (
                    <View style={styles.seasonStatsContainer}>
                        <View style={styles.statsHeader}>
                            <Ionicons name="stats-chart" size={18} color={colors.accent} />
                            <Text style={styles.statsHeaderText}>Season Statistics</Text>
                        </View>
                        
                        {/* Stats Grid */}
                        <View style={styles.statsGrid}>
                            <StatCard 
                                icon="trending-up-outline" 
                                label="Total Runs" 
                                value={seasonStats.totalRuns}
                                color="#4CAF50"
                            />
                            <StatCard 
                                icon="flame-outline" 
                                label="Total Wickets" 
                                value={seasonStats.totalWickets}
                                color="#FF5722"
                            />
                            <StatCard 
                                icon="rocket-outline" 
                                label="Total Sixes" 
                                value={seasonStats.totalSixes}
                                color="#9C27B0"
                            />
                            <StatCard 
                                icon="flash-outline" 
                                label="Total Fours" 
                                value={seasonStats.totalFours}
                                color="#2196F3"
                            />
                        </View>

                        {/* Top Performers */}
                        <View style={styles.topPerformersContainer}>
                            <LinearGradient
                                colors={gradients.card}
                                style={styles.topPerformerCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.topPerformerIcon}>
                                    <Ionicons name="trophy" size={20} color="#FFD700" />
                                </View>
                                <View style={styles.topPerformerInfo}>
                                    <Text style={styles.topPerformerLabel}>Highest Score</Text>
                                    <Text style={styles.topPerformerValue}>{seasonStats.highestScore.runs} runs</Text>
                                    <Text style={styles.topPerformerName}>{seasonStats.highestScore.player}</Text>
                                </View>
                            </LinearGradient>

                            <LinearGradient
                                colors={gradients.card}
                                style={styles.topPerformerCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={[styles.topPerformerIcon, { backgroundColor: '#FF572220' }]}>
                                    <Ionicons name="fitness" size={20} color="#FF5722" />
                                </View>
                                <View style={styles.topPerformerInfo}>
                                    <Text style={styles.topPerformerLabel}>Best Bowling</Text>
                                    <Text style={styles.topPerformerValue}>{seasonStats.bestBowling.wickets}/{seasonStats.bestBowling.runs}</Text>
                                    <Text style={styles.topPerformerName}>{seasonStats.bestBowling.player}</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Season Leaders */}
                        <View style={styles.seasonLeadersContainer}>
                            {seasonStats.topScorer && (
                                <View style={styles.seasonLeaderCard}>
                                    <Ionicons name="baseball-outline" size={16} color="#4CAF50" />
                                    <View style={styles.seasonLeaderInfo}>
                                        <Text style={styles.seasonLeaderLabel}>Top Scorer</Text>
                                        <Text style={styles.seasonLeaderName}>{seasonStats.topScorer.name}</Text>
                                        <Text style={styles.seasonLeaderValue}>{seasonStats.topScorer.runs} runs</Text>
                                    </View>
                                </View>
                            )}
                            {seasonStats.topWicketTaker && (
                                <View style={styles.seasonLeaderCard}>
                                    <Ionicons name="flame" size={16} color="#FF5722" />
                                    <View style={styles.seasonLeaderInfo}>
                                        <Text style={styles.seasonLeaderLabel}>Top Wicket Taker</Text>
                                        <Text style={styles.seasonLeaderName}>{seasonStats.topWicketTaker.name}</Text>
                                        <Text style={styles.seasonLeaderValue}>{seasonStats.topWicketTaker.wickets} wickets</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Match Count Badge */}
                <View style={styles.matchCountContainer}>
                    <LinearGradient
                        colors={gradients.card}
                        style={styles.matchCountBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="calendar" size={16} color={colors.accent} />
                        <Text style={styles.matchCount}>
                            {matches.length} Match{matches.length !== 1 ? 'es' : ''}
                        </Text>
                    </LinearGradient>
                </View>

                {matches.length === 0 ? (
                    <View style={styles.noMatches}>
                        <Ionicons name="baseball-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.noMatchesText}>No matches found</Text>
                        <Text style={styles.noMatchesSubtext}>Select a different tournament</Text>
                    </View>
                ) : (
                    matches.map((match, index) => (
                        <MatchCard 
                            key={match.match_id || index} 
                            match={match} 
                            onPress={() => handleMatchPress(match)}
                            delay={index * 80}
                        />
                    ))
                )}
                <View style={styles.bottomPadding} />
            </ScrollView>

            <ScorecardModal
                visible={modalVisible}
                match={selectedMatch}
                onClose={handleCloseModal}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginTop: 12,
    },
    selectorContainer: {
        padding: 16,
        paddingBottom: 12,
    },
    selectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    selectorLabel: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '600',
    },
    selectorScroll: {
        paddingBottom: 4,
        gap: 10,
    },
    tournamentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    tournamentButtonInactive: {
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    tournamentButtonText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    tournamentButtonTextActive: {
        fontSize: 13,
        color: colors.primaryDark,
        fontWeight: '700',
    },
    matchCountContainer: {
        marginBottom: 12,
    },
    matchCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    matchCount: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    matchesList: {
        flex: 1,
    },
    matchesContent: {
        padding: 16,
        paddingTop: 8,
    },
    noMatches: {
        padding: 40,
        alignItems: 'center',
    },
    noMatchesText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 12,
        fontWeight: '500',
    },
    noMatchesSubtext: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 4,
    },
    bottomPadding: {
        height: 30,
    },
    // Season Stats Styles
    seasonStatsContainer: {
        marginBottom: 16,
    },
    statsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    statsHeaderText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    statLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    statSubtext: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: 2,
    },
    topPerformersContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    topPerformerCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
        gap: 10,
    },
    topPerformerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFD70020',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topPerformerInfo: {
        flex: 1,
    },
    topPerformerLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    topPerformerValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginTop: 2,
    },
    topPerformerName: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 1,
    },
    seasonLeadersContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    seasonLeaderCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
        gap: 10,
    },
    seasonLeaderInfo: {
        flex: 1,
    },
    seasonLeaderLabel: {
        fontSize: 9,
        color: colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    seasonLeaderName: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
        marginTop: 2,
    },
    seasonLeaderValue: {
        fontSize: 11,
        color: colors.accent,
        fontWeight: '500',
        marginTop: 1,
    },
});

export default TournamentsScreen;
