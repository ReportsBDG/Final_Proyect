import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec"
  
  try {
    console.log('🔍 Verificando configuración del Google Apps Script...')
    
    // Test básico
    const response = await fetch(baseUrl)
    const data = await response.json()
    const recordCount = data.data?.length || data.length || 0
    
    // Análisis de los datos
    const analysis = {
      totalRecords: recordCount,
      expectedRecords: 248,
      missingRecords: 248 - recordCount,
      percentageComplete: Math.round((recordCount / 248) * 100),
      sampleRecord: data.data?.[0] || data[0],
      dataStructure: data.data ? 'data.data' : 'data',
      responseStatus: response.status,
      responseOk: response.ok
    }
    
    // Diagnóstico del problema
    const diagnosis = {
      possibleCauses: [
        'Límite de filas configurado en Google Apps Script',
        'Filtros aplicados en la hoja de Google Sheets',
        'Rango de lectura limitado (ej: A1:Z150)',
        'Datos en hojas diferentes',
        'Configuración de despliegue del script'
      ],
      recommendations: [
        'Verificar el código del Google Apps Script para límites',
        'Revisar si hay filtros activos en Google Sheets',
        'Confirmar que el rango de lectura incluya todas las filas',
        'Verificar la configuración de despliegue del script',
        'Revisar si hay múltiples hojas con datos'
      ],
      nextSteps: [
        'Acceder al Google Apps Script y revisar el código',
        'Verificar la configuración de despliegue',
        'Revisar el Google Sheet para filtros o rangos limitados',
        'Probar con parámetros específicos (limit, range, sheet)'
      ]
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      scriptUrl: baseUrl,
      analysis,
      diagnosis,
      rawResponse: {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check Google Apps Script',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 