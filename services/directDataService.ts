import { PatientRecord } from '@/types'

// Servicio de datos directo que usa la API proxy sin capas adicionales
export class DirectDataService {
  /**
   * Obtener datos directamente de la API proxy con reintentos y fallback
   */
  async fetchPatientRecords(): Promise<PatientRecord[]> {
    console.log('🚀 [DirectDataService] Cargando datos desde API proxy...')

    let lastError: Error | null = null

    // Intentar múltiples veces en caso de interferencias
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 [DirectDataService] Intento ${attempt}/3`)

        const data = await this.attemptFetch(attempt)
        if (data && data.length > 0) {
          console.log(`✅ [DirectDataService] Datos cargados exitosamente en intento ${attempt}: ${data.length} registros`)
          return data
        } else if (data && data.length === 0) {
          console.warn(`⚠️ [DirectDataService] Intento ${attempt} devolvió datos vacíos`)
          // Si obtenemos respuesta pero sin datos, puede ser problema temporal
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
            continue
          }
        }

      } catch (error: any) {
        lastError = error
        console.warn(`⚠️ [DirectDataService] Intento ${attempt} falló:`, {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        })

        // Si no es el último intento, esperar un poco antes del siguiente
        if (attempt < 3) {
          const delay = 1000 * attempt
          console.log(`⏳ [DirectDataService] Esperando ${delay}ms antes del siguiente intento...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // Si todos los intentos fallaron, usar datos mock como fallback
    console.warn('❌ [DirectDataService] Todos los intentos fallaron, usando datos mock como fallback')
    console.warn('🔍 [DirectDataService] Último error:', lastError?.message || 'Unknown error')
    console.log('📋 [DirectDataService] Intentos realizados: límites [5000, 3000, 1000] registros')
    console.log('💡 [DirectDataService] Sugerencia: Verifique el estado del Google Apps Script o reduzca el volumen de datos')

    return this.getFallbackData()
  }

  /**
   * Intento individual de fetch con degradación gradual de límites
   */
  private async attemptFetch(attempt: number): Promise<PatientRecord[]> {
    // Estrategia de degradación: reducir límite en cada intento
    const limits = [5000, 3000, 1000] // Límites progresivamente menores
    const limit = limits[attempt - 1] || 500

    // Crear AbortController con timeout ajustado
    const controller = new AbortController()
    const timeout = 45000 // Timeout fijo de 45 segundos

    const timeoutId = setTimeout(() => {
      console.log(`⏰ [DirectDataService] Timeout de ${timeout}ms alcanzado en intento ${attempt} (límite: ${limit})`)
      controller.abort()
    }, timeout)

    try {
      // Construir URL con límite específico para este intento
      const url = `/api/proxy?action=getAllRecords&limit=${limit}&sheet=DB&range=A:AG`
      console.log(`🔄 [DirectDataService] Intento ${attempt} con límite ${limit} registros`)

      // Configuraciones anti-interferencia
      const response = await fetch(url, {
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
        const errorMsg = `API Error: ${apiData.error} - ${apiData.details || ''}`

        // Manejo específico para error "terminated" de Google Apps Script
        if (apiData.details === 'terminated') {
          console.warn(`⚠️ [DirectDataService] Google Apps Script terminado (timeout/recursos) en intento ${attempt}`)
          if (attempt < 3) {
            console.log(`🔄 [DirectDataService] Reintentando con límite menor...`)
          }
        }

        throw new Error(errorMsg)
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

      // Importar dinámicamente los datos mock con manejo de errores
      try {
        const mockModule = await import('@/utils/mockData')
        const mockData = mockModule.generateMockData(50) // 50 registros mock

        console.log(`📝 [DirectDataService] Datos mock cargados: ${mockData.length} registros`)
        return mockData
      } catch (importError) {
        console.warn('⚠️ [DirectDataService] Error importando módulo mock:', importError)
        // Fallback to inline mock data if import fails
        throw importError
      }

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

    // Filtrar la primera fila si contiene headers
    const dataToProcess = rawData.filter((item, index) => {
      // Si la primera fila contiene headers (strings que coinciden con nombres de columnas), la eliminamos
      if (index === 0) {
        const firstRowValues = Object.values(item).map(v => String(v).toLowerCase())
        const hasHeaders = firstRowValues.some(value =>
          value.includes('patient') || value.includes('office') || value.includes('insurance') ||
          value.includes('claim') || value.includes('status') || value.includes('timestamp') ||
          value.includes('amount') || value.includes('email')
        )
        if (hasHeaders) {
          console.log('🔍 [DirectDataService] Primera fila detectada como headers, eliminando...')
          return false
        }
      }
      return true
    })

    const processedRecords = dataToProcess.map((item, index) => {
      // Log detallado del primer registro real (después de filtrar headers)
      if (index === 0) {
        console.log('📝 [DirectDataService] Estructura del primer registro:', Object.keys(item))
        console.log('📝 [DirectDataService] Valores del primer registro:', item)
      }

      // Mapear campos con múltiples posibles nombres
      // CORRECCIÓN: claimstatus debe mapear de la columna X específicamente
      const record: PatientRecord = {
        timestamp: item.timestamp || item.Timestamp || new Date().toISOString(),
        insurancecarrier: item.insurancecarrier || item['Insurance Carrier'] || item.carrier || '',
        offices: item.offices || item.Office || item['Office'] || '',
        patientname: item.patientname || item['Patient Name'] || item.patient || '',
        paidamount: this.parseNumber(item.paidamount || item['Paid Amount'] || item.amount || 0),
        // CORRECCIÓN: Mapear claimstatus específicamente de la columna X (índice 23, basado en 0)
        claimstatus: this.getColumnValue(item, 'X') || item.claimstatus || item['Claim Status'] || '',
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
        eftCheckIssuedDate: this.getColumnValue(item, 'AA') || item.eftCheckIssuedDate || item['EFT/Check Issued Date'] || ''
      }

      return record
    })

    // Filtrar registros válidos (excluir headers restantes y registros inválidos)
    const validRecords = processedRecords.filter(record => {
      // Verificar que tiene nombre de paciente válido
      const hasValidPatientName = record.patientname &&
        record.patientname.trim().length > 0 &&
        !record.patientname.toLowerCase().includes('patient') &&
        !record.patientname.toLowerCase().includes('name')

      return hasValidPatientName
    })

    console.log(`✅ [DirectDataService] Procesamiento completado: ${validRecords.length}/${processedRecords.length} registros válidos`)
    return validRecords
  }

  /**
   * Obtener valor de una columna específica (A, B, C, ..., X, Y, Z, AA, AB, etc.)
   */
  private getColumnValue(item: any, columnLetter: string): string {
    // Convertir letra de columna a índice
    let columnIndex = 0
    if (columnLetter.length === 1) {
      // Columnas simples A-Z
      columnIndex = columnLetter.charCodeAt(0) - 65
    } else if (columnLetter.length === 2) {
      // Columnas dobles AA-ZZ
      const firstChar = columnLetter.charCodeAt(0) - 65
      const secondChar = columnLetter.charCodeAt(1) - 65
      columnIndex = 26 + (firstChar * 26) + secondChar
    }

    // Intentar obtener el valor por índice de array si el item es un array
    if (Array.isArray(item) && item[columnIndex] !== undefined) {
      return String(item[columnIndex] || '')
    }

    // Intentar obtener por clave de objeto con la letra de columna
    if (item[columnLetter] !== undefined) {
      return String(item[columnLetter] || '')
    }

    // Intentar obtener por clave de objeto con nombre completo de columna
    const columnNames = {
      'X': ['claimstatus', 'claim_status', 'Claim Status', 'X'],
      'AA': ['eftCheckIssuedDate', 'eft_check_issued_date', 'EFT/Check Issued Date', 'AA']
    }

    if (columnNames[columnLetter as keyof typeof columnNames]) {
      for (const possibleName of columnNames[columnLetter as keyof typeof columnNames]) {
        if (item[possibleName] !== undefined) {
          return String(item[possibleName] || '')
        }
      }
    }

    return ''
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
