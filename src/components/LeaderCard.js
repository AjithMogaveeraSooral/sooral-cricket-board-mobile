import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors, { gradients } from '../constants/colors';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/AjithMogaveeraSooral/spl-sooral-cricket-board/main/';
const DEFAULT_IMAGE = GITHUB_RAW_BASE + 'images/default_player.jpg';

const getImageUrl = (profileImageUrl) => {
    if (!profileImageUrl) return DEFAULT_IMAGE;
    // If it's already a full URL, return as is
    if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
        return profileImageUrl;
    }
    // Convert relative path to full GitHub raw URL
    return GITHUB_RAW_BASE + profileImageUrl.replace(/\\/g, '/');
};

const LeaderCard = ({ title, player, color, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const ringRotate = useRef(new Animated.Value(0)).current;

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
                tension: 60,
                friction: 6,
            }),
        ]).start();

        // Continuous subtle glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.6,
                    duration: 1800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 1800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Slow rotating ring effect
        Animated.loop(
            Animated.timing(ringRotate, {
                toValue: 1,
                duration: 8000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const ringRotateInterpolate = ringRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const getIcon = () => {
        if (title.includes('Run')) return 'analytics';
        if (title.includes('Wicket')) return 'baseball';
        if (title.includes('Sixes')) return 'rocket';
        if (title.includes('Fours')) return 'flash';
        return 'trophy';
    };

    const getValue = () => {
        if (title.includes('Run')) return `${player.total_runs} runs`;
        if (title.includes('Wicket')) return `${player.wickets} wickets`;
        if (title.includes('Sixes')) return `${player.sixes} sixes`;
        if (title.includes('Fours')) return `${player.fours} fours`;
        return '';
    };

    const getGradient = () => {
        if (color === colors.gold) return gradients.goldSubtle;
        if (color === colors.silver) return gradients.silverSubtle;
        if (color === colors.orange) return [colors.orange, colors.orangeLight];
        if (color === colors.bronze) return gradients.bronzeSubtle;
        return gradients.accent;
    };

    if (!player) {
        return (
            <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient colors={gradients.card} style={[styles.card, { borderColor: color + '30' }]}>
                    <View style={[styles.iconBadge, { backgroundColor: color + '15' }]}>
                        <Ionicons name={getIcon()} size={18} color={color} />
                    </View>
                    <Text style={[styles.title, { color }]}>{title}</Text>
                    <View style={styles.noDataContainer}>
                        <Ionicons name="person-outline" size={32} color={colors.textMuted} />
                        <Text style={styles.noData}>No data</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    }

    const imageUrl = getImageUrl(player.profile_image_url);

    return (
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient 
                colors={gradients.cardElevated} 
                style={[styles.card, { borderColor: color + '35' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Background glow effect */}
                <Animated.View style={[styles.backgroundGlow, { 
                    backgroundColor: color,
                    opacity: glowAnim,
                }]} />

                {/* Icon badge */}
                <View style={[styles.iconBadge, { backgroundColor: color + '20' }]}>
                    <Ionicons name={getIcon()} size={18} color={color} />
                </View>

                {/* Title */}
                <Text style={[styles.title, { color }]}>{title}</Text>

                {/* Profile image with animated ring */}
                <View style={styles.imageWrapper}>
                    <Animated.View style={[
                        styles.rotatingRing,
                        { 
                            borderColor: color,
                            transform: [{ rotate: ringRotateInterpolate }],
                        }
                    ]}>
                        <View style={[styles.ringDot, { backgroundColor: color }]} />
                    </Animated.View>
                    
                    <View style={[styles.imageContainer, { shadowColor: color }]}>
                        <LinearGradient
                            colors={getGradient()}
                            style={styles.imageBorder}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.imageInner}>
                                <Image source={{ uri: imageUrl }} style={styles.image} />
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                {/* Player name */}
                <Text style={styles.name} numberOfLines={1}>{player.name}</Text>

                {/* Value badge */}
                <LinearGradient
                    colors={[color + '25', color + '10']}
                    style={styles.valueBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name={getIcon()} size={12} color={color} />
                    <Text style={[styles.value, { color }]}>{getValue()}</Text>
                </LinearGradient>

                {/* Shine overlay */}
                <View style={styles.cardShine} />
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '48%',
        marginBottom: 14,
    },
    card: {
        alignItems: 'center',
        padding: 18,
        paddingTop: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    backgroundGlow: {
        position: 'absolute',
        top: -40,
        left: '50%',
        width: 80,
        height: 80,
        borderRadius: 40,
        marginLeft: -40,
    },
    iconBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    imageWrapper: {
        position: 'relative',
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rotatingRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderStyle: 'dashed',
        opacity: 0.3,
    },
    ringDot: {
        position: 'absolute',
        top: -4,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    imageContainer: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    imageBorder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        padding: 3,
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
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginTop: 14,
        maxWidth: '100%',
        letterSpacing: 0.3,
    },
    valueBadge: {
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    value: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noData: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 8,
        fontWeight: '500',
    },
    cardShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});

export default LeaderCard;
