import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import {
  ACHIEVEMENTS,
  TIER_COLORS,
  getUnlocked,
  getPlayerTitle,
  type Achievement,
  type GameStats,
} from '../engine/achievements'

interface Props {
  onContinue: () => void
  onNewGame:  () => void
}

// ── Achievement badge ────────────────────────────────────────────────────────

function AchievementBadge({
  achievement,
  unlocked,
  onClick,
}: {
  achievement: Achievement
  unlocked: boolean
  onClick: () => void
}) {
  const color = TIER_COLORS[achievement.tier]

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all active:scale-95 w-full"
      style={
        unlocked
          ? { borderColor: color + '55', background: 'rgba(35,40,57,0.9)' }
          : { borderColor: '#2a2f42', background: 'rgba(20,24,36,0.7)', opacity: 0.45 }
      }
    >
      <span className="text-[1.5rem] leading-none">{unlocked ? achievement.icon : '🔒'}</span>
      <span
        className="text-[0.5rem] font-black uppercase tracking-wide text-center leading-tight font-game"
        style={{ color: unlocked ? color : '#4a5568' }}
      >
        {achievement.title}
      </span>
    </button>
  )
}

// ── New-game confirmation modal ──────────────────────────────────────────────

function ConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel:  () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 pb-6 px-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-surface border border-[#2e3650] rounded-3xl p-7 text-center shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-pop-in w-full max-w-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-[1.3rem] font-black text-tl font-game mb-2">Start Over?</h2>
        <p className="text-[0.8rem] text-tm leading-relaxed mb-6">
          This will permanently erase your level progress, total score, streaks, and all achievements. There's no going back.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[22px] border border-[#2e3650] text-tm font-game font-bold text-[0.9rem] cursor-pointer bg-transparent hover:border-[#3e4860] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-[22px] bg-bad/20 border border-bad/40 text-bad font-game font-bold text-[0.9rem] cursor-pointer hover:bg-bad/30 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Achievement detail tooltip ───────────────────────────────────────────────

function AchievementDetail({
  achievement,
  unlocked,
  onClose,
}: {
  achievement: Achievement
  unlocked: boolean
  onClose: () => void
}) {
  const color = TIER_COLORS[achievement.tier]
  const tierLabel = achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 pb-6 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-[#2e3650] rounded-3xl p-6 text-center shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-pop-in w-full max-w-sm">
        <div className="text-5xl mb-2">{unlocked ? achievement.icon : '🔒'}</div>
        <div
          className="inline-block text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 font-game"
          style={{ color, background: color + '20', border: `1px solid ${color}44` }}
        >
          {tierLabel}
        </div>
        <h3 className="text-[1.1rem] font-black text-tl font-game mb-1">{achievement.title}</h3>
        <p className="text-[0.78rem] text-tm leading-relaxed mb-4">{achievement.description}</p>
        <div
          className="text-[0.72rem] font-bold font-game"
          style={{ color: unlocked ? '#9de0a0' : '#556677' }}
        >
          {unlocked ? '✓ Unlocked' : 'Locked'}
        </div>
      </div>
    </div>
  )
}

// ── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl bg-bg">
      <span className="text-[1.2rem] font-black text-acc font-game">{value}</span>
      <span className="text-[0.55rem] font-bold text-tm uppercase tracking-[0.8px] font-game">{label}</span>
    </div>
  )
}

// ── Home screen ──────────────────────────────────────────────────────────────

export function HomeScreen({ onContinue, onNewGame }: Props) {
  const levelNum     = useGameStore(s => s.levelNum)
  const totalScore   = useGameStore(s => s.totalScore)
  const levelStreak  = useGameStore(s => s.levelStreak)
  const bestStreak   = useGameStore(s => s.bestStreak)
  const bestTimes    = useGameStore(s => s.bestTimes)
  const perfectLevels = useGameStore(s => s.perfectLevels)
  const resetGame    = useGameStore(s => s.resetGame)

  const [showConfirm, setShowConfirm] = useState(false)
  const [detailAch, setDetailAch]     = useState<Achievement | null>(null)

  const levelsCompleted = Math.max(0, levelNum - 1)
  const stats: GameStats = { levelsCompleted, totalScore, bestStreak, bestTimes, perfectLevels }
  const unlocked = getUnlocked(stats)
  const { title, subtitle } = getPlayerTitle(stats)
  const unlockedCount = unlocked.size

  function handleNewGame() {
    resetGame()
    setShowConfirm(false)
    onNewGame()
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-8 gap-5 animate-fade-in overflow-y-auto">

      {/* ── Logo ── */}
      <div className="flex flex-col items-center gap-1 pt-2">
        <h1 className="text-[2.8rem] font-black tracking-[4px] bg-gradient-to-r from-acc to-acc2 bg-clip-text text-transparent font-game leading-none">
          NUMCROSS
        </h1>
        <p className="text-[0.7rem] font-bold text-tm uppercase tracking-[2px] font-game">
          Infinite Arithmetic Puzzle
        </p>
      </div>

      {/* ── Player card ── */}
      <div className="w-full max-w-sm bg-surface rounded-3xl p-5 flex flex-col items-center gap-3 border border-[#2e3650]">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[0.6rem] font-bold text-tm uppercase tracking-widest font-game">Your rank</span>
          <span className="text-[1.05rem] font-black text-acc font-game">{title}</span>
          <span className="text-[0.68rem] text-tm italic font-game">{subtitle}</span>
        </div>

        <div className="w-full h-px bg-[#2e3650]" />

        <div className="flex items-center justify-center gap-2 w-full">
          <StatChip label="Level"   value={levelNum} />
          <StatChip label="Score"   value={totalScore.toLocaleString()} />
          <StatChip label="Streak"  value={levelStreak} />
        </div>
      </div>

      {/* ── Buttons ── */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-acc to-acc2 text-td py-4 rounded-[26px] font-game text-[1.05rem] font-extrabold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(255,200,60,0.3)] border-none"
        >
          ▶ Continue · Level {levelNum}
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3.5 rounded-[26px] font-game text-[0.9rem] font-bold cursor-pointer transition-all hover:border-[#3e4860] active:scale-[0.98] border border-[#2e3650] bg-transparent text-tm"
        >
          ↺ New Game
        </button>
      </div>

      {/* ── Achievements ── */}
      <div className="w-full max-w-sm flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[0.72rem] font-black text-tl uppercase tracking-widest font-game">
            Achievements
          </span>
          <span className="text-[0.65rem] font-bold text-tm font-game">
            {unlockedCount} / {ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map(ach => (
            <AchievementBadge
              key={ach.id}
              achievement={ach}
              unlocked={unlocked.has(ach.id)}
              onClick={() => setDetailAch(ach)}
            />
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleNewGame}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {detailAch && (
        <AchievementDetail
          achievement={detailAch}
          unlocked={unlocked.has(detailAch.id)}
          onClose={() => setDetailAch(null)}
        />
      )}
    </div>
  )
}
