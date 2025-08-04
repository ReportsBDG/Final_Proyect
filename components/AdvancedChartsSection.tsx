'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Grid3x3,
  Filter,
  X,
  Save,
  MoreVertical
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import ChartToolbar from './ChartToolbar'
import ChartTemplates, { ChartTemplate } from './ChartTemplates'

interface ChartConfig {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  xAxis: string
  yAxis: string[]
  showLegend: boolean
  showGrid: boolean
  isVisible: boolean
  colors: string[]
  aggregation: 'sum' | 'avg' | 'count'
}

interface AdvancedChartsSectionProps {
  data: any[]
}

const CHART_COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
]

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChartIcon },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { value: 'area', label: 'Area Chart', icon: TrendingUp }
]

export default function AdvancedChartsSection({ data }: AdvancedChartsSectionProps) {
  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      id: '1',
      title: 'Revenue by Office',
      type: 'bar',
      xAxis: 'office',
      yAxis: ['amount'],
      showLegend: true,
      showGrid: true,
      isVisible: true,
      colors: ['#0ea5e9'],
      aggregation: 'sum'
    },
    {
      id: '2',
      title: 'Claims by Status',
      type: 'pie',
      xAxis: 'status',
      yAxis: ['amount'],
      showLegend: true,
      showGrid: false,
      isVisible: true,
      colors: CHART_COLORS,
      aggregation: 'count'
    }
  ])
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null)
  const [showChartsFilter, setShowChartsFilter] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Get available fields from data
  const availableFields = data.length > 0 ? Object.keys(data[0]) : []
  const numericFields = availableFields.filter(field => 
    data.some(item => typeof item[field] === 'number')
  )
  const categoricalFields = availableFields.filter(field => 
    data.some(item => typeof item[field] === 'string')
  )

  const processChartData = (chart: ChartConfig) => {
    if (!data.length) return []

    const groupedData = data.reduce((acc, item) => {
      const key = item[chart.xAxis]
      if (!acc[key]) {
        acc[key] = { name: key }
        chart.yAxis.forEach(field => {
          acc[key][field] = 0
          acc[key][`${field}_count`] = 0
        })
      }
      
      chart.yAxis.forEach(field => {
        if (chart.aggregation === 'sum') {
          acc[key][field] += item[field] || 0
        } else if (chart.aggregation === 'count') {
          acc[key][field] += 1
        }
        acc[key][`${field}_count`] += 1
      })
      
      return acc
    }, {} as any)

    return Object.values(groupedData).map((item: any) => {
      if (chart.aggregation === 'avg') {
        chart.yAxis.forEach(field => {
          item[field] = item[field] / item[`${field}_count`]
        })
      }
      return item
    })
  }

  const createNewChart = () => {
    setShowTemplates(true)
  }

  const createChartFromTemplate = (template: ChartTemplate) => {
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      title: template.name,
      type: template.type,
      xAxis: template.xAxis,
      yAxis: template.yAxis,
      showLegend: true,
      showGrid: true,
      isVisible: true,
      colors: [CHART_COLORS[charts.length % CHART_COLORS.length]],
      aggregation: template.aggregation
    }
    setCharts([...charts, newChart])
    setShowTemplates(false)
  }

  const createCustomChart = () => {
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      title: 'Custom Chart',
      type: 'bar',
      xAxis: categoricalFields[0] || '',
      yAxis: [numericFields[0] || ''],
      showLegend: true,
      showGrid: true,
      isVisible: true,
      colors: [CHART_COLORS[charts.length % CHART_COLORS.length]],
      aggregation: 'sum'
    }
    setCharts([...charts, newChart])
    setCurrentChart(newChart)
    setShowConfigModal(true)
    setShowTemplates(false)
  }

  const updateChart = (chartId: string, updates: Partial<ChartConfig>) => {
    setCharts(charts.map(chart => 
      chart.id === chartId ? { ...chart, ...updates } : chart
    ))
  }

  const deleteChart = (chartId: string) => {
    setCharts(charts.filter(chart => chart.id !== chartId))
  }

  const toggleChartVisibility = (chartId: string) => {
    updateChart(chartId, { isVisible: !charts.find(c => c.id === chartId)?.isVisible })
  }

  const openConfiguration = (chart: ChartConfig) => {
    setCurrentChart(chart)
    setShowConfigModal(true)
  }

  const renderChart = (chart: ChartConfig) => {
    const chartData = processChartData(chart)
    
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chart.showLegend && <Legend />}
              <Tooltip />
              {chart.yAxis.map((field, index) => (
                <Bar 
                  key={field}
                  dataKey={field} 
                  fill={chart.colors[index % chart.colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chart.showLegend && <Legend />}
              <Tooltip />
              {chart.yAxis.map((field, index) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stroke={chart.colors[index % chart.colors.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey={chart.yAxis[0]}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chart.colors[index % chart.colors.length]} 
                  />
                ))}
              </Pie>
              {chart.showLegend && <Legend />}
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chart.showLegend && <Legend />}
              <Tooltip />
              {chart.yAxis.map((field, index) => (
                <Area
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stackId="1"
                  stroke={chart.colors[index % chart.colors.length]}
                  fill={chart.colors[index % chart.colors.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  const visibleCharts = charts.filter(chart => chart.isVisible)

  return (
    <div className="space-y-6">
      {/* Charts Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Advanced Analytics Charts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Create and customize dynamic charts with pivot-like functionality
        </p>
      </div>

      {/* Chart Toolbar */}
      <ChartToolbar
        onCreateChart={createNewChart}
        onToggleChartsFilter={() => setShowChartsFilter(!showChartsFilter)}
        onExportCharts={() => console.log('Export charts')}
        onRefreshData={() => window.location.reload()}
        chartsCount={charts.length}
        visibleChartsCount={visibleCharts.length}
      />

      {/* Charts Filter Panel */}
      {showChartsFilter && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Chart Visibility</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {charts.map((chart) => (
              <label key={chart.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chart.isVisible}
                  onChange={() => toggleChartVisibility(chart.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {chart.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCharts.map((chart) => (
          <div key={chart.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            {/* Chart Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {chart.title}
                </h3>
                
                {/* Chart Controls */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveDropdown(activeDropdown === chart.id ? null : chart.id)
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors border-2 border-blue-700 hover:border-blue-800"
                      title="Chart Options"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === chart.id && (
                      <div
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl z-30 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                      <div className="py-2">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Chart Actions
                          </h4>
                        </div>

                        <button
                          onClick={() => {
                            openConfiguration(chart)
                            setActiveDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Settings className="w-5 h-5 mr-3 text-blue-500" />
                          <div className="text-left">
                            <div className="font-medium">Configuration</div>
                            <div className="text-xs text-gray-500">Pivot table settings</div>
                          </div>
                        </button>
                        
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chart Type</span>
                          <div className="mt-1 grid grid-cols-2 gap-1">
                            {CHART_TYPES.map((type) => (
                              <button
                                key={type.value}
                                onClick={() => updateChart(chart.id, { type: type.value as any })}
                                className={`flex items-center p-1 rounded text-xs ${
                                  chart.type === type.value 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <type.icon className="w-3 h-3 mr-1" />
                                {type.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => updateChart(chart.id, { showLegend: !chart.showLegend })}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {chart.showLegend ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {chart.showLegend ? 'Hide Legend' : 'Show Legend'}
                        </button>
                        
                        <button
                          onClick={() => updateChart(chart.id, { showGrid: !chart.showGrid })}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Grid3x3 className="w-4 h-4 mr-2" />
                          {chart.showGrid ? 'Hide Grid' : 'Show Grid'}
                        </button>
                        
                        <button
                          onClick={() => toggleChartVisibility(chart.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Chart
                        </button>
                        
                        <button
                          onClick={() => deleteChart(chart.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Chart
                        </button>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Content */}
            <div className="p-6">
              {renderChart(chart)}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && currentChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Chart Configuration - {currentChart.title}
                </h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Title
                  </label>
                  <input
                    type="text"
                    value={currentChart.title}
                    onChange={(e) => setCurrentChart({ ...currentChart, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={currentChart.type}
                    onChange={(e) => setCurrentChart({ ...currentChart, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {CHART_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pivot Table Configuration */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Data Configuration (Pivot-like)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      X-Axis (Categories)
                    </label>
                    <select
                      value={currentChart.xAxis}
                      onChange={(e) => setCurrentChart({ ...currentChart, xAxis: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {categoricalFields.map((field) => (
                        <option key={field} value={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Y-Axis (Values)
                    </label>
                    <select
                      multiple
                      value={currentChart.yAxis}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value)
                        setCurrentChart({ ...currentChart, yAxis: values })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white h-32"
                    >
                      {numericFields.map((field) => (
                        <option key={field} value={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Hold Ctrl/Cmd to select multiple
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Aggregation
                    </label>
                    <select
                      value={currentChart.aggregation}
                      onChange={(e) => setCurrentChart({ ...currentChart, aggregation: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="sum">Sum</option>
                      <option value="avg">Average</option>
                      <option value="count">Count</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Display Options
                  </h4>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentChart.showLegend}
                      onChange={(e) => setCurrentChart({ ...currentChart, showLegend: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Legend</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentChart.showGrid}
                      onChange={(e) => setCurrentChart({ ...currentChart, showGrid: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Grid Lines</span>
                  </label>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Color Palette
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {CHART_COLORS.map((color, index) => (
                      <button
                        key={color}
                        onClick={() => {
                          const newColors = [...currentChart.colors]
                          newColors[0] = color
                          setCurrentChart({ ...currentChart, colors: newColors })
                        }}
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateChart(currentChart.id, currentChart)
                  setShowConfigModal(false)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ChartTemplates
            onSelectTemplate={createChartFromTemplate}
            onClose={() => setShowTemplates(false)}
          />
        </div>
      )}
    </div>
  )
}
