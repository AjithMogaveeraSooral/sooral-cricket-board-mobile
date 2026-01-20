import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSPL } from '../contexts/SPLContext';
import LeaderCard from '../components/LeaderCard';
import Rank1Card from '../components/Rank1Card';
import RankingList from '../components/RankingList';
import colors, { gradients } from '../constants/colors';

const AnimatedStatBox = ({ value, label, icon, delay, color }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.statBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
                colors={gradients.card}
                style={styles.statBoxGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </LinearGradient>
        </Animated.View>
    );
};

const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
            <Ionicons name={icon} size={18} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

const HomeScreen = () => {
    // Use rankedPlayers (with calculated points) and rankings from context
    const { rankedPlayers, rankings, leaders, stats: contextStats, loading, error, refreshData } = useSPL();
    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const stats = useMemo(() => {
        if (!rankedPlayers || rankedPlayers.length === 0) return null;

        const totalRuns = rankedPlayers.reduce((sum, p) => sum + (parseInt(p.total_runs) || 0), 0);
        const totalWickets = rankedPlayers.reduce((sum, p) => sum + (parseInt(p.wickets) || 0), 0);
        const totalSixes = rankedPlayers.reduce((sum, p) => sum + (parseInt(p.sixes) || 0), 0);
        const totalFours = rankedPlayers.reduce((sum, p) => sum + (parseInt(p.fours) || 0), 0);

        // League Leaders - sorted by raw stats (most runs, wickets, sixes)
        const topRunScorer = leaders.topBatter;
        const topWicketTaker = leaders.topBowler;
        const topSixHitter = leaders.highestSixHitter;
        const topFourHitter = [...rankedPlayers].sort((a, b) => (b.fours || 0) - (a.fours || 0))[0];

        // Rankings - use pre-sorted arrays from context (sorted by points)
        const battingRanking = rankings.battingSorted?.filter(p => p.batting_points > 0) || [];
        const bowlingRanking = rankings.bowlingSorted?.filter(p => p.bowling_points > 0) || [];
        const allrounderRanking = rankings.allrounderSorted?.filter(p => p.allrounder_points > 0) || [];

        return {
            totalRuns,
            totalWickets,
            // Use totalMatches from context (calculated from tournaments JSON)
            totalMatches: contextStats.totalMatches || 0,
            totalSixes,
            totalFours,
            topRunScorer,
            topWicketTaker,
            topSixHitter,
            topFourHitter,
            battingRanking,
            bowlingRanking,
            allrounderRanking,
        };
    }, [rankedPlayers, rankings, leaders, contextStats]);

    if (loading && !stats) {
        return (
            <LinearGradient colors={gradients.primary} style={styles.centered}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Loading SPL Data...</Text>
                </View>
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
            <ScrollView
                contentContainerStyle={styles.content}
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
                {/* Animated Hero Header */}
                <Animated.View style={[styles.heroHeader, {
                    opacity: headerAnim,
                    transform: [{ translateY: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0]
                    })}]
                }]}>
                    <LinearGradient
                        colors={[colors.cardBackground, colors.cardGradientEnd]}
                        style={styles.heroGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.heroContent}>
                            <View style={styles.heroLogoContainer}>
                                <LinearGradient
                                    colors={gradients.accent}
                                    style={styles.heroLogo}
                                >
                                    <Text style={styles.heroLogoText}>SPL</Text>
                                </LinearGradient>
                            </View>
                            <Text style={styles.heroTitle}>Sooral Premier League</Text>
                            <Text style={styles.heroSubtitle}>🏏 Season 7 • 2025</Text>
                        </View>
                        <View style={styles.heroBorder} />
                    </LinearGradient>
                </Animated.View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <AnimatedStatBox 
                        value={stats?.totalMatches || 0} 
                        label="Matches" 
                        icon="calendar"
                        delay={100}
                        color={colors.cyan}
                    />
                    <AnimatedStatBox 
                        value={stats?.totalRuns || 0} 
                        label="Total Runs" 
                        icon="analytics"
                        delay={200}
                        color={colors.accent}
                    />
                    <AnimatedStatBox 
                        value={stats?.totalWickets || 0} 
                        label="Wickets" 
                        icon="baseball"
                        delay={300}
                        color={colors.purple}
                    />
                    <AnimatedStatBox 
                        value={stats?.totalSixes || 0} 
                        label="Sixes" 
                        icon="rocket"
                        delay={400}
                        color={colors.orange}
                    />
                </View>

                {/* League Leaders */}
                <SectionHeader title="League Leaders" icon="star" />
                <View style={styles.leadersGrid}>
                    <LeaderCard title="Most Runs" player={stats?.topRunScorer} color={colors.gold} delay={100} />
                    <LeaderCard title="Most Wickets" player={stats?.topWicketTaker} color={colors.silver} delay={200} />
                    <LeaderCard title="Most Sixes" player={stats?.topSixHitter} color={colors.orange} delay={300} />
                    <LeaderCard title="Most Fours" player={stats?.topFourHitter} color={colors.bronze} delay={400} />
                </View>

                {/* #1 Ranked Players */}
                <SectionHeader title="#1 Ranked Players" icon="medal" />
                <View style={styles.rank1Grid}>
                    <Rank1Card title="Batting" player={stats?.battingRanking?.[0]} color={colors.gold} />
                    <Rank1Card title="Bowling" player={stats?.bowlingRanking?.[0]} color={colors.silver} />
                    <Rank1Card title="Allrounder" player={stats?.allrounderRanking?.[0]} color={colors.bronze} />
                </View>

                {/* Top 5 Rankings */}
                <SectionHeader title="Top 5 Rankings" icon="podium" />
                <RankingList title="Batting Rankings" players={stats?.battingRanking} type="batting" color={colors.gold} />
                <RankingList title="Bowling Rankings" players={stats?.bowlingRanking} type="bowling" color={colors.silver} />
                <RankingList title="Allrounder Rankings" players={stats?.allrounderRanking} type="allrounder" color={colors.bronze} />

                <View style={styles.bottomPadding} />
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
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
    heroHeader: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    heroGradient: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    heroContent: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    heroLogoContainer: {
        marginBottom: 12,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    heroLogo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroLogoText: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.primaryDark,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: 1,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        color: colors.textAccent,
        marginTop: 8,
        fontWeight: '600',
    },
    heroBorder: {
        height: 3,
        backgroundColor: colors.accent,
        borderRadius: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statBox: {
        width: '48%',
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    statBoxGradient: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.glassBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: 0.5,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.borderLight,
        marginLeft: 12,
    },
    leadersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    rank1Grid: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    bottomPadding: {
        height: 30,
    },
});

export default HomeScreen;
