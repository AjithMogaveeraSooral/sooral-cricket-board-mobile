import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors, { gradients } from '../constants/colors';

const MatchCard = ({ match, onPress, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
            }),
        ]).start();
    }, []);

    const teams = match.teams || [];
    const team1Name = teams[0] || 'Team 1';
    const team2Name = teams[1] || 'Team 2';
    const isTeam1Winner = match.winner === team1Name;
    const isTeam2Winner = match.winner === team2Name;

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
                <LinearGradient
                    colors={gradients.card}
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
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 14,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    matchIdBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent + '15',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 6,
    },
    matchNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.accent,
    },
    tapHint: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tapHintText: {
        fontSize: 11,
        color: colors.textMuted,
        marginRight: 2,
    },
    teamsContainer: {
        marginBottom: 14,
    },
    teamRow: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    winnerRow: {
        backgroundColor: colors.gold + '10',
    },
    teamNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    winnerIcon: {
        marginRight: 8,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    winnerName: {
        color: colors.gold,
        fontWeight: '700',
    },
    vsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    vsLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.borderLight,
    },
    vsBadge: {
        backgroundColor: colors.cardBackgroundLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    vs: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    resultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 8,
        marginBottom: 10,
    },
    result: {
        fontSize: 13,
        color: colors.accent,
        fontWeight: '600',
    },
    potmContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gold + '10',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    potmBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.gold + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    potmTextContainer: {
        flex: 1,
    },
    potmLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    potmName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.gold,
        marginTop: 2,
    },
    summary: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default MatchCard;
