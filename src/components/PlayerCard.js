import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { safeDisplay, parseBestSpell } from '../utils/calculations';
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

const RankBadge = ({ label, rank, color, icon }) => {
    const isTopThree = rank && rank <= 3;
    const glowAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (isTopThree) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.8,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.4,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isTopThree]);

    const badgeGradient = rank === 1 ? gradients.goldShine : 
                          rank === 2 ? gradients.silverShine : 
                          rank === 3 ? gradients.bronzeShine : 
                          [colors.cardBackgroundLight, colors.cardBackground];

    return (
        <View style={styles.rankBadgeContainer}>
            {isTopThree ? (
                <View style={styles.rankBadgeWrapper}>
                    <Animated.View style={[styles.rankBadgeGlow, {
                        backgroundColor: color,
                        opacity: glowAnim,
                    }]} />
                    <LinearGradient colors={badgeGradient} style={styles.rankBadge}>
                        <Ionicons name={icon} size={13} color={rank <= 2 ? colors.primaryDark : '#fff'} />
                        <Text style={[styles.rankValue, { color: rank <= 2 ? colors.primaryDark : '#fff' }]}>
                            #{rank}
                        </Text>
                    </LinearGradient>
                </View>
            ) : (
                <View style={[styles.rankBadge, styles.rankBadgeInactive]}>
                    <Ionicons name={icon} size={13} color={colors.textMuted} />
                    <Text style={[styles.rankValue, { color: colors.textSecondary }]}>
                        {rank ? `#${rank}` : '—'}
                    </Text>
                </View>
            )}
            <Text style={[styles.rankLabel, isTopThree && { color }]}>{label}</Text>
        </View>
    );
};

const StatSection = ({ title, icon, children, gradient, accentColor }) => (
    <LinearGradient 
        colors={gradient || gradients.card} 
        style={styles.statSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={styles.statHeader}>
            <View style={[styles.statIconBg, { backgroundColor: accentColor + '20' }]}>
                <Ionicons name={icon} size={14} color={accentColor || colors.accent} />
            </View>
            <Text style={[styles.statTitle, accentColor && { color: accentColor }]}>{title}</Text>
        </View>
        {children}
        <View style={styles.statSectionShine} />
    </LinearGradient>
);

const PlayerCard = ({ player, index = 0 }) => {
    const imageUrl = getImageUrl(player.profile_image_url);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                easing: Easing.out(Easing.back(1.1)),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay: index * 100,
                tension: 60,
                friction: 6,
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

    // Determine if player has any top 3 ranks
    const hasTopRank = (player.batting_rank && player.batting_rank <= 3) ||
                       (player.bowling_rank && player.bowling_rank <= 3) ||
                       (player.allrounder_rank && player.allrounder_rank <= 3);

    return (
        <Animated.View style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }] 
        }}>
            <LinearGradient colors={gradients.cardElevated} style={[
                styles.card,
                hasTopRank && styles.cardHighlight,
            ]}>
                {/* Background glow for top ranked players */}
                {hasTopRank && (
                    <View style={styles.cardGlow} />
                )}

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.imageContainer}>
                        <LinearGradient
                            colors={gradients.accent}
                            style={styles.imageRing}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.imageInner}>
                                <Image source={{ uri: imageUrl }} style={styles.image} />
                            </View>
                        </LinearGradient>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{player.name}</Text>
                        <View style={styles.matchesRow}>
                            <LinearGradient
                                colors={[colors.glassHighlight, colors.glassBackground]}
                                style={styles.matchBadge}
                            >
                                <Ionicons name="baseball-outline" size={12} color={colors.accent} />
                                <Text style={styles.matchesText}>
                                    {safeDisplay(player.matches)} M
                                </Text>
                            </LinearGradient>
                            <LinearGradient
                                colors={[colors.glassHighlight, colors.glassBackground]}
                                style={styles.matchBadge}
                            >
                                <Ionicons name="stats-chart-outline" size={12} color={colors.purple} />
                                <Text style={styles.matchesText}>
                                    {safeDisplay(player.innings)} Inn
                                </Text>
                            </LinearGradient>
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
                    <StatSection 
                        title="Batting" 
                        icon="baseball" 
                        gradient={[colors.gold + '12', colors.gold + '05']}
                        accentColor={colors.gold}
                    >
                        <View style={styles.statRow}>
                            <Text style={styles.statMainLabel}>Runs</Text>
                            <Text style={[styles.statMainValue, { color: colors.gold }]}>
                                {safeDisplay(player.total_runs)}
                            </Text>
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

                    <StatSection 
                        title="Bowling" 
                        icon="fitness" 
                        gradient={[colors.accent + '12', colors.accent + '05']}
                        accentColor={colors.accent}
                    >
                        <View style={styles.statRow}>
                            <Text style={styles.statMainLabel}>Wickets</Text>
                            <Text style={[styles.statMainValue, { color: colors.accent }]}>
                                {safeDisplay(player.wickets)}
                            </Text>
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
                    <LinearGradient
                        colors={[colors.gold + '20', colors.gold + '08']}
                        style={styles.pointItem}
                    >
                        <Ionicons name="baseball" size={14} color={colors.gold} />
                        <Text style={[styles.pointsText, { color: colors.gold }]}>
                            {safeDisplay(player.batting_points)} pts
                        </Text>
                    </LinearGradient>
                    <LinearGradient
                        colors={[colors.accent + '20', colors.accent + '08']}
                        style={styles.pointItem}
                    >
                        <Ionicons name="fitness" size={14} color={colors.accent} />
                        <Text style={[styles.pointsText, { color: colors.accent }]}>
                            {safeDisplay(player.bowling_points)} pts
                        </Text>
                    </LinearGradient>
                    <LinearGradient
                        colors={[colors.bronze + '20', colors.bronze + '08']}
                        style={styles.pointItem}
                    >
                        <Ionicons name="star" size={14} color={colors.bronze} />
                        <Text style={[styles.pointsText, { color: colors.bronze }]}>
                            {safeDisplay(player.allrounder_points)} pts
                        </Text>
                    </LinearGradient>
                </View>

                {/* Card shine */}
                <View style={styles.cardShine} />
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 18,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    cardHighlight: {
        borderColor: colors.accent + '50',
    },
    cardGlow: {
        position: 'absolute',
        top: -50,
        left: '50%',
        marginLeft: -75,
        width: 150,
        height: 100,
        backgroundColor: colors.accent,
        opacity: 0.08,
        borderRadius: 75,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    imageRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        padding: 3,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    imageInner: {
        flex: 1,
        borderRadius: 33,
        overflow: 'hidden',
        backgroundColor: colors.cardBackgroundDark,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    matchesRow: {
        flexDirection: 'row',
        gap: 10,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    matchesText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    rankBadges: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 18,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    rankBadgeContainer: {
        alignItems: 'center',
    },
    rankBadgeWrapper: {
        position: 'relative',
    },
    rankBadgeGlow: {
        position: 'absolute',
        top: -6,
        left: -6,
        right: -6,
        bottom: -6,
        borderRadius: 18,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 14,
        gap: 5,
        marginBottom: 6,
    },
    rankBadgeInactive: {
        backgroundColor: colors.glassBackground,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    rankValue: {
        fontWeight: '800',
        fontSize: 14,
    },
    rankLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    statSection: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
        position: 'relative',
        overflow: 'hidden',
    },
    statSectionShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    statIconBg: {
        width: 26,
        height: 26,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statTitle: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statMainLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    statMainValue: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    statGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statItemLabel: {
        fontSize: 10,
        color: colors.textMuted,
        marginBottom: 3,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    statItemValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    statSecondaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statSecondary: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '500',
    },
    pointsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    pointItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    pointsText: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '25%',
        backgroundColor: 'rgba(255, 255, 255, 0.015)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
});

export default PlayerCard;
