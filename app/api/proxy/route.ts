import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec"
  
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const limit = searchParams.get('limit')
  const sheet = searchParams.get('sheet')
  
  // Build URL with parameters
  let url = baseUrl
  const params = new URLSearchParams()
  
  if (action) params.append('action', action)
  if (limit) params.append('limit', limit)
  if (sheet) params.append('sheet', sheet)
  
  if (params.toString()) {
    url += '?' + params.toString()
  }
  
  try {
    console.log('Proxy request to:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Proxy response status:', response.status)
    console.log('Proxy response data length:', data.data?.length || data.length || 0)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en proxy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 