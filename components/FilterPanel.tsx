'use client'

import { useState } from 'react'
import { 
  Filter, 
  X, 
  Calendar,
  Building,
  Shield,
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react'
import { FilterState, FilterOption } from '@/types'

interface FilterPanelProps {
  filters: FilterState
  options: {
    offices: FilterOption[]
    insuranceCarriers: FilterOption[]
    claimStatus: FilterOption[]
    interactionTypes: FilterOption[]
  }
  onFiltersChange: (filters: Partial<FilterState>) => void
  onClearFilters: () => void
  activeFiltersCount: number
}

interface MultiSelectProps {
  label: string
  icon: React.ReactNode
  options: FilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder: string
}

const MultiSelect = ({ label, icon, options, selected, onChange, placeholder }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon}
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100 rounded-full">
            {selected.length}
          </span>
        )}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="text-left truncate">
            {selected.length === 0 
              ? placeholder
              : selected.length === 1 
                ? selected[0]
                : `${selected.length} selected`
            }
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
              >
                Clear all selections
              </button>
            )}
            
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="flex-1 text-sm text-gray-900 dark:text-white">
                  {option.label}
                </span>
                {option.count && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({option.count})
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function FilterPanel({
  filters,
  options,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    })
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange({ searchQuery: value })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Clear all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Search className="w-4 h-4" />
              <span>Global Search</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, emails, comments..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Offices */}
          <MultiSelect
            label="Offices"
            icon={<Building className="w-4 h-4" />}
            options={options.offices}
            selected={filters.offices}
            onChange={(values) => onFiltersChange({ offices: values })}
            placeholder="Select offices..."
          />

          {/* Insurance Carriers */}
          <MultiSelect
            label="Insurance Carriers"
            icon={<Shield className="w-4 h-4" />}
            options={options.insuranceCarriers}
            selected={filters.insuranceCarriers}
            onChange={(values) => onFiltersChange({ insuranceCarriers: values })}
            placeholder="Select insurance carriers..."
          />

          {/* Claim Status */}
          <MultiSelect
            label="Claim Status"
            icon={<Activity className="w-4 h-4" />}
            options={options.claimStatus}
            selected={filters.claimStatus}
            onChange={(values) => onFiltersChange({ claimStatus: values })}
            placeholder="Select claim status..."
          />

          {/* Interaction Types */}
          <MultiSelect
            label="Interaction Types"
            icon={<Activity className="w-4 h-4" />}
            options={options.interactionTypes}
            selected={filters.interactionTypes}
            onChange={(values) => onFiltersChange({ interactionTypes: values })}
            placeholder="Select interaction types..."
          />

          {/* Advanced Filters */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Advanced Filters
            </h3>
            
            {/* How Proceeded */}
            <div className="space-y-2 mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-400">How Proceeded</label>
              <select
                multiple
                value={filters.howProceeded}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  onFiltersChange({ howProceeded: values })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                size={3}
              >
                <option value="Standard processing">Standard processing</option>
                <option value="Follow-up required">Follow-up required</option>
                <option value="Claim submitted electronically">Electronic submission</option>
                <option value="Appeal submitted">Appeal submitted</option>
                <option value="Contacted insurance">Contacted insurance</option>
              </select>
            </div>

            {/* Escalated To */}
            <div className="space-y-2 mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-400">Escalated To</label>
              <select
                multiple
                value={filters.escalatedTo}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  onFiltersChange({ escalatedTo: values })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                size={3}
              >
                <option value="Supervisor">Supervisor</option>
                <option value="Insurance Specialist">Insurance Specialist</option>
                <option value="Claims Manager">Claims Manager</option>
                <option value="Clinical Director">Clinical Director</option>
                <option value="Treatment Coordinator">Treatment Coordinator</option>
              </select>
            </div>

            {/* Missing Documents */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Missing Documents</label>
              <select
                multiple
                value={filters.missingDocs}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  onFiltersChange({ missingDocs: values })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                size={3}
              >
                <option value="Missing pre-authorization">Pre-authorization</option>
                <option value="Documentation pending">Documentation pending</option>
                <option value="Treatment plan required">Treatment plan</option>
                <option value="Medical necessity documentation">Medical necessity</option>
                <option value="X-rays required">X-rays</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {activeFiltersCount === 0 ? 'No filters applied' : `${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} active`}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
