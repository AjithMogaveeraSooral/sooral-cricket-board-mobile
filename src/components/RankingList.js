import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
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
            gradient: gradients.gold, 
            color: colors.primaryDark,
            icon: 'medal',
            glow: colors.goldGlow 
        };
        case 1: return { 
            gradient: gradients.silver, 
            color: colors.primaryDark,
            icon: 'medal-outline',
            glow: colors.silverGlow 
        };
        case 2: return { 
            gradient: gradients.bronze, 
            color: '#fff',
            icon: 'medal-outline',
            glow: colors.bronzeGlow 
        };
        default: return { 
            gradient: [colors.cardBackgroundLight, colors.cardBackground], 
            color: colors.text,
            icon: null,
            glow: 'transparent' 
        };
    }
};

const RankingRow = ({ player, index, type, delay }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const imageUrl = getImageUrl(player.profile_image_url);
    const medalStyle = getMedalStyle(index);
    const points = type === 'batting' ? player.batting_points :
        type === 'bowling' ? player.bowling_points : player.allrounder_points;

    return (
        <Animated.View style={[
            styles.row,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
            index < 3 && { backgroundColor: medalStyle.glow }
        ]}>
            <LinearGradient 
                colors={medalStyle.gradient} 
                style={styles.rankBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={[styles.rankNumber, { color: medalStyle.color }]}>
                    {index + 1}
                </Text>
            </LinearGradient>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
            </View>
            <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
                {index < 3 && (
                    <View style={styles.medalIndicator}>
                        <Ionicons 
                            name={medalStyle.icon} 
                            size={10} 
                            color={medalStyle.gradient[0]} 
                        />
                    </View>
                )}
            </View>
            <View style={styles.pointsContainer}>
                <Text style={styles.points}>{points}</Text>
                <Text style={styles.ptsLabel}>pts</Text>
            </View>
        </Animated.View>
    );
};

const RankingList = ({ title, players, type, color }) => {
    if (!players || players.length === 0) {
        return (
            <View style={[styles.container, { borderColor: color + '40' }]}>
                <Text style={[styles.title, { color }]}>{title}</Text>
                <Text style={styles.noData}>No rankings available</Text>
            </View>
        );
    }

    const top5 = players.slice(0, 5);
    const icon = type === 'batting' ? 'analytics' : type === 'bowling' ? 'baseball' : 'star';

    return (
        <LinearGradient 
            colors={gradients.card} 
            style={[styles.container, { borderColor: color + '40' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.header}>
                <View style={[styles.headerIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={16} color={color} />
                </View>
                <Text style={[styles.title, { color }]}>{title}</Text>
            </View>
            
            {top5.map((player, index) => (
                <RankingRow 
                    key={player.player_id || index} 
                    player={player} 
                    index={index} 
                    type={type}
                    delay={index * 80}
                />
            ))}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        marginVertical: 2,
        borderRadius: 10,
    },
    rankBadge: {
        width: 26,
        height: 26,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    rankNumber: {
        fontSize: 12,
        fontWeight: '800',
    },
    imageContainer: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 36,
        height: 36,
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 1,
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
        color: colors.text,
        fontWeight: '500',
    },
    medalIndicator: {
        marginLeft: 4,
    },
    pointsContainer: {
        alignItems: 'flex-end',
    },
    points: {
        fontSize: 15,
        color: colors.accent,
        fontWeight: '700',
    },
    ptsLabel: {
        fontSize: 9,
        color: colors.textMuted,
        fontWeight: '500',
    },
    noData: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        paddingVertical: 20,
    },
});

export default RankingList;
