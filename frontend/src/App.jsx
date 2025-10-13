import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [backendData, setBackendData] = useState(null)

  useEffect(() => {
    testBackendConnection()
  }, [])

  const testBackendConnection = async () => {
    setLoading(true)
    setError(null)
    setConnectionStatus('connecting')
    
    try {
      console.log('Testing connection to backend...')
      const response = await axios.get('http://localhost:5001')
      
      console.log('✅ Response received:', response.data)
      
      const msg = response.data.message || response.data.status || 'Connected!'
      setMessage(msg)
      setBackendData(response.data)
      setConnectionStatus('connected')
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      
      if (error.response) {
        setError(`Server error: ${error.response.status}`)
      } else if (error.request) {
        setError('Cannot reach backend. Is it running on port 5001?')
      } else {
        setError(`Connection error: ${error.message}`)
      }
      
      setConnectionStatus('disconnected')
      setMessage('')
      setBackendData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginClick = () => {
    // Navigate to login page
    window.location.href = '/login'
  }

  const getStatusColor = () => {
    switch(connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-red-500'
      case 'connecting': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch(connectionStatus) {
      case 'connected': return 'Connected to Backend'
      case 'disconnected': return 'Backend Disconnected'
      case 'connecting': return 'Connecting...'
      default: return 'Checking Connection'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">M</span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MERN Stack
              </h1>
            </div>
            
            {/* Login Button */}
            <button
              onClick={handleLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <span className="hidden sm:inline">👤 Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
            Welcome to Your Application
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Testing Frontend ↔️ Backend Connection
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

            {/* Loading State */}
            {loading && (
              <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 text-blue-800 rounded-lg sm:rounded-xl mb-4 sm:mb-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm sm:text-base font-medium">Testing backend connection...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 rounded-lg sm:rounded-xl mb-4 sm:mb-6 shadow-md">
                <p className="font-bold text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">❌</span>
                  Connection Error
                </p>
                <p className="text-sm sm:text-base mb-3">{error}</p>
                <p className="text-xs sm:text-sm text-red-700 bg-red-50 p-2 sm:p-3 rounded border border-red-200">
                  💡 Make sure your backend is running on port 5001
                </p>
              </div>
            )}

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
                    <span className="font-bold text-sm sm:text-base text-green-700 break-words">{message}</span>
                  </div>
                  
                  {backendData.mongodb && (
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
                  )}
                  
                  {backendData.timestamp && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-gray-600">Timestamp:</span>
                      <span className="text-xs sm:text-sm text-gray-700 font-mono">
                        {new Date(backendData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
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
                onClick={testBackendConnection}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <span className="text-lg sm:text-xl">{loading ? '🔄' : '🔌'}</span>
                {loading ? 'Testing...' : 'Test Connection'}
              </button>
              
              <button
                onClick={handleLoginClick}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <span className="text-lg sm:text-xl">👤</span>
                Go to Login
              </button>
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
                  connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
                  connectionStatus === 'disconnected' ? 'bg-red-100 text-red-700' :
                  connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {connectionStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 md:mt-16 pb-6 sm:pb-8 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-2">
            Built with ❤️ using React, Node.js, Express & MongoDB
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span>🔥 Vite</span>
            <span>⚛️ React</span>
            <span>🎨 Tailwind CSS</span>
            <span>🟢 Node.js</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App