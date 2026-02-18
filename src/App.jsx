import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './components/LoginPage'
import PlayerPage from './pages/PlayerPage'
import MasterPage from './pages/MasterPage'

function AppContent() {
  const { user } = useAuth()

  if (!user) return <LoginPage />
  if (user.role === 'master') return <MasterPage />
  return <PlayerPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
