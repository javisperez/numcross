import { useEffect, useState } from 'react'
import { useGameStore } from './store/useGameStore'
import { HomeScreen } from './screens/HomeScreen'
import { GameScreen } from './screens/GameScreen'

type Screen = 'home' | 'game'

export default function App() {
  const restoreLevel = useGameStore(s => s.restoreLevel)
  const [screen, setScreen] = useState<Screen>('home')

  // Restore saved progress (or generate a fresh level) on boot.
  // This always runs regardless of which screen is shown so the store
  // is ready before the user hits Continue.
  useEffect(() => { restoreLevel() }, [restoreLevel])

  return (
    <div className="min-h-screen bg-bg text-tl font-game flex flex-col justify-between items-center px-2 py-4 select-none">
      {screen === 'home' ? (
        <HomeScreen
          onContinue={() => setScreen('game')}
          onNewGame={()  => setScreen('game')}
        />
      ) : (
        <GameScreen onGoHome={() => setScreen('home')} />
      )}
    </div>
  )
}
