'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface ConnectionStatusProps {
  googleScriptUrl?: string
}

export default function ConnectionStatus({ 
  googleScriptUrl = "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec" 
}: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const checkConnection = async () => {
    setIsChecking(true)
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsConnected(true)
        setLastCheck(new Date())
        console.log('✅ Conexión exitosa a Google Sheets:', data)
      } else {
        setIsConnected(false)
        setErrorMessage(`Error HTTP: ${response.status}`)
      }
    } catch (error) {
      setIsConnected(false)
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
      console.error('❌ Error de conexión:', error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estado de Conexión de Base de Datos
        </h3>
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          title="Verificar conexión"
        >
          <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center space-x-3">
          {isConnected === null ? (
            <div className="w-5 h-5 bg-gray-400 rounded-full animate-pulse" />
          ) : isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          
          <span className={`font-medium ${
            isConnected === null ? 'text-gray-500' :
            isConnected ? 'text-green-600 dark:text-green-400' : 
            'text-red-600 dark:text-red-400'
          }`}>
            {isConnected === null ? 'Verificando...' :
             isConnected ? 'Conectado a Google Sheets' : 
             'Error de conexión'}
          </span>
        </div>

        {/* Google Script URL */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="font-medium mb-1">URL del Script:</div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs font-mono break-all">
            {googleScriptUrl}
          </div>
        </div>

        {/* Script ID */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="font-medium mb-1">ID del Script:</div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs font-mono">
            AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ
          </div>
        </div>

        {/* Last Check Time */}
        {lastCheck && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Última verificación: {lastCheck.toLocaleTimeString()}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {errorMessage}
          </div>
        )}

        {/* Status Indicator */}
        <div className={`text-xs px-3 py-1 rounded-full inline-block ${
          isConnected === null ? 'bg-gray-100 text-gray-700' :
          isConnected ? 'bg-green-100 text-green-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {isConnected === null ? 'Verificando estado...' :
           isConnected ? 'Base de datos real conectada' : 
           'Error en la conexión'}
        </div>
      </div>
    </div>
  )
}
