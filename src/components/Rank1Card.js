import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors, { gradients } from '../constants/colors';

const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/AjithMogaveeraSooral/spl-sooral-cricket-board/main/images/default_player.jpg';

const Rank1Card = ({ title, player, color }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
        }).start();

        // Subtle pulse for the crown
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const titleColor = title.includes('Bat') ? colors.gold :
        title.includes('Bowl') ? colors.silver : colors.bronze;

    const getGradient = () => {
        if (title.includes('Bat')) return gradients.gold;
        if (title.includes('Bowl')) return gradients.silver;
        return gradients.bronze;
    };

    if (!player) {
        return (
            <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient colors={gradients.card} style={[styles.card, { borderColor: color + '40' }]}>
                    <Text style={[styles.title, { color }]}>{title}</Text>
                    <Text style={styles.noData}>No data</Text>
                </LinearGradient>
            </Animated.View>
        );
    }

    const imageUrl = player.profile_image_url || DEFAULT_IMAGE;
    const points = title.includes('Bat') ? player.batting_points :
        title.includes('Bowl') ? player.bowling_points : player.allrounder_points;

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient 
                colors={gradients.card} 
                style={[styles.card, { borderColor: titleColor + '40' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Crown Badge */}
                <Animated.View style={[styles.crownBadge, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient colors={getGradient()} style={styles.crownGradient}>
                        <Ionicons name="trophy" size={14} color={colors.primaryDark} />
                    </LinearGradient>
                </Animated.View>

                {/* Rank Badge */}
                <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#1</Text>
                </View>

                <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

                <View style={[styles.imageContainer, { shadowColor: titleColor }]}>
                    <View style={[styles.imageRing, { borderColor: titleColor }]}>
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    </View>
                </View>

                <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
                
                <View style={[styles.pointsBadge, { backgroundColor: titleColor + '20' }]}>
                    <Ionicons name="star" size={12} color={titleColor} />
                    <Text style={[styles.points, { color: titleColor }]}>{points} pts</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
    card: {
        alignItems: 'center',
        padding: 14,
        paddingTop: 20,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    crownBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
    },
    crownGradient: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
    rankBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    rankText: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.primaryDark,
    },
    title: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    imageContainer: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    imageRing: {
        padding: 3,
        borderRadius: 30,
        borderWidth: 2,
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    name: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginTop: 8,
        maxWidth: '100%',
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    points: {
        fontSize: 11,
        fontWeight: '700',
    },
    noData: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 8,
    },
});

export default Rank1Card;
