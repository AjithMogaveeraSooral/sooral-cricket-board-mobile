import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { playerKey } from '../utils/playerHistory';

const badges = new Map([
    ['Kings Sooral', require('../../assets/teams/kings.jpg')],
    ['Sooral Bulls', require('../../assets/teams/bulls.jpg')],
    ['Sooral Warriors', require('../../assets/teams/warriors.jpg')],
    ['Sooral Sixers', require('../../assets/teams/sixers.jpg')],
]);

export function TeamBadge({ name }) {
    const source = badges.get(name);
    return source ? <Image source={source} resizeMode="contain" style={styles.badge} /> : null;
}

function seasonTeams(matches) {
    const teams = new Map();
    for (const match of matches) {
        const sides = match.teams || [];
        for (const side of sides) if (!teams.has(side)) teams.set(side, new Map());
        for (const innings of Object.values(match.detailed_scorecard || {})) {
            if (!sides.includes(innings?.batting_team)) continue;
            const opponent = sides.find(side => side !== innings.batting_team);
            for (const [side, rows] of [[innings.batting_team, innings.batting_stats], [opponent, innings.bowling_stats]]) {
                for (const row of rows || []) {
                    const key = playerKey(row.name);
                    if (key) teams.get(side)?.set(key, row.name.replace(/\s*\((?:c|wk)\)/gi, '').trim());
                }
            }
        }
    }
    return Array.from(teams, ([name, players]) => ({ name, players: [...players.values()].sort((left, right) => left.localeCompare(right)) })).sort((left, right) => left.name.localeCompare(right.name));
}

export default function SeasonTeams({ matches }) {
    const [expanded, setExpanded] = useState(null);
    if (!matches.length) return null;
    return <View style={styles.section}>
        <Text style={styles.title}>Teams</Text>
        <Text style={styles.note}>Players recorded in this season's batting and bowling scorecards.</Text>
        {seasonTeams(matches).map(({ name, players }) => <View key={name}>
            <Pressable style={styles.row} accessibilityRole="button" accessibilityState={{ expanded: expanded === name }} onPress={() => setExpanded(expanded === name ? null : name)}>
                <TeamBadge name={name} /><Text style={styles.team}>{name} ({players.length})</Text>
                <Ionicons name={expanded === name ? 'chevron-up' : 'chevron-down'} size={18} color={colors.accent} />
            </Pressable>
            {expanded === name && <Text style={styles.players}>{players.join('\n') || 'No player entries recorded.'}</Text>}
        </View>)}
    </View>;
}

const styles = StyleSheet.create({
    section: { paddingVertical: 12, gap: 6 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text },
    note: { color: colors.textSecondary, marginBottom: 6 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    badge: { width: 40, height: 40, marginRight: 10, borderRadius: 4, backgroundColor: '#080808' },
    team: { flex: 1, color: colors.text, fontWeight: '600' },
    players: { paddingLeft: 50, lineHeight: 24, color: colors.textSecondary },
});