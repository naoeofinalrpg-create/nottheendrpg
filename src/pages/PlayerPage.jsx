import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CharacterSheet from '../components/CharacterSheet'
import ThemeToggle from '../components/ThemeToggle'
import TestSystem from '../components/TestSystem'
import StorageIndicator from '../components/StorageIndicator'
import { saveSheet, subscribeToSheet } from '../services/sheetService'
import { testService } from '../services/testService'

export default function PlayerPage() {
  const { user, logout } = useAuth()
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTest, setActiveTest] = useState(null)
  const saveTimer = useRef(null)

  useEffect(() => {
    const unsubscribe = subscribeToSheet(user.name, (data) => {
      if (data) {
        setSheet(data)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user.name])

  useEffect(() => {
    const unsubscribe = testService.subscribeToTest((data) => {
      setActiveTest(data)
    })
    return () => unsubscribe()
  }, [])

  const handleUpdate = (updatedSheet) => {
    setSheet(updatedSheet)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveSheet(user.name, updatedSheet).catch(console.error)
    }, 1000)
  }

  const canClickHexes = activeTest && !activeTest.shuffled &&
    (activeTest.playerName === user.name || activeTest.helpers?.includes(user.name))

  const canClickMisfortune = activeTest && !activeTest.shuffled && activeTest.playerName === user.name

  const handleHexClick = async () => {
    if (!canClickHexes) return
    await testService.addGreenHex(activeTest)
  }

  const handleMisfortuneClick = async (misfortune) => {
    if (!canClickMisfortune || misfortune.complications <= 0) return
    await testService.addMisfortuneComplications(activeTest, misfortune)
  }

  const handleDraw = async () => {
    if (!activeTest || !activeTest.shuffled || activeTest.playerName !== user.name) return
    await testService.drawHex(activeTest)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted text-lg animate-pulse-slow">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col">
      <header className="bg-panel/80 backdrop-blur-md border-b border-border-purple px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Not The End</h1>
          <p className="text-sm text-emerald-neon">Jogador: {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <StorageIndicator />
          <ThemeToggle />
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-300 text-white"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 0 10px rgba(239,68,68,0.3)' }}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-4 sm:py-6">
        <TestSystem
          activeTest={activeTest}
          onDraw={handleDraw}
          currentPlayerName={user.name}
          isMaster={false}
        />
        <CharacterSheet
          sheet={sheet}
          onUpdate={handleUpdate}
          playerName={user.name}
          activeTest={activeTest}
          onHexClick={canClickHexes ? handleHexClick : null}
          onMisfortuneClick={canClickMisfortune ? handleMisfortuneClick : null}
        />
      </main>
    </div>
  )
}
