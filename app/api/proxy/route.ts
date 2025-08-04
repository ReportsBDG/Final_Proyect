import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec"
  
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const limit = searchParams.get('limit')
  const sheet = searchParams.get('sheet')
  const range = searchParams.get('range')
  
  // Build URL with parameters
  let url = baseUrl
  const params = new URLSearchParams()
  
  // Si no hay parámetros específicos, intentar obtener todos los datos
  if (!action && !limit && !sheet && !range) {
    params.append('action', 'getAllRecords')
    params.append('limit', '10000') // Límite alto para obtener todos los datos
    params.append('sheet', 'Sheet1')
    params.append('range', 'A:Z')
  } else {
    if (action) params.append('action', action)
    if (limit) params.append('limit', limit)
    if (sheet) params.append('sheet', sheet)
    if (range) params.append('range', range)
  }
  
  if (params.toString()) {
    url += '?' + params.toString()
  }
  
  try {
    console.log('🔗 Proxy request to:', url)
    console.log('📋 Parameters:', { action, limit, sheet, range })
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Dental-Dashboard/1.0',
      },
    })
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ HTTP Error:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Proxy response data length:', data.data?.length || data.length || 0)
    console.log('📊 Response structure:', Object.keys(data))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error en proxy:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Google Sheets', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        url: url
      }, 
      { status: 500 }
    )
  }
} 