import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function TripDetail({ tripId, onBack, onLogout }) {
  const [trip, setTrip] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTrip()
  }, [tripId])

  async function fetchTrip() {
    try {
      const data = await api.getTrip(tripId)
      setTrip(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneratePlan() {
    setGenerating(true)
    setError('')
    try {
      const data = await api.generatePlan(tripId)
      setPlan(data)
      setTrip(prev => ({ ...prev, status: 'planned' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

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
        {/* Back button */}
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
        >
          ← Back to trips
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Trip Header */}
        {trip && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{trip.destination}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {trip.duration_days} days · {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                  {trip.budget_usd ? ` · NPR ${(trip.budget_usd * 133).toLocaleString()} budget` : ''}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                trip.status === 'planned'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {trip.status}
              </span>
            </div>

            {!plan && (
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {generating ? 'Generating plan...' : '✨ Generate AI Plan'}
              </button>
            )}
          </div>
        )}

        {/* Plan */}
        {plan && (
          <div className="space-y-6">
            {/* Route */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">Route</h3>
              <p className="text-gray-300 text-sm">{plan.route_summary}</p>
            </div>

            {/* Itinerary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Day-by-Day Itinerary</h3>
              <div className="space-y-4">
                {plan.itinerary.map((day) => (
                  <div key={day.day} className="border-l-2 border-blue-500 pl-4">
                    <h4 className="font-medium text-white">{day.title}</h4>
                    <div className="mt-2 space-y-1">
                      {day.activities.map((activity, i) => (
                        <p key={i} className="text-gray-400 text-sm">• {activity}</p>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2">🏨 {day.accommodation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(plan.budget_breakdown)
                  .filter(([key]) => key !== 'currency')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className={key === 'total' ? 'text-white font-semibold' : 'text-gray-300'}>
                        NPR {value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                <div className="border-t border-gray-800 pt-3 flex justify-between text-sm">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-semibold">
                    NPR {plan.budget_breakdown.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Local Tips */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">Local Tips</h3>
              <p className="text-gray-300 text-sm">{plan.local_tips}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}