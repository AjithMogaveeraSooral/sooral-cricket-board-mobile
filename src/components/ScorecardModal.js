import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors, { gradients } from '../constants/colors';

// Batting Stats Row Component
const BattingRow = ({ player, isHeader }) => {
    if (isHeader) {
        return (
            <View style={styles.battingHeader}>
                <Text style={[styles.battingCell, styles.battingNameCell, styles.headerText]}>Batter</Text>
                <Text style={[styles.battingCell, styles.battingStatCell, styles.headerText]}>R</Text>
                <Text style={[styles.battingCell, styles.battingStatCell, styles.headerText]}>B</Text>
                <Text style={[styles.battingCell, styles.battingStatCell, styles.headerText]}>4s</Text>
                <Text style={[styles.battingCell, styles.battingStatCell, styles.headerText]}>6s</Text>
            </View>
        );
    }

    const isNotOut = player.status?.toLowerCase().includes('not out');

    return (
        <View style={styles.battingRow}>
            <View style={[styles.battingCell, styles.battingNameCell]}>
                <Text style={[styles.playerName, isNotOut && styles.notOutName]} numberOfLines={1}>
                    {player.name}
                    {isNotOut && <Text style={styles.notOutBadge}> *</Text>}
                </Text>
                <Text style={styles.dismissalText} numberOfLines={1}>{player.status}</Text>
            </View>
            <Text style={[styles.battingCell, styles.battingStatCell, styles.runsText]}>{player.runs}</Text>
            <Text style={[styles.battingCell, styles.battingStatCell, styles.statText]}>{player.balls}</Text>
            <Text style={[styles.battingCell, styles.battingStatCell, styles.statText]}>{player.fours}</Text>
            <Text style={[styles.battingCell, styles.battingStatCell, styles.statText]}>{player.sixes}</Text>
        </View>
    );
};

// Bowling Stats Row Component
const BowlingRow = ({ player, isHeader }) => {
    if (isHeader) {
        return (
            <View style={styles.bowlingHeader}>
                <Text style={[styles.bowlingCell, styles.bowlingNameCell, styles.headerText]}>Bowler</Text>
                <Text style={[styles.bowlingCell, styles.bowlingStatCell, styles.headerText]}>O</Text>
                <Text style={[styles.bowlingCell, styles.bowlingStatCell, styles.headerText]}>M</Text>
                <Text style={[styles.bowlingCell, styles.bowlingStatCell, styles.headerText]}>R</Text>
                <Text style={[styles.bowlingCell, styles.bowlingStatCell, styles.headerText]}>W</Text>
            </View>
        );
    }

    const hasWickets = player.wickets > 0;

    return (
        <View style={styles.bowlingRow}>
            <Text style={[styles.bowlingCell, styles.bowlingNameCell, styles.playerName]} numberOfLines={1}>
                {player.name}
            </Text>
            <Text style={[styles.bowlingCell, styles.bowlingStatCell, styles.statText]}>{player.overs}</Text>
            <Text style={[styles.bowlingCell, styles.bowlingStatCell, styles.statText]}>{player.maidens}</Text>
            <Text style={[styles.bowlingCell, styles.bowlingStatCell, styles.statText]}>{player.runs}</Text>
            <Text style={[styles.bowlingCell, styles.bowlingStatCell, hasWickets ? styles.wicketsText : styles.statText]}>
                {player.wickets}
            </Text>
        </View>
    );
};

// Innings Card Component
const InningsCard = ({ innings, inningsNumber, isWinner }) => {
    if (!innings) return null;

    const gradientColors = isWinner ? [colors.gold + '15', colors.gold + '08'] : gradients.card;

    return (
        <LinearGradient colors={gradientColors} style={styles.inningsCard}>
            {/* Innings Header */}
            <View style={styles.inningsHeader}>
                <View style={styles.inningsTeamRow}>
                    {isWinner && <Ionicons name="trophy" size={18} color={colors.gold} style={{ marginRight: 8 }} />}
                    <Text style={[styles.inningsTeamName, isWinner && styles.winnerTeamName]}>
                        {innings.batting_team}
                    </Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{innings.score}</Text>
                </View>
            </View>

            {/* Batting Section */}
            <View style={styles.statsSection}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="baseball-outline" size={14} color={colors.accent} />
                    <Text style={styles.sectionTitle}>Batting</Text>
                </View>
                <BattingRow isHeader={true} />
                {innings.batting_stats?.map((player, index) => (
                    <BattingRow key={index} player={player} />
                ))}
            </View>

            {/* Bowling Section */}
            <View style={[styles.statsSection, styles.bowlingSection]}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="fitness-outline" size={14} color={colors.accent} />
                    <Text style={styles.sectionTitle}>Bowling</Text>
                </View>
                <BowlingRow isHeader={true} />
                {innings.bowling_stats?.map((player, index) => (
                    <BowlingRow key={index} player={player} />
                ))}
            </View>
        </LinearGradient>
    );
};

const ScorecardModal = ({ visible, match, onClose }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        if (visible && match) {
            setActiveTab('summary');
            slideAnim.setValue(50);
            fadeAnim.setValue(0);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, match]);

    const teams = match?.teams || [];
    const team1Name = teams[0] || 'Team 1';
    const team2Name = teams[1] || 'Team 2';
    const isTeam1Winner = match?.winner === team1Name;
    const isTeam2Winner = match?.winner === team2Name;
    
    const detailedScorecard = match?.detailed_scorecard;
    const hasDetailedScorecard = !!detailedScorecard?.innings1 || !!detailedScorecard?.innings2;

    // Determine which innings belongs to the winner
    const innings1IsWinner = detailedScorecard?.innings1?.batting_team === match?.winner;
    const innings2IsWinner = detailedScorecard?.innings2?.batting_team === match?.winner;

    return (
        <Modal
            visible={!!visible && !!match}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <LinearGradient colors={gradients.primary} style={styles.container}>
                {/* Header */}
                <LinearGradient colors={gradients.header} style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.matchIdBadge}>
                            <Ionicons name="baseball" size={16} color={colors.accent} />
                            <Text style={styles.headerTitle}>{match?.match_id || ''}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <LinearGradient colors={[colors.error + '30', colors.error + '10']} style={styles.closeButtonGradient}>
                            <Ionicons name="close" size={22} color={colors.error} />
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Tab Switcher */}
                {hasDetailedScorecard && (
                    <View style={styles.tabContainer}>
                        <TouchableOpacity 
                            style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
                            onPress={() => setActiveTab('summary')}
                        >
                            <Ionicons 
                                name="information-circle-outline" 
                                size={18} 
                                color={activeTab === 'summary' ? colors.accent : colors.textMuted} 
                            />
                            <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
                                Summary
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tab, activeTab === 'scorecard' && styles.activeTab]}
                            onPress={() => setActiveTab('scorecard')}
                        >
                            <Ionicons 
                                name="document-text-outline" 
                                size={18} 
                                color={activeTab === 'scorecard' ? colors.accent : colors.textMuted} 
                            />
                            <Text style={[styles.tabText, activeTab === 'scorecard' && styles.activeTabText]}>
                                Full Scorecard
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {activeTab === 'summary' ? (
                            <>
                                {/* Match Card */}
                                <LinearGradient colors={gradients.card} style={styles.matchCard}>
                                    <View style={styles.teamsContainer}>
                                        {/* Team 1 */}
                                        <View style={[styles.teamBox, isTeam1Winner && styles.winnerBox]}>
                                            {isTeam1Winner && (
                                                <View style={styles.winnerCrown}>
                                                    <Ionicons name="trophy" size={20} color={colors.gold} />
                                                </View>
                                            )}
                                            <Text style={[styles.teamName, isTeam1Winner && styles.winnerName]}>
                                                {team1Name}
                                            </Text>
                                            {isTeam1Winner && <Text style={styles.winnerLabel}>WINNER</Text>}
                                        </View>

                                        {/* VS Badge */}
                                        <View style={styles.vsBadge}>
                                            <Text style={styles.vsText}>VS</Text>
                                        </View>

                                        {/* Team 2 */}
                                        <View style={[styles.teamBox, isTeam2Winner && styles.winnerBox]}>
                                            {isTeam2Winner && (
                                                <View style={styles.winnerCrown}>
                                                    <Ionicons name="trophy" size={20} color={colors.gold} />
                                                </View>
                                            )}
                                            <Text style={[styles.teamName, isTeam2Winner && styles.winnerName]}>
                                                {team2Name}
                                            </Text>
                                            {isTeam2Winner && <Text style={styles.winnerLabel}>WINNER</Text>}
                                        </View>
                                    </View>
                                </LinearGradient>

                                {/* Quick Score Summary */}
                                {hasDetailedScorecard && (
                                    <LinearGradient colors={gradients.card} style={styles.quickScoreCard}>
                                        <View style={styles.quickScoreRow}>
                                            <View style={styles.quickScoreTeam}>
                                                <Text style={styles.quickScoreTeamName} numberOfLines={1}>
                                                    {detailedScorecard.innings1?.batting_team}
                                                </Text>
                                                <Text style={[
                                                    styles.quickScoreValue,
                                                    innings1IsWinner && styles.winnerScoreValue
                                                ]}>
                                                    {detailedScorecard.innings1?.score}
                                                </Text>
                                            </View>
                                            <View style={styles.quickScoreDivider} />
                                            <View style={styles.quickScoreTeam}>
                                                <Text style={styles.quickScoreTeamName} numberOfLines={1}>
                                                    {detailedScorecard.innings2?.batting_team}
                                                </Text>
                                                <Text style={[
                                                    styles.quickScoreValue,
                                                    innings2IsWinner && styles.winnerScoreValue
                                                ]}>
                                                    {detailedScorecard.innings2?.score}
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                )}

                                {/* Result Box */}
                                <LinearGradient 
                                    colors={[colors.accent + '20', colors.accent + '05']} 
                                    style={styles.resultBox}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.resultIconContainer}>
                                        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                                    </View>
                                    <View style={styles.resultTextContainer}>
                                        <Text style={styles.resultLabel}>Match Result</Text>
                                        <Text style={styles.resultText}>
                                            {match?.scorecard_summary || `${match?.winner || 'TBD'} won the match!`}
                                        </Text>
                                    </View>
                                </LinearGradient>

                                {/* Man of the Match */}
                                {match?.man_of_the_match && (
                                    <LinearGradient 
                                        colors={[colors.gold + '20', colors.gold + '05']} 
                                        style={styles.potmBox}
                                    >
                                        <View style={styles.potmHeader}>
                                            <View style={styles.potmIconContainer}>
                                                <Ionicons name="star" size={24} color={colors.gold} />
                                            </View>
                                            <View style={styles.potmTextContainer}>
                                                <Text style={styles.potmLabel}>Man of the Match</Text>
                                                <Text style={styles.potmName}>{match.man_of_the_match}</Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                )}

                                {/* View Scorecard Button */}
                                {hasDetailedScorecard && (
                                    <TouchableOpacity 
                                        style={styles.viewScorecardButton}
                                        onPress={() => setActiveTab('scorecard')}
                                    >
                                        <LinearGradient 
                                            colors={gradients.accent} 
                                            style={styles.viewScorecardGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Ionicons name="document-text" size={20} color={colors.background} />
                                            <Text style={styles.viewScorecardText}>View Full Scorecard</Text>
                                            <Ionicons name="chevron-forward" size={20} color={colors.background} />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Detailed Scorecard View */}
                                {detailedScorecard?.innings1 && (
                                    <InningsCard 
                                        innings={detailedScorecard.innings1} 
                                        inningsNumber={1}
                                        isWinner={innings1IsWinner}
                                    />
                                )}
                                {detailedScorecard?.innings2 && (
                                    <InningsCard 
                                        innings={detailedScorecard.innings2} 
                                        inningsNumber={2}
                                        isWinner={innings2IsWinner}
                                    />
                                )}

                                {/* Result Summary at bottom */}
                                <LinearGradient 
                                    colors={[colors.accent + '20', colors.accent + '05']} 
                                    style={styles.resultBoxCompact}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                    <Text style={styles.resultTextCompact}>
                                        {match?.scorecard_summary || `${match?.winner} won!`}
                                    </Text>
                                </LinearGradient>
                            </>
                        )}
                    </Animated.View>

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </LinearGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerLeft: {
        flex: 1,
    },
    matchIdBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent + '15',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.accent,
    },
    closeButton: {
        marginLeft: 16,
    },
    closeButtonGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: colors.cardBackground,
        gap: 8,
    },
    activeTab: {
        backgroundColor: colors.accent + '20',
        borderWidth: 1,
        borderColor: colors.accent + '40',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
    },
    activeTabText: {
        color: colors.accent,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    matchCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamBox: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.glassBackground,
    },
    winnerBox: {
        backgroundColor: colors.gold + '15',
        borderWidth: 1,
        borderColor: colors.gold + '40',
    },
    winnerCrown: {
        marginBottom: 8,
    },
    teamName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    winnerName: {
        color: colors.gold,
    },
    winnerLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.gold,
        marginTop: 6,
        letterSpacing: 1,
    },
    vsBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.cardBackgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    vsText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    quickScoreCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickScoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickScoreTeam: {
        flex: 1,
        alignItems: 'center',
    },
    quickScoreTeamName: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    quickScoreValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    winnerScoreValue: {
        color: colors.gold,
    },
    quickScoreDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.borderLight,
        marginHorizontal: 16,
    },
    resultBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.accent + '30',
    },
    resultIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultLabel: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    resultText: {
        fontSize: 15,
        color: colors.accent,
        fontWeight: '600',
        marginTop: 2,
    },
    potmBox: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.gold + '30',
    },
    potmHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    potmIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.gold + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    potmTextContainer: {
        flex: 1,
    },
    potmLabel: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    potmName: {
        fontSize: 16,
        color: colors.gold,
        fontWeight: '700',
        marginTop: 2,
    },
    viewScorecardButton: {
        marginTop: 4,
    },
    viewScorecardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 10,
    },
    viewScorecardText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.background,
    },
    // Innings Card Styles
    inningsCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inningsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    inningsTeamRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    inningsTeamName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    winnerTeamName: {
        color: colors.gold,
    },
    scoreBadge: {
        backgroundColor: colors.accent + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.accent,
    },
    statsSection: {
        marginBottom: 12,
    },
    bowlingSection: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        marginBottom: 0,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 6,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Batting Table Styles
    battingHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        backgroundColor: colors.glassBackground,
        borderRadius: 8,
        marginBottom: 4,
    },
    battingRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    battingCell: {
        justifyContent: 'center',
    },
    battingNameCell: {
        flex: 2.5,
        paddingLeft: 8,
    },
    battingStatCell: {
        flex: 0.7,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
    },
    playerName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
    },
    notOutName: {
        color: colors.accent,
    },
    notOutBadge: {
        color: colors.accent,
        fontWeight: '800',
    },
    dismissalText: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: 2,
    },
    runsText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    statText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    wicketsText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.accent,
    },
    // Bowling Table Styles
    bowlingHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        backgroundColor: colors.glassBackground,
        borderRadius: 8,
        marginBottom: 4,
    },
    bowlingRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    bowlingCell: {
        justifyContent: 'center',
    },
    bowlingNameCell: {
        flex: 2,
        paddingLeft: 8,
    },
    bowlingStatCell: {
        flex: 0.75,
        alignItems: 'center',
    },
    resultBoxCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: colors.accent + '30',
    },
    resultTextCompact: {
        flex: 1,
        fontSize: 14,
        color: colors.accent,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 40,
    },
});

export default ScorecardModal;
