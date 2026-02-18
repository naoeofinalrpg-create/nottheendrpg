import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CharacterSheet from '../components/CharacterSheet'
import ThemeToggle from '../components/ThemeToggle'
import TestSystem from '../components/TestSystem'
import StorageIndicator from '../components/StorageIndicator'
import { subscribeToSheets, saveSheet, deleteSheet } from '../services/sheetService'
import { testService } from '../services/testService'

export default function MasterPage() {
  const { logout } = useAuth()
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSheet, setSelectedSheet] = useState(null)
  const [activeTest, setActiveTest] = useState(null)
  const [sheetToDelete, setSheetToDelete] = useState(null)

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

  const handleDeleteSheet = async () => {
    if (!sheetToDelete) return
    if (selectedSheet?.playerName === sheetToDelete.playerName) setSelectedSheet(null)
    await deleteSheet(sheetToDelete.playerName)
    setSheetToDelete(null)
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
                <div key={s.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedSheet(selectedSheet?.id === s.id ? null : s)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                      selectedSheet?.id === s.id
                        ? 'btn-neon'
                        : 'btn-ghost'
                    }`}
                  >
                    {s.playerName}
                  </button>
                  <button
                    onClick={() => setSheetToDelete(s)}
                    className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-all duration-200"
                    title="Excluir ficha"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Delete confirmation modal */}
            {sheetToDelete && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="glass-panel neon-border rounded-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
                  <h2 className="text-lg font-bold text-text-primary mb-2 text-center">Excluir Ficha</h2>
                  <p className="text-sm text-text-muted text-center mb-6">
                    Tem certeza que deseja excluir a ficha de{' '}
                    <span className="text-danger font-semibold">{sheetToDelete.playerName}</span>?
                    Essa ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteSheet}
                      className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-300"
                      style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 0 12px rgba(239,68,68,0.3)' }}
                    >
                      Excluir
                    </button>
                    <button
                      onClick={() => setSheetToDelete(null)}
                      className="flex-1 px-4 py-2.5 btn-ghost rounded-lg font-semibold text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

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
