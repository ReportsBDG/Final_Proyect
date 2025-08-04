'use client'

import { useState } from 'react'
import {
  Plus,
  Filter,
  Eye,
  EyeOff,
  Download,
  Settings,
  Grid3x3,
  BarChart3,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react'

interface ChartToolbarProps {
  onCreateChart: () => void
  onToggleChartsFilter: () => void
  onExportCharts: () => void
  onRefreshData: () => void
  chartsCount: number
  visibleChartsCount: number
}

export default function ChartToolbar({
  onCreateChart,
  onToggleChartsFilter,
  onExportCharts,
  onRefreshData,
  chartsCount,
  visibleChartsCount
}: ChartToolbarProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'fullscreen'>('grid')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Left Section - Chart Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Charts: {visibleChartsCount} / {chartsCount}
            </span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Real-time Data
            </span>
          </div>
        </div>

        {/* Center Section - View Mode */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="List View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('fullscreen')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'fullscreen'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="Fullscreen View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefreshData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleChartsFilter}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Show/Hide Charts"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Manage</span>
          </button>

          <button
            onClick={onExportCharts}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Export Charts"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

          <button
            onClick={onCreateChart}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            title="Create New Chart"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create Chart</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Quick Actions
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 rounded">
                Revenue Analysis
              </button>
              <button className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 rounded">
                Claims Breakdown
              </button>
              <button className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 rounded">
                Office Performance
              </button>
              <button className="px-2 py-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200 rounded">
                Trends Analysis
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Last updated:</span>
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
