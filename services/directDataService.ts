import { PatientRecord } from '@/types'

// Servicio de datos directo que usa la API proxy sin capas adicionales
export class DirectDataService {
  /**
   * Obtener datos directamente de la API proxy con reintentos y fallback
   */
  async fetchPatientRecords(): Promise<PatientRecord[]> {
    console.log('🚀 [DirectDataService] Cargando datos desde API proxy...')
    
    // Intentar múltiples veces en caso de interferencias
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`��� [DirectDataService] Intento ${attempt}/3`)
        
        const data = await this.attemptFetch(attempt)
        if (data && data.length > 0) {
          console.log(`✅ [DirectDataService] Datos cargados exitosamente en intento ${attempt}: ${data.length} registros`)
          return data
        }
        
      } catch (error) {
        console.warn(`⚠️ [DirectDataService] Intento ${attempt} falló:`, error)
        
        // Si no es el último intento, esperar un poco antes del siguiente
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    // Si todos los intentos fallaron, usar datos mock como fallback
    console.warn('❌ [DirectDataService] Todos los intentos fallaron, usando datos mock')
    return this.getFallbackData()
  }

  /**
   * Intento individual de fetch con configuraciones anti-interferencia
   */
  private async attemptFetch(attempt: number): Promise<PatientRecord[]> {
    // Crear AbortController con timeout progresivo
    const controller = new AbortController()
    const timeout = 30000 + (attempt * 15000) // 30s, 45s, 60s

    const timeoutId = setTimeout(() => {
      console.log(`⏰ [DirectDataService] Timeout de ${timeout}ms alcanzado en intento ${attempt}`)
      controller.abort()
    }, timeout)

    try {
      // Configuraciones anti-interferencia
      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal,
        cache: 'no-cache',
        credentials: 'same-origin'
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available')
        console.error(`❌ [DirectDataService] HTTP Error ${response.status}:`, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.error('❌ [DirectDataService] Response is not JSON:', responseText.substring(0, 200))
        throw new Error(`Invalid response format: expected JSON, got ${contentType}`)
      }

      const apiData = await response.json()
      console.log('📡 [DirectDataService] Respuesta recibida:', {
        success: apiData.success,
        totalRecords: apiData.totalRecords,
        dataLength: apiData.data?.length,
        timestamp: apiData.timestamp,
        hasError: !!apiData.error
      })

      // Verificar si la API reporta error
      if (apiData.error) {
        throw new Error(`API Error: ${apiData.error} - ${apiData.details || ''}`)
      }

      const rawData = apiData.data || []

      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        console.warn(`⚠️ [DirectDataService] Datos vacíos o inválidos: ${typeof rawData}, length: ${rawData?.length}`)
        // Si es el primer intento y no hay datos, lanzar error para reintentar
        if (attempt === 1) {
          throw new Error(`No hay datos válidos en primer intento`)
        }
        // En intentos posteriores, usar fallback directamente
        return []
      }

      return this.processRawData(rawData)

    } catch (error: any) {
      clearTimeout(timeoutId)

      // Analizar el tipo de error para mejor debugging
      if (error.name === 'AbortError') {
        console.error(`⏰ [DirectDataService] Request aborted (timeout) en intento ${attempt}`)
        throw new Error(`Request timeout after ${timeout}ms`)
      }

      if (error.message?.includes('Failed to fetch')) {
        console.error(`🌐 [DirectDataService] Network error en intento ${attempt}:`, error.message)
        throw new Error(`Network connectivity issue: ${error.message}`)
      }

      console.error(`❌ [DirectDataService] Error en intento ${attempt}:`, error)
      throw error
    }
  }

  /**
   * Obtener datos mock como fallback cuando falla la conexión
   */
  private async getFallbackData(): Promise<PatientRecord[]> {
    try {
      console.log('🔄 [DirectDataService] Cargando datos mock como fallback...')
      
      // Importar dinámicamente los datos mock
      const { generateMockData } = await import('@/utils/mockData')
      const mockData = generateMockData(50) // 50 registros mock
      
      console.log(`📝 [DirectDataService] Datos mock cargados: ${mockData.length} registros`)
      return mockData
      
    } catch (error) {
      console.error('❌ [DirectDataService] Error cargando datos mock:', error)
      
      // Fallback de emergencia con datos mínimos
      return [{
        timestamp: new Date().toISOString(),
        insurancecarrier: 'Demo Insurance',
        offices: 'Demo Office',
        patientname: 'Demo Patient',
        paidamount: 100,
        claimstatus: 'Demo',
        typeofinteraction: 'Demo Interaction',
        patientdob: '1990-01-01',
        dos: '2024-01-01',
        productivityamount: 100,
        missingdocsorinformation: '',
        howweproceeded: 'Demo process',
        escalatedto: '',
        commentsreasons: 'Datos de demostración - problemas de conectividad',
        emailaddress: 'demo@example.com',
        status: 'Demo',
        timestampbyinteraction: new Date().toISOString(),
        eftCheckIssuedDate: '2024-01-01'
      }]
    }
  }

  /**
   * Procesar datos en bruto de Google Sheets
   */
  private processRawData(rawData: any[]): PatientRecord[] {
    console.log('🔄 [DirectDataService] Procesando datos...', rawData.length, 'registros')

    const processedRecords = rawData.map((item, index) => {
      // Log detallado del primer registro
      if (index === 0) {
        console.log('📝 [DirectDataService] Estructura del primer registro:', Object.keys(item))
      }

      // Mapear campos con múltiples posibles nombres
      const record: PatientRecord = {
        timestamp: item.timestamp || item.Timestamp || new Date().toISOString(),
        insurancecarrier: item.insurancecarrier || item['Insurance Carrier'] || item.carrier || '',
        offices: item.offices || item.Office || item['Office'] || '',
        patientname: item.patientname || item['Patient Name'] || item.patient || '',
        paidamount: this.parseNumber(item.paidamount || item['Paid Amount'] || item.amount || 0),
        claimstatus: item.claimstatus || item['Claim Status'] || item.status || '',
        typeofinteraction: item.typeofinteraction || item['Type of Interaction'] || item.type || '',
        patientdob: item.patientdob || item['Patient DOB'] || item.dob || '',
        dos: item.dos || item.DOS || item['DOS'] || '',
        productivityamount: this.parseNumber(item.productivityamount || item['Productivity Amount'] || 0),
        missingdocsorinformation: item.missingdocsorinformation || item['Missing Docs'] || '',
        howweproceeded: item.howweproceeded || item['How We Proceeded'] || '',
        escalatedto: item.escalatedto || item['Escalated To'] || '',
        commentsreasons: item.commentsreasons || item['Comments/Reasons'] || item.comments || '',
        emailaddress: item.emailaddress || item['Email Address'] || item.email || '',
        status: item.status || item.Status || '',
        timestampbyinteraction: item.timestampbyinteraction || item['Timestamp By Interaction'] || '',
        eftCheckIssuedDate: item.eftCheckIssuedDate || item['EFT/Check Issued Date'] || ''
      }

      return record
    })

    // Filtrar registros válidos
    const validRecords = processedRecords.filter(record => 
      record.patientname && record.patientname.trim().length > 0
    )

    console.log(`✅ [DirectDataService] Procesamiento completado: ${validRecords.length}/${processedRecords.length} registros válidos`)
    return validRecords
  }

  /**
   * Probar conectividad con la API de forma simple
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 [DirectDataService] Probando conectividad...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos para test

      const response = await fetch('/api/proxy', {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache'
      })

      clearTimeout(timeoutId)
      const isConnected = response.ok
      console.log(`🔗 [DirectDataService] Conectividad: ${isConnected ? 'OK' : 'FAILED'}`)
      return isConnected
      
    } catch (error) {
      console.error('❌ [DirectDataService] Test de conectividad falló:', error)
      return false
    }
  }

  /**
   * Convertir valores a número de forma segura
   */
  private parseNumber(value: any): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }
}

// Instancia singleton
export const directDataService = new DirectDataService()
