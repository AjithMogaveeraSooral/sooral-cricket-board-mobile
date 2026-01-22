import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors, { gradients } from '../constants/colors';

const MatchCard = ({ match, onPress, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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
                tension: 60,
                friction: 6,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const teams = match.teams || [];
    const team1Name = teams[0] || 'Team 1';
    const team2Name = teams[1] || 'Team 2';
    const isTeam1Winner = match.winner === team1Name;
    const isTeam2Winner = match.winner === team2Name;

    return (
        <Animated.View style={{ 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }] 
        }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
                <LinearGradient
                    colors={gradients.cardElevated}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.matchIdBadge}>
                            <Ionicons name="calendar" size={12} color={colors.accent} />
                            <Text style={styles.matchNumber}>{match.match_id}</Text>
                        </View>
                        <View style={styles.tapHint}>
                            <Text style={styles.tapHintText}>Tap for details</Text>
                            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                        </View>
                    </View>

                    {/* Teams */}
                    <View style={styles.teamsContainer}>
                        <View style={[styles.teamRow, isTeam1Winner && styles.winnerRow]}>
                            <View style={styles.teamNameContainer}>
                                {isTeam1Winner && (
                                    <Ionicons name="trophy" size={14} color={colors.gold} style={styles.winnerIcon} />
                                )}
                                <Text style={[styles.teamName, isTeam1Winner && styles.winnerName]}>{team1Name}</Text>
                            </View>
                        </View>

                        <View style={styles.vsContainer}>
                            <View style={styles.vsLine} />
                            <View style={styles.vsBadge}>
                                <Text style={styles.vs}>VS</Text>
                            </View>
                            <View style={styles.vsLine} />
                        </View>

                        <View style={[styles.teamRow, isTeam2Winner && styles.winnerRow]}>
                            <View style={styles.teamNameContainer}>
                                {isTeam2Winner && (
                                    <Ionicons name="trophy" size={14} color={colors.gold} style={styles.winnerIcon} />
                                )}
                                <Text style={[styles.teamName, isTeam2Winner && styles.winnerName]}>{team2Name}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Result */}
                    <LinearGradient
                        colors={[colors.accent + '15', colors.accent + '05']}
                        style={styles.resultContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                        <Text style={styles.result}>{match.winner || 'TBD'} won</Text>
                    </LinearGradient>

                    {/* Man of the Match */}
                    {match.man_of_the_match && (
                        <View style={styles.potmContainer}>
                            <View style={styles.potmBadge}>
                                <Ionicons name="star" size={12} color={colors.gold} />
                            </View>
                            <View style={styles.potmTextContainer}>
                                <Text style={styles.potmLabel}>Man of the Match</Text>
                                <Text style={styles.potmName}>{match.man_of_the_match}</Text>
                            </View>
                        </View>
                    )}

                    {/* Summary */}
                    {match.scorecard_summary && (
                        <Text style={styles.summary}>{match.scorecard_summary}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 18,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: colors.border,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    matchIdBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    matchNumber: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.accent,
        letterSpacing: 0.3,
    },
    tapHint: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glassBackground,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tapHintText: {
        fontSize: 11,
        color: colors.textMuted,
        marginRight: 4,
        fontWeight: '500',
    },
    teamsContainer: {
        marginBottom: 16,
    },
    teamRow: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    winnerRow: {
        backgroundColor: colors.gold + '15',
        borderWidth: 1,
        borderColor: colors.gold + '30',
    },
    teamNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    winnerIcon: {
        marginRight: 10,
    },
    teamName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    winnerName: {
        color: colors.gold,
        fontWeight: '800',
    },
    vsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    vsLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: colors.borderLight,
    },
    vsBadge: {
        backgroundColor: colors.cardBackgroundLight,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 12,
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    vs: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.textMuted,
        letterSpacing: 1.5,
    },
    resultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 12,
    },
    result: {
        fontSize: 14,
        color: colors.accent,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    potmContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gold + '12',
        padding: 12,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.gold + '25',
    },
    potmBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gold + '25',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    potmTextContainer: {
        flex: 1,
    },
    potmLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    potmName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.gold,
        marginTop: 3,
        letterSpacing: 0.3,
    },
    summary: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 18,
    },
});

export default MatchCard;
