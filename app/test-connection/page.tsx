'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestConnectionPage() {
  const [connectionData, setConnectionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const testConnection = async () => {
    setIsLoading(true)
    setError('')
    setConnectionData(null)

    try {
      console.log('🔄 Probando conexión a Google Sheets...')
      
      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Datos recibidos:', data)
        setConnectionData(data)
      } else {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prueba de Conexión - Base de Datos Real
            </h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">URL de Google Script:</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm font-mono break-all">
                https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">ID del Script:</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm font-mono">
                AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ
              </div>
            </div>
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Estado de Conexión
            </h2>
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Probando...' : 'Probar Conexión'}</span>
            </button>
          </div>

          {/* Status */}
          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center space-x-3 text-blue-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Conectando a la base de datos real...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-3 text-red-600">
                <XCircle className="w-5 h-5" />
                <span>Error: {error}</span>
              </div>
            )}

            {connectionData && (
              <div className="flex items-center space-x-3 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>✅ Conexión exitosa a la base de datos real</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Data */}
        {connectionData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Datos Recibidos de Google Sheets
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">Total de Registros</h3>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {connectionData.totalRecords || connectionData.data?.length || 0}
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 dark:text-green-300">Estado</h3>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {connectionData.success ? 'Exitoso' : 'Error'}
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300">Timestamp</h3>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {connectionData.timestamp ? new Date(connectionData.timestamp).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Sample Data */}
              {connectionData.data && connectionData.data.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Muestra de datos (primeros 3 registros):
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      {JSON.stringify(connectionData.data.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Raw Response */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Respuesta completa:
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto max-h-96">
                  <pre className="text-xs">
                    {JSON.stringify(connectionData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
