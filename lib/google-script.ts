// Configuración para Google Apps Script
export const GOOGLE_SCRIPT_CONFIG = {
  url: "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec",
  timeout: 15000, // Aumentado para dar más tiempo
  retries: 3,
  useProxy: true,
  useFallbackData: false // Activando conexión real
}

// Tipos de respuesta esperados
export interface GoogleScriptResponse {
  success: boolean
  data?: any[]
  error?: string
  message?: string
}

// Datos de ejemplo para desarrollo (solo como respaldo)
const fallbackData = [
  {
    timestamp: "2024-01-15T10:30:00Z",
    insurancecarrier: "Delta Dental",
    offices: "Downtown Office",
    patientname: "John Smith",
    paidamount: 150.00,
    claimstatus: "Paid",
    typeofinteraction: "Cleaning",
    patientdob: "1985-03-15",
    dos: "2024-01-10",
    productivityamount: 200.00,
    status: "Completed",
    emailaddress: "john.smith@email.com"
  },
  {
    timestamp: "2024-01-15T11:15:00Z",
    insurancecarrier: "Aetna",
    offices: "Uptown Office",
    patientname: "Sarah Johnson",
    paidamount: 300.00,
    claimstatus: "Pending",
    typeofinteraction: "Root Canal",
    patientdob: "1990-07-22",
    dos: "2024-01-12",
    productivityamount: 450.00,
    status: "In Progress",
    emailaddress: "sarah.j@email.com"
  },
  {
    timestamp: "2024-01-15T12:00:00Z",
    insurancecarrier: "Cigna",
    offices: "Downtown Office",
    patientname: "Mike Davis",
    paidamount: 75.00,
    claimstatus: "Denied",
    typeofinteraction: "Checkup",
    patientdob: "1978-11-08",
    dos: "2024-01-08",
    productivityamount: 100.00,
    status: "Needs Review",
    emailaddress: "mike.davis@email.com"
  }
]

// Función principal para obtener datos
export async function fetchFromGoogleScript(): Promise<any[]> {
  const { url, timeout, retries, useFallbackData, useProxy } = GOOGLE_SCRIPT_CONFIG
  
  if (useFallbackData) {
    console.log('Usando datos de ejemplo (modo de desarrollo)')
    return fallbackData
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const fetchUrl = useProxy ? '/api/proxy' : url
      
      console.log(`🔄 Intento ${attempt}/${retries}: Conectando a Google Sheets...`)
      console.log(`📍 URL: ${fetchUrl}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📡 Response Status: ${response.status} ${response.statusText}`)
      console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`📊 Datos recibidos:`, data)
      console.log(`✅ Datos obtenidos: ${data.data?.length || data.length || 0} registros`)
      
      const processedData = processData(data.data || data)
      console.log(`✅ Datos procesados: ${processedData.length} registros`)
      
      // Validar que tenemos datos válidos
      if (!processedData || processedData.length === 0) {
        throw new Error('No se recibieron datos válidos de Google Sheets')
      }
      
      console.log(`✅ Datos reales obtenidos de Google Sheets: ${processedData.length} registros`)
      return processedData
      
    } catch (error) {
      console.error(`❌ Intento ${attempt}/${retries} falló:`, error)
      
      if (attempt === retries) {
        console.log('⚠️ Usando datos de respaldo debido a errores de conexión')
        return fallbackData
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return fallbackData
}

// Procesar datos recibidos
function processData(data: any[]): any[] {
  return data.map(item => ({
    timestamp: item.timestamp || item.Timestamp,
    insurancecarrier: item.insurancecarrier || item.Carrier,
    offices: item.offices || item.Office,
    patientname: item.patientname || item.Patient,
    paidamount: parseFloat(item.paidamount || item.PaidAmount || 0),
    claimstatus: item.claimstatus || item.Status,
    typeofinteraction: item.typeofinteraction || item.Type,
    patientdob: item.patientdob || item.DOB,
    dos: item.dos || item.DOS,
    productivityamount: parseFloat(item.productivityamount || item.ProductivityAmount || 0),
    missingdocsorinformation: item.missingdocsorinformation || item.MissingDocs,
    howweproceeded: item.howweproceeded || item.HowProceeded,
    escalatedto: item.escalatedto || item.EscalatedTo,
    commentsreasons: item.commentsreasons || item.Comments,
    emailaddress: item.emailaddress || item.Email,
    status: item.status || item.Status,
    timestampbyinteraction: item.timestampbyinteraction || item.TimestampByInteraction
  }))
}

// Validar datos de pacientes
export function validatePatientData(data: any[]): boolean {
  return Array.isArray(data) && data.length > 0 && 
         data.every(item => item.patientname && item.offices)
}
