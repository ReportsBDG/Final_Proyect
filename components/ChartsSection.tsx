'use client'

import { useState } from 'react'
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
  ResponsiveContainer,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart
} from 'recharts'
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react'
import { PatientRecord, ChartConfig, ChartType } from '@/types'
import { generateAnalyticsData } from '@/utils/dataHelpers'

interface ChartsSectionProps {
  data: PatientRecord[]
  configs: Record<string, ChartConfig>
  onConfigChange: (chartId: string, config: Partial<ChartConfig>) => void
  isLoading: boolean
}

interface ChartWrapperProps {
  title: string
  chartId: string
  config: ChartConfig
  onConfigChange: (config: Partial<ChartConfig>) => void
  children: React.ReactNode
  className?: string
}

const ChartWrapper = ({ title, chartId, config, onConfigChange, children, className = '' }: ChartWrapperProps) => {
  const [showSettings, setShowSettings] = useState(false)

  const chartTypeIcons = {
    bar: BarChart3,
    line: LineChartIcon,
    pie: PieChartIcon,
    doughnut: PieChartIcon,
    area: Activity,
    polarArea: Activity,
  }

  const IconComponent = chartTypeIcons[config.type] || BarChart3

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onConfigChange({ showLegend: !config.showLegend })}
            className={`p-2 rounded-lg transition-colors ${
              config.showLegend 
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title={config.showLegend ? 'Hide Legend' : 'Show Legend'}
          >
            {config.showLegend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            title="Chart Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chart Type</span>
            <select
              value={config.type}
              onChange={(e) => onConfigChange({ type: e.target.value as ChartType })}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Labels</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showLabels}
                onChange={(e) => onConfigChange({ showLabels: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Animation</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.animated}
                onChange={(e) => onConfigChange({ animated: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      )}

      <div className="h-80">
        {children}
      </div>
    </div>
  )
}

const COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
]

export default function ChartsSection({ data, configs, onConfigChange, isLoading }: ChartsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Charts</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const analyticsData = generateAnalyticsData(data)
  
  if (!analyticsData) {
    return (
      <div className="card p-8 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
        <p className="text-gray-600 dark:text-gray-400">Unable to generate charts without data</p>
      </div>
    )
  }

  const renderChart = (chartId: string, chartData: any[], config: ChartConfig) => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {config.showLegend && <Legend />}
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9' }}
                animationDuration={config.animated ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {config.showLegend && <Legend />}
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#0ea5e9" 
                fill="#0ea5e9" 
                fillOpacity={0.6}
                animationDuration={config.animated ? 1000 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={config.type === 'doughnut' ? 80 : 100}
                innerRadius={config.type === 'doughnut' ? 40 : 0}
                fill="#8884d8"
                dataKey="value"
                label={config.showLabels ? ({ name, value }) => `${name}: ${value}` : false}
                animationDuration={config.animated ? 1000 : 0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {config.showLegend && <Legend />}
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      
      default: // bar
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {config.showLegend && <Legend />}
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="#0ea5e9"
                animationDuration={config.animated ? 1000 : 0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Charts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interactive data visualization and insights
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Real-time Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Status */}
        <ChartWrapper
          title="Claims Distribution by Status"
          chartId="claimStatus"
          config={configs.claimStatus}
          onConfigChange={(config) => onConfigChange('claimStatus', config)}
        >
          {renderChart('claimStatus', analyticsData.claimsByStatus, configs.claimStatus)}
        </ChartWrapper>

        {/* Revenue by Office */}
        <ChartWrapper
          title="Revenue by Office"
          chartId="revenueByOffice"
          config={configs.revenueByOffice}
          onConfigChange={(config) => onConfigChange('revenueByOffice', config)}
        >
          {renderChart('revenueByOffice', analyticsData.revenueByOffice, configs.revenueByOffice)}
        </ChartWrapper>

        {/* Revenue by Insurance Carrier */}
        <ChartWrapper
          title="Revenue by Insurance Carrier"
          chartId="revenueByInsurer"
          config={configs.revenueByInsurer}
          onConfigChange={(config) => onConfigChange('revenueByInsurer', config)}
        >
          {renderChart('revenueByInsurer', analyticsData.revenueByInsurer, configs.revenueByInsurer)}
        </ChartWrapper>

        {/* Interaction Types */}
        <ChartWrapper
          title="Treatment Types Distribution"
          chartId="interactionTypes"
          config={configs.interactionTypes}
          onConfigChange={(config) => onConfigChange('interactionTypes', config)}
        >
          {renderChart('interactionTypes', analyticsData.interactionTypes, configs.interactionTypes)}
        </ChartWrapper>

        {/* Average Payment by Status */}
        <ChartWrapper
          title="Average Payment by Claim Status"
          chartId="averagePayment"
          config={configs.averagePayment}
          onConfigChange={(config) => onConfigChange('averagePayment', config)}
        >
          {renderChart('averagePayment', analyticsData.avgPaymentByStatus, configs.averagePayment)}
        </ChartWrapper>

        {/* Monthly Trends - Full Width */}
        <ChartWrapper
          title="Monthly Revenue & Claims Trends"
          chartId="monthlyTrends"
          config={configs.monthlyTrends}
          onConfigChange={(config) => onConfigChange('monthlyTrends', config)}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="revenue" orientation="left" />
              <YAxis yAxisId="claims" orientation="right" />
              {configs.monthlyTrends.showLegend && <Legend />}
              <Tooltip />
              <Line 
                yAxisId="revenue"
                type="monotone" 
                dataKey="revenue" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                name="Revenue ($)"
                animationDuration={configs.monthlyTrends.animated ? 1000 : 0}
              />
              <Line 
                yAxisId="claims"
                type="monotone" 
                dataKey="claims" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Claims Count"
                animationDuration={configs.monthlyTrends.animated ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  )
}
