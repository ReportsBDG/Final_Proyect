'use client'

import { useState } from 'react'
import { fetchFromGoogleScript } from '@/lib/google-script'

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testDirectConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Probando conexión directa...')
      const response = await fetch('https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec')
      console.log('Status:', response.status)
      console.log('Headers:', response.headers)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult({ type: 'Direct Connection', data, count: data.data?.length || data.length || 0 })
    } catch (err) {
      setError(`Error directo: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testProxyConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Probando conexión por proxy...')
      const response = await fetch('/api/proxy')
      console.log('Proxy Status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult({ type: 'Proxy Connection', data, count: data.data?.length || data.length || 0 })
    } catch (err) {
      setError(`Error proxy: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testGoogleScriptFunction = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Probando función fetchFromGoogleScript...')
      const data = await fetchFromGoogleScript()
      setResult({ type: 'Google Script Function', data, count: data.length })
    } catch (err) {
      setError(`Error función: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testWithParameters = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Probando con parámetros...')
      const response = await fetch('/api/proxy?action=getAllRecords&limit=1000&sheet=DB')
      console.log('Parameters Status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult({ type: 'With Parameters', data, count: data.data?.length || data.length || 0 })
    } catch (err) {
      setError(`Error parámetros: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testSheetInfo = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Probando información de la hoja...')
      const response = await fetch('/api/proxy?action=getSheetInfo&sheet=DB')
      console.log('Sheet Info Status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult({ type: 'Sheet Information', data })
    } catch (err) {
      setError(`Error info hoja: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testAdvancedDiagnosis = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Ejecutando diagnóstico avanzado...')
      
      const tests = [
        { name: 'Basic', url: '/api/diagnose?test=basic' },
        { name: 'With Limit', url: '/api/diagnose?test=withLimit' },
        { name: 'With Action', url: '/api/diagnose?test=withAction' },
        { name: 'With Sheet', url: '/api/diagnose?test=withSheet' },
        { name: 'Full Params', url: '/api/diagnose?test=fullParams' }
      ]
      
      const results = []
      
      for (const test of tests) {
        try {
          const response = await fetch(test.url)
          const data = await response.json()
          results.push({ ...data, testName: test.name })
        } catch (err) {
          results.push({ 
            testName: test.name, 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          })
        }
      }
      
      setResult({ type: 'Advanced Diagnosis', data: results })
    } catch (err) {
      setError(`Error diagnóstico: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testRealDataConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Probando conexión de datos reales...')
      const data = await fetchFromGoogleScript()
      setResult({ 
        type: 'Real Data Connection', 
        data: data.slice(0, 5), // Solo mostrar primeros 5 para preview
        count: data.length,
        message: `Obtenidos ${data.length} registros reales de Google Sheets`
      })
    } catch (err) {
      setError(`Error datos reales: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testDebugSheets = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Ejecutando debug completo de Google Sheets...')
      const response = await fetch('/api/debug-sheets')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult({ 
        type: 'Debug Google Sheets', 
        data: data,
        message: `Debug completado - ${data.summary.actualRecords} de ${data.summary.expectedRecords} registros`
      })
    } catch (err) {
      setError(`Error debug: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const checkScriptConfiguration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Verificando configuración del Google Apps Script...')
      const response = await fetch('/api/check-script')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult({ 
        type: 'Script Configuration Check', 
        data: data,
        message: `Análisis completado - ${data.analysis.totalRecords} registros (${data.analysis.percentageComplete}% del total esperado)`
      })
    } catch (err) {
      setError(`Error verificación: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testAuthenticationIssue = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('🔍 Diagnosticando problema de autenticación...')
      
      // Probar diferentes URLs y métodos
      const tests = [
        { name: 'URL Directa', url: 'https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec' },
        { name: 'URL con parámetros', url: 'https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec?action=getAllRecords&sheet=DB&range=A:AG' },
        { name: 'Proxy sin parámetros', url: '/api/proxy' },
        { name: 'Proxy con sheet DB', url: '/api/proxy?sheet=DB' },
        { name: 'Proxy con action y sheet', url: '/api/proxy?action=getAllRecords&sheet=DB' },
        { name: 'Proxy con rango AG', url: '/api/proxy?action=getAllRecords&sheet=DB&range=A:AG' }
      ]
      
      const results = []
      
      for (const test of tests) {
        try {
          console.log(`📡 Probando: ${test.name}`)
          const response = await fetch(test.url)
          
          const result: any = {
            test: test.name,
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            isRedirect: response.redirected,
            url: response.url
          }
          
          if (response.ok) {
            try {
              const data = await response.json()
              result.data = data
              result.dataLength = data.data?.length || data.length || 0
            } catch (parseError) {
              result.parseError = parseError instanceof Error ? parseError.message : 'Unknown error'
            }
          }
          
          results.push(result)
        } catch (err) {
          results.push({
            test: test.name,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }
      
      setResult({ 
        type: 'Authentication Diagnosis', 
        data: results,
        message: `Diagnóstico completado - ${results.filter(r => r.success).length} de ${results.length} pruebas exitosas`
      })
    } catch (err) {
      setError(`Error diagnóstico: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Test de Conexión Google Sheets
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Diagnóstico de Conexión</h2>
          
          <div className="space-y-4">
            <button
              onClick={testAuthenticationIssue}
              disabled={loading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Diagnosticando...' : '🔍 Diagnosticar Problema de Autenticación'}
            </button>
            
            <button
              onClick={testDirectConnection}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '1. Test Conexión Directa'}
            </button>
            
            <button
              onClick={testProxyConnection}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '2. Test Conexión por Proxy'}
            </button>
            
            <button
              onClick={testGoogleScriptFunction}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '3. Test Función fetchFromGoogleScript'}
            </button>

            <button
              onClick={testWithParameters}
              disabled={loading}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '4. Test con Parámetros (sheet=DB)'}
            </button>

            <button
              onClick={testSheetInfo}
              disabled={loading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '5. Test Información de la Hoja DB'}
            </button>

            <button
              onClick={testAdvancedDiagnosis}
              disabled={loading}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '6. Test Diagnóstico Avanzado'}
            </button>

            <button
              onClick={testRealDataConnection}
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '7. Test Datos Reales (fetchFromGoogleScript)'}
            </button>

            <button
              onClick={testDebugSheets}
              disabled={loading}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : '8. Test Debug de Google Sheets'}
            </button>

            <button
              onClick={checkScriptConfiguration}
              disabled={loading}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : '9. Verificar Configuración del Script'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-green-800 font-semibold mb-2">
              ✅ Resultado ({result.type}): {result.count ? `${result.count} registros` : ''}
            </h3>
            <pre className="bg-white p-4 rounded border overflow-auto max-h-96 text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-800 font-semibold mb-2">📋 Información del Script:</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• <strong>ID del Script:</strong> AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ</li>
            <li>• <strong>URL:</strong> https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec</li>
            <li>• <strong>Archivo:</strong> Test Overview</li>
            <li>• <strong>Hoja:</strong> DB</li>
            <li>• <strong>Problema detectado:</strong> El script requiere autenticación</li>
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-semibold mb-2">🚨 Problema de Autenticación Detectado:</h3>
          <ul className="text-red-700 space-y-1">
            <li>• <strong>El Google Apps Script está solicitando autenticación</strong></li>
            <li>• <strong>Solución 1:</strong> Configurar el script para acceso público</li>
            <li>• <strong>Solución 2:</strong> Usar autenticación con credenciales de servicio</li>
            <li>• <strong>Solución 3:</strong> Implementar OAuth 2.0</li>
            <li>• <strong>Estado actual:</strong> El script no es accesible públicamente</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">🔧 Soluciones Recomendadas:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• <strong>Opción 1:</strong> Configurar el script para ejecutarse como "yo" y hacerlo público</li>
            <li>• <strong>Opción 2:</strong> Usar Google Apps Script API con autenticación</li>
            <li>• <strong>Opción 3:</strong> Crear un webhook que publique los datos</li>
            <li>• <strong>Opción 4:</strong> Usar Google Sheets API directamente</li>
            <li>• <strong>Opción 5:</strong> Implementar un sistema de autenticación en el frontend</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 