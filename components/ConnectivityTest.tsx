'use client'

import { useState } from 'react'
import { directDataService } from '@/services/directDataService'

export default function ConnectivityTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [lastError, setLastError] = useState<string>('')

  const runConnectivityTest = async () => {
    setIsLoading(true)
    setResult('')
    setLastError('')
    
    try {
      console.log('🧪 Starting connectivity test...')
      const isConnected = await directDataService.testConnection()
      
      setResult(isConnected ? 'Connection successful ✅' : 'Connection failed ❌')
      console.log('🧪 Connectivity test result:', isConnected)
      
    } catch (error: any) {
      console.error('🧪 Connectivity test error:', error)
      setLastError(`Error: ${error.name} - ${error.message}`)
      setResult('Test failed with error ❌')
    } finally {
      setIsLoading(false)
    }
  }

  const runDataFetch = async () => {
    setIsLoading(true)
    setResult('')
    setLastError('')
    
    try {
      console.log('🧪 Starting data fetch test...')
      const data = await directDataService.fetchPatientRecords()
      
      setResult(`Data fetch successful ✅ - ${data.length} records`)
      console.log('🧪 Data fetch result:', data.length, 'records')
      
    } catch (error: any) {
      console.error('🧪 Data fetch error:', error)
      setLastError(`Error: ${error.name} - ${error.message}`)
      setResult('Data fetch failed ❌')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Connectivity Test</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={runConnectivityTest}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={runDataFetch}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Test Data Fetch'}
          </button>
        </div>

        {result && (
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="font-medium">Result:</p>
            <p>{result}</p>
          </div>
        )}

        {lastError && (
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded">
            <p className="font-medium text-red-800 dark:text-red-200">Error Details:</p>
            <p className="text-red-700 dark:text-red-300 font-mono text-sm">{lastError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
