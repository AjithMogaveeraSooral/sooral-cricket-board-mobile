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

const Rank1Card = ({ title, player, color }) => {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 60,
            friction: 6,
        }).start();

        // Enhanced crown pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.6,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Shimmer effect
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 100],
    });

    const titleColor = title.includes('Bat') ? colors.gold :
        title.includes('Bowl') ? colors.silver : colors.bronze;

    const getGradient = () => {
        if (title.includes('Bat')) return gradients.goldShine;
        if (title.includes('Bowl')) return gradients.silverShine;
        return gradients.bronzeShine;
    };

    const getBorderGradient = () => {
        if (title.includes('Bat')) return gradients.goldSubtle;
        if (title.includes('Bowl')) return gradients.silverSubtle;
        return gradients.bronzeSubtle;
    };

    if (!player) {
        return (
            <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient colors={gradients.card} style={[styles.card, { borderColor: color + '30' }]}>
                    <Text style={[styles.title, { color }]}>{title}</Text>
                    <View style={styles.noDataContainer}>
                        <Ionicons name="person-outline" size={28} color={colors.textMuted} />
                        <Text style={styles.noData}>No data</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    }

    const imageUrl = getImageUrl(player.profile_image_url);
    const points = title.includes('Bat') ? player.batting_points :
        title.includes('Bowl') ? player.bowling_points : player.allrounder_points;

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient 
                colors={gradients.cardElevated} 
                style={[styles.card, { borderColor: titleColor + '35' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Background glow */}
                <Animated.View style={[styles.backgroundGlow, { 
                    backgroundColor: titleColor,
                    opacity: glowAnim,
                }]} />

                {/* Crown Badge with enhanced animation */}
                <Animated.View style={[styles.crownBadge, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient colors={getGradient()} style={styles.crownGradient}>
                        <Ionicons name="trophy" size={16} color={colors.primaryDark} />
                    </LinearGradient>
                    {/* Crown glow */}
                    <Animated.View style={[styles.crownGlow, {
                        backgroundColor: titleColor,
                        opacity: glowAnim,
                    }]} />
                </Animated.View>

                {/* Rank Badge */}
                <LinearGradient
                    colors={gradients.accent}
                    style={styles.rankBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.rankText}>#1</Text>
                </LinearGradient>

                <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

                {/* Enhanced image with gradient border */}
                <View style={[styles.imageContainer, { shadowColor: titleColor }]}>
                    <LinearGradient
                        colors={getBorderGradient()}
                        style={styles.imageBorderGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.imageInner}>
                            <Image source={{ uri: imageUrl }} style={styles.image} />
                        </View>
                    </LinearGradient>
                </View>

                <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
                
                {/* Enhanced points badge */}
                <LinearGradient
                    colors={[titleColor + '30', titleColor + '15']}
                    style={styles.pointsBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name="star" size={12} color={titleColor} />
                    <Text style={[styles.points, { color: titleColor }]}>{points} pts</Text>
                </LinearGradient>

                {/* Shimmer overlay */}
                <Animated.View style={[styles.shimmerOverlay, { 
                    transform: [{ translateX: shimmerTranslate }]
                }]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shimmerGradient}
                    />
                </Animated.View>

                {/* Card shine */}
                <View style={styles.cardShine} />
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    card: {
        alignItems: 'center',
        padding: 16,
        paddingTop: 24,
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
        top: -30,
        left: '50%',
        width: 60,
        height: 60,
        borderRadius: 30,
        marginLeft: -30,
    },
    crownBadge: {
        position: 'absolute',
        top: -14,
        alignSelf: 'center',
    },
    crownGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },
    crownGlow: {
        position: 'absolute',
        top: -8,
        left: -8,
        right: -8,
        bottom: -8,
        borderRadius: 24,
        opacity: 0.4,
    },
    rankBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    rankText: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.primaryDark,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    imageContainer: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    imageBorderGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        padding: 3,
    },
    imageInner: {
        flex: 1,
        borderRadius: 27,
        overflow: 'hidden',
        backgroundColor: colors.cardBackgroundDark,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginTop: 10,
        maxWidth: '100%',
        letterSpacing: 0.3,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 5,
    },
    points: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    noData: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 6,
        fontWeight: '500',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    shimmerGradient: {
        width: 60,
        height: '100%',
    },
    cardShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '35%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});

export default Rank1Card;
