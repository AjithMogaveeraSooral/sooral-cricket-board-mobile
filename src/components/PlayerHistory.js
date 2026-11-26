import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text } from "../contexts/Language";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSPL } from '../contexts/SPLContext';
import { playerKey, playerHistory } from '../utils/playerHistory';
import colors from '../constants/colors';

export default function PlayerHistory({ name, onBack }) {
    const { players, tournaments } = useSPL();
    const [season, setSeason] = useState(null);
    const player = players.find(item => playerKey(item.name) === playerKey(name));
    const history = playerHistory(tournaments, name);
    const seasons = [...new Set(history.map(match => match.season))];
    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.header}>
                <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10}>
                    <Ionicons name="arrow-back" size={26} color={colors.accent} />
                </Pressable>
                <Text style={styles.name}>{player?.name || name}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.meta}>{player ? `Career: ${player.matches} matches | ${player.total_runs} runs | ${player.wickets} wickets` : 'Career totals unavailable'}</Text>
                <Text style={styles.title}>Match history</Text>
                {seasons.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[null, ...seasons].map(item => <Pressable key={item || 'all'} accessibilityRole="button" accessibilityState={{ selected: item === season }} onPress={() => setSeason(item)} style={styles.filter}>
                        <Text style={{ color: item === season ? colors.accent : colors.textSecondary }}>{item || 'All seasons'}</Text>
                    </Pressable>)}
                </ScrollView>}
                {history.filter(match => !season || match.season === season).map(match => <View key={`${match.season}:${match.id}`} style={styles.match}>
                    <Text style={styles.meta}>{match.season} | {match.id}</Text>
                    <Text style={styles.teams}>{match.teams}</Text>
                    {match.lines.map((line, index) => <Text key={index} style={styles.line}>{line}</Text>)}
                    <Text style={styles.meta}>{match.result}</Text>
                </View>)}
                {!history.length && <Text style={styles.meta}>No batting or bowling entries in available scorecards.</Text>}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18 },
    name: { color: colors.text, fontSize: 22, fontWeight: '700', flex: 1 },
    content: { paddingHorizontal: 18, paddingBottom: 28, gap: 10 },
    title: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 12 },
    meta: { color: colors.textSecondary },
    filter: { paddingVertical: 10, paddingRight: 16 },
    match: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.textMuted, paddingVertical: 12, gap: 6 },
    teams: { color: colors.text, fontSize: 16, fontWeight: '600' },
    line: { color: colors.textPrimary },
});