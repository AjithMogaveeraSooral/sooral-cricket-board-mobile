// Utility functions for SPL calculations

export const safeNum = (v, fallback = 0) => {
    return (v === undefined || v === null || Number.isNaN(Number(v))) ? fallback : Number(v);
};

export const safeDisplay = (v, fallback = "—") => {
    if (v === null || v === undefined) return fallback;
    if (typeof v === 'number' && !Number.isInteger(v)) {
        return v.toFixed(2);
    }
    return String(v);
};

export const parseBestSpell = (spell) => {
    if (!spell || typeof spell !== "string") return { wickets: 0, runs: 0 };
    const s = spell.trim();
    if (s === "" || s === "0-0") return { wickets: 0, runs: 0 };
    const parts = s.includes('-') ? s.split('-') : s.includes('/') ? s.split('/') : [s, "0"];
    return {
        wickets: parseInt(parts[0] || "0", 10) || 0,
        runs: parseInt(parts[1] || "0", 10) || 0
    };
};

export const calculateBattingRating = (p) => {
    const runs = Number(p.total_runs || 0);
    const innings = Number(p.innings || 0);
    const not_outs = Number(p.not_outs || 0);
    const balls = Number(p.balls_faced || 0);
    const outs = Math.max(innings - not_outs, 1);
    const average = runs / outs;
    const strikeRate = balls > 0 ? (runs / balls) * 100 : 0;

    const points =
        runs * 1 +
        average * 18 +
        strikeRate * 0.45 +
        (Number(p.highest_score) || 0) * 2;

    return {
        points: Math.round(points * 100) / 100,
        average: Math.round(average * 100) / 100,
        strikeRate: Math.round(strikeRate * 100) / 100
    };
};

export const calculateBowlingRating = (p) => {
    const totalWickets = Number(p.wickets || 0);
    const totalBalls = Number(p.total_balls_bowled || 0);
    const conceded = Number(p.total_runs_conceded || 0);
    const overs = totalBalls > 0 ? (Math.floor(totalBalls / 6) + (totalBalls % 6) / 10) : 0;
    const economy = totalBalls > 0 ? (conceded / (totalBalls / 6)) : 0;
    const bowlStrikeRate = totalWickets > 0 ? (totalBalls / totalWickets) : 0;

    const best = parseBestSpell(p.best_spell);

    const points =
        totalWickets * 24 +
        (best.wickets || 0) * 14 -
        (best.runs || 0) * 0.15 +
        (Number(p.maidens) || 0) * 7 +
        (Number(p.three_wicket_hauls) || 0) * 9 +
        (Number(p.four_wicket_hauls) || 0) * 14 +
        (Number(p.five_wicket_hauls) || 0) * 24 -
        economy * 1.5;

    return {
        points: Math.round(points * 100) / 100,
        economy: Math.round(economy * 100) / 100,
        strikeRate: Math.round(bowlStrikeRate * 100) / 100,
        overs: overs
    };
};

export const calculateAllrounderRating = (bat, bowl) => {
    if (!bat || !bowl) return 0;
    const raw = (bat * bowl) / 100;
    return Math.round(raw * 100) / 100;
};

export const assignRanks = (list, key, hideZero = false) => {
    const sorted = [...list].sort((a, b) => (b[key] || 0) - (a[key] || 0));
    let rank = 1;
    let lastScore = null;
    let lastRank = 1;

    sorted.forEach(p => {
        const score = Number(p[key] || 0);
        if (hideZero && score <= 0) {
            p.temp_rank = null;
        } else {
            if (lastScore !== null && score === lastScore) {
                p.temp_rank = lastRank;
            } else {
                p.temp_rank = rank;
                lastRank = rank;
            }
        }
        lastScore = score;
        rank++;
    });

    return new Map(sorted.map(p => [p.player_id, p.temp_rank]));
};

export const calculateRanksPointsBased = (players) => {
    let list = players.map(p => {
        const bat = calculateBattingRating(p);
        return {
            ...p,
            batting_points: bat.points,
            batting_average: bat.average,
            batting_strike_rate: bat.strikeRate
        };
    });

    const battingRanks = assignRanks(list, "batting_points");

    list = list.map(p => {
        const bowl = calculateBowlingRating(p);
        return {
            ...p,
            bowling_points: bowl.points,
            bowling_economy: bowl.economy,
            bowling_strike_rate: bowl.strikeRate,
            bowling_overs_calc: bowl.overs
        };
    });

    const bowlingRanks = assignRanks(list, "bowling_points");

    list = list.map(p => {
        const ar = calculateAllrounderRating(p.batting_points || 0, p.bowling_points || 0);
        return {
            ...p,
            allrounder_points: ar
        };
    });

    const allrounderRanks = assignRanks(list, "allrounder_points", true);

    const rankedPlayers = list.map(p => ({
        ...p,
        batting_rank: battingRanks.get(p.player_id) || null,
        bowling_rank: bowlingRanks.get(p.player_id) || null,
        allrounder_rank: allrounderRanks.get(p.player_id) || null
    }));
    
    const battingSorted = [...rankedPlayers].sort((a, b) => (b.batting_points || 0) - (a.batting_points || 0));
    const bowlingSorted = [...rankedPlayers].sort((a, b) => (b.bowling_points || 0) - (a.bowling_points || 0));
    const allrounderSorted = [...rankedPlayers].sort((a, b) => (b.allrounder_points || 0) - (a.allrounder_points || 0));

    return {
        rankedPlayers,
        topBatter: battingSorted.find(p => p.batting_points > 0) || null,
        topBowler: bowlingSorted.find(p => p.bowling_points > 0) || null,
        topAllrounder: allrounderSorted.find(p => p.allrounder_points > 0) || null,
        battingSorted,
        bowlingSorted,
        allrounderSorted,
    };
};

export const calculateLeader = (rankedPlayers) => {
    const battingSorted = [...rankedPlayers].sort((a, b) => safeNum(b.total_runs, 0) - safeNum(a.total_runs, 0));
    const bowlingSorted = [...rankedPlayers].sort((a, b) => safeNum(b.wickets, 0) - safeNum(a.wickets, 0));
    const highestSixHitterSorted = [...rankedPlayers].sort((a, b) => safeNum(b.sixes, 0) - safeNum(a.sixes, 0));
    
    return {
        topBatter: battingSorted[0] || null,
        topBowler: bowlingSorted[0] || null,
        highestSixHitter: highestSixHitterSorted[0] || null,
    };
};

export const sortPlayersByName = (players) => {
    return [...players].sort((a, b) =>
        a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1
    );
};
