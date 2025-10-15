import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ user, session, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSessions, setActiveSessions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const [profileResponse, sessionsResponse] = await Promise.all([
          axios.get('http://localhost:5001/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5001/api/auth/sessions', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        
        setProfile(profileResponse.data)
        setActiveSessions(sessionsResponse.data.activeSessions || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600">
                You're successfully logged in and your session is active.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  User Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-600">Name:</span>
                    <span className="text-gray-900">{profile?.user?.name || user.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-600">Email:</span>
                    <span className="text-gray-900">{profile?.user?.email || user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-600">User ID:</span>
                    <span className="text-gray-900 font-mono text-sm">{profile?.user?._id || user._id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Session Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-600">Login Time:</span>
                    <span className="text-gray-900 text-sm">
                      {session?.loginTime ? new Date(session.loginTime).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-600">Session Duration:</span>
                    <span className="text-gray-900">
                      {session?.sessionDuration ? formatDuration(session.sessionDuration) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Sessions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Active Sessions
                </h3>
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-indigo-600">{activeSessions.length}</div>
                    <div className="text-sm text-gray-500">Total active sessions</div>
                  </div>
                  {activeSessions.slice(0, 3).map((session, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600 truncate max-w-[120px]">
                          {session.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDuration(Date.now() - new Date(session.loginTime).getTime())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-indigo-500">
              <h4 className="font-semibold text-gray-900 mb-2">Profile Settings</h4>
              <p className="text-gray-600 text-sm">Update your personal information</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-green-500">
              <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
              <p className="text-gray-600 text-sm">Change password and security settings</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-blue-500">
              <h4 className="font-semibold text-gray-900 mb-2">Activity</h4>
              <p className="text-gray-600 text-sm">View your recent activity</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-red-500">
              <h4 className="font-semibold text-gray-900 mb-2">Logout</h4>
              <p className="text-gray-600 text-sm">Sign out from your account</p>
              <button
                onClick={onLogout}
                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout Now
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              ← Back to Home Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard