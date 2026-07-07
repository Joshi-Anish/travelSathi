import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TripDetail from './pages/TripDetail'

export default function App() {
  const [page, setPage] = useState('login')
  const [tripId, setTripId] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      setPage('dashboard')
    }
  }, [token])

  function handleLogin(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setPage('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
    setPage('login')
  }

  function openTrip(id) {
    setTripId(id)
    setPage('trip')
  }

  if (page === 'login') return <Login onLogin={handleLogin} onGoRegister={() => setPage('register')} />
  if (page === 'register') return <Register onLogin={handleLogin} onGoLogin={() => setPage('login')} />
  if (page === 'trip') return <TripDetail tripId={tripId} onBack={() => setPage('dashboard')} onLogout={handleLogout} />
  return <Dashboard onLogout={handleLogout} onOpenTrip={openTrip} />
}