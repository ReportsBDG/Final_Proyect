import { PatientRecord, APIResponse } from '@/types'
import { fetchFromGoogleScript, validatePatientData, GOOGLE_SCRIPT_CONFIG } from '@/lib/google-script'
import { mockPatientData } from '@/utils/mockData'

// Google Apps Script configuration
const GOOGLE_APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || GOOGLE_SCRIPT_CONFIG.url
const API_TIMEOUT = 30000 // 30 seconds

// Custom error classes
export class DataServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DataServiceError'
  }
}

export class NetworkError extends DataServiceError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR')
  }
}

export class TimeoutError extends DataServiceError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR')
  }
}

export class ValidationError extends DataServiceError {
  constructor(message: string = 'Data validation failed') {
    super(message, 'VALIDATION_ERROR')
  }
}

// Data validation functions
function validatePatientRecord(record: any): PatientRecord {
  if (!record || typeof record !== 'object') {
    throw new ValidationError('Invalid record format')
  }

  const requiredFields = ['timestamp', 'patientname', 'offices', 'insurancecarrier']
  const missingFields = requiredFields.filter(field => !record[field])

  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`)
  }

  // Validate and convert data types
  const validatedRecord: PatientRecord = {
    timestamp: record.timestamp,
    insurancecarrier: String(record.insurancecarrier || ''),
    offices: String(record.offices || ''),
    patientname: String(record.patientname || ''),
    paidamount: Number(record.paidamount) || 0,
    claimstatus: String(record.claimstatus || 'Unknown'),
    typeofinteraction: record.typeofinteraction ? String(record.typeofinteraction) : undefined,
    patientdob: record.patientdob ? String(record.patientdob) : undefined,
    dos: record.dos ? String(record.dos) : undefined,
    productivityamount: record.productivityamount ? Number(record.productivityamount) : undefined,
    missingdocsorinformation: record.missingdocsorinformation ? String(record.missingdocsorinformation) : undefined,
    howweproceeded: record.howweproceeded ? String(record.howweproceeded) : undefined,
    escalatedto: record.escalatedto ? String(record.escalatedto) : undefined,
    commentsreasons: record.commentsreasons ? String(record.commentsreasons) : undefined,
    emailaddress: record.emailaddress ? String(record.emailaddress) : undefined,
    status: record.status ? String(record.status) : undefined,
    timestampbyinteraction: record.timestampbyinteraction ? String(record.timestampbyinteraction) : undefined,
  }

  // Additional validations
  if (validatedRecord.paidamount < 0) {
    throw new ValidationError('Paid amount cannot be negative')
  }

  if (validatedRecord.emailaddress && !isValidEmail(validatedRecord.emailaddress)) {
    console.warn(`Invalid email format: ${validatedRecord.emailaddress}`)
  }

  if (validatedRecord.dos && !isValidDate(validatedRecord.dos)) {
    console.warn(`Invalid date format for DOS: ${validatedRecord.dos}`)
  }

  return validatedRecord
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// HTTP client with timeout and retry logic
class HttpClient {
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number = API_TIMEOUT): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw new NetworkError(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async request<T>(
    url: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<APIResponse<T>> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          ...options,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new DataServiceError(
            `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
            `HTTP_${response.status}`
          )
        }

        const data = await response.json()
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (attempt === retries) {
          break
        }

        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return {
      success: false,
      data: null as T,
      error: lastError?.message || 'Request failed after retries',
      timestamp: new Date().toISOString(),
    }
  }
}

// Data Service Class
export class DataService {
  private httpClient: HttpClient
  private cache: Map<string, { data: PatientRecord[]; timestamp: number }>
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.httpClient = new HttpClient()
    this.cache = new Map()
  }

  /**
   * Fetch all patient records from Google Apps Script
   */
  async fetchPatientRecords(useCache: boolean = true): Promise<PatientRecord[]> {
    const cacheKey = 'all_records'
    
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data
      }
    }

    try {
      // Use the new Google Script integration
      const rawData = await fetchFromGoogleScript()

      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        console.warn('No data received from Google Sheets, using mock data')
        return mockPatientData
      }

      if (!validatePatientData(rawData)) {
        console.warn('Invalid data received from Google Sheets, using mock data')
        const { mockPatientData } = await import('@/utils/mockData')
        return mockPatientData
      }

      // Validate and transform the data
      const validatedRecords = rawData.map((record, index) => {
        try {
          return validatePatientRecord(record)
        } catch (error) {
          console.error(`Validation error for record ${index}:`, error)
          return null
        }
      }).filter((record): record is PatientRecord => record !== null)

      // Cache the results
      this.cache.set(cacheKey, {
        data: validatedRecords,
        timestamp: Date.now()
      })

      return validatedRecords
    } catch (error) {
      console.error('Error fetching patient records:', error)
      
      // Fall back to mock data in case of error
      console.warn('Falling back to mock data due to error')
      const { mockPatientData } = await import('@/utils/mockData')
      return mockPatientData
    }
  }

  /**
   * Fetch records with filters applied on the server side
   */
  async fetchFilteredRecords(filters: {
    startDate?: string
    endDate?: string
    office?: string
    insuranceCarrier?: string
    claimStatus?: string
  }): Promise<PatientRecord[]> {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.warn('Google Apps Script URL not configured, using mock data')
      const { mockPatientData } = await import('@/utils/mockData')
      return mockPatientData
    }

    const searchParams = new URLSearchParams({
      action: 'getFilteredRecords',
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    })

    try {
      const response = await this.httpClient.request<any[]>(
        `${GOOGLE_APPS_SCRIPT_URL}?${searchParams.toString()}`
      )

      if (!response.success) {
        throw new DataServiceError(response.error || 'Failed to fetch filtered data')
      }

      return response.data.map(validatePatientRecord)
    } catch (error) {
      console.error('Error fetching filtered records:', error)
      throw error
    }
  }

  /**
   * Submit a new patient record
   */
  async submitRecord(record: Omit<PatientRecord, 'timestamp'>): Promise<void> {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      throw new DataServiceError('Google Apps Script URL not configured')
    }

    try {
      const response = await this.httpClient.request(
        GOOGLE_APPS_SCRIPT_URL,
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'submitRecord',
            data: record
          })
        }
      )

      if (!response.success) {
        throw new DataServiceError(response.error || 'Failed to submit record')
      }

      // Clear cache after successful submission
      this.clearCache()
    } catch (error) {
      console.error('Error submitting record:', error)
      throw error
    }
  }

  /**
   * Update an existing record
   */
  async updateRecord(timestamp: string, updates: Partial<PatientRecord>): Promise<void> {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      throw new DataServiceError('Google Apps Script URL not configured')
    }

    try {
      const response = await this.httpClient.request(
        GOOGLE_APPS_SCRIPT_URL,
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateRecord',
            timestamp,
            data: updates
          })
        }
      )

      if (!response.success) {
        throw new DataServiceError(response.error || 'Failed to update record')
      }

      // Clear cache after successful update
      this.clearCache()
    } catch (error) {
      console.error('Error updating record:', error)
      throw error
    }
  }

  /**
   * Get data quality metrics
   */
  async getDataQuality(): Promise<{
    totalRecords: number
    completenessScore: number
    duplicateCount: number
    lastUpdated: string
  }> {
    try {
      const records = await this.fetchPatientRecords()
      
      // Calculate completeness score
      const requiredFields = ['patientname', 'offices', 'insurancecarrier', 'claimstatus']
      let completenessSum = 0
      
      records.forEach(record => {
        const filledFields = requiredFields.filter(field => record[field as keyof PatientRecord])
        completenessSum += filledFields.length / requiredFields.length
      })

      const completenessScore = records.length > 0 ? (completenessSum / records.length) * 100 : 0

      // Simple duplicate detection (by patient name and DOS)
      const recordKeys = new Set<string>()
      let duplicateCount = 0
      
      records.forEach(record => {
        const key = `${record.patientname}-${record.dos}`
        if (recordKeys.has(key)) {
          duplicateCount++
        } else {
          recordKeys.add(key)
        }
      })

      return {
        totalRecords: records.length,
        completenessScore: Math.round(completenessScore * 10) / 10,
        duplicateCount,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error calculating data quality:', error)
      return {
        totalRecords: 0,
        completenessScore: 0,
        duplicateCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  /**
   * Test connection to Google Apps Script
   */
  async testConnection(): Promise<boolean> {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      return false
    }

    try {
      const response = await this.httpClient.request(
        `${GOOGLE_APPS_SCRIPT_URL}?action=ping`,
        {},
        1 // Only 1 retry for connection test
      )
      return response.success
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  /**
   * Clear internal cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; items: string[] } {
    return {
      size: this.cache.size,
      items: Array.from(this.cache.keys())
    }
  }
}

// Create and export a singleton instance
export const dataService = new DataService()

// Export utility functions for direct use
export {
  validatePatientRecord,
  isValidEmail,
  isValidDate
}
