import { useTimer } from '../hooks/useTimer'
import { useKeyboard } from '../hooks/useKeyboard'
import { Header } from '../components/Header'
import { Grid } from '../components/Grid'
import { TileBank } from '../components/TileBank'
import { ActionBar } from '../components/ActionBar'
import { ScoreBar } from '../components/ScoreBar'
import { WinModal } from '../components/WinModal'
import { Toast } from '../components/Toast'

interface Props {
  onGoHome: () => void
}

export function GameScreen({ onGoHome }: Props) {
  useTimer()
  useKeyboard()

  return (
    <>
      <Toast />
      <WinModal />
      <Header onGoHome={onGoHome} />
      <Grid />
      <TileBank />
      <ActionBar />
      <ScoreBar />
    </>
  )
}
