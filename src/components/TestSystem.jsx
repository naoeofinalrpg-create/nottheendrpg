import { useState } from 'react'
import saquinhoImg from '../assets/saquinhoteste.png'
import redHexImg from '../assets/complicacaovermelho.png'
import greenHexImg from '../assets/sucessoverde.png'

const DIFFICULTY_OPTIONS = [
  { label: 'Muito Fácil', value: 'muito-facil', redHexes: 1 },
  { label: 'Fácil', value: 'facil', redHexes: 2 },
  { label: 'Normal', value: 'normal', redHexes: 3 },
  { label: 'Difícil', value: 'dificil', redHexes: 4 },
  { label: 'Muito Difícil', value: 'muito-dificil', redHexes: 5 },
  { label: 'Quase Impossível', value: 'quase-impossivel', redHexes: 6 },
]

export default function TestSystem({
  activeTest,
  onApplyTest,
  onAddGreenHex,
  onShuffle,
  onDraw,
  onClear,
  currentPlayerName,
  isMaster,
  allPlayerNames = [],
}) {
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)
  const [selectedHelpers, setSelectedHelpers] = useState([])

  const handleApplyTest = () => {
    setShowDifficultyModal(true)
    setSelectedHelpers([])
  }

  const handleDifficultySelect = () => {
    if (selectedDifficulty) {
      const difficulty = DIFFICULTY_OPTIONS.find(d => d.value === selectedDifficulty)
      onApplyTest(difficulty, selectedHelpers)
      setShowDifficultyModal(false)
      setSelectedDifficulty(null)
      setSelectedHelpers([])
    }
  }

  const toggleHelper = (name) => {
    setSelectedHelpers(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  // Potential helpers are all players EXCEPT the test target player (currentPlayerName when isMaster)
  const potentialHelpers = allPlayerNames.filter(n => n !== currentPlayerName)

  const isTestTarget = activeTest && activeTest.playerName === currentPlayerName
  const isHelper = activeTest && activeTest.helpers?.includes(currentPlayerName)
  const isPlayerInTest = (isTestTarget || isHelper) && !isMaster
  const canDraw = isTestTarget && !isMaster

  return (
    <div className="relative">
      {/* Master Controls */}
      {isMaster && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleApplyTest}
            disabled={activeTest !== null}
            className="px-4 py-2 btn-neon rounded-lg font-semibold text-sm"
          >
            Aplicar Teste
          </button>

          {activeTest && !activeTest.shuffled && (
            <button
              onClick={onShuffle}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}
            >
              Embaralhar
            </button>
          )}

          {activeTest && (
            <button
              onClick={onClear}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 0 12px rgba(239,68,68,0.3)' }}
            >
              Limpar Sorteio
            </button>
          )}
        </div>
      )}

      {/* Difficulty Selection Modal */}
      {showDifficultyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel neon-border rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-4 text-center tracking-wide">
              Aplicar Teste
            </h2>

            {/* Difficulty */}
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Dificuldade
            </label>
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg input-dark text-sm mb-5"
            >
              <option value="">Escolha a dificuldade...</option>
              {DIFFICULTY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.redHexes} hex{opt.redHexes > 1 ? 'es' : ''} vermelha{opt.redHexes > 1 ? 's' : ''})
                </option>
              ))}
            </select>

            {/* Helpers */}
            {potentialHelpers.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Ajudantes
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {potentialHelpers.map(name => (
                    <label
                      key={name}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedHelpers.includes(name)
                          ? 'bg-neon-subtle border border-neon/40'
                          : 'bg-panel/50 border border-border-purple hover:border-neon/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedHelpers.includes(name)
                          ? 'bg-neon border-neon'
                          : 'border border-border-glow bg-transparent'
                      }`}
                        style={{ border: selectedHelpers.includes(name) ? '1px solid var(--color-neon)' : '' }}
                      >
                        {selectedHelpers.includes(name) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedHelpers.includes(name)}
                        onChange={() => toggleHelper(name)}
                      />
                      <span className="text-sm text-text-primary">{name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleDifficultySelect}
                disabled={!selectedDifficulty}
                className="flex-1 px-4 py-2.5 btn-neon rounded-lg font-semibold text-sm"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowDifficultyModal(false)
                  setSelectedDifficulty(null)
                  setSelectedHelpers([])
                }}
                className="flex-1 px-4 py-2.5 btn-ghost rounded-lg font-semibold text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Display - appears on the right side */}
      {activeTest && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
          {/* Bag with hexes */}
          <div className="relative">
            {/* Bag image */}
            <img
              src={saquinhoImg}
              alt="Saquinho de teste"
              className="w-48 h-48 object-contain drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 0 15px rgba(124,58,237,0.4))' }}
            />

            {/* Hex counter */}
            <div className="absolute top-2 right-2 bg-panel/90 border border-border-purple rounded-full px-3 py-1 neon-glow-sm">
              <span className="text-sm font-bold text-danger">
                {activeTest.hexes.filter(h => h.color === 'red').length}
              </span>
              <span className="text-xs text-text-muted mx-1">/</span>
              <span className="text-sm font-bold text-emerald-neon">
                {activeTest.hexes.filter(h => h.color === 'green').length}
              </span>
            </div>

            {/* Animating hexes entering bag */}
            {activeTest.hexes.map((hex, index) => (
              !hex.drawn && (
                <img
                  key={hex.id}
                  src={hex.color === 'red' ? redHexImg : greenHexImg}
                  alt={`${hex.color} hex`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 opacity-0 animate-enter-bag pointer-events-none"
                  style={{ animationDelay: `${index * 0.15}s` }}
                />
              )
            ))}
          </div>

          {/* Helpers indicator */}
          {activeTest.helpers?.length > 0 && (
            <div className="glass-panel rounded-lg px-3 py-1.5 text-center neon-glow-sm">
              <span className="text-xs text-text-muted">Ajudantes: </span>
              <span className="text-xs text-neon-bright font-semibold">{activeTest.helpers.join(', ')}</span>
            </div>
          )}

          {/* Draw button for player (test target only) */}
          {canDraw && activeTest.shuffled && activeTest.hexes.some(h => !h.drawn) && (
            <button
              onClick={onDraw}
              className="px-6 py-3 rounded-lg font-bold text-lg text-white transition-all hover:scale-105 animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
            >
              Sortear
            </button>
          )}

          {/* Drawn hexes queue */}
          {activeTest.drawnHexes.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {activeTest.drawnHexes.map((hex, index) => (
                <div key={`drawn-${index}`} className="flex flex-col items-center gap-0.5">
                  <img
                    src={hex.color === 'red' ? redHexImg : greenHexImg}
                    alt={`${hex.color} hex`}
                    className="w-16 h-16 object-contain animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s`, filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.3))' }}
                  />
                  {hex.label && (
                    <span className="text-[8px] text-danger font-semibold text-center leading-tight max-w-[4rem] break-words">
                      {hex.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info banner for player (target or helper, before shuffle) */}
      {isPlayerInTest && !activeTest.shuffled && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-lg font-semibold animate-fade-in neon-glow-sm"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
        >
          {isHelper
            ? 'Você está ajudando! Clique nos seus hexágonos para adicionar sucessos!'
            : 'Clique nos hexágonos de Arquétipo, Qualidade ou Habilidade para adicionar sucessos!'}
        </div>
      )}

      {/* Info banner for waiting (test target only after shuffle) */}
      {isTestTarget && !isMaster && activeTest.shuffled && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-lg font-semibold animate-fade-in neon-glow-sm"
          style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}
        >
          Clique em "Sortear" para retirar hexágonos do saquinho!
        </div>
      )}
    </div>
  )
}
