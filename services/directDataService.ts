import { PatientRecord } from '@/types'

// Servicio de datos directo que usa la API proxy sin capas adicionales
export class DirectDataService {
  /**
   * Obtener datos directamente de la API proxy
   */
  async fetchPatientRecords(): Promise<PatientRecord[]> {
    try {
      console.log('🚀 [DirectDataService] Cargando datos desde API proxy...')

      // Crear AbortController con timeout extendido
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ [DirectDataService] Timeout alcanzado - abortando request')
        controller.abort()
      }, 180000) // 3 minutos para datasets grandes

      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        // Agregar configuraciones adicionales para mejorar la conexión
        cache: 'no-cache',
        credentials: 'same-origin'
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const apiData = await response.json()
      console.log('📡 [DirectDataService] Datos recibidos:', {
        success: apiData.success,
        totalRecords: apiData.totalRecords,
        dataLength: apiData.data?.length,
        timestamp: apiData.timestamp
      })

      const rawData = apiData.data || []
      
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        console.error('❌ [DirectDataService] Error: No se recibieron datos')
        console.error('Respuesta completa:', apiData)
        throw new Error(`No data received: expected array, got ${typeof rawData}`)
      }

      console.log(`✅ [DirectDataService] Procesando ${rawData.length} registros...`)

      // Procesar y mapear los datos
      const processedData = this.processRawData(rawData)
      
      console.log(`🎯 [DirectDataService] Datos procesados exitosamente: ${processedData.length} registros`)
      console.log('📊 [DirectDataService] Muestra de datos procesados:', processedData.slice(0, 2))

      return processedData

    } catch (error) {
      console.error('❌ [DirectDataService] Error al cargar datos:', error)

      // Proveer más contexto sobre el tipo de error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🌐 [DirectDataService] Error de red - posible problema de conectividad')
        throw new Error('Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.')
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('⏰ [DirectDataService] Request cancelado por timeout')
        throw new Error('Timeout: La carga de datos está tomando demasiado tiempo. Intenta de nuevo.')
      }

      throw error
    }
  }

  /**
   * Procesar datos en bruto de Google Sheets
   */
  private processRawData(rawData: any[]): PatientRecord[] {
    console.log('🔄 [DirectDataService] Iniciando procesamiento de datos...')
    console.log('📋 [DirectDataService] Claves del primer registro:', Object.keys(rawData[0] || {}))

    const processedRecords = rawData.map((item, index) => {
      // Log detallado del primer registro
      if (index === 0) {
        console.log('📝 [DirectDataService] Estructura del primer registro:', item)
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

      // Validar registro básico
      if (!record.patientname && !record.insurancecarrier) {
        console.warn(`⚠️ [DirectDataService] Registro ${index} incompleto:`, record)
      }

      return record
    })

    // Filtrar registros válidos (que tengan al menos nombre de paciente)
    const validRecords = processedRecords.filter(record => 
      record.patientname && record.patientname.trim().length > 0
    )

    console.log(`✅ [DirectDataService] Filtrado completado: ${validRecords.length}/${processedRecords.length} registros válidos`)

    return validRecords
  }

  /**
   * Probar conectividad con la API
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 [DirectDataService] Probando conectividad...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos para test

      const response = await fetch('/api/proxy?action=test', {
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
