'use client'

import { useState } from 'react'
import { fetchFromGoogleScript } from '@/lib/google-script'

export default function DebugImportRange() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [dataInfo, setDataInfo] = useState<any>(null)

  const testImportRange = async () => {
    setLoading(true)
    setError('')
    setResults([])
    setDataInfo(null)

    try {
      console.log('🔍 Iniciando prueba de IMPORTRANGE...')
      
      const data = await fetchFromGoogleScript()
      
      console.log('📊 Datos obtenidos:', data)
      
      if (data && data.length > 0) {
        setResults(data.slice(0, 10)) // Mostrar solo los primeros 10 registros
        
        // Analizar los datos
        const analysis = {
          totalRecords: data.length,
          sampleRecords: data.slice(0, 3),
          hasRealData: data.some(item => 
            item.patientname && 
            item.patientname !== 'John Smith' && 
            item.patientname !== 'Sarah Johnson' &&
            item.patientname !== 'Mike Davis'
          ),
          dataSource: data[0]?.timestamp ? 'Real Data' : 'Fallback Data',
          uniqueOffices: Array.from(new Set(data.map(item => item.offices))).length,
          uniqueCarriers: Array.from(new Set(data.map(item => item.insurancecarrier))).length,
          totalRevenue: data.reduce((sum, item) => sum + (parseFloat(item.paidamount) || 0), 0)
        }
        
        setDataInfo(analysis)
        console.log('📈 Análisis de datos:', analysis)
      } else {
        setError('No se obtuvieron datos')
      }
    } catch (err) {
      console.error('❌ Error en prueba:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const testDirectConnection = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('🔍 Probando conexión directa...')
      
      const response = await fetch('/api/proxy')
      const data = await response.json()
      
      console.log('📡 Respuesta directa:', data)
      
      if (data.error) {
        setError(`Error del proxy: ${data.error}`)
      } else {
        setDataInfo({
          proxyResponse: data,
          hasData: !!data.data,
          dataLength: data.data?.length || 0
        })
      }
    } catch (err) {
      console.error('❌ Error en conexión directa:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔍 Debug IMPORTRANGE
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Diagnóstico de Conexión</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={testImportRange}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : 'Probar IMPORTRANGE'}
            </button>
            
            <button
              onClick={testDirectConnection}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : 'Probar Conexión Directa'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-red-800 font-semibold">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {dataInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-blue-800 font-semibold mb-2">Información de Datos:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-blue-600">Total Records:</span>
                  <div className="font-bold text-blue-800">{dataInfo.totalRecords}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Data Source:</span>
                  <div className="font-bold text-blue-800">{dataInfo.dataSource}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Has Real Data:</span>
                  <div className="font-bold text-blue-800">{dataInfo.hasRealData ? '✅ Sí' : '❌ No'}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Total Revenue:</span>
                  <div className="font-bold text-blue-800">${dataInfo.totalRevenue?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>
              
              {dataInfo.sampleRecords && (
                <div className="mt-4">
                  <h4 className="text-blue-800 font-semibold mb-2">Muestra de Datos:</h4>
                  <div className="space-y-2">
                    {dataInfo.sampleRecords.map((record: any, index: number) => (
                      <div key={index} className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                        <strong>{record.patientname}</strong> - {record.offices} - ${record.paidamount}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Datos Obtenidos (Primeros 10)</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Patient</th>
                    <th className="px-4 py-2 text-left">Office</th>
                    <th className="px-4 py-2 text-left">Carrier</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((record, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{record.patientname}</td>
                      <td className="px-4 py-2">{record.offices}</td>
                      <td className="px-4 py-2">{record.insurancecarrier}</td>
                      <td className="px-4 py-2">${record.paidamount}</td>
                      <td className="px-4 py-2">{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Configuración Actual</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Google Script Config:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• URL: AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ</li>
                <li>• Sheet: DB</li>
                <li>• Range: A:AG</li>
                <li>• Use Fallback: false</li>
                <li>• Use Proxy: true</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Recomendaciones:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verificar que el Google Apps Script esté configurado para acceso público</li>
                <li>• Confirmar que la hoja "DB" existe en el archivo "Test Overview"</li>
                <li>• Verificar que el rango A:AG contenga datos</li>
                <li>• Revisar la consola del navegador para errores detallados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 