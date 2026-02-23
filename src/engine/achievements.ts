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
  { id: 'p1',   category: 'progress',   tier: 'bronze', icon: '🔢', title: 'First Steps',     description: 'Complete your first level',                   check: s => s.levelsCompleted >= 1  },
  { id: 'p10',  category: 'progress',   tier: 'silver', icon: '📐', title: 'Ten Deep',        description: 'Complete 10 levels',                          check: s => s.levelsCompleted >= 10 },
  { id: 'p25',  category: 'progress',   tier: 'gold',   icon: '🏆', title: 'Century',         description: 'Complete 25 levels',                          check: s => s.levelsCompleted >= 25 },

  // ── Score ─────────────────────────────────────────────────────────────────
  { id: 's1k',  category: 'score',      tier: 'bronze', icon: '⭐', title: 'Sharp Mind',      description: 'Earn 1,000 total points',                     check: s => s.totalScore >= 1_000   },
  { id: 's10k', category: 'score',      tier: 'silver', icon: '🌟', title: 'Cruncher',        description: 'Earn 10,000 total points',                    check: s => s.totalScore >= 10_000  },
  { id: 's50k', category: 'score',      tier: 'gold',   icon: '💫', title: 'Math Wizard',     description: 'Earn 50,000 total points',                    check: s => s.totalScore >= 50_000  },

  // ── Streak ────────────────────────────────────────────────────────────────
  { id: 'st3',  category: 'streak',     tier: 'bronze', icon: '🔥', title: 'On a Roll',       description: 'Achieve a 3-level winning streak',            check: s => s.bestStreak >= 3       },
  { id: 'st10', category: 'streak',     tier: 'silver', icon: '🚀', title: 'On Fire',         description: 'Achieve a 10-level winning streak',           check: s => s.bestStreak >= 10      },
  { id: 'st25', category: 'streak',     tier: 'gold',   icon: '⚡', title: 'Unstoppable',     description: 'Achieve a 25-level winning streak',           check: s => s.bestStreak >= 25      },

  // ── Speed ─────────────────────────────────────────────────────────────────
  { id: 'sp90', category: 'speed',      tier: 'bronze', icon: '⏱',  title: 'Quick Thinker',   description: 'Solve any level in under 90 seconds',         check: s => Object.values(s.bestTimes).some(t => t < 90) },
  { id: 'sp45', category: 'speed',      tier: 'silver', icon: '💨', title: 'Speed Run',       description: 'Solve any level in under 45 seconds',         check: s => Object.values(s.bestTimes).some(t => t < 45) },
  { id: 'sp20', category: 'speed',      tier: 'gold',   icon: '🌪',  title: 'Lightning',       description: 'Solve any level in under 20 seconds',         check: s => Object.values(s.bestTimes).some(t => t < 20) },

  // ── Perfection ────────────────────────────────────────────────────────────
  { id: 'pf1',  category: 'perfection', tier: 'bronze', icon: '✨', title: 'Flawless',        description: 'Finish a level with no mistakes and no hints', check: s => s.perfectLevels >= 1   },
  { id: 'pf5',  category: 'perfection', tier: 'silver', icon: '💎', title: 'Precise',         description: 'Finish 5 levels with no mistakes and no hints', check: s => s.perfectLevels >= 5  },
  { id: 'pf20', category: 'perfection', tier: 'gold',   icon: '👑', title: 'Pristine',        description: 'Finish 20 levels with no mistakes and no hints', check: s => s.perfectLevels >= 20 },
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
  if (perfectLevels >= 20 && levelsCompleted >= 25) return { title: 'Pristine Master',  subtitle: 'Perfect in every way'    }
  if (bestStreak >= 25)                             return { title: 'Unstoppable',       subtitle: 'On an endless streak'    }
  if (levelsCompleted >= 50)                        return { title: 'Grand Master',       subtitle: 'A true math legend'      }
  if (levelsCompleted >= 25)                        return { title: 'Expert',             subtitle: 'Deep in the numbers'     }
  if (levelsCompleted >= 10)                        return { title: 'Mathematician',      subtitle: 'Getting serious'         }
  if (levelsCompleted >= 5)                         return { title: 'Apprentice',         subtitle: 'Learning the ropes'      }
  if (levelsCompleted >= 1)                         return { title: 'Beginner',           subtitle: 'Just warming up'         }
  return                                                   { title: 'Novice',             subtitle: 'First puzzle awaits'     }
}
