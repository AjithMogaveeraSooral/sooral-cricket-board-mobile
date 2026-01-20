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

const TournamentsScreen = () => {
    const { tournaments, loading, error, refreshData } = useSPL();
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const tournamentNames = useMemo(() => {
        if (!tournaments || tournaments.length === 0) return [];
        return tournaments.map(t => t.name);
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
        paddingHorizontal: 16,
        marginBottom: 8,
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
});

export default TournamentsScreen;
