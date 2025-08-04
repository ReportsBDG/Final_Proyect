'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  DollarSign,
  FileText,
  Calendar,
  Building,
  TrendingUp,
  Filter,
  Search,
  Download,
  Moon,
  Sun,
  RefreshCw,
  Bell,
  Settings,
  Users,
  Eye,
  MoreHorizontal,
  CheckSquare,
  Square,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Columns,
  ChevronDown,
  ChevronUp,
  Menu
} from 'lucide-react'
import SimpleCharts from '@/components/SimpleCharts'
import { dataService } from '@/services/dataService'
import { PatientRecord } from '@/types'
import { exportService } from '@/services/exportService'

// Enhanced notification system
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}

// Utility functions for timestamp handling
const isToday = (dateString: string): boolean => {
  if (!dateString) return false
  try {
    const date = new Date(dateString)
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  } catch {
    return false
  }
}

const isCurrentMonth = (dateString: string): boolean => {
  if (!dateString) return false
  try {
    const date = new Date(dateString)
    const now = new Date()
    return date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear()
  } catch {
    return false
  }
}

// Load persistent state from localStorage
const loadPersistedState = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

// Save state to localStorage
const savePersistedState = (key: string, value: any) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export default function DentalDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOffices, setSelectedOffices] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedClaimStatuses, setSelectedClaimStatuses] = useState<string[]>([])
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [selectedInteractionTypes, setSelectedInteractionTypes] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [isClient, setIsClient] = useState(false)
  const [data, setData] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false)
  const [recentChanges, setRecentChanges] = useState<Array<{
    id: string
    type: 'new_record' | 'updated_record' | 'deleted_record' | 'data_sync'
    message: string
    timestamp: Date
    details?: string
  }>>([])

  // New states for enhanced functionality
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(() => 
    loadPersistedState('dentalDashboard.filtersCollapsed', false)
  )
  const [showColumnFilter, setShowColumnFilter] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState(() =>
    loadPersistedState('dentalDashboard.selectedColumns', {
      patientName: true,
      carrier: true,
      offices: true,
      dos: true,
      claimStatus: true,
      comments: true,
      email: true,
      patientPortion: true,
      eftCheckDate: true,
      status: true
    })
  )
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)
  const [sortBy, setSortBy] = useState<keyof PatientRecord | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Persist states to localStorage
  useEffect(() => {
    savePersistedState('dentalDashboard.filtersCollapsed', isFiltersCollapsed)
  }, [isFiltersCollapsed])

  useEffect(() => {
    savePersistedState('dentalDashboard.selectedColumns', selectedColumns)
  }, [selectedColumns])

  // Add notification function with unique ID generation
  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date()
    }
    setNotifications(prev => [notification, ...prev].slice(0, 5))

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Load data from Google Sheets with better error handling
  useEffect(() => {
    loadData()
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadData(true) // Silent reload
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Enhanced reload function with detailed change tracking
  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError(null)
      }

      const patientData = await dataService.fetchPatientRecords()

      // Detailed change detection
      if (data.length > 0) {
        const oldRecords = new Map(data.map(record => [record.patientname + record.timestamp, record]))
        const newRecords = new Map(patientData.map(record => [record.patientname + record.timestamp, record]))

        // Detect new records
        const addedRecords = patientData.filter(record =>
          !oldRecords.has(record.patientname + record.timestamp)
        )

        // Detect removed records
        const removedRecords = data.filter(record =>
          !newRecords.has(record.patientname + record.timestamp)
        )

        // Detect modified records
        const modifiedRecords = patientData.filter(record => {
          const key = record.patientname + record.timestamp
          const oldRecord = oldRecords.get(key)
          return oldRecord && JSON.stringify(oldRecord) !== JSON.stringify(record)
        })

        // Add detailed notifications
        if (addedRecords.length > 0) {
          addNotification('info', `${addedRecords.length} new record(s) added`)
          addRecentChange('new_record', `${addedRecords.length} new patient records added`,
            `Latest: ${addedRecords[0]?.patientname || 'Unknown'}`)
        }

        if (removedRecords.length > 0) {
          addNotification('warning', `${removedRecords.length} record(s) removed`)
          addRecentChange('deleted_record', `${removedRecords.length} records removed from database`)
        }

        if (modifiedRecords.length > 0) {
          addNotification('info', `${modifiedRecords.length} record(s) updated`)
          addRecentChange('updated_record', `${modifiedRecords.length} patient records updated`,
            `Latest: ${modifiedRecords[0]?.patientname || 'Unknown'}`)
        }

        if (addedRecords.length === 0 && removedRecords.length === 0 && modifiedRecords.length === 0 && silent) {
          // No changes detected in silent refresh
        }
      }

      setData(patientData)

      if (!silent) {
        addNotification('success', 'Data refreshed successfully')
        addRecentChange('data_sync', 'Database synchronized successfully',
          `${patientData.length} total records`)
      }
    } catch (err) {
      const errorMessage = 'Error loading data from Google Sheets'
      setError(errorMessage)
      addNotification('error', errorMessage)
      console.error('Error loading data:', err)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  // Add recent change tracking
  const addRecentChange = (type: 'new_record' | 'updated_record' | 'deleted_record' | 'data_sync', message: string, details?: string) => {
    const change = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      details
    }
    setRecentChanges(prev => [change, ...prev].slice(0, 10)) // Keep last 10 changes
  }

  // Ensure consistent rendering between server and client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Enhanced metrics calculation with proper timestamp filtering
  const totalRevenue = data.reduce((sum, item) => sum + item.paidamount, 0)
  
  // Modified Claims Processed - only count 'complete' status from column AF (status field)
  const claimsProcessed = data.filter(item => 
    item.status?.toLowerCase() === 'complete' || 
    item.status?.toLowerCase() === 'completed'
  ).length
  
  // Calculate monthly claims using timestamp from column AG (timestamp field)
  const monthlyClaims = data.filter(item => {
    // Use timestamp field (column AG) for filtering
    return isCurrentMonth(item.timestamp)
  }).length
  
  // Calculate today's claims using timestamp from column AG (timestamp field)
  const todaysClaims = data.filter(item => {
    // Use timestamp field (column AG) for filtering
    return isToday(item.timestamp)
  }).length
  
  const activeOffices = new Set(data.map(item => item.offices).filter(Boolean)).size

  // Enhanced global search that filters across all relevant fields
  const filteredData = data.filter(item => {
    // Enhanced search filter - searches across multiple fields
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || (
      item.patientname?.toLowerCase().includes(searchLower) ||
      item.emailaddress?.toLowerCase().includes(searchLower) ||
      item.insurancecarrier?.toLowerCase().includes(searchLower) ||
      item.offices?.toLowerCase().includes(searchLower) ||
      item.claimstatus?.toLowerCase().includes(searchLower) ||
      item.commentsreasons?.toLowerCase().includes(searchLower) ||
      item.dos?.toLowerCase().includes(searchLower)
    )
    
    // Multi-select filters
    const matchesOffice = selectedOffices.length === 0 || selectedOffices.includes(item.offices || '')
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status || '')
    const matchesClaimStatus = selectedClaimStatuses.length === 0 || selectedClaimStatuses.includes(item.claimstatus || '')
    const matchesCarrier = selectedCarriers.length === 0 || selectedCarriers.includes(item.insurancecarrier || '')

    // Type of Interaction filter (Column B) - Multi-select
    const matchesInteractionType = selectedInteractionTypes.length === 0 || selectedInteractionTypes.includes(item.typeofinteraction || '')

    // Date range filter using DOS (column G)
    const matchesDateRange = !dateRange.start || !dateRange.end || 
      (item.dos && item.dos >= dateRange.start && item.dos <= dateRange.end)
    
    return matchesSearch && matchesOffice && matchesStatus &&
           matchesClaimStatus && matchesCarrier && matchesInteractionType && matchesDateRange
  })

  // Sorting functionality
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0
    
    const aValue = a[sortBy] || ''
    const bValue = b[sortBy] || ''
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  // Get unique values for filters
  const uniqueOffices = Array.from(new Set(data.map(item => item.offices).filter(Boolean)))
  const uniqueStatuses = Array.from(new Set(data.map(item => item.status).filter(Boolean)))
  const uniqueClaimStatuses = Array.from(new Set(data.map(item => item.claimstatus).filter(Boolean)))
  const uniqueCarriers = Array.from(new Set(data.map(item => item.insurancecarrier).filter(Boolean)))
  const uniqueInteractionTypes = Array.from(new Set(data.map(item => item.typeofinteraction).filter(Boolean)))

  // Complete Dashboard PDF Export functionality - TODOS LOS REGISTROS
  const handleCompleteDashboardPDFExport = async () => {
    try {
      addNotification('info', `Preparing complete dashboard PDF export with ${filteredData.length} records...`)

      // Capture all visual elements
      const chartElements = document.querySelectorAll('.recharts-wrapper')
      const kpiCards = document.querySelector('#kpi-cards-section')

      // Prepare comprehensive data
      const dashboardMetrics = {
        totalRevenue,
        claimsProcessed,
        activeOffices,
        todaysClaims,
        monthlyClaims
      }

      await exportService.exportCompleteDashboardToPDF({
        data: filteredData, // TODOS los datos filtrados, no solo los paginados
        allData: data,
        metrics: dashboardMetrics,
        chartElements: Array.from(chartElements) as HTMLElement[],
        kpiCardsElement: kpiCards as HTMLElement,
        filters: {
          search: searchTerm,
          offices: selectedOffices,
          statuses: selectedStatuses,
          claimStatuses: selectedClaimStatuses,
          carriers: selectedCarriers,
          interactionTypes: selectedInteractionTypes,
          dateRange
        },
        selectedColumns,
        title: 'Complete Dental Analytics Dashboard Report'
      })

      addNotification('success', `Complete dashboard PDF exported with ${filteredData.length} patient records`)
      addRecentChange('data_sync', 'Complete dashboard exported to PDF',
        `${filteredData.length} records included`)
    } catch (error) {
      addNotification('error', 'Failed to export complete dashboard PDF')
      console.error('Complete dashboard PDF export error:', error)
    }
  }

  // Simple PDF Export functionality for Patient Records table - TODOS LOS REGISTROS
  const handlePatientRecordsPDFExport = async () => {
    try {
      addNotification('info', `Preparing patient records PDF export with ${filteredData.length} records...`)
      await exportService.exportToPDF(filteredData, { // TODOS los datos filtrados
        title: `Patient Records Report (${filteredData.length} records)`,
        includeCharts: false,
        filters: {
          search: searchTerm,
          offices: selectedOffices,
          statuses: selectedStatuses,
          claimStatuses: selectedClaimStatuses,
          carriers: selectedCarriers,
          interactionTypes: selectedInteractionTypes,
          dateRange
        }
      })
      addNotification('success', `Patient records PDF exported with ${filteredData.length} records`)
      addRecentChange('data_sync', 'Patient records exported to PDF',
        `${filteredData.length} records included`)
    } catch (error) {
      addNotification('error', 'Failed to export patient records PDF')
      console.error('Patient records PDF export error:', error)
    }
  }

  // Excel Export functionality - TODOS LOS REGISTROS
  const handleExcelExport = async () => {
    try {
      addNotification('info', `Preparing Excel export with ${filteredData.length} records...`)

      const dashboardMetrics = {
        totalRevenue,
        claimsProcessed,
        activeOffices,
        todaysClaims,
        monthlyClaims,
        averageClaim: filteredData.length > 0 ? totalRevenue / filteredData.length : 0,
        weeklyClaims: 0 // You can implement this if needed
      }

      await exportService.exportToExcel(filteredData, { // TODOS los datos filtrados
        format: 'excel',
        includeCharts: false,
        dateRange,
        selectedColumns: Object.keys(selectedColumns).filter(key => selectedColumns[key as keyof typeof selectedColumns])
      }, dashboardMetrics)

      addNotification('success', `Excel file exported with ${filteredData.length} records`)
      addRecentChange('data_sync', 'Data exported to Excel',
        `${filteredData.length} records included`)
    } catch (error) {
      addNotification('error', 'Failed to export Excel file')
      console.error('Excel export error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'denied': return 'bg-red-100 text-red-800 border-red-200'
      case 'complete': 
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!isClient || !dateString) return dateString
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Multi-select filter component
  const MultiSelectFilter = ({
    label,
    options,
    selectedValues,
    onToggle,
    placeholder = "Select options..."
  }: {
    label: string
    options: string[]
    selectedValues: string[]
    onToggle: (value: string) => void
    placeholder?: string
  }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white flex items-center justify-between"
        >
          <span className="truncate">
            {selectedValues.length === 0
              ? placeholder
              : selectedValues.length === 1
                ? selectedValues[0]
                : `${selectedValues.length} selected`
            }
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Select All / Clear All */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    options.forEach(option => {
                      if (!selectedValues.includes(option)) {
                        onToggle(option)
                      }
                    })
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    selectedValues.forEach(selected => onToggle(selected))
                  }}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Options */}
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => onToggle(option)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900 dark:text-white truncate">{option}</span>
              </label>
            ))}

            {options.length === 0 && (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options available
              </div>
            )}
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
      </div>
    )
  }

  // Handle sorting
  const handleSort = (column: keyof PatientRecord) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Toggle column visibility
  const toggleColumn = (column: keyof typeof selectedColumns) => {
    setSelectedColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  // Toggle filters sidebar
  const toggleFilters = () => {
    setIsFiltersCollapsed(!isFiltersCollapsed)
  }

  // Multi-select helper functions
  const toggleFilterSelection = (value: string, currentSelection: string[], setSelection: (selection: string[]) => void) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter(item => item !== value))
    } else {
      setSelection([...currentSelection, value])
    }
  }

  const clearAllFilters = () => {
    setSelectedOffices([])
    setSelectedStatuses([])
    setSelectedClaimStatuses([])
    setSelectedCarriers([])
    setSelectedInteractionTypes([])
    setDateRange({ start: '', end: '' })
    setSearchTerm('')
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dental Analytics Dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => loadData()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`} suppressHydrationWarning>
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleFilters}
                className={`p-2 rounded-lg transition-all duration-200 border ${
                  isFiltersCollapsed
                    ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
                title={isFiltersCollapsed ? 'Mostrar Filtros' : 'Ocultar Filtros'}
              >
                <Menu className={`w-5 h-5 transition-colors duration-200 ${
                  isFiltersCollapsed
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
              </button>

              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Dental Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Professional Dental Analytics Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Recent Database Changes"
                >
                  <Bell className="w-5 h-5" />
                  {(notifications.length > 0 || recentChanges.length > 0) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{Math.min(notifications.length + recentChanges.length, 9)}</span>
                    </span>
                  )}
                </button>

                {/* Enhanced Notifications Panel */}
                {showNotificationsPanel && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Recent Changes</h4>
                        <button
                          onClick={() => setShowNotificationsPanel(false)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {/* Recent Changes Section */}
                      {recentChanges.length > 0 && (
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Database Changes</h5>
                          {recentChanges.map((change) => (
                            <div key={change.id} className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  change.type === 'new_record' ? 'bg-green-500' :
                                  change.type === 'updated_record' ? 'bg-blue-500' :
                                  change.type === 'deleted_record' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900 dark:text-white font-medium">{change.message}</p>
                                  {change.details && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{change.details}</p>
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {change.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Current Notifications */}
                      {notifications.length > 0 && (
                        <div className="p-3">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">System Notifications</h5>
                          {notifications.map((notification) => (
                            <div key={notification.id} className={`mb-2 p-2 rounded-lg ${
                              notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                              notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                              notification.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                              'bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                              <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty State */}
                      {notifications.length === 0 && recentChanges.length === 0 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent changes or notifications</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => {
                          setNotifications([])
                          setRecentChanges([])
                          setShowNotificationsPanel(false)
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Clear all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => loadData()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Refresh Data"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleCompleteDashboardPDFExport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                title="Export Complete Dashboard Report"
              >
                <Download className="w-4 h-4" />
                <span>Export Dashboard</span>
              </button>
            </div>
          </div>

          {/* Main KPI Cards - Updated with new layout */}
          <div id="kpi-cards-section" className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Revenue */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12.5% from last month</span>
              </div>
            </div>

            {/* Claims Processed - Modified to count only 'complete' status */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Claims Processed</p>
                  <p className="text-2xl font-bold">{claimsProcessed}</p>
                </div>
                <FileText className="w-8 h-8 text-green-200" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Complete status only</span>
              </div>
            </div>

            {/* Active Offices */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Offices</p>
                  <p className="text-2xl font-bold">{activeOffices}</p>
                </div>
                <Building className="w-8 h-8 text-orange-200" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-orange-100">All systems operational</span>
              </div>
            </div>

            {/* Today's Claims - Fixed timestamp logic */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Today's Claims</p>
                  <p className="text-2xl font-bold">{todaysClaims}</p>
                </div>
                <Calendar className="w-8 h-8 text-pink-200" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>From column AG timestamps</span>
              </div>
            </div>

            {/* Monthly Claims - Fixed timestamp logic */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Monthly Claims</p>
                  <p className="text-2xl font-bold">{monthlyClaims}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Current month (Col AG)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Collapsible Sidebar Filters */}
        <div
          className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto transition-all duration-300 ease-in-out relative ${
            isFiltersCollapsed ? 'w-0 opacity-0' : 'w-80'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <div className={`flex items-center space-x-2 transition-opacity duration-300 ${isFiltersCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h2>
              </div>
              {isFiltersCollapsed && (
                <div className="opacity-60">
                  <Filter className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Filters Content */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isFiltersCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'
            }`}
          >
            <div className="p-4 space-y-4">
              {/* Enhanced Global Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Global Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients, emails, carriers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {searchTerm && (
                  <p className="text-xs text-gray-500 mt-1">
                    Found {filteredData.length} results
                  </p>
                )}
              </div>

              {/* Date Range Filter - Updated for DOS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  DOS Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Multi-Select Filters */}
            <MultiSelectFilter
              label="Office"
              options={uniqueOffices}
              selectedValues={selectedOffices}
              onToggle={(value) => toggleFilterSelection(value, selectedOffices, setSelectedOffices)}
              placeholder="All Offices"
            />

            <MultiSelectFilter
              label="Insurance Carrier"
              options={uniqueCarriers}
              selectedValues={selectedCarriers}
              onToggle={(value) => toggleFilterSelection(value, selectedCarriers, setSelectedCarriers)}
              placeholder="All Carriers"
            />

            <MultiSelectFilter
              label="Claim Status"
              options={uniqueClaimStatuses}
              selectedValues={selectedClaimStatuses}
              onToggle={(value) => toggleFilterSelection(value, selectedClaimStatuses, setSelectedClaimStatuses)}
              placeholder="All Claim Statuses"
            />

            <MultiSelectFilter
              label="Processing Status"
              options={uniqueStatuses}
              selectedValues={selectedStatuses}
              onToggle={(value) => toggleFilterSelection(value, selectedStatuses, setSelectedStatuses)}
              placeholder="All Statuses"
            />

            <MultiSelectFilter
              label="Type of Interaction"
              options={uniqueInteractionTypes}
              selectedValues={selectedInteractionTypes}
              onToggle={(value) => toggleFilterSelection(value, selectedInteractionTypes, setSelectedInteractionTypes)}
              placeholder="All Interaction Types"
            />

              {/* Active Filters Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Active Filters</h3>
                {(selectedOffices.length > 0 || selectedCarriers.length > 0 || selectedClaimStatuses.length > 0 ||
                  selectedStatuses.length > 0 || selectedInteractionTypes.length > 0 || searchTerm ||
                  dateRange.start || dateRange.end) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {selectedOffices.length > 0 && (
                  <div className="text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Offices:</span>
                    <span className="font-medium text-blue-600 ml-1">{selectedOffices.length} selected</span>
                  </div>
                )}
                {selectedCarriers.length > 0 && (
                  <div className="text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Carriers:</span>
                    <span className="font-medium text-blue-600 ml-1">{selectedCarriers.length} selected</span>
                  </div>
                )}
                {selectedClaimStatuses.length > 0 && (
                  <div className="text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Claim Status:</span>
                    <span className="font-medium text-blue-600 ml-1">{selectedClaimStatuses.length} selected</span>
                  </div>
                )}
                {selectedStatuses.length > 0 && (
                  <div className="text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Processing:</span>
                    <span className="font-medium text-blue-600 ml-1">{selectedStatuses.length} selected</span>
                  </div>
                )}
                {selectedInteractionTypes.length > 0 && (
                  <div className="text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Interaction:</span>
                    <span className="font-medium text-blue-600 ml-1">{selectedInteractionTypes.length} selected</span>
                  </div>
                )}
                {searchTerm && (
                  <div className="text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Search:</span>
                    <span className="font-medium text-blue-600 ml-1">"{searchTerm}"</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Total Records</span>
                    <span className="font-medium text-blue-600">{data.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Filtered Records</span>
                    <span className="font-medium text-green-600">{filteredData.length}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 space-y-6 transition-all duration-300 ease-in-out ${
          isFiltersCollapsed ? 'p-6 ml-0' : 'p-6'
        }`}>
          {/* Interactive Charts Section */}
          <div id="charts-section">
            <SimpleCharts data={filteredData} />
          </div>

          {/* Enhanced Patient Records Table */}
          <div id="patient-records-section" className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Patient Records</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} records
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Column Filters Button */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowColumnFilter(!showColumnFilter)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 text-sm"
                    >
                      <Columns className="w-4 h-4" />
                      <span>Columns</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showColumnFilter ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Column Filter Dropdown */}
                    {showColumnFilter && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Table Columns</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {Object.entries(selectedColumns).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-2 text-sm cursor-pointer">
                              <button
                                onClick={() => toggleColumn(key as keyof typeof selectedColumns)}
                                className="flex items-center"
                              >
                                {value ? 
                                  <CheckSquare className="w-4 h-4 text-blue-600" /> : 
                                  <Square className="w-4 h-4 text-gray-400" />
                                }
                              </button>
                              <span className="text-gray-700 dark:text-gray-300 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => setShowColumnFilter(false)}
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                          >
                            Apply Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handlePatientRecordsPDFExport}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 text-sm"
                    title="Export Patient Records Only"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={handleExcelExport}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 text-sm"
                    title={`Export All ${filteredData.length} Records to Excel`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {selectedColumns.patientName && (
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                          onClick={() => handleSort('patientname')}
                        >
                          Patient Name
                          {sortBy === 'patientname' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      )}
                      {selectedColumns.carrier && (
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                          onClick={() => handleSort('insurancecarrier')}
                        >
                          Carrier
                          {sortBy === 'insurancecarrier' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      )}
                      {selectedColumns.offices && (
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                          onClick={() => handleSort('offices')}
                        >
                          Office
                          {sortBy === 'offices' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      )}
                      {selectedColumns.dos && (
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                          onClick={() => handleSort('dos')}
                        >
                          DOS
                          {sortBy === 'dos' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      )}
                      {selectedColumns.claimStatus && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Claim Status
                        </th>
                      )}
                      {selectedColumns.comments && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Comments
                        </th>
                      )}
                      {selectedColumns.email && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                      )}
                      {selectedColumns.patientPortion && (
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                          onClick={() => handleSort('paidamount')}
                        >
                          Patient Portion
                          {sortBy === 'paidamount' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      )}
                      {selectedColumns.eftCheckDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          EFT/Check Date
                        </th>
                      )}
                      {selectedColumns.status && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      {/* Actions column removed completely */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map((record, index) => (
                      <tr key={`${record.timestamp || 'no-timestamp'}-${record.patientname || 'no-name'}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                        {selectedColumns.patientName && (
                          <td className="px-4 py-3 whitespace-nowrap transition-all duration-200">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.patientname}
                            </div>
                          </td>
                        )}
                        {selectedColumns.carrier && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white transition-all duration-200">
                            {record.insurancecarrier}
                          </td>
                        )}
                        {selectedColumns.offices && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white transition-all duration-200">
                            {record.offices}
                          </td>
                        )}
                        {selectedColumns.dos && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white transition-all duration-200">
                            {record.dos ? formatDate(record.dos) : 'N/A'}
                          </td>
                        )}
                        {selectedColumns.claimStatus && (
                          <td className="px-4 py-3 whitespace-nowrap transition-all duration-200">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.claimstatus)}`}>
                              {record.claimstatus}
                            </span>
                          </td>
                        )}
                        {selectedColumns.comments && (
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs transition-all duration-200">
                            <div className="truncate" title={record.commentsreasons}>
                              {record.commentsreasons || 'N/A'}
                            </div>
                          </td>
                        )}
                        {selectedColumns.email && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white transition-all duration-200">
                            {record.emailaddress || 'N/A'}
                          </td>
                        )}
                        {selectedColumns.patientPortion && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white transition-all duration-200">
                            {formatCurrency(record.paidamount)}
                          </td>
                        )}
                        {selectedColumns.eftCheckDate && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white transition-all duration-200">
                            {record.eftCheckIssuedDate ? formatDate(record.eftCheckIssuedDate) : 'N/A'}
                          </td>
                        )}
                        {selectedColumns.status && (
                          <td className="px-4 py-3 whitespace-nowrap transition-all duration-200">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                              {record.status || 'N/A'}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No records found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showColumnFilter && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowColumnFilter(false)}
        ></div>
      )}

      {showNotificationsPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotificationsPanel(false)}
        ></div>
      )}
    </div>
  )
}
