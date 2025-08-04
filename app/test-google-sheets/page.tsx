'use client'

import { useState } from 'react'
import { fetchFromGoogleScript } from '@/lib/google-script'

export default function TestGoogleSheetsPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  const testRealDataConnection = async () => {
    setLoading(true)
    setError(null)
    setData([])
    setStats(null)
    
    try {
      console.log('🔄 Probando conexión de datos reales...')
      const rawData = await fetchFromGoogleScript()
      
      setData(rawData)
      
      // Calcular estadísticas
      const stats = {
        totalRecords: rawData.length,
        uniqueOffices: Array.from(new Set(rawData.map(item => item.offices))).length,
        uniqueCarriers: Array.from(new Set(rawData.map(item => item.insurancecarrier))).length,
        uniqueStatuses: Array.from(new Set(rawData.map(item => item.claimstatus))).length,
        totalRevenue: rawData.reduce((sum, item) => sum + (item.paidamount || 0), 0),
        averageAmount: rawData.length > 0 ? rawData.reduce((sum, item) => sum + (item.paidamount || 0), 0) / rawData.length : 0,
        dateRange: {
          earliest: rawData.length > 0 ? new Date(Math.min(...rawData.map(item => new Date(item.timestamp || item.dos || Date.now()).getTime()))).toISOString().split('T')[0] : 'N/A',
          latest: rawData.length > 0 ? new Date(Math.max(...rawData.map(item => new Date(item.timestamp || item.dos || Date.now()).getTime()))).toISOString().split('T')[0] : 'N/A'
        }
      }
      
      setStats(stats)
      
      console.log('✅ Datos obtenidos exitosamente:', rawData.length, 'registros')
    } catch (err) {
      setError(`Error al obtener datos: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('❌ Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testWithDifferentParameters = async () => {
    setLoading(true)
    setError(null)
    setData([])
    setStats(null)
    
    try {
      console.log('🔄 Probando con diferentes parámetros...')
      
      const tests = [
        { name: 'Sin parámetros', url: '/api/proxy' },
        { name: 'Con action getAllRecords', url: '/api/proxy?action=getAllRecords' },
        { name: 'Con límite alto', url: '/api/proxy?action=getAllRecords&limit=10000' },
        { name: 'Con rango completo', url: '/api/proxy?action=getAllRecords&range=A:Z' },
        { name: 'Con sheet específico', url: '/api/proxy?action=getAllRecords&sheet=Sheet1' }
      ]
      
      const results = []
      
      for (const test of tests) {
        try {
          console.log(`📡 Probando: ${test.name}`)
          const response = await fetch(test.url)
          const responseData = await response.json()
          
          results.push({
            test: test.name,
            success: true,
            count: responseData.data?.length || responseData.length || 0,
            data: responseData.data || responseData
          })
        } catch (err) {
          results.push({
            test: test.name,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }
      
      // Usar el resultado más exitoso
      const bestResult = results.find(r => r.success && r.count > 0) || results[0]
      
      if (bestResult.success && bestResult.data) {
        setData(bestResult.data)
        
                 const stats = {
           totalRecords: bestResult.data.length,
           uniqueOffices: Array.from(new Set(bestResult.data.map((item: any) => item.offices))).length,
           uniqueCarriers: Array.from(new Set(bestResult.data.map((item: any) => item.insurancecarrier))).length,
           uniqueStatuses: Array.from(new Set(bestResult.data.map((item: any) => item.claimstatus))).length,
           totalRevenue: bestResult.data.reduce((sum: number, item: any) => sum + (item.paidamount || 0), 0),
           averageAmount: bestResult.data.length > 0 ? bestResult.data.reduce((sum: number, item: any) => sum + (item.paidamount || 0), 0) / bestResult.data.length : 0,
           dateRange: {
             earliest: bestResult.data.length > 0 ? new Date(Math.min(...bestResult.data.map((item: any) => new Date(item.timestamp || item.dos || Date.now()).getTime()))).toISOString().split('T')[0] : 'N/A',
             latest: bestResult.data.length > 0 ? new Date(Math.max(...bestResult.data.map((item: any) => new Date(item.timestamp || item.dos || Date.now()).getTime()))).toISOString().split('T')[0] : 'N/A'
           }
         }
        
        setStats(stats)
      }
      
      console.log('📊 Resultados de las pruebas:', results)
    } catch (err) {
      setError(`Error en pruebas: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('❌ Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📊 Test de Google Sheets - Datos Reales
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Obtener Datos de Google Sheets</h2>
          
          <div className="space-y-4">
            <button
              onClick={testRealDataConnection}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Obteniendo datos...' : '1. Obtener Datos Reales (fetchFromGoogleScript)'}
            </button>
            
            <button
              onClick={testWithDifferentParameters}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Probando parámetros...' : '2. Probar Diferentes Parámetros'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {stats && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-green-800 font-semibold mb-4">📊 Estadísticas de los Datos:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Total Registros</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalRecords}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Oficinas Únicas</div>
                <div className="text-2xl font-bold text-green-600">{stats.uniqueOffices}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Carriers Únicos</div>
                <div className="text-2xl font-bold text-purple-600">{stats.uniqueCarriers}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Estados Únicos</div>
                <div className="text-2xl font-bold text-orange-600">{stats.uniqueStatuses}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Ingresos Totales</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Promedio por Claim</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageAmount)}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Fecha Más Antigua</div>
                <div className="text-lg font-semibold text-gray-800">{stats.dateRange.earliest}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Fecha Más Reciente</div>
                <div className="text-lg font-semibold text-gray-800">{stats.dateRange.latest}</div>
              </div>
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              📋 Datos Obtenidos ({data.length} registros)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 20).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.patientname || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.offices || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.insurancecarrier || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.paidamount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.claimstatus === 'Paid' ? 'bg-green-100 text-green-800' :
                          item.claimstatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.claimstatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.dos || item.timestamp ? new Date(item.dos || item.timestamp).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {data.length > 20 && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Mostrando los primeros 20 registros de {data.length} totales
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-blue-800 font-semibold mb-2">ℹ️ Información:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• <strong>URL del Script:</strong> https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec</li>
            <li>• <strong>Objetivo:</strong> Obtener todos los datos reales de Google Sheets</li>
            <li>• <strong>Datos esperados:</strong> Más de 5000 registros en la base real</li>
            <li>• <strong>Fallback:</strong> Si hay errores, se usan datos de ejemplo</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 