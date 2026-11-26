export function playerKey(name) {
    return String(name || '').replace(/\s*\((?:c|wk)\)/gi, '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function playerHistory(tournaments, name) {
    const key = playerKey(name);
    const history = [];
    for (const season of tournaments || []) {
        for (const match of season.matches || []) {
            const lines = [];
            for (const innings of Object.values(match.detailed_scorecard || {})) {
                for (const row of innings?.batting_stats || []) {
                    if (key && playerKey(row.name) === key) lines.push(`Batting: ${row.runs} (${row.balls} balls) | ${row.fours} fours, ${row.sixes} sixes${row.status ? ` | ${row.status}` : ''}`);
                }
                for (const row of innings?.bowling_stats || []) {
                    if (key && playerKey(row.name) === key) lines.push(`Bowling: ${row.wickets}/${row.runs} in ${row.overs} overs | ${row.maidens ?? 0} maidens`);
                }
            }
            if (lines.length) history.push({ season: season.name, id: match.match_id, teams: match.teams.join(' vs '), result: match.scorecard_summary, lines });
        }
    }
    return history.reverse();
}