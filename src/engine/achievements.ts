export interface GameStats {
  levelsCompleted: number       // levelNum - 1
  totalScore: number
  bestStreak: number
  bestTimes: Record<string, number>
  perfectLevels: number
}

export interface Achievement {
  id: string
  category: 'progress' | 'score' | 'streak' | 'speed' | 'perfection'
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold'
  check: (stats: GameStats) => boolean
}

export interface PlayerTitle {
  title: string
  subtitle: string
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Progress ──────────────────────────────────────────────────────────────
  { id: 'p1',   category: 'progress',   tier: 'bronze', icon: '🔢', title: 'First Steps',     description: 'Complete 25 levels',                          check: s => s.levelsCompleted >= 25  },
  { id: 'p10',  category: 'progress',   tier: 'silver', icon: '📐', title: 'Dedicated',       description: 'Complete 100 levels',                         check: s => s.levelsCompleted >= 100 },
  { id: 'p25',  category: 'progress',   tier: 'gold',   icon: '🏆', title: 'Legendary',       description: 'Complete 300 levels',                         check: s => s.levelsCompleted >= 300 },

  // ── Score ─────────────────────────────────────────────────────────────────
  { id: 's1k',  category: 'score',      tier: 'bronze', icon: '⭐', title: 'Sharp Mind',      description: 'Earn 25,000 total points',                    check: s => s.totalScore >= 25_000   },
  { id: 's10k', category: 'score',      tier: 'silver', icon: '🌟', title: 'Cruncher',        description: 'Earn 250,000 total points',                   check: s => s.totalScore >= 250_000  },
  { id: 's50k', category: 'score',      tier: 'gold',   icon: '💫', title: 'Math Wizard',     description: 'Earn 1,000,000 total points',                 check: s => s.totalScore >= 1_000_000  },

  // ── Streak ────────────────────────────────────────────────────────────────
  { id: 'st3',  category: 'streak',     tier: 'bronze', icon: '🔥', title: 'On a Roll',       description: 'Achieve a 15-level winning streak',           check: s => s.bestStreak >= 15       },
  { id: 'st10', category: 'streak',     tier: 'silver', icon: '🚀', title: 'On Fire',         description: 'Achieve a 50-level winning streak',           check: s => s.bestStreak >= 50      },
  { id: 'st25', category: 'streak',     tier: 'gold',   icon: '⚡', title: 'Unstoppable',     description: 'Achieve a 125-level winning streak',          check: s => s.bestStreak >= 125      },

  // ── Speed ─────────────────────────────────────────────────────────────────
  { id: 'sp90', category: 'speed',      tier: 'bronze', icon: '⏱',  title: 'Quick Thinker',   description: 'Solve any level in under 60 seconds',         check: s => Object.values(s.bestTimes).some(t => t < 60) },
  { id: 'sp45', category: 'speed',      tier: 'silver', icon: '💨', title: 'Speed Run',       description: 'Solve any level in under 30 seconds',         check: s => Object.values(s.bestTimes).some(t => t < 30) },
  { id: 'sp20', category: 'speed',      tier: 'gold',   icon: '🌪',  title: 'Lightning',       description: 'Solve any level in under 12 seconds',         check: s => Object.values(s.bestTimes).some(t => t < 12) },

  // ── Perfection ────────────────────────────────────────────────────────────
  { id: 'pf1',  category: 'perfection', tier: 'bronze', icon: '✨', title: 'Flawless',        description: 'Finish 10 levels with no mistakes and no hints', check: s => s.perfectLevels >= 10   },
  { id: 'pf5',  category: 'perfection', tier: 'silver', icon: '💎', title: 'Precise',         description: 'Finish 50 levels with no mistakes and no hints', check: s => s.perfectLevels >= 50  },
  { id: 'pf20', category: 'perfection', tier: 'gold',   icon: '👑', title: 'Pristine',        description: 'Finish 150 levels with no mistakes and no hints', check: s => s.perfectLevels >= 150 },
]

export const TIER_COLORS: Record<Achievement['tier'], string> = {
  bronze: '#c97c3a',
  silver: '#9eb4c0',
  gold:   '#ffc93c',
}

export function getUnlocked(stats: GameStats): Set<string> {
  return new Set(ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id))
}

export function getPlayerTitle(stats: GameStats): PlayerTitle {
  const { levelsCompleted, bestStreak, perfectLevels } = stats
  if (perfectLevels >= 150 && levelsCompleted >= 300) return { title: 'Pristine Master',  subtitle: 'Perfect in every way'    }
  if (bestStreak >= 125)                               return { title: 'Unstoppable',      subtitle: 'On an endless streak'    }
  if (levelsCompleted >= 300)                          return { title: 'Grand Master',     subtitle: 'A true math legend'      }
  if (levelsCompleted >= 100)                          return { title: 'Expert',           subtitle: 'Deep in the numbers'     }
  if (levelsCompleted >= 50)                           return { title: 'Mathematician',    subtitle: 'Getting serious'         }
  if (levelsCompleted >= 25)                           return { title: 'Apprentice',       subtitle: 'Learning the ropes'      }
  if (levelsCompleted >= 10)                           return { title: 'Beginner',         subtitle: 'Just warming up'         }
  if (levelsCompleted >= 1)                            return { title: 'Novice',           subtitle: 'First puzzle awaits'     }
  return                                                       { title: 'Newcomer',         subtitle: 'Ready to begin'          }
}
