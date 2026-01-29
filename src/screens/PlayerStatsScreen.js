import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    RefreshControl, 
    StyleSheet, 
    ActivityIndicator,
    TouchableOpacity,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSPL } from '../contexts/SPLContext';
import PlayerCard from '../components/PlayerCard';
import colors, { gradients } from '../constants/colors';

const SORT_OPTIONS = [
    { key: 'batting_rank', label: 'Batting', icon: 'baseball-outline' },
    { key: 'bowling_rank', label: 'Bowling', icon: 'fitness-outline' },
    { key: 'allrounder_rank', label: 'Allrounder', icon: 'star-outline' },
    { key: 'total_runs', label: 'Runs', icon: 'trending-up-outline' },
    { key: 'highest_score', label: 'High Score', icon: 'trophy-outline' },
    { key: 'wickets', label: 'Wickets', icon: 'flame-outline' },
    { key: 'sixes', label: 'Sixes', icon: 'rocket-outline' },
    { key: 'fours', label: 'Fours', icon: 'flash-outline' },
    { key: 'name', label: 'Name', icon: 'person-outline' },
];

const SortChip = ({ item, isActive, onPress, index }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            delay: index * 50,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {isActive ? (
                    <LinearGradient
                        colors={gradients.accent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sortChip}
                    >
                        <Ionicons name={item.icon} size={14} color={colors.background} />
                        <Text style={styles.sortChipTextActive}>{item.label}</Text>
                    </LinearGradient>
                ) : (
                    <View style={[styles.sortChip, styles.sortChipInactive]}>
                        <Ionicons name={item.icon} size={14} color={colors.textSecondary} />
                        <Text style={styles.sortChipText}>{item.label}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const PlayerStatsScreen = () => {
    // Use rankedPlayers which has calculated points and ranks
    const { rankedPlayers, loading, error, refreshData } = useSPL();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('batting_rank');
    const searchFocusAnim = useRef(new Animated.Value(0)).current;

    const filteredAndSortedPlayers = useMemo(() => {
        if (!rankedPlayers) return [];

        let result = [...rankedPlayers];

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.name?.toLowerCase().includes(query)
            );
        }

        // Sort based on website logic
        result.sort((a, b) => {
            if (sortBy === 'name') {
                return (a.name || '').localeCompare(b.name || '');
            }
            if (sortBy === 'batting_rank') {
                // Sort by batting points descending (higher points = better rank)
                return (b.batting_points || 0) - (a.batting_points || 0);
            }
            if (sortBy === 'bowling_rank') {
                // Sort by bowling points descending
                return (b.bowling_points || 0) - (a.bowling_points || 0);
            }
            if (sortBy === 'allrounder_rank') {
                // Sort by allrounder points descending
                return (b.allrounder_points || 0) - (a.allrounder_points || 0);
            }
            // For numeric stats, sort descending
            const aVal = parseFloat(a[sortBy]) || 0;
            const bVal = parseFloat(b[sortBy]) || 0;
            return bVal - aVal;
        });

        return result;
    }, [rankedPlayers, searchQuery, sortBy]);

    const handleSearchFocus = () => {
        Animated.timing(searchFocusAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleSearchBlur = () => {
        Animated.timing(searchFocusAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const searchBorderColor = searchFocusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.borderLight, colors.accent],
    });

    const renderPlayer = ({ item, index }) => <PlayerCard player={item} index={index} />;

    if (loading && !rankedPlayers) {
        return (
            <LinearGradient colors={gradients.primary} style={styles.centered}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Loading Players...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={gradients.primary} style={styles.centered}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color={colors.error} />
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={gradients.primary} style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Animated.View style={[styles.searchInputWrapper, { borderColor: searchBorderColor }]}>
                    <View style={styles.searchIconContainer}>
                        <Ionicons name="search" size={20} color={colors.accent} />
                    </View>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search players..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => setSearchQuery('')}
                            style={styles.clearButton}
                        >
                            <View style={styles.clearButtonInner}>
                                <Ionicons name="close" size={14} color={colors.background} />
                            </View>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>

            {/* Sort Options */}
            <View style={styles.sortContainer}>
                <View style={styles.sortHeader}>
                    <Ionicons name="funnel-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.sortLabel}>Sort by</Text>
                </View>
                <FlatList
                    data={SORT_OPTIONS}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item, index }) => (
                        <SortChip 
                            item={item}
                            isActive={sortBy === item.key}
                            onPress={() => setSortBy(item.key)}
                            index={index}
                        />
                    )}
                    contentContainerStyle={styles.sortList}
                />
            </View>

            {/* Player Count */}
            <View style={styles.countContainer}>
                <LinearGradient 
                    colors={[colors.accent + '15', colors.accent + '05']} 
                    style={styles.countBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name="people" size={14} color={colors.accent} />
                    <Text style={styles.countText}>
                        {filteredAndSortedPlayers.length} Player{filteredAndSortedPlayers.length !== 1 ? 's' : ''}
                    </Text>
                </LinearGradient>
            </View>

            {/* Players List */}
            <FlatList
                data={filteredAndSortedPlayers}
                renderItem={renderPlayer}
                keyExtractor={(item) => item.player_id || item.name}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={!!loading}
                        onRefresh={refreshData}
                        tintColor={colors.accent}
                        colors={[colors.accent]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.noPlayers}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                        </View>
                        <Text style={styles.noPlayersTitle}>No players found</Text>
                        <Text style={styles.noPlayersText}>Try adjusting your search</Text>
                    </View>
                }
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: colors.accent,
        borderRadius: 20,
    },
    retryText: {
        color: colors.background,
        fontWeight: '600',
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 12,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        paddingHorizontal: 4,
        borderWidth: 2,
        overflow: 'hidden',
    },
    searchIconContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: colors.text,
        paddingRight: 12,
    },
    clearButton: {
        padding: 8,
    },
    clearButtonInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.textMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    sortHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 6,
    },
    sortLabel: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sortList: {
        gap: 8,
    },
    sortChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    sortChipInactive: {
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    sortChipText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    sortChipTextActive: {
        fontSize: 13,
        color: colors.background,
        fontWeight: '700',
    },
    countContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    countBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: colors.accent + '20',
    },
    countText: {
        fontSize: 13,
        color: colors.accent,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    noPlayers: {
        padding: 40,
        alignItems: 'center',
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.glassBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    noPlayersTitle: {
        fontSize: 18,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 4,
    },
    noPlayersText: {
        fontSize: 14,
        color: colors.textMuted,
    },
});

export default PlayerStatsScreen;
