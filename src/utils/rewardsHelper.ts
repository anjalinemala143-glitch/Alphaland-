import { UserStats, Badge } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'explore_1',
    title: 'First Explorer',
    description: 'Looked at your first alphabet box!',
    icon: '🧭',
    unlockedAt: null,
    reqDescription: 'Explore any 1 letter'
  },
  {
    id: 'explore_all',
    title: 'Alphabet Master',
    description: 'Discovered all 26 wonderful letters!',
    icon: '🏆',
    unlockedAt: null,
    reqDescription: 'Explore all 26 letters'
  },
  {
    id: 'trace_1',
    title: 'Pencil Beginner',
    description: 'Completed your very first letter trace drawing!',
    icon: '✏️',
    unlockedAt: null,
    reqDescription: 'Trace 1 letter'
  },
  {
    id: 'trace_10',
    title: 'Mighty Writer',
    description: 'Traced 10 letters with high accuracy!',
    icon: '🎨',
    unlockedAt: null,
    reqDescription: 'Trace 10 different letters'
  },
  {
    id: 'game_1',
    title: 'Quiz Kid',
    description: 'Played your first letter quiz mini-game!',
    icon: '👾',
    unlockedAt: null,
    reqDescription: 'Play 1 mini-game'
  },
  {
    id: 'game_won_5',
    title: 'Star Solver',
    description: 'Answered 5 mini-game questions correctly!',
    icon: '⭐',
    unlockedAt: null,
    reqDescription: 'Get 5 correct answers'
  },
  {
    id: 'star_champion',
    title: 'Crown of Stars',
    description: 'Gathered a legendary pile of golden stars!',
    icon: '👑',
    unlockedAt: null,
    reqDescription: 'Reach 150 total stars'
  }
];

export const INITIAL_STATS: UserStats = {
  stars: 10, // give a nice headstart of 10 stars so they see rewards instantly!
  unlockedLetters: [],
  tracedLetters: [],
  gamesPlayed: 0,
  gamesWon: 0,
  badges: INITIAL_BADGES
};

const STORAGE_KEY = 'alphabet_learning_stats_v1';

export function getStats(): UserStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as UserStats;
      // Merge with initial badges to avoid missing keys
      const mergedBadges = INITIAL_BADGES.map((bt) => {
        const found = parsed.badges?.find((b) => b.id === bt.id);
        return found ? { ...bt, unlockedAt: found.unlockedAt } : bt;
      });
      return {
        ...INITIAL_STATS,
        ...parsed,
        badges: mergedBadges
      };
    }
  } catch (e) {
    console.error('Error reading stats:', e);
  }
  return INITIAL_STATS;
}

export function saveStats(stats: UserStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
}

export function updateStatsAndCheckBadges(
  updater: (prev: UserStats) => Partial<UserStats>,
  onBadgeUnlocked?: (badge: Badge) => void
): UserStats {
  const current = getStats();
  const updatedFields = updater(current);
  const nextStats: UserStats = {
    ...current,
    ...updatedFields,
  };

  // Badge unlock triggers
  let newlyUnlockedSome = false;
  const nextBadges = nextStats.badges.map((b) => {
    if (b.unlockedAt) return b; // Already unlocked

    let shouldUnlock = false;
    switch (b.id) {
      case 'explore_1':
        shouldUnlock = nextStats.unlockedLetters.length >= 1;
        break;
      case 'explore_all':
        shouldUnlock = nextStats.unlockedLetters.length >= 26;
        break;
      case 'trace_1':
        shouldUnlock = nextStats.tracedLetters.length >= 1;
        break;
      case 'trace_10':
        shouldUnlock = nextStats.tracedLetters.length >= 10;
        break;
      case 'game_1':
        shouldUnlock = nextStats.gamesPlayed >= 1;
        break;
      case 'game_won_5':
        shouldUnlock = nextStats.gamesWon >= 5;
        break;
      case 'star_champion':
        shouldUnlock = nextStats.stars >= 150;
        break;
    }

    if (shouldUnlock) {
      newlyUnlockedSome = true;
      const unlockedBadge = {
        ...b,
        unlockedAt: new Date().toLocaleDateString()
      };
      // notify
      setTimeout(() => {
        onBadgeUnlocked?.(unlockedBadge);
      }, 100);
      return unlockedBadge;
    }

    return b;
  });

  const finalStats = {
    ...nextStats,
    badges: nextBadges
  };

  saveStats(finalStats);
  return finalStats;
}
