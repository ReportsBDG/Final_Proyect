'use client'

import { 
  DollarSign, 
  FileText, 
  Calculator, 
  Building, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  Users
} from 'lucide-react'
import { DashboardMetrics } from '@/types'

interface KPICardsProps {
  metrics: DashboardMetrics
  isLoading: boolean
}

interface KPICardProps {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  formatter: 'currency' | 'number' | 'percentage'
  description?: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo'
}

const KPICard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  formatter, 
  description,
  color 
}: KPICardProps) => {
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val
    
    switch (formatter) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(numValue)
      case 'percentage':
        return `${numValue.toFixed(1)}%`
      default:
        return new Intl.NumberFormat('en-US').format(numValue)
    }
  }

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />
    return <div className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400'
    if (trend === 'down') return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatValue(value)}
        </p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
)

export default function KPICards({ metrics, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {[...Array(7)].map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    )
  }

  const kpiData = [
    {
      title: 'Total Revenue',
      value: metrics.totalRevenue || 0,
      change: 12.5,
      trend: 'up' as const,
      icon: <DollarSign className="w-6 h-6" />,
      formatter: 'currency' as const,
      description: 'All-time revenue',
      color: 'blue' as const,
    },
    {
      title: 'Claims Processed',
      value: metrics.claimsProcessed || 0,
      change: 8.2,
      trend: 'up' as const,
      icon: <FileText className="w-6 h-6" />,
      formatter: 'number' as const,
      description: 'Total claims handled',
      color: 'green' as const,
    },
    {
      title: 'Average Claim',
      value: metrics.averageClaim || 0,
      change: 3.1,
      trend: 'up' as const,
      icon: <Calculator className="w-6 h-6" />,
      formatter: 'currency' as const,
      description: 'Per claim average',
      color: 'purple' as const,
    },
    {
      title: 'Active Offices',
      value: metrics.activeOffices || 0,
      change: 0,
      trend: 'neutral' as const,
      icon: <Building className="w-6 h-6" />,
      formatter: 'number' as const,
      description: 'Currently operational',
      color: 'orange' as const,
    },
    {
      title: "Today's Claims",
      value: metrics.todaysClaims || 0,
      change: 15.3,
      trend: 'up' as const,
      icon: <Calendar className="w-6 h-6" />,
      formatter: 'number' as const,
      description: 'Claims today',
      color: 'pink' as const,
    },
    {
      title: 'Weekly Claims',
      value: metrics.weeklyClaims || 0,
      change: 7.8,
      trend: 'up' as const,
      icon: <Activity className="w-6 h-6" />,
      formatter: 'number' as const,
      description: 'This week total',
      color: 'indigo' as const,
    },
    {
      title: 'Monthly Claims',
      value: metrics.monthlyClaims || 0,
      change: 4.2,
      trend: 'up' as const,
      icon: <Clock className="w-6 h-6" />,
      formatter: 'number' as const,
      description: 'This month total',
      color: 'blue' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Key Performance Indicators
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time metrics and performance overview
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            formatter={kpi.formatter}
            description={kpi.description}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Summary Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">94.2%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Processing Time</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.3 days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Denial Rate</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">3.8%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Patient Satisfaction</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">96.7%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
