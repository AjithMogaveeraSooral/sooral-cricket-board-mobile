import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    RefreshControl, 
    StyleSheet, 
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSPL } from '../contexts/SPLContext';
import colors, { gradients } from '../constants/colors';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/AjithMogaveeraSooral/spl-sooral-cricket-board/main/';
const DEFAULT_IMAGE = GITHUB_RAW_BASE + 'images/default_player.jpg';

const getImageUrl = (profileImageUrl) => {
    if (!profileImageUrl) return DEFAULT_IMAGE;
    if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
        return profileImageUrl;
    }
    return GITHUB_RAW_BASE + profileImageUrl.replace(/\\/g, '/');
};

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

const CategoryChip = ({ label, icon, isSelected, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {isSelected ? (
            <LinearGradient
                colors={gradients.accent}
                style={styles.categoryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Ionicons name={icon} size={14} color={colors.primaryDark} />
                <Text style={styles.categoryButtonTextActive}>{label}</Text>
            </LinearGradient>
        ) : (
            <View style={[styles.categoryButton, styles.categoryButtonInactive]}>
                <Ionicons name={icon} size={14} color={colors.textSecondary} />
                <Text style={styles.categoryButtonText}>{label}</Text>
            </View>
        )}
    </TouchableOpacity>
);

const getMedalColors = (index) => {
    switch (index) {
        case 0: return { bg: '#FFD700', text: '#000' };
        case 1: return { bg: '#C0C0C0', text: '#000' };
        case 2: return { bg: '#CD7F32', text: '#fff' };
        default: return { bg: colors.cardBackgroundLight, text: colors.text };
    }
};

const LeaderboardRow = ({ player, index, category, delay, allPlayers }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                delay,
                useNativeDriver: true,
                tension: 100,
                friction: 10,
            }),
        ]).start();
    }, []);

    const medalColors = getMedalColors(index);
    const isTopThree = index < 3;
    
    // Find player image from allPlayers
    const playerData = allPlayers?.find(p => p.name === player.name);
    const imageUrl = getImageUrl(playerData?.profile_image_url);

    const getValue = () => {
        switch (category) {
            case 'runs': return `${player.runs} runs`;
            case 'wickets': return `${player.wickets} wkts`;
            case 'sixes': return `${player.sixes} sixes`;
            case 'fours': return `${player.fours} fours`;
            case 'highestScore': return `${player.highestScore}*`;
            case 'bestBowling': return `${player.bestWickets}/${player.bestRuns}`;
            default: return player.runs;
        }
    };

    const getSubValue = () => {
        switch (category) {
            case 'runs': return `${player.innings} inn`;
            case 'wickets': return `${player.innings} inn`;
            case 'sixes': return `${player.runs} runs`;
            case 'fours': return `${player.runs} runs`;
            case 'highestScore': return `${player.runs} total`;
            case 'bestBowling': return `${player.wickets} total`;
            default: return '';
        }
    };

    return (
        <Animated.View style={[
            styles.leaderboardRow,
            isTopThree && styles.leaderboardRowTop,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
        ]}>
            <View style={[styles.rankBadge, { backgroundColor: medalColors.bg }]}>
                <Text style={[styles.rankText, { color: medalColors.text }]}>{index + 1}</Text>
            </View>
            
            <View style={[styles.playerImageContainer, isTopThree && { borderColor: medalColors.bg }]}>
                <Image source={{ uri: imageUrl }} style={styles.playerImage} />
            </View>
            
            <View style={styles.playerInfo}>
                <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
                <Text style={styles.playerSubtext}>{getSubValue()}</Text>
            </View>
            
            <View style={styles.valueContainer}>
                <Text style={[styles.valueText, isTopThree && { color: colors.accent }]}>{getValue()}</Text>
            </View>
        </Animated.View>
    );
};

const CATEGORIES = [
    { key: 'runs', label: 'Runs', icon: 'trending-up-outline' },
    { key: 'wickets', label: 'Wickets', icon: 'flame-outline' },
    { key: 'sixes', label: 'Sixes', icon: 'rocket-outline' },
    { key: 'fours', label: 'Fours', icon: 'flash-outline' },
    { key: 'highestScore', label: 'High Score', icon: 'trophy-outline' },
    { key: 'bestBowling', label: 'Best Bowling', icon: 'fitness-outline' },
];

const TournamentLeaderboardScreen = () => {
    const { tournaments, players, loading, error, refreshData } = useSPL();
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('runs');

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

    // Calculate tournament leaderboard
    const leaderboard = useMemo(() => {
        if (!matches || matches.length === 0) return [];

        const playerStats = {};

        matches.forEach(match => {
            const scorecard = match.detailed_scorecard;
            if (!scorecard) return;

            ['innings1', 'innings2'].forEach(inningsKey => {
                const innings = scorecard[inningsKey];
                if (!innings) return;

                // Batting stats
                (innings.batting_stats || []).forEach(batter => {
                    if (!playerStats[batter.name]) {
                        playerStats[batter.name] = {
                            name: batter.name,
                            runs: 0,
                            innings: 0,
                            sixes: 0,
                            fours: 0,
                            highestScore: 0,
                            wickets: 0,
                            bowlingInnings: 0,
                            bestWickets: 0,
                            bestRuns: 999,
                        };
                    }

                    const stats = playerStats[batter.name];
                    stats.runs += batter.runs || 0;
                    stats.innings += 1;
                    stats.sixes += batter.sixes || 0;
                    stats.fours += batter.fours || 0;
                    if ((batter.runs || 0) > stats.highestScore) {
                        stats.highestScore = batter.runs || 0;
                    }
                });

                // Bowling stats
                (innings.bowling_stats || []).forEach(bowler => {
                    if (!playerStats[bowler.name]) {
                        playerStats[bowler.name] = {
                            name: bowler.name,
                            runs: 0,
                            innings: 0,
                            sixes: 0,
                            fours: 0,
                            highestScore: 0,
                            wickets: 0,
                            bowlingInnings: 0,
                            bestWickets: 0,
                            bestRuns: 999,
                        };
                    }

                    const stats = playerStats[bowler.name];
                    stats.wickets += bowler.wickets || 0;
                    stats.bowlingInnings += 1;
                    
                    const wickets = bowler.wickets || 0;
                    const runs = bowler.runs || 0;
                    if (wickets > stats.bestWickets || 
                        (wickets === stats.bestWickets && runs < stats.bestRuns)) {
                        stats.bestWickets = wickets;
                        stats.bestRuns = runs;
                    }
                });
            });
        });

        // Convert to array and sort based on category
        let sortedPlayers = Object.values(playerStats);

        switch (selectedCategory) {
            case 'runs':
                sortedPlayers = sortedPlayers.filter(p => p.runs > 0).sort((a, b) => b.runs - a.runs);
                break;
            case 'wickets':
                sortedPlayers = sortedPlayers.filter(p => p.wickets > 0).sort((a, b) => b.wickets - a.wickets);
                break;
            case 'sixes':
                sortedPlayers = sortedPlayers.filter(p => p.sixes > 0).sort((a, b) => b.sixes - a.sixes);
                break;
            case 'fours':
                sortedPlayers = sortedPlayers.filter(p => p.fours > 0).sort((a, b) => b.fours - a.fours);
                break;
            case 'highestScore':
                sortedPlayers = sortedPlayers.filter(p => p.highestScore > 0).sort((a, b) => b.highestScore - a.highestScore);
                break;
            case 'bestBowling':
                sortedPlayers = sortedPlayers.filter(p => p.bestWickets > 0).sort((a, b) => {
                    if (b.bestWickets !== a.bestWickets) return b.bestWickets - a.bestWickets;
                    return a.bestRuns - b.bestRuns;
                });
                break;
        }

        return sortedPlayers.slice(0, 20); // Top 20 players
    }, [matches, selectedCategory]);

    if (loading && !tournaments) {
        return (
            <LinearGradient colors={gradients.primary} style={styles.centered}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading Leaderboard...</Text>
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
                    <Ionicons name="trophy" size={18} color={colors.accent} />
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

            {/* Category Selector */}
            <View style={styles.categoryContainer}>
                <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {CATEGORIES.map((cat) => (
                        <CategoryChip
                            key={cat.key}
                            label={cat.label}
                            icon={cat.icon}
                            isSelected={selectedCategory === cat.key}
                            onPress={() => setSelectedCategory(cat.key)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Leaderboard List */}
            <ScrollView
                style={styles.leaderboardList}
                contentContainerStyle={styles.leaderboardContent}
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
                {leaderboard.length === 0 ? (
                    <View style={styles.noData}>
                        <Ionicons name="podium-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.noDataText}>No data available</Text>
                        <Text style={styles.noDataSubtext}>Select a different tournament</Text>
                    </View>
                ) : (
                    <>
                        {/* Header Row */}
                        <View style={styles.headerRow}>
                            <Text style={styles.headerRank}>#</Text>
                            <Text style={styles.headerPlayer}>Player</Text>
                            <Text style={styles.headerValue}>
                                {CATEGORIES.find(c => c.key === selectedCategory)?.label}
                            </Text>
                        </View>
                        
                        {leaderboard.map((player, index) => (
                            <LeaderboardRow
                                key={player.name}
                                player={player}
                                index={index}
                                category={selectedCategory}
                                delay={index * 50}
                                allPlayers={players}
                            />
                        ))}
                    </>
                )}
                <View style={styles.bottomPadding} />
            </ScrollView>
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
        paddingBottom: 8,
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
    categoryContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    categoryScroll: {
        gap: 8,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    categoryButtonInactive: {
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    categoryButtonText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    categoryButtonTextActive: {
        fontSize: 12,
        color: colors.primaryDark,
        fontWeight: '700',
    },
    leaderboardList: {
        flex: 1,
    },
    leaderboardContent: {
        padding: 16,
        paddingTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    headerRank: {
        width: 32,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
    },
    headerPlayer: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        marginLeft: 48,
    },
    headerValue: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        textAlign: 'right',
        minWidth: 70,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    leaderboardRowTop: {
        borderColor: colors.accent + '40',
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
    },
    playerImageContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.borderLight,
    },
    playerImage: {
        width: '100%',
        height: '100%',
    },
    playerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    playerName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    playerSubtext: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 2,
    },
    valueContainer: {
        minWidth: 70,
        alignItems: 'flex-end',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    noData: {
        padding: 40,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 12,
        fontWeight: '500',
    },
    noDataSubtext: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 4,
    },
    bottomPadding: {
        height: 30,
    },
});

export default TournamentLeaderboardScreen;
