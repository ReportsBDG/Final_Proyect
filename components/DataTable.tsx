'use client'

import { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  Mail,
  DollarSign,
  FileText
} from 'lucide-react'
import { PatientRecord, TableState, ExportOptions } from '@/types'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/dataHelpers'

interface DataTableProps {
  data: PatientRecord[]
  state: TableState
  onStateChange: (state: Partial<TableState>) => void
  onExport: (options: ExportOptions) => void
  isLoading: boolean
}

interface TableColumn {
  key: keyof PatientRecord
  label: string
  sortable: boolean
  filterable: boolean
  width?: string
  formatter?: 'currency' | 'date' | 'status' | 'text' | 'email'
}

const columns: TableColumn[] = [
  { key: 'patientname', label: 'Patient Name', sortable: true, filterable: true, width: 'w-48' },
  { key: 'offices', label: 'Office', sortable: true, filterable: true, width: 'w-40' },
  { key: 'insurancecarrier', label: 'Insurance', sortable: true, filterable: true, width: 'w-36' },
  { key: 'paidamount', label: 'Amount', sortable: true, filterable: false, formatter: 'currency', width: 'w-28' },
  { key: 'claimstatus', label: 'Status', sortable: true, filterable: true, formatter: 'status', width: 'w-28' },
  { key: 'typeofinteraction', label: 'Type', sortable: true, filterable: true, width: 'w-36' },
  { key: 'dos', label: 'Service Date', sortable: true, filterable: false, formatter: 'date', width: 'w-32' },
  { key: 'timestampbyinteraction', label: 'Interaction Date', sortable: true, filterable: false, formatter: 'date', width: 'w-36' },
  { key: 'emailaddress', label: 'Email', sortable: true, filterable: true, formatter: 'email', width: 'w-48' },
  { key: 'commentsreasons', label: 'Comments', sortable: false, filterable: true, width: 'w-64' },
  { key: 'missingdocsorinformation', label: 'Missing Docs', sortable: false, filterable: true, width: 'w-40' },
  { key: 'howweproceeded', label: 'How Proceeded', sortable: false, filterable: true, width: 'w-40' },
  { key: 'escalatedto', label: 'Escalated To', sortable: false, filterable: true, width: 'w-36' },
]

export default function DataTable({ data, state, onStateChange, onExport, isLoading }: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => col.key))

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data]

    // Apply table search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          value?.toString().toLowerCase().includes(query)
        )
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const cellValue = row[key as keyof PatientRecord]
          return cellValue?.toString().toLowerCase().includes(value.toLowerCase())
        })
      }
    })

    // Apply sorting
    if (state.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[state.sortBy!] || ''
        const bVal = b[state.sortBy!] || ''
        
        // Handle numeric values
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        // Handle string values
        const aStr = aVal.toString().toLowerCase()
        const bStr = bVal.toString().toLowerCase()
        
        if (state.sortDirection === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
    }

    return filtered
  }, [data, state.searchQuery, state.sortBy, state.sortDirection, columnFilters])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / state.itemsPerPage)
  const startIndex = (state.currentPage - 1) * state.itemsPerPage
  const endIndex = startIndex + state.itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex)

  const handleSort = (column: keyof PatientRecord) => {
    if (state.sortBy === column) {
      onStateChange({
        sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
      })
    } else {
      onStateChange({
        sortBy: column,
        sortDirection: 'asc'
      })
    }
  }

  const formatCellValue = (value: any, formatter?: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">—</span>
    }

    switch (formatter) {
      case 'currency':
        return formatCurrency(Number(value))
      case 'date':
        return formatDate(value.toString())
      case 'status':
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value.toString())}`}>
            {value}
          </span>
        )
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            {value}
          </a>
        )
      default:
        return (
          <span className="truncate max-w-xs" title={value.toString()}>
            {value.toString()}
          </span>
        )
    }
  }

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    onExport({
      format,
      includeCharts: false,
      selectedColumns: visibleColumns,
    })
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const toggleAllRows = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedData.map(row => row.timestamp))
    }
  }

  const visibleColumnsData = columns.filter(col => visibleColumns.includes(col.key))

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Patient Records</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedData.length} of {data.length} records
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={state.searchQuery}
              onChange={(e) => onStateChange({ searchQuery: e.target.value })}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white w-64"
            />
          </div>

          {/* Column Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Columns</span>
            </button>
            
            {showColumnSelector && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">Show Columns</h3>
                </div>
                <div className="p-2">
                  {columns.map((column) => (
                    <label key={column.key} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns([...visibleColumns, column.key])
                          } else {
                            setVisibleColumns(visibleColumns.filter(col => col !== column.key))
                          }
                        }}
                        className="mr-3 h-4 w-4 text-primary-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {/* Select All Checkbox */}
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleAllRows}
                    className="h-4 w-4 text-primary-600"
                  />
                </th>
                
                {visibleColumnsData.map((column) => (
                  <th
                    key={column.key}
                    className={`${column.width || 'w-auto'} px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <span>{column.label}</span>
                        {state.sortBy === column.key ? (
                          state.sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
                
                {/* Actions */}
                <th className="w-16 px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((row, index) => (
                <tr
                  key={row.timestamp}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedRows.includes(row.timestamp) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.timestamp)}
                      onChange={() => toggleRowSelection(row.timestamp)}
                      className="h-4 w-4 text-primary-600"
                    />
                  </td>
                  
                  {visibleColumnsData.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCellValue(row[column.key], column.formatter)}
                    </td>
                  ))}
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="More Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
              </span>
              
              <select
                value={state.itemsPerPage}
                onChange={(e) => onStateChange({ 
                  itemsPerPage: Number(e.target.value),
                  currentPage: 1 
                })}
                className="ml-4 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onStateChange({ currentPage: state.currentPage - 1 })}
                disabled={state.currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {state.currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => onStateChange({ currentPage: state.currentPage + 1 })}
                disabled={state.currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Actions */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
            </span>
            <button className="btn-secondary text-sm">
              Export Selected
            </button>
            <button className="btn-secondary text-sm">
              Bulk Edit
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
