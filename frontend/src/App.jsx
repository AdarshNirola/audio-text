import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [backendData, setBackendData] = useState(null)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await axios.get('http://localhost:5001/api/auth/check-session', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (response.data.valid) {
            setUser(response.data.user)
            setSession(response.data.session)
          } else {
            localStorage.removeItem('token')
          }
        } catch (error) {
          console.error('Session check failed:', error)
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }

    checkSession()
  }, [])

  // Test backend connection on app load
  useEffect(() => {
    testBackendConnection()
  }, [])

  const testBackendConnection = async () => {
    setBackendStatus('connecting')
    
    try {
      console.log('Testing connection to backend...')
      const response = await axios.get('http://localhost:5001')
      
      console.log('✅ Response received:', response.data)
      
      setBackendData(response.data)
      setBackendStatus('connected')
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      
      if (error.response) {
        setBackendStatus('error')
      } else if (error.request) {
        setBackendStatus('disconnected')
      } else {
        setBackendStatus('error')
      }
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('token', userData.token)
    navigate('/dashboard')
  }

  const handleRegister = (userData) => {
    setUser(userData)
    localStorage.setItem('token', userData.token)
    navigate('/dashboard')
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('http://localhost:5001/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setSession(null)
      localStorage.removeItem('token')
      navigate('/')
    }
  }

  const getStatusColor = () => {
    switch(backendStatus) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-red-500'
      case 'connecting': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch(backendStatus) {
      case 'connected': return 'Connected to Backend'
      case 'disconnected': return 'Backend Disconnected'
      case 'connecting': return 'Connecting...'
      case 'error': return 'Connection Error'
      default: return 'Checking Connection'
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-xl text-gray-600">Checking session...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Show navbar on all pages except auth pages */}
      {!['/login', '/register'].includes(location.pathname) && (
        <NavBar user={user} onLogout={handleLogout} />
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={
          <HomePage 
            backendStatus={backendStatus}
            backendData={backendData}
            onTestConnection={testBackendConnection}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            user={user}
          />
        } />
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : 
          <Login onLogin={handleLogin} backendStatus={backendStatus} />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/dashboard" replace /> : 
          <Register onRegister={handleRegister} backendStatus={backendStatus} />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} session={session} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// NavBar Component
function NavBar({ user, onLogout }) {
  const navigate = useNavigate()

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">M</span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MERN Stack
            </h1>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-gray-700 hidden sm:inline">Welcome, {user.name}</span>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Home Page Component
function HomePage({ backendStatus, backendData, onTestConnection, getStatusColor, getStatusText, user }) {
  const navigate = useNavigate()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
          Welcome to Your Application
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          {user ? `Hello, ${user.name}! You're logged in.` : 'Testing Frontend ↔️ Backend Connection'}
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          
          {/* Connection Status Badge */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getStatusColor()} animate-pulse shadow-lg`}></div>
            <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wide">
              {getStatusText()}
            </span>
          </div>

          {/* Success State */}
          {backendData && (
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-900 rounded-lg sm:rounded-xl mb-4 sm:mb-6 shadow-md">
              <p className="font-bold text-base sm:text-lg md:text-xl mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">✅</span>
                Backend Connection Successful!
              </p>
              
              {/* Info Grid */}
              <div className="bg-white bg-opacity-60 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 pb-2 sm:pb-3 border-b border-green-200">
                  <span className="font-semibold text-xs sm:text-sm text-gray-600">Message:</span>
                  <span className="font-bold text-sm sm:text-base text-green-700 break-words">{backendData.message}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 pb-2 sm:pb-3 border-b border-green-200">
                  <span className="font-semibold text-xs sm:text-sm text-gray-600">MongoDB Status:</span>
                  <span className={`font-bold text-sm sm:text-base px-2 py-1 rounded ${
                    backendData.mongodb === 'connected' 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {backendData.mongodb}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-gray-600">Timestamp:</span>
                  <span className="text-xs sm:text-sm text-gray-700 font-mono">
                    {new Date(backendData.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Raw Response Accordion */}
              <details className="mt-4">
                <summary className="cursor-pointer text-xs sm:text-sm font-semibold text-green-800 hover:text-green-900 bg-green-100 px-3 py-2 rounded transition-colors">
                  🔍 View Raw JSON Response
                </summary>
                <pre className="mt-3 p-3 sm:p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto shadow-inner">
                  {JSON.stringify(backendData, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={onTestConnection}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <span className="text-lg sm:text-xl">🔌</span>
              Test Connection
            </button>
            
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <span className="text-lg sm:text-xl">📊</span>
                Go to Dashboard
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span className="text-lg sm:text-xl">🔐</span>
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span className="text-lg sm:text-xl">👤</span>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Debug Info Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🛠️</span>
            Debug Information
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <strong className="text-xs sm:text-sm text-gray-600">Frontend URL:</strong>
              <code className="text-xs sm:text-sm text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">
                http://localhost:5173
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <strong className="text-xs sm:text-sm text-gray-600">Backend URL:</strong>
              <code className="text-xs sm:text-sm text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">
                http://localhost:5001
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <strong className="text-xs sm:text-sm text-gray-600">Connection Status:</strong>
              <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-100 text-green-700' :
                backendStatus === 'disconnected' ? 'bg-red-100 text-red-700' :
                backendStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {backendStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <strong className="text-xs sm:text-sm text-gray-600">User Status:</strong>
              <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${
                user ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {user ? 'LOGGED IN' : 'NOT LOGGED IN'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App