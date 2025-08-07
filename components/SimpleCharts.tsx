'use client'

import { useState } from 'react'
import {
  Plus,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  BarChart3,
  LineChart as LineIcon,
  PieChart,
  Grid3x3,
  X
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import ChartConfigModal from './ChartConfigModal'
import { PatientRecord } from '@/types'

interface ChartProps {
  data: PatientRecord[]
}

interface ChartConfig {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  visible: boolean
  showLegend: boolean
  showGrid: boolean
  xAxis: string
  yAxis: string[]
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min'
  colors: string[]
}

export default function SimpleCharts({ data }: ChartProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null)
  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      id: '1',
      title: 'Revenue by Office',
      type: 'bar',
      visible: true,
      showLegend: true,
      showGrid: true,
      xAxis: 'offices',
      yAxis: ['paidamount'],
      aggregation: 'sum',
      colors: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    },
    {
      id: '2',
      title: 'Claims by Status',
      type: 'pie',
      visible: true,
      showLegend: true,
      showGrid: false,
      xAxis: 'claimstatus',
      yAxis: ['count'],
      aggregation: 'count',
      colors: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    },
    {
      id: '3',
      title: 'Monthly Revenue Trend',
      type: 'line',
      visible: true,
      showLegend: true,
      showGrid: true,
      xAxis: 'month',
      yAxis: ['paidamount'],
      aggregation: 'sum',
      colors: ['#6366f1', '#06b6d4']
    },
    {
      id: '4',
      title: 'Claims by Insurance Carrier',
      type: 'area',
      visible: true,
      showLegend: true,
      showGrid: true,
      xAxis: 'insurancecarrier',
      yAxis: ['paidamount'],
      aggregation: 'sum',
      colors: ['#8b5cf6', '#ec4899', '#f97316']
    }
  ])

  // Process data for charts
  const processChartData = (chart: ChartConfig) => {
    if (!data || data.length === 0) return []

    const { xAxis, yAxis, aggregation } = chart

    if (xAxis === 'month') {
      // Special handling for monthly data
      const monthlyData: Record<string, number> = {}
      
      data.forEach(record => {
        if (record.dos || record.timestamp) {
          const date = new Date(record.dos || record.timestamp)
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0
          }
          
          if (aggregation === 'sum' && yAxis.includes('paidamount')) {
            monthlyData[monthKey] += record.paidamount || 0
          } else if (aggregation === 'count') {
            monthlyData[monthKey] += 1
          }
        }
      })

      return Object.entries(monthlyData)
        .map(([month, value]) => ({
          name: month,
          [yAxis[0] === 'count' ? 'count' : yAxis[0]]: value
        }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    }

    // Group by xAxis field
    const grouped: Record<string, any> = {}
    
    data.forEach(record => {
      const key = record[xAxis as keyof PatientRecord] || 'Unknown'
      const keyStr = String(key)
      
      if (!grouped[keyStr]) {
        grouped[keyStr] = {
          name: keyStr,
          count: 0,
          paidamount: 0,
          records: []
        }
      }
      
      grouped[keyStr].count += 1
      grouped[keyStr].paidamount += record.paidamount || 0
      grouped[keyStr].records.push(record)
    })

    // Convert to array and calculate aggregations
    return Object.values(grouped).map(item => {
      const result: any = { name: item.name }
      
      yAxis.forEach(field => {
        if (field === 'count') {
          result[field] = item.count
        } else if (aggregation === 'sum') {
          result[field] = item[field] || 0
        } else if (aggregation === 'avg') {
          result[field] = item.count > 0 ? (item[field] || 0) / item.count : 0
        } else if (aggregation === 'count') {
          result[field] = item.count
        }
      })
      
      return result
    }).sort((a, b) => {
      // Sort by value for better visualization
      const aValue = a[yAxis[0]] || 0
      const bValue = b[yAxis[0]] || 0
      return bValue - aValue
    }).slice(0, 10) // Limit to top 10 items for readability
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const renderChart = (chart: ChartConfig) => {
    const chartData = processChartData(chart)
    
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      )
    }

    const formatTooltipValue = (value: any, name: string) => {
      if (name === 'paidamount') {
        return [formatCurrency(Number(value)), 'Revenue']
      }
      if (name === 'count') {
        return [formatNumber(Number(value)), 'Count']
      }
      return [formatNumber(Number(value)), name]
    }

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151' }}
                tickFormatter={(value) => {
                  if (chart.yAxis.includes('paidamount')) {
                    return formatCurrency(value)
                  }
                  return formatNumber(value)
                }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#fff',
                  border: document.documentElement.classList.contains('dark') ? '1px solid #6b7280' : '1px solid #ccc',
                  borderRadius: '8px',
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }}
              />
              {chart.showLegend && <Legend />}
              {chart.yAxis.map((field, index) => (
                <Bar 
                  key={field}
                  dataKey={field} 
                  fill={chart.colors[index % chart.colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151' }}
                tickFormatter={(value) => {
                  if (chart.yAxis.includes('paidamount')) {
                    return formatCurrency(value)
                  }
                  return formatNumber(value)
                }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#fff',
                  border: document.documentElement.classList.contains('dark') ? '1px solid #6b7280' : '1px solid #ccc',
                  borderRadius: '8px',
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }}
              />
              {chart.showLegend && <Legend />}
              {chart.yAxis.map((field, index) => (
                <Line 
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stroke={chart.colors[index % chart.colors.length]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151' }}
                tickFormatter={(value) => {
                  if (chart.yAxis.includes('paidamount')) {
                    return formatCurrency(value)
                  }
                  return formatNumber(value)
                }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#fff',
                  border: document.documentElement.classList.contains('dark') ? '1px solid #6b7280' : '1px solid #ccc',
                  borderRadius: '8px',
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }}
              />
              {chart.showLegend && <Legend />}
              {chart.yAxis.map((field, index) => (
                <Area 
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stackId="1"
                  stroke={chart.colors[index % chart.colors.length]}
                  fill={chart.colors[index % chart.colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = chartData.slice(0, 8) // Limit pie chart to 8 slices for readability
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip 
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#fff',
                  border: document.documentElement.classList.contains('dark') ? '1px solid #6b7280' : '1px solid #ccc',
                  borderRadius: '8px',
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }}
              />
              {chart.showLegend && <Legend />}
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey={chart.yAxis[0]}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chart.colors[index % chart.colors.length]}
                  />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const updateChart = (id: string, updates: Partial<ChartConfig>) => {
    setCharts(charts.map(chart => 
      chart.id === id ? { ...chart, ...updates } : chart
    ))
  }

  const deleteChart = (id: string) => {
    setCharts(charts.filter(chart => chart.id !== id))
    setActiveDropdown(null)
  }

  const openConfiguration = (chart: ChartConfig) => {
    setCurrentChart(chart)
    setShowConfigModal(true)
    setActiveDropdown(null)
  }

  const saveConfiguration = (config: Partial<ChartConfig>) => {
    if (currentChart) {
      setCharts(charts.map(chart =>
        chart.id === currentChart.id ? { ...chart, ...config } : chart
      ))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Interactive charts with real data from your dental practice ({data.length} records)
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.filter(chart => chart.visible).map((chart) => (
          <div key={chart.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Chart Header with + Button */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chart.title}
                </h3>
                
                {/* PROMINENT + BUTTON */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === chart.id ? null : chart.id)}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white hover:scale-105 transition-all duration-200"
                    title="Chart Options"
                  >
                    <Plus className="w-6 h-6" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === chart.id && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl z-50">
                      {/* Header */}
                      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Chart Options</h4>
                          <button
                            onClick={() => setActiveDropdown(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="py-2">
                        {/* 1. Chart Type */}
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            1. Chart Type
                          </h5>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { type: 'bar', icon: BarChart3, label: 'Bar' },
                              { type: 'line', icon: LineIcon, label: 'Line' },
                              { type: 'pie', icon: PieChart, label: 'Pie' },
                              { type: 'area', icon: BarChart3, label: 'Area' }
                            ].map(({ type, icon: Icon, label }) => (
                              <button
                                key={type}
                                onClick={() => updateChart(chart.id, { type: type as ChartConfig['type'] })}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  chart.type === type
                                    ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                                }`}
                              >
                                <Icon className="w-4 h-4 mx-auto mb-1" />
                                <div className="text-xs">{label}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Legend Toggle */}
                        <button
                          onClick={() => updateChart(chart.id, { showLegend: !chart.showLegend })}
                          className="flex items-center w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {chart.showLegend ? (
                            <EyeOff className="w-5 h-5 mr-3 text-orange-500" />
                          ) : (
                            <Eye className="w-5 h-5 mr-3 text-green-500" />
                          )}
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">
                              2. {chart.showLegend ? 'Hide Legend' : 'Show Legend'}
                            </div>
                            <div className="text-xs text-gray-500">Toggle chart legend visibility</div>
                          </div>
                        </button>

                        {/* 3. Grid Lines */}
                        <button
                          onClick={() => updateChart(chart.id, { showGrid: !chart.showGrid })}
                          className="flex items-center w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Grid3x3 className="w-5 h-5 mr-3 text-purple-500" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">
                              3. {chart.showGrid ? 'Hide Grid' : 'Show Grid'}
                            </div>
                            <div className="text-xs text-gray-500">Toggle grid lines</div>
                          </div>
                        </button>

                        {/* 4. Delete Chart */}
                        <button
                          onClick={() => deleteChart(chart.id)}
                          className="flex items-center w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-5 h-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">4. Delete Chart</div>
                            <div className="text-xs opacity-75">Remove this chart permanently</div>
                          </div>
                        </button>

                        {/* 5. Hide Chart */}
                        <button
                          onClick={() => {
                            updateChart(chart.id, { visible: false })
                            setActiveDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <EyeOff className="w-5 h-5 mr-3 text-gray-500" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">5. Hide Chart</div>
                            <div className="text-xs text-gray-500">Hide this chart from view</div>
                          </div>
                        </button>

                        {/* 6. Configuration */}
                        <button
                          onClick={() => openConfiguration(chart)}
                          className="flex items-center w-full px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-gray-200 dark:border-gray-700"
                        >
                          <Settings className="w-5 h-5 mr-3 text-blue-500" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">6. Configuration</div>
                            <div className="text-xs text-gray-500">Advanced chart settings</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
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

      {/* Hidden Charts Section */}
      {charts.filter(chart => !chart.visible).length > 0 && (
        <div className="space-y-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hidden Charts ({charts.filter(chart => !chart.visible).length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.filter(chart => !chart.visible).map((chart) => (
                <div key={chart.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{chart.title}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateChart(chart.id, { visible: true })}
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        title="Show Chart"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteChart(chart.id)}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Chart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Type: {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}</p>
                    <p>X-Axis: {chart.xAxis}</p>
                    <p>Y-Axis: {chart.yAxis.join(', ')}</p>
                    <p>Aggregation: {chart.aggregation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create New Chart Button */}
      <div className="text-center">
        <button
          onClick={() => {
            const newChart: ChartConfig = {
              id: Date.now().toString(),
              title: `New Chart ${charts.length + 1}`,
              type: 'bar',
              visible: true,
              showLegend: true,
              showGrid: true,
              xAxis: 'offices',
              yAxis: ['paidamount'],
              aggregation: 'sum',
              colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }
            setCharts([...charts, newChart])
          }}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Chart
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click the <strong>blue + button</strong> on any chart to see all options</li>
          <li>• Change chart type between Bar, Line, Pie, and Area charts</li>
          <li>• Toggle legend and grid lines for better visualization</li>
          <li>• Charts automatically update with real data from {data.length} patient records</li>
          <li>• Use <strong>Configuration</strong> for advanced settings</li>
        </ul>
      </div>

      {/* Configuration Modal */}
      <ChartConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={saveConfiguration}
        currentChart={currentChart}
        data={data}
      />
    </div>
  )
}
