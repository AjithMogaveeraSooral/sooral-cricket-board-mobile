import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { safeDisplay, parseBestSpell } from '../utils/calculations';
import colors, { gradients } from '../constants/colors';

const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/AjithMogaveeraSooral/spl-sooral-cricket-board/main/images/default_player.jpg';

const RankBadge = ({ label, rank, color, icon }) => {
    const isTopThree = rank && rank <= 3;
    const badgeGradient = rank === 1 ? gradients.gold : 
                          rank === 2 ? gradients.silver : 
                          rank === 3 ? gradients.bronze : 
                          [colors.cardBackgroundLight, colors.cardBackground];

    return (
        <View style={styles.rankBadgeContainer}>
            {isTopThree ? (
                <LinearGradient colors={badgeGradient} style={styles.rankBadge}>
                    <Ionicons name={icon} size={12} color={color} />
                    <Text style={[styles.rankValue, { color }]}>
                        {rank ? `#${rank}` : '—'}
                    </Text>
                </LinearGradient>
            ) : (
                <View style={[styles.rankBadge, styles.rankBadgeInactive]}>
                    <Ionicons name={icon} size={12} color={colors.textMuted} />
                    <Text style={[styles.rankValue, { color: colors.textSecondary }]}>
                        {rank ? `#${rank}` : '—'}
                    </Text>
                </View>
            )}
            <Text style={styles.rankLabel}>{label}</Text>
        </View>
    );
};

const StatSection = ({ title, icon, children, gradient }) => (
    <LinearGradient 
        colors={gradient || gradients.card} 
        style={styles.statSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={styles.statHeader}>
            <Ionicons name={icon} size={14} color={colors.accent} />
            <Text style={styles.statTitle}>{title}</Text>
        </View>
        {children}
    </LinearGradient>
);

const PlayerCard = ({ player, index = 0 }) => {
    const imageUrl = player.profile_image_url || DEFAULT_IMAGE;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const battingAvg = player.batting_average || "—";
    const strikeRate = player.batting_strike_rate || "0.00";

    const bowlingEconomy = player.bowling_economy || "—";
    const bowlingSR = player.bowling_strike_rate || "—";
    const best = parseBestSpell(player.best_spell || "0-0");
    const bestSpellDisplay = `${best.wickets}-${best.runs}`;
    const overs = player.bowling_overs_calc || "0.0";

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <LinearGradient colors={gradients.card} style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                        <LinearGradient 
                            colors={gradients.accent} 
                            style={styles.imageRing}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{player.name}</Text>
                        <View style={styles.matchesRow}>
                            <View style={styles.matchBadge}>
                                <Ionicons name="baseball-outline" size={12} color={colors.textMuted} />
                                <Text style={styles.matchesText}>
                                    {safeDisplay(player.matches)} M
                                </Text>
                            </View>
                            <View style={styles.matchBadge}>
                                <Ionicons name="stats-chart-outline" size={12} color={colors.textMuted} />
                                <Text style={styles.matchesText}>
                                    {safeDisplay(player.innings)} Inn
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Rank Badges */}
                <View style={styles.rankBadges}>
                    <RankBadge 
                        label="Batting" 
                        rank={player.batting_rank} 
                        color={colors.gold} 
                        icon="baseball-outline"
                    />
                    <RankBadge 
                        label="Bowling" 
                        rank={player.bowling_rank} 
                        color={colors.silver} 
                        icon="fitness-outline"
                    />
                    <RankBadge 
                        label="Allrounder" 
                        rank={player.allrounder_rank} 
                        color={colors.bronze} 
                        icon="star-outline"
                    />
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    <StatSection title="Batting" icon="baseball" gradient={[colors.gold + '10', colors.gold + '05']}>
                        <View style={styles.statRow}>
                            <Text style={styles.statMainLabel}>Runs</Text>
                            <Text style={styles.statMainValue}>{safeDisplay(player.total_runs)}</Text>
                        </View>
                        <View style={styles.statGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statItemLabel}>HS</Text>
                                <Text style={styles.statItemValue}>{safeDisplay(player.highest_score)}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statItemLabel}>4s</Text>
                                <Text style={styles.statItemValue}>{safeDisplay(player.fours)}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statItemLabel}>6s</Text>
                                <Text style={styles.statItemValue}>{safeDisplay(player.sixes)}</Text>
                            </View>
                        </View>
                        <View style={styles.statSecondaryRow}>
                            <Text style={styles.statSecondary}>SR: {strikeRate}</Text>
                            <Text style={styles.statSecondary}>AVG: {battingAvg}</Text>
                        </View>
                    </StatSection>

                    <StatSection title="Bowling" icon="fitness" gradient={[colors.accent + '10', colors.accent + '05']}>
                        <View style={styles.statRow}>
                            <Text style={styles.statMainLabel}>Wickets</Text>
                            <Text style={styles.statMainValue}>{safeDisplay(player.wickets)}</Text>
                        </View>
                        <View style={styles.statGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statItemLabel}>Best</Text>
                                <Text style={styles.statItemValue}>{bestSpellDisplay}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statItemLabel}>Overs</Text>
                                <Text style={styles.statItemValue}>{overs}</Text>
                            </View>
                        </View>
                        <View style={styles.statSecondaryRow}>
                            <Text style={styles.statSecondary}>Econ: {bowlingEconomy}</Text>
                            <Text style={styles.statSecondary}>SR: {bowlingSR}</Text>
                        </View>
                    </StatSection>
                </View>

                {/* Points Footer */}
                <View style={styles.pointsContainer}>
                    <View style={styles.pointItem}>
                        <Ionicons name="baseball" size={14} color={colors.gold} />
                        <Text style={styles.pointsText}>{safeDisplay(player.batting_points)} pts</Text>
                    </View>
                    <View style={styles.pointItem}>
                        <Ionicons name="fitness" size={14} color={colors.silver} />
                        <Text style={styles.pointsText}>{safeDisplay(player.bowling_points)} pts</Text>
                    </View>
                    <View style={styles.pointItem}>
                        <Ionicons name="star" size={14} color={colors.bronze} />
                        <Text style={styles.pointsText}>{safeDisplay(player.allrounder_points)} pts</Text>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 32,
        zIndex: 1,
    },
    imageRing: {
        position: 'absolute',
        top: -3,
        left: -3,
        width: 70,
        height: 70,
        borderRadius: 35,
        opacity: 0.5,
    },
    info: {
        flex: 1,
        marginLeft: 14,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
    },
    matchesRow: {
        flexDirection: 'row',
        gap: 10,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.glassBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    matchesText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    rankBadges: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    rankBadgeContainer: {
        alignItems: 'center',
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
        marginBottom: 4,
    },
    rankBadgeInactive: {
        backgroundColor: colors.glassBackground,
    },
    rankValue: {
        fontWeight: '700',
        fontSize: 13,
    },
    rankLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10,
    },
    statSection: {
        flex: 1,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    statTitle: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statMainLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    statMainValue: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
    },
    statGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    statItem: {
        alignItems: 'center',
    },
    statItemLabel: {
        fontSize: 10,
        color: colors.textMuted,
        marginBottom: 2,
    },
    statItemValue: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    statSecondaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statSecondary: {
        fontSize: 11,
        color: colors.textMuted,
    },
    pointsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    pointItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pointsText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});

export default PlayerCard;
