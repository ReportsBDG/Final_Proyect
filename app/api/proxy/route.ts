import { NextRequest, NextResponse } from 'next/server'

// Configurar como dinámico para evitar problemas en build
export const dynamic = 'force-dynamic'

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
  
  // Handle ping action for connectivity testing
  if (action === 'ping') {
    // For ping, just make a minimal request to check if the script is responding
    params.append('action', 'ping')
  } else if (!action && !limit && !sheet && !range) {
    // Si no hay parámetros específicos, usar límite reducido para evitar timeouts
    params.append('action', 'getAllRecords')
    params.append('limit', '5000') // Reducido para evitar timeouts del Google Apps Script
    params.append('sheet', 'DB') // Nombre correcto de la hoja
    params.append('range', 'A:AG') // Rango correcto hasta columna AG
  } else {
    if (action) params.append('action', action)
    if (limit) params.append('limit', limit)
    if (sheet) params.append('sheet', sheet)
    if (range) params.append('range', range)
  }
  
  if (params.toString()) {
    url += '?' + params.toString()
  }
  
  let timeoutId: NodeJS.Timeout | null = null

  try {
    console.log('🔗 Proxy request to:', url)
    console.log('📋 Parameters:', { action, limit, sheet, range })

    // Timeout ajustado dependiendo del tipo de request
    const controller = new AbortController()
    const isPingRequest = action === 'ping'
    const timeoutDuration = isPingRequest ? 8000 : 90000 // 8 segundos para ping, 90 para datos

    timeoutId = setTimeout(() => {
      if (isPingRequest) {
        console.log('⏰ Ping timeout de 8 segundos alcanzado')
      } else {
        console.log('⏰ Timeout de 90 segundos alcanzado - Google Script puede estar sobrecargado')
      }
      controller.abort()
    }, timeoutDuration)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Dental-Dashboard/1.0',
      },
      signal: controller.signal
    })

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ HTTP Error:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const data = await response.json()
    const recordCount = data.data?.length || data.length || 0
    console.log('✅ Proxy response data length:', recordCount)
    console.log('📊 Response structure:', Object.keys(data))

    // Log detallado para datasets grandes
    if (recordCount > 1000) {
      console.log('🔍 Dataset grande detectado:')
      console.log('  - Total de registros:', recordCount)
      console.log('  - Estructura de respuesta:', data.success ? 'Exitosa' : 'Con errores')
      console.log('  - Timestamp:', data.timestamp)
    }

    // Verificar si necesitamos más datos
    if (recordCount >= 10000) {
      console.log('⚠️ Posible truncamiento: se alcanzó el límite de 10000 registros')
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    // Clear timeout on error to prevent race conditions
    try {
      clearTimeout(timeoutId)
    } catch (e) {
      // Ignore timeout clearing errors
    }

    console.error('❌ Error en proxy:', {
      name: error.name,
      message: error.message,
      action: action,
      url: url
    })

    // Handle specific error types
    let errorDetails = error.message || 'Unknown error'
    let statusCode = 500

    if (error.name === 'AbortError') {
      errorDetails = action === 'ping' ? 'Connectivity test timeout' : 'Request timeout - Google Apps Script may be overloaded'
      statusCode = 408 // Request Timeout
    } else if (error.message?.includes('Failed to fetch')) {
      errorDetails = 'Network connectivity issue'
      statusCode = 503 // Service Unavailable
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch data from Google Sheets',
        details: errorDetails,
        timestamp: new Date().toISOString(),
        url: url,
        action: action
      },
      { status: statusCode }
    )
  }
}
