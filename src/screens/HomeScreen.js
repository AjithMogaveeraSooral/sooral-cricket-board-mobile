import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSPL } from '../contexts/SPLContext';
import LeaderCard from '../components/LeaderCard';
import Rank1Card from '../components/Rank1Card';
import RankingList from '../components/RankingList';
import colors, { gradients } from '../constants/colors';

const { width } = Dimensions.get('window');

// Shimmer effect component for loading states
const ShimmerEffect = ({ style }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <Animated.View
            style={[
                style,
                {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX }],
                },
            ]}
        >
            <LinearGradient
                colors={gradients.shimmer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
            />
        </Animated.View>
    );
};

const AnimatedStatBox = ({ value, label, icon, delay, color, gradientColors }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay,
                useNativeDriver: true,
                tension: 80,
                friction: 6,
            }),
        ]).start();

        // Subtle glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.8,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.5,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.statBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
                colors={gradientColors || gradients.card}
                style={styles.statBoxGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Glow effect */}
                <Animated.View style={[styles.statGlowEffect, { 
                    backgroundColor: color,
                    opacity: glowAnim,
                }]} />
                
                <View style={[styles.statIconContainer, { backgroundColor: color + '25' }]}>
                    <LinearGradient
                        colors={[color + '40', 'transparent']}
                        style={styles.iconGlow}
                    />
                    <Ionicons name={icon} size={22} color={color} />
                </View>
                <Text style={[styles.statValue, { color }]}>{value.toLocaleString()}</Text>
                <Text style={styles.statLabel}>{label}</Text>
                
                {/* Shine overlay */}
                <View style={styles.statShine} />
            </LinearGradient>
        </Animated.View>
    );
};

const SectionHeader = ({ title, icon, accentColor }) => {
    const lineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(lineAnim, {
            toValue: 1,
            duration: 800,
            delay: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, []);

    const lineWidth = lineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, accentColor && { borderColor: accentColor + '40' }]}>
                <Ionicons name={icon} size={18} color={accentColor || colors.accent} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionLineContainer}>
                <Animated.View style={[styles.sectionLine, { width: lineWidth }]}>
                    <LinearGradient
                        colors={[accentColor || colors.accent, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sectionLineGradient}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

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
                        gradientColors={gradients.cyan}
                    />
                    <AnimatedStatBox 
                        value={stats?.totalRuns || 0} 
                        label="Total Runs" 
                        icon="analytics"
                        delay={200}
                        color={colors.accent}
                        gradientColors={gradients.emerald}
                    />
                    <AnimatedStatBox 
                        value={stats?.totalWickets || 0} 
                        label="Wickets" 
                        icon="baseball"
                        delay={300}
                        color={colors.purple}
                        gradientColors={gradients.purple}
                    />
                    <AnimatedStatBox 
                        value={stats?.totalSixes || 0} 
                        label="Sixes" 
                        icon="rocket"
                        delay={400}
                        color={colors.orange}
                        gradientColors={gradients.orange}
                    />
                </View>

                {/* League Leaders */}
                <SectionHeader title="League Leaders" icon="star" accentColor={colors.gold} />
                <View style={styles.leadersGrid}>
                    <LeaderCard title="Most Runs" player={stats?.topRunScorer} color={colors.gold} delay={100} />
                    <LeaderCard title="Most Wickets" player={stats?.topWicketTaker} color={colors.silver} delay={200} />
                    <LeaderCard title="Most Sixes" player={stats?.topSixHitter} color={colors.orange} delay={300} />
                    <LeaderCard title="Most Fours" player={stats?.topFourHitter} color={colors.bronze} delay={400} />
                </View>

                {/* #1 Ranked Players */}
                <SectionHeader title="#1 Ranked Players" icon="medal" accentColor={colors.accent} />
                <View style={styles.rank1Grid}>
                    <Rank1Card title="Batting" player={stats?.battingRanking?.[0]} color={colors.gold} />
                    <Rank1Card title="Bowling" player={stats?.bowlingRanking?.[0]} color={colors.silver} />
                    <Rank1Card title="Allrounder" player={stats?.allrounderRanking?.[0]} color={colors.bronze} />
                </View>

                {/* Top 5 Rankings */}
                <SectionHeader title="Top 5 Rankings" icon="podium" accentColor={colors.purple} />
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
        padding: 40,
        borderRadius: 24,
        backgroundColor: colors.glassBackground,
    },
    loadingText: {
        marginTop: 16,
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    errorText: {
        color: colors.error,
        fontSize: 15,
        marginTop: 14,
        textAlign: 'center',
    },
    heroHeader: {
        marginBottom: 24,
        borderRadius: 24,
        overflow: 'hidden',
    },
    heroGradient: {
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    heroContent: {
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 24,
    },
    heroLogoContainer: {
        marginBottom: 14,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 16,
    },
    heroLogo: {
        width: 88,
        height: 88,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroLogoText: {
        fontSize: 30,
        fontWeight: '900',
        color: colors.primaryDark,
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 15,
        color: colors.textAccent,
        marginTop: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    heroBorder: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    statBox: {
        width: '48%',
        marginBottom: 14,
        borderRadius: 20,
        overflow: 'hidden',
    },
    statBoxGradient: {
        padding: 18,
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: colors.borderLight,
        position: 'relative',
        overflow: 'hidden',
    },
    statGlowEffect: {
        position: 'absolute',
        top: -30,
        left: '50%',
        width: 60,
        height: 60,
        borderRadius: 30,
        marginLeft: -30,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    iconGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 14,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 6,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    statShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 10,
    },
    sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.glassBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: 0.8,
    },
    sectionLineContainer: {
        flex: 1,
        height: 2,
        marginLeft: 14,
        borderRadius: 1,
        backgroundColor: colors.borderLight,
        overflow: 'hidden',
    },
    sectionLine: {
        height: '100%',
    },
    sectionLineGradient: {
        flex: 1,
        height: '100%',
    },
    leadersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    rank1Grid: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    bottomPadding: {
        height: 40,
    },
});

export default HomeScreen;
