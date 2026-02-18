import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CharacterSheet from '../components/CharacterSheet'
import ThemeToggle from '../components/ThemeToggle'
import TestSystem from '../components/TestSystem'
import StorageIndicator from '../components/StorageIndicator'
import { subscribeToSheets, saveSheet } from '../services/sheetService'
import { testService } from '../services/testService'

export default function MasterPage() {
  const { logout } = useAuth()
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSheet, setSelectedSheet] = useState(null)
  const [activeTest, setActiveTest] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToSheets((data) => {
      setSheets(data)
      setLoading(false)
      // Keep selectedSheet in sync when data updates
      setSelectedSheet(prev => {
        if (!prev) return prev
        const updated = data.find(s => s.id === prev.id)
        return updated || prev
      })
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = testService.subscribeToTest((data) => {
      setActiveTest(data)
    })
    return () => unsubscribe()
  }, [])

  const handleApplyTest = async (difficulty, helpers) => {
    if (!selectedSheet) return
    // Check if the player has a complication (red) hex placed on their Confusion slot
    const hasConfusionComplication = selectedSheet?.placedHexes?.confusion?.color === 'red'
    await testService.applyTest(selectedSheet.playerName, difficulty, helpers, hasConfusionComplication)
  }

  const handleShuffle = async () => {
    if (!activeTest) return
    await testService.shuffle(activeTest)
  }

  const handleClear = async () => {
    await testService.clearTest()
  }

  const handleUpdateMisfortuneComplication = async (index, newCount) => {
    if (!selectedSheet) return
    const misfortunes = (selectedSheet.misfortunes || []).map((m, i) => {
      const normalized = typeof m === 'string' ? { text: m, complications: 0 } : (m || { text: '', complications: 0 })
      return i === index ? { ...normalized, complications: newCount } : normalized
    })
    const updated = { ...selectedSheet, misfortunes }
    setSelectedSheet(updated)
    await saveSheet(selectedSheet.playerName, updated)
  }

  const allPlayerNames = sheets.map(s => s.playerName)

  return (
    <div className="min-h-screen bg-grid">
      <header className="bg-panel/80 backdrop-blur-md border-b border-border-purple px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Not The End</h1>
          <p className="text-sm text-neon-bright">Mestre</p>
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

      <main className="p-4 sm:p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 tracking-tight">Fichas</h2>

        {loading ? (
          <p className="text-text-muted">Carregando fichas...</p>
        ) : sheets.length === 0 ? (
          <div className="glass-panel rounded-xl p-6 text-center">
            <p className="text-text-muted">
              Nenhuma ficha criada ainda. As fichas aparecerão aqui quando os jogadores entrarem.
            </p>
          </div>
        ) : (
          <>
            {/* Sheet list */}
            <div className="flex flex-wrap gap-3 mb-6">
              {sheets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSheet(selectedSheet?.id === s.id ? null : s)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                    selectedSheet?.id === s.id
                      ? 'btn-neon'
                      : 'btn-ghost'
                  }`}
                >
                  {s.playerName}
                </button>
              ))}
            </div>

            {/* Selected sheet view */}
            {selectedSheet && (
              <>
                <TestSystem
                  activeTest={activeTest}
                  onApplyTest={handleApplyTest}
                  onShuffle={handleShuffle}
                  onClear={handleClear}
                  currentPlayerName={selectedSheet.playerName}
                  isMaster={true}
                  allPlayerNames={allPlayerNames}
                />
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <CharacterSheet
                    sheet={selectedSheet}
                    readOnly
                    activeTest={activeTest}
                    onUpdateMisfortuneComplication={handleUpdateMisfortuneComplication}
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
