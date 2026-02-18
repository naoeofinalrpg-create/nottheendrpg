import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import { getAllSheetNames, sheetExists, saveSheet } from '../services/sheetService'

export default function LoginPage() {
  const { loginAsMaster, loginAsPlayer, loginAsNewPlayer } = useAuth()

  // Master state
  const [masterPassword, setMasterPassword] = useState('')
  const [masterError, setMasterError] = useState('')

  // Existing player state
  const [playerName, setPlayerName] = useState('')
  const [playerPassword, setPlayerPassword] = useState('')
  const [playerError, setPlayerError] = useState('')
  const [sheetNames, setSheetNames] = useState([])
  const [filteredNames, setFilteredNames] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // New player state
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerPassword, setNewPlayerPassword] = useState('')
  const [newPlayerError, setNewPlayerError] = useState('')
  const [creatingSheet, setCreatingSheet] = useState(false)

  useEffect(() => {
    getAllSheetNames().then(setSheetNames).catch(console.error)
  }, [])

  useEffect(() => {
    if (playerName.trim()) {
      const filtered = sheetNames.filter(name =>
        name.toLowerCase().includes(playerName.toLowerCase())
      )
      setFilteredNames(filtered)
    } else {
      setFilteredNames(sheetNames)
    }
  }, [playerName, sheetNames])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMasterLogin = (e) => {
    e.preventDefault()
    setMasterError('')
    if (!loginAsMaster(masterPassword)) {
      setMasterError('Senha incorreta')
    }
  }

  const handlePlayerLogin = (e) => {
    e.preventDefault()
    setPlayerError('')
    if (!playerName.trim()) {
      setPlayerError('Selecione um jogador')
      return
    }
    if (!sheetNames.some(n => n.toLowerCase() === playerName.trim().toLowerCase())) {
      setPlayerError('Ficha não encontrada. Use "Novo Jogador" para criar uma nova.')
      return
    }
    const exactName = sheetNames.find(n => n.toLowerCase() === playerName.trim().toLowerCase())
    if (!loginAsPlayer(exactName, playerPassword)) {
      setPlayerError('Senha incorreta')
    }
  }

  const handleNewPlayerCreate = async (e) => {
    e.preventDefault()
    setNewPlayerError('')
    const name = newPlayerName.trim()
    if (!name) {
      setNewPlayerError('Insira o nome do jogador')
      return
    }
    const exists = await sheetExists(name)
    if (exists) {
      setNewPlayerError('Já existe uma ficha com esse nome. Use "Jogador" para acessá-la.')
      return
    }
    setCreatingSheet(true)
    try {
      await saveSheet(name, { playerName: name })
      if (!loginAsNewPlayer(name, newPlayerPassword)) {
        setNewPlayerError('Senha incorreta')
        setCreatingSheet(false)
      }
    } catch (err) {
      setNewPlayerError('Erro ao criar ficha. Tente novamente.')
      setCreatingSheet(false)
    }
  }

  const selectName = (name) => {
    setPlayerName(name)
    setShowDropdown(false)
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-1 text-center tracking-tight">
        Not The End
      </h1>
      <p className="text-text-muted mb-10 text-center text-sm tracking-widest uppercase">Sistema de RPG</p>

      <div className="flex flex-col gap-5 w-full max-w-md relative z-10">
        {/* Login Mestre */}
        <form
          onSubmit={handleMasterLogin}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-neon-bright mb-4 text-center tracking-wide uppercase">
            Mestre
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide uppercase">
                Senha
              </label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
                placeholder="Digite a senha"
              />
            </div>
            {masterError && (
              <p className="text-danger text-sm">{masterError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 btn-neon rounded-lg font-semibold text-sm tracking-wide"
            >
              Entrar como Mestre
            </button>
          </div>
        </form>

        {/* Login Jogador (existente) */}
        <form
          onSubmit={handlePlayerLogin}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-emerald-neon mb-4 text-center tracking-wide uppercase">
            Jogador
          </h2>
          <div className="space-y-4">
            <div ref={dropdownRef} className="relative">
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide uppercase">
                Nome da Ficha
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
                placeholder="Buscar ficha..."
                autoComplete="off"
              />
              {showDropdown && filteredNames.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-panel border border-border-purple rounded-lg shadow-lg max-h-40 overflow-y-auto neon-glow-sm">
                  {filteredNames.map((name) => (
                    <li
                      key={name}
                      onClick={() => selectName(name)}
                      className="px-3 py-2 cursor-pointer hover:bg-neon-subtle text-text-primary text-sm transition-colors"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
              {showDropdown && playerName.trim() && filteredNames.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-panel border border-border-purple rounded-lg shadow-lg px-3 py-2">
                  <p className="text-sm text-text-muted">Nenhuma ficha encontrada</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide uppercase">
                Senha
              </label>
              <input
                type="password"
                value={playerPassword}
                onChange={(e) => setPlayerPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
                placeholder="Digite a senha"
              />
            </div>
            {playerError && (
              <p className="text-danger text-sm">{playerError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-semibold text-sm tracking-wide text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}
            >
              Entrar como Jogador
            </button>
          </div>
        </form>

        {/* Novo Jogador */}
        <form
          onSubmit={handleNewPlayerCreate}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-gold mb-4 text-center tracking-wide uppercase">
            Novo Jogador
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide uppercase">
                Nome
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
                placeholder="Nome do jogador"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide uppercase">
                Senha
              </label>
              <input
                type="password"
                value={newPlayerPassword}
                onChange={(e) => setNewPlayerPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
                placeholder="Digite a senha"
              />
            </div>
            {newPlayerError && (
              <p className="text-danger text-sm">{newPlayerError}</p>
            )}
            <button
              type="submit"
              disabled={creatingSheet}
              className="w-full py-2.5 rounded-lg font-semibold text-sm tracking-wide text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 0 15px rgba(245,158,11,0.3)' }}
            >
              {creatingSheet ? 'Criando ficha...' : 'Criar nova ficha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
