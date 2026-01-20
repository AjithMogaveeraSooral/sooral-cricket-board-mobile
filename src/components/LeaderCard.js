import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
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
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
                tension: 80,
                friction: 8,
            }),
        ]).start();
    }, []);

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

    if (!player) {
        return (
            <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient colors={gradients.card} style={[styles.card, { borderColor: color + '40' }]}>
                    <View style={[styles.iconBadge, { backgroundColor: color + '20' }]}>
                        <Ionicons name={getIcon()} size={16} color={color} />
                    </View>
                    <Text style={[styles.title, { color }]}>{title}</Text>
                    <Text style={styles.noData}>No data</Text>
                </LinearGradient>
            </Animated.View>
        );
    }

    const imageUrl = getImageUrl(player.profile_image_url);

    return (
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient 
                colors={gradients.card} 
                style={[styles.card, { borderColor: color + '40' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={[styles.iconBadge, { backgroundColor: color + '20' }]}>
                    <Ionicons name={getIcon()} size={16} color={color} />
                </View>
                <Text style={[styles.title, { color }]}>{title}</Text>
                <View style={[styles.imageContainer, { shadowColor: color }]}>
                    <Image source={{ uri: imageUrl }} style={[styles.image, { borderColor: color }]} />
                    <View style={[styles.imageGlow, { backgroundColor: color + '30' }]} />
                </View>
                <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
                <View style={[styles.valueBadge, { backgroundColor: color + '15' }]}>
                    <Text style={[styles.value, { color }]}>{getValue()}</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '48%',
        marginBottom: 12,
    },
    card: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    iconBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    imageContainer: {
        position: 'relative',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
    },
    imageGlow: {
        position: 'absolute',
        bottom: -4,
        left: 4,
        right: 4,
        height: 8,
        borderRadius: 10,
        opacity: 0.6,
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginTop: 10,
        maxWidth: '100%',
    },
    valueBadge: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    value: {
        fontSize: 12,
        fontWeight: '600',
    },
    noData: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 8,
    },
});

export default LeaderCard;
