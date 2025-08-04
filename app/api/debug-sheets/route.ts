import { NextRequest, NextResponse } from 'next/server'

// Configurar como dinámico para evitar problemas en build
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const baseUrl = "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec"
  
  try {
    // Test 1: Basic connection
    console.log('🔍 Test 1: Basic connection...')
    const basicResponse = await fetch(baseUrl)
    const basicData = await basicResponse.json()
    const basicCount = basicData.data?.length || basicData.length || 0
    
    // Test 2: With explicit parameters
    console.log('🔍 Test 2: With explicit parameters...')
    const paramResponse = await fetch(`${baseUrl}?action=getAllRecords&limit=1000`)
    const paramData = await paramResponse.json()
    const paramCount = paramData.data?.length || paramData.length || 0
    
    // Test 3: Different sheet name
    console.log('🔍 Test 3: Different sheet name...')
    const sheetResponse = await fetch(`${baseUrl}?sheet=Sheet1`)
    const sheetData = await sheetResponse.json()
    const sheetCount = sheetData.data?.length || sheetData.length || 0
    
    // Test 4: Full parameters
    console.log('🔍 Test 4: Full parameters...')
    const fullResponse = await fetch(`${baseUrl}?action=getAllRecords&limit=1000&sheet=Sheet1&range=A:Z`)
    const fullData = await fullResponse.json()
    const fullCount = fullData.data?.length || fullData.length || 0
    
    return NextResponse.json({
      summary: {
        expectedRecords: 248,
        actualRecords: basicCount,
        missingRecords: 248 - basicCount
      },
      tests: [
        {
          name: 'Basic Connection',
          count: basicCount,
          success: basicResponse.ok,
          status: basicResponse.status,
          sampleData: basicData.data?.[0] || basicData[0]
        },
        {
          name: 'With Parameters (action=getAllRecords&limit=1000)',
          count: paramCount,
          success: paramResponse.ok,
          status: paramResponse.status,
          sampleData: paramData.data?.[0] || paramData[0]
        },
        {
          name: 'With Sheet Name (sheet=Sheet1)',
          count: sheetCount,
          success: sheetResponse.ok,
          status: sheetResponse.status,
          sampleData: sheetData.data?.[0] || sheetData[0]
        },
        {
          name: 'Full Parameters (action=getAllRecords&limit=1000&sheet=Sheet1&range=A:Z)',
          count: fullCount,
          success: fullResponse.ok,
          status: fullResponse.status,
          sampleData: fullData.data?.[0] || fullData[0]
        }
      ],
      recommendations: [
        'Verificar el código del Google Apps Script',
        'Revisar si hay filtros aplicados en la hoja',
        'Confirmar el rango de datos en Google Sheets',
        'Verificar si hay límites configurados en el script'
      ]
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to debug Google Sheets connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 