import { PatientRecord, DashboardMetrics, FilterState } from '@/types'

export function calculateMetrics(data: PatientRecord[]): DashboardMetrics {
  if (!data || data.length === 0) {
    return {
      totalRevenue: 0,
      claimsProcessed: 0,
      averageClaim: 0,
      activeOffices: 0,
      todaysClaims: 0,
      weeklyClaims: 0,
      monthlyClaims: 0,
    }
  }

  const totalRevenue = data.reduce((sum, record) => sum + (record.paidamount || 0), 0)
  const claimsProcessed = data.length
  const averageClaim = totalRevenue / claimsProcessed || 0
  
  // Get unique offices
  const activeOffices = new Set(data.map(record => record.offices)).size
  
  // Date calculations
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  // Claims by time period
  const todaysClaims = data.filter(record => 
    record.dos && record.dos === todayStr
  ).length
  
  const weeklyClaims = data.filter(record => {
    if (!record.dos) return false
    const recordDate = new Date(record.dos)
    return recordDate >= oneWeekAgo && recordDate <= today
  }).length
  
  const monthlyClaims = data.filter(record => {
    if (!record.dos) return false
    const recordDate = new Date(record.dos)
    return recordDate >= oneMonthAgo && recordDate <= today
  }).length

  return {
    totalRevenue,
    claimsProcessed,
    averageClaim,
    activeOffices,
    todaysClaims,
    weeklyClaims,
    monthlyClaims,
  }
}

export function filterData(data: PatientRecord[], filters: FilterState): PatientRecord[] {
  if (!data || data.length === 0) return []

  return data.filter(record => {
    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const recordDate = record.dos || record.timestamp.split('T')[0]
      if (recordDate < filters.dateRange.start || recordDate > filters.dateRange.end) {
        return false
      }
    }

    // Office filter
    if (filters.offices.length > 0 && !filters.offices.includes(record.offices)) {
      return false
    }

    // Insurance carrier filter
    if (filters.insuranceCarriers.length > 0 && !filters.insuranceCarriers.includes(record.insurancecarrier)) {
      return false
    }

    // Claim status filter
    if (filters.claimStatus.length > 0 && !filters.claimStatus.includes(record.claimstatus)) {
      return false
    }

    // Interaction type filter
    if (filters.interactionTypes.length > 0 && record.typeofinteraction) {
      if (!filters.interactionTypes.includes(record.typeofinteraction)) {
        return false
      }
    }

    // Search query filter (searches in patient name, email, and comments)
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      const searchableFields = [
        record.patientname,
        record.emailaddress,
        record.commentsreasons,
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableFields.includes(searchLower)) {
        return false
      }
    }

    // How proceeded filter
    if (filters.howProceeded.length > 0 && record.howweproceeded) {
      if (!filters.howProceeded.includes(record.howweproceeded)) {
        return false
      }
    }

    // Escalated to filter
    if (filters.escalatedTo.length > 0 && record.escalatedto) {
      if (!filters.escalatedTo.includes(record.escalatedto)) {
        return false
      }
    }

    // Missing docs filter
    if (filters.missingDocs.length > 0 && record.missingdocsorinformation) {
      if (!filters.missingDocs.includes(record.missingdocsorinformation)) {
        return false
      }
    }

    return true
  })
}

export function generateAnalyticsData(data: PatientRecord[]) {
  if (!data || data.length === 0) return null

  // Revenue by office
  const revenueByOffice = Object.entries(
    data.reduce((acc, record) => {
      acc[record.offices] = (acc[record.offices] || 0) + (record.paidamount || 0)
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Claims by status
  const claimsByStatus = Object.entries(
    data.reduce((acc, record) => {
      acc[record.claimstatus] = (acc[record.claimstatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Revenue by insurance carrier
  const revenueByInsurer = Object.entries(
    data.reduce((acc, record) => {
      acc[record.insurancecarrier] = (acc[record.insurancecarrier] || 0) + (record.paidamount || 0)
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Interaction types
  const interactionTypes = Object.entries(
    data.reduce((acc, record) => {
      if (record.typeofinteraction) {
        acc[record.typeofinteraction] = (acc[record.typeofinteraction] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Average payment by status
  const avgPaymentByStatus = Object.entries(
    data.reduce((acc, record) => {
      if (!acc[record.claimstatus]) {
        acc[record.claimstatus] = { total: 0, count: 0 }
      }
      acc[record.claimstatus].total += record.paidamount || 0
      acc[record.claimstatus].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([name, { total, count }]) => ({ name, value: total / count }))

  // Monthly trends (last 6 months)
  const monthlyTrends = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = date.toISOString().slice(0, 7) // YYYY-MM format
    
    const monthData = data.filter(record => {
      const recordMonth = (record.dos || record.timestamp).slice(0, 7)
      return recordMonth === monthStr
    })
    
    monthlyTrends.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: monthData.reduce((sum, r) => sum + (r.paidamount || 0), 0),
      claims: monthData.length,
    })
  }

  return {
    revenueByOffice,
    claimsByStatus,
    revenueByInsurer,
    interactionTypes,
    avgPaymentByStatus,
    monthlyTrends,
  }
}

export function exportToCSV(data: PatientRecord[], filename: string = 'dental-data.csv') {
  if (!data || data.length === 0) return

  const headers = [
    'Timestamp',
    'Patient Name',
    'Office',
    'Insurance Carrier',
    'Paid Amount',
    'Claim Status',
    'Type of Interaction',
    'Date of Service',
    'Email Address',
    'Comments/Reasons',
    'Missing Docs',
    'How Proceeded',
    'Escalated To',
  ]

  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      record.timestamp,
      `"${record.patientname || ''}"`,
      `"${record.offices || ''}"`,
      `"${record.insurancecarrier || ''}"`,
      record.paidamount || 0,
      `"${record.claimstatus || ''}"`,
      `"${record.typeofinteraction || ''}"`,
      record.dos || '',
      `"${record.emailaddress || ''}"`,
      `"${record.commentsreasons || ''}"`,
      `"${record.missingdocsorinformation || ''}"`,
      `"${record.howweproceeded || ''}"`,
      `"${record.escalatedto || ''}"`,
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
    case 'denied':
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}

export function calculateCompletionRate(data: PatientRecord[]): number {
  if (!data || data.length === 0) return 0
  
  const completedStatuses = ['paid', 'completed']
  const completed = data.filter(record => 
    completedStatuses.includes(record.claimstatus.toLowerCase())
  ).length
  
  return (completed / data.length) * 100
}

export function getTopPerformingOffices(data: PatientRecord[], limit: number = 5) {
  const officeMetrics = Object.entries(
    data.reduce((acc, record) => {
      if (!acc[record.offices]) {
        acc[record.offices] = { revenue: 0, claims: 0 }
      }
      acc[record.offices].revenue += record.paidamount || 0
      acc[record.offices].claims += 1
      return acc
    }, {} as Record<string, { revenue: number; claims: number }>)
  ).map(([office, metrics]) => ({
    office,
    ...metrics,
    averageClaim: metrics.revenue / metrics.claims,
  }))

  return officeMetrics
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}
