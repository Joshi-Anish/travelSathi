import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function Dashboard({ onLogout, onOpenTrip }) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    destination: '',
    duration_days: '',
    travelers: 1,
    budget_usd: '',
  })

  useEffect(() => {
    fetchTrips()
  }, [])

  async function fetchTrips() {
    try {
      const data = await api.getTrips()
      setTrips(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTrip() {
    if (!form.destination || !form.duration_days) {
      setError('Destination and duration are required')
      return
    }
    setCreating(true)
    setError('')
    try {
      const data = await api.createTrip({
        destination: form.destination,
        duration_days: parseInt(form.duration_days),
        travelers: parseInt(form.travelers),
        budget_usd: form.budget_usd ? parseFloat(form.budget_usd) : null,
      })
      setTrips([data, ...trips])
      setShowForm(false)
      setForm({ destination: '', duration_days: '', travelers: 1, budget_usd: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    try {
      await api.deleteTrip(id)
      setTrips(trips.filter(t => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">travelSathi</h1>
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">My Trips</h2>
            <p className="text-gray-400 text-sm mt-1">Plan your next adventure</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + New Trip
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Create Trip Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Plan a new trip</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Destination</label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Pokhara, Nepal"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Duration (days)</label>
                <input
                  type="number"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Travelers</label>
                <input
                  type="number"
                  value={form.travelers}
                  onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                  min="1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Budget (USD) — optional</label>
                <input
                  type="number"
                  value={form.budget_usd}
                  onChange={(e) => setForm({ ...form, budget_usd: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateTrip}
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {creating ? 'Creating...' : 'Create Trip'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-sm px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Trips List */}
        {loading ? (
          <div className="text-center text-gray-500 py-16">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No trips yet</p>
            <p className="text-gray-600 text-sm mt-1">Click "New Trip" to plan your first adventure</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => onOpenTrip(trip.id)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{trip.destination}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {trip.duration_days} days · {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                      {trip.budget_usd ? ` · $${trip.budget_usd} budget` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      trip.status === 'planned'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {trip.status}
                    </span>
                    <button
                      onClick={(e) => handleDelete(trip.id, e)}
                      className="text-gray-600 hover:text-red-400 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}