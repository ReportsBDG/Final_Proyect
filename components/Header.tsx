'use client'

import { 
  RefreshCw, 
  Download, 
  Moon, 
  Sun, 
  Activity, 
  Users, 
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Search
} from 'lucide-react'
import { DashboardMetrics } from '@/types'

interface HeaderProps {
  title: string
  metrics: DashboardMetrics
  onRefresh: () => void
  onExport: () => void
  onThemeToggle: () => void
  isLoading: boolean
  theme: 'light' | 'dark'
}

export default function Header({
  title,
  metrics,
  onRefresh,
  onExport,
  onThemeToggle,
  isLoading,
  theme
}: HeaderProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        {/* Top Row - Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Professional Dental Analytics Platform
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <button
              onClick={onExport}
              className="btn-primary flex items-center space-x-2"
              title="Export Data"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total Revenue */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-200" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </div>

          {/* Claims Processed */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Claims Processed</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.claimsProcessed || 0)}</p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8.2% from last week</span>
            </div>
          </div>

          {/* Average Claim */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Average Claim</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageClaim || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+3.1% from last month</span>
            </div>
          </div>

          {/* Active Offices */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Offices</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.activeOffices || 0)}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-purple-100">All systems operational</span>
            </div>
          </div>

          {/* Today's Claims */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Today's Claims</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.todaysClaims || 0)}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-200" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-orange-100">Updated 5 min ago</span>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm font-medium">System Status</p>
                <p className="text-xl font-bold">Operational</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-200">99.9% uptime</span>
            </div>
          </div>
        </div>

        {/* Data Quality Indicator */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Total Records: {formatNumber(metrics.claimsProcessed || 0)}</span>
            <span>•</span>
            <span>Filtered Records: {formatNumber(metrics.claimsProcessed || 0)}</span>
            <span>•</span>
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Data Quality: 98.5%</span>
          </div>
        </div>
      </div>
    </header>
  )
}
