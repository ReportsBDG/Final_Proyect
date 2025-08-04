import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('test') || 'basic'
  
  const baseUrl = "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec"
  
  let testName = 'Basic Test' // Declare testName at the top level
  
  try {
    let url = baseUrl
    
    switch (testType) {
      case 'withLimit':
        url += '?limit=1000'
        testName = 'Test with Limit 1000'
        break
      case 'withAction':
        url += '?action=getAllRecords'
        testName = 'Test with Action Parameter'
        break
      case 'withSheet':
        url += '?sheet=Sheet1'
        testName = 'Test with Sheet Parameter'
        break
      case 'fullParams':
        url += '?action=getAllRecords&limit=1000&sheet=Sheet1'
        testName = 'Test with Full Parameters'
        break
      default:
        testName = 'Basic Test'
    }
    
    console.log(`🔍 ${testName}: ${url}`)
    
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const endTime = Date.now()
    
    const responseTime = endTime - startTime
    
    if (!response.ok) {
      return NextResponse.json({
        test: testName,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        url
      })
    }
    
    const data = await response.json()
    const recordCount = data.data?.length || data.length || 0
    
    return NextResponse.json({
      test: testName,
      success: true,
      recordCount,
      responseTime: `${responseTime}ms`,
      url,
      sampleData: recordCount > 0 ? data.data?.[0] || data[0] : null,
      headers: Object.fromEntries(response.headers.entries())
    })
    
  } catch (error) {
    return NextResponse.json({
      test: testName,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: baseUrl
    })
  }
} 