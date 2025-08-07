'use client'

import { useState } from 'react'
import ConnectivityTest from '@/components/ConnectivityTest'

export default function DebugPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testBasicFetch = async () => {
    setLoading(true)
    setResult('Testing basic fetch...')
    
    try {
      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult(`✅ Success! Got ${data.data?.length || 0} records`)
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testWithTimeout = async () => {
    setLoading(true)
    setResult('Testing with timeout...')
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        setResult('❌ Timeout: Request took too long')
      }, 10000)
      
      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult(`✅ Success with timeout! Got ${data.data?.length || 0} records`)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setResult('❌ Request was aborted (timeout)')
      } else {
        setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug API Connection</h1>
        
        <div className="space-y-4">
          <button
            onClick={testBasicFetch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Basic Fetch
          </button>
          
          <button
            onClick={testWithTimeout}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test With Timeout
          </button>
        </div>
        
        {loading && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Testing...</span>
            </div>
          </div>
        )}
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
