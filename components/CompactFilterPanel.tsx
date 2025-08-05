'use client'

import { useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

interface CompactFilterPanelProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  dateRange: { start: string; end: string }
  setDateRange: (range: { start: string; end: string }) => void
  filteredDataLength: number
  
  // Filters data
  uniqueOffices: string[]
  selectedOffices: string[]
  uniqueCarriers: string[]
  selectedCarriers: string[]
  uniqueClaimStatuses: string[]
  selectedClaimStatuses: string[]
  uniqueStatuses: string[]
  selectedStatuses: string[]
  uniqueInteractionTypes: string[]
  selectedInteractionTypes: string[]
  
  // Filter functions
  toggleFilterSelection: (value: string, currentSelection: string[], setSelection: (selection: string[]) => void) => void
  setSelectedOffices: (offices: string[]) => void
  setSelectedCarriers: (carriers: string[]) => void
  setSelectedClaimStatuses: (statuses: string[]) => void
  setSelectedStatuses: (statuses: string[]) => void
  setSelectedInteractionTypes: (types: string[]) => void
  
  // Clear all function
  clearAllFilters: () => void
}

interface CompactMultiSelectProps {
  label: string
  options: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  placeholder?: string
}

const CompactMultiSelect = ({
  label,
  options,
  selectedValues,
  onToggle,
  onSelectAll,
  onClearAll,
  placeholder = "Select options..."
}: CompactMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {selectedValues.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
            {selectedValues.length}
          </span>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 text-sm"
      >
        <span className="truncate font-medium">
          {selectedValues.length === 0
            ? <span className="text-gray-500">{placeholder}</span>
            : selectedValues.length === 1
              ? selectedValues[0]
              : <span className="text-blue-600 dark:text-blue-400">{selectedValues.length} selected</span>
          }
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-56 overflow-hidden">
          {/* Header with actions */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectAll()
                    setIsOpen(false)
                  }}
                  className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    onClearAll()
                    setIsOpen(false)
                  }}
                  className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-40 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-sm transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => onToggle(option)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 w-4 h-4"
                />
                <span className="text-gray-900 dark:text-white truncate min-w-0 leading-relaxed font-medium">{option}</span>
              </label>
            ))}

            {options.length === 0 && (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default function CompactFilterPanel(props: CompactFilterPanelProps) {
  const {
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    filteredDataLength,
    uniqueOffices,
    selectedOffices,
    uniqueCarriers,
    selectedCarriers,
    uniqueClaimStatuses,
    selectedClaimStatuses,
    uniqueStatuses,
    selectedStatuses,
    uniqueInteractionTypes,
    selectedInteractionTypes,
    toggleFilterSelection,
    setSelectedOffices,
    setSelectedCarriers,
    setSelectedClaimStatuses,
    setSelectedStatuses,
    setSelectedInteractionTypes,
    clearAllFilters
  } = props

  // Helper functions
  const selectAllOffices = () => setSelectedOffices(uniqueOffices)
  const clearAllOffices = () => setSelectedOffices([])
  const selectAllCarriers = () => setSelectedCarriers(uniqueCarriers)
  const clearAllCarriers = () => setSelectedCarriers([])
  const selectAllClaimStatuses = () => setSelectedClaimStatuses(uniqueClaimStatuses)
  const clearAllClaimStatuses = () => setSelectedClaimStatuses([])
  const selectAllStatuses = () => setSelectedStatuses(uniqueStatuses)
  const clearAllStatuses = () => setSelectedStatuses([])
  const selectAllInteractionTypes = () => setSelectedInteractionTypes(uniqueInteractionTypes)
  const clearAllInteractionTypes = () => setSelectedInteractionTypes([])

  const hasActiveFilters = selectedOffices.length > 0 || selectedCarriers.length > 0 || 
    selectedClaimStatuses.length > 0 || selectedStatuses.length > 0 || 
    selectedInteractionTypes.length > 0 || searchTerm || dateRange.start || dateRange.end

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Compact Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients, emails, carriers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm font-medium placeholder:text-gray-400 transition-all"
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                {filteredDataLength}
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">DOS Date Range</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <CompactMultiSelect
          label="Office"
          options={uniqueOffices}
          selectedValues={selectedOffices}
          onToggle={(value) => toggleFilterSelection(value, selectedOffices, setSelectedOffices)}
          onSelectAll={selectAllOffices}
          onClearAll={clearAllOffices}
          placeholder="All Offices"
        />

        <CompactMultiSelect
          label="Insurance Carrier"
          options={uniqueCarriers}
          selectedValues={selectedCarriers}
          onToggle={(value) => toggleFilterSelection(value, selectedCarriers, setSelectedCarriers)}
          onSelectAll={selectAllCarriers}
          onClearAll={clearAllCarriers}
          placeholder="All Carriers"
        />

        <CompactMultiSelect
          label="Claim Status"
          options={uniqueClaimStatuses}
          selectedValues={selectedClaimStatuses}
          onToggle={(value) => toggleFilterSelection(value, selectedClaimStatuses, setSelectedClaimStatuses)}
          onSelectAll={selectAllClaimStatuses}
          onClearAll={clearAllClaimStatuses}
          placeholder="All Claim Statuses"
        />

        <CompactMultiSelect
          label="Processing Status"
          options={uniqueStatuses}
          selectedValues={selectedStatuses}
          onToggle={(value) => toggleFilterSelection(value, selectedStatuses, setSelectedStatuses)}
          onSelectAll={selectAllStatuses}
          onClearAll={clearAllStatuses}
          placeholder="All Statuses"
        />

        <CompactMultiSelect
          label="Type of Interaction"
          options={uniqueInteractionTypes}
          selectedValues={selectedInteractionTypes}
          onToggle={(value) => toggleFilterSelection(value, selectedInteractionTypes, setSelectedInteractionTypes)}
          onSelectAll={selectAllInteractionTypes}
          onClearAll={clearAllInteractionTypes}
          placeholder="All Interaction Types"
        />
      </div>

      {/* Summary Footer */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Results: </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{filteredDataLength}</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
