import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

const getMedalStyle = (index) => {
    switch (index) {
        case 0: return { 
            gradient: gradients.goldShine, 
            color: colors.primaryDark,
            icon: 'medal',
            glow: colors.goldGlow,
            glowStrong: colors.goldGlowStrong,
            accentColor: colors.gold,
        };
        case 1: return { 
            gradient: gradients.silverShine, 
            color: colors.primaryDark,
            icon: 'medal-outline',
            glow: colors.silverGlow,
            glowStrong: 'rgba(226, 232, 240, 0.4)',
            accentColor: colors.silver,
        };
        case 2: return { 
            gradient: gradients.bronzeShine, 
            color: '#fff',
            icon: 'medal-outline',
            glow: colors.bronzeGlow,
            glowStrong: 'rgba(217, 119, 6, 0.4)',
            accentColor: colors.bronze,
        };
        default: return { 
            gradient: [colors.cardBackgroundLight, colors.cardBackground], 
            color: colors.textPrimary,
            icon: null,
            glow: 'transparent',
            glowStrong: 'transparent',
            accentColor: colors.textSecondary,
        };
    }
};

const RankingRow = ({ player, index, type, delay }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
        ]).start();

        // Glow animation for top 3
        if (index < 3) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.7,
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
    }, []);

    const imageUrl = getImageUrl(player.profile_image_url);
    const medalStyle = getMedalStyle(index);
    const points = type === 'batting' ? player.batting_points :
        type === 'bowling' ? player.bowling_points : player.allrounder_points;

    const isTopThree = index < 3;

    return (
        <Animated.View style={[
            styles.row,
            { 
                opacity: fadeAnim, 
                transform: [{ translateX: slideAnim }],
            },
        ]}>
            {/* Background glow for top 3 */}
            {isTopThree && (
                <Animated.View style={[styles.rowGlow, {
                    backgroundColor: medalStyle.accentColor,
                    opacity: glowAnim,
                }]} />
            )}

            {/* Rank badge */}
            <View style={styles.rankBadgeWrapper}>
                <LinearGradient 
                    colors={medalStyle.gradient} 
                    style={[styles.rankBadge, isTopThree && styles.rankBadgeTop3]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={[styles.rankNumber, { color: medalStyle.color }]}>
                        {index + 1}
                    </Text>
                </LinearGradient>
            </View>

            {/* Player image with border */}
            <View style={[styles.imageWrapper, isTopThree && { shadowColor: medalStyle.accentColor }]}>
                {isTopThree ? (
                    <LinearGradient
                        colors={medalStyle.gradient.slice(0, 2)}
                        style={styles.imageBorder}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.imageInner}>
                            <Image source={{ uri: imageUrl }} style={styles.image} />
                        </View>
                    </LinearGradient>
                ) : (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl }} style={[styles.image, styles.imageNoBorder]} />
                    </View>
                )}
            </View>

            {/* Name and medal */}
            <View style={styles.nameContainer}>
                <Text style={[styles.name, isTopThree && styles.nameHighlight]} numberOfLines={1}>
                    {player.name}
                </Text>
                {isTopThree && (
                    <View style={[styles.medalIndicator, { backgroundColor: medalStyle.accentColor + '25' }]}>
                        <Ionicons 
                            name={medalStyle.icon} 
                            size={12} 
                            color={medalStyle.accentColor} 
                        />
                    </View>
                )}
            </View>

            {/* Points */}
            <View style={styles.pointsContainer}>
                <LinearGradient
                    colors={isTopThree ? [medalStyle.accentColor + '25', medalStyle.accentColor + '10'] : [colors.accent + '20', colors.accent + '08']}
                    style={styles.pointsBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={[styles.points, isTopThree && { color: medalStyle.accentColor }]}>{points}</Text>
                    <Text style={styles.ptsLabel}>pts</Text>
                </LinearGradient>
            </View>
        </Animated.View>
    );
};

const RankingList = ({ title, players, type, color }) => {
    const containerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(containerAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, []);

    if (!players || players.length === 0) {
        return (
            <Animated.View style={{ opacity: containerAnim }}>
                <LinearGradient colors={gradients.card} style={[styles.container, { borderColor: color + '30' }]}>
                    <Text style={[styles.title, { color }]}>{title}</Text>
                    <View style={styles.noDataContainer}>
                        <Ionicons name="podium-outline" size={32} color={colors.textMuted} />
                        <Text style={styles.noData}>No rankings available</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    }

    const top5 = players.slice(0, 5);
    const icon = type === 'batting' ? 'analytics' : type === 'bowling' ? 'baseball' : 'star';

    return (
        <Animated.View style={{ opacity: containerAnim, transform: [{ scale: containerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
        })}]}}>
            <LinearGradient 
                colors={gradients.cardElevated} 
                style={[styles.container, { borderColor: color + '35' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={[color + '30', color + '15']}
                        style={styles.headerIcon}
                    >
                        <Ionicons name={icon} size={18} color={color} />
                    </LinearGradient>
                    <Text style={[styles.title, { color }]}>{title}</Text>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>TOP 5</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                    <LinearGradient
                        colors={[color, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.dividerGradient}
                    />
                </View>
                
                {top5.map((player, index) => (
                    <RankingRow 
                        key={player.player_id || index} 
                        player={player} 
                        index={index} 
                        type={type}
                        delay={index * 100}
                    />
                ))}

                {/* Card shine */}
                <View style={styles.cardShine} />
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        marginBottom: 16,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
        flex: 1,
    },
    headerBadge: {
        backgroundColor: colors.glassBackground,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    headerBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 0.5,
    },
    divider: {
        height: 2,
        marginBottom: 12,
        borderRadius: 1,
        backgroundColor: colors.borderLight,
        overflow: 'hidden',
    },
    dividerGradient: {
        width: '50%',
        height: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginVertical: 3,
        borderRadius: 14,
        position: 'relative',
        overflow: 'hidden',
    },
    rowGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 14,
    },
    rankBadgeWrapper: {
        marginRight: 12,
    },
    rankBadge: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankBadgeTop3: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    rankNumber: {
        fontSize: 13,
        fontWeight: '900',
    },
    imageWrapper: {
        marginRight: 12,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    imageBorder: {
        width: 44,
        height: 44,
        borderRadius: 14,
        padding: 2,
    },
    imageInner: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.cardBackgroundDark,
    },
    imageContainer: {
        width: 44,
        height: 44,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    imageNoBorder: {
        borderWidth: 1.5,
        borderColor: colors.borderLight,
    },
    nameContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    nameHighlight: {
        color: colors.textPrimary,
        fontWeight: '700',
    },
    medalIndicator: {
        marginLeft: 8,
        width: 22,
        height: 22,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pointsContainer: {
        alignItems: 'flex-end',
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 3,
    },
    points: {
        fontSize: 16,
        color: colors.accent,
        fontWeight: '800',
    },
    ptsLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '600',
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    noData: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },
    cardShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.015)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});

export default RankingList;
