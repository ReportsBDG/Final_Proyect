'use client'

import { BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react'

interface ChartTemplate {
  id: string
  name: string
  description: string
  icon: any
  type: 'bar' | 'line' | 'pie' | 'area'
  xAxis: string
  yAxis: string[]
  aggregation: 'sum' | 'avg' | 'count'
  category: 'financial' | 'operational' | 'analytical'
}

const chartTemplates: ChartTemplate[] = [
  {
    id: 'revenue-by-office',
    name: 'Revenue Analysis',
    description: 'Revenue breakdown by office location',
    icon: DollarSign,
    type: 'bar',
    xAxis: 'office',
    yAxis: ['amount'],
    aggregation: 'sum',
    category: 'financial'
  },
  {
    id: 'claims-distribution',
    name: 'Claims Distribution',
    description: 'Claims status breakdown',
    icon: PieChart,
    type: 'pie',
    xAxis: 'status',
    yAxis: ['amount'],
    aggregation: 'count',
    category: 'operational'
  },
  {
    id: 'insurance-performance',
    name: 'Insurance Performance',
    description: 'Performance by insurance carrier',
    icon: BarChart3,
    type: 'bar',
    xAxis: 'insurance',
    yAxis: ['amount'],
    aggregation: 'avg',
    category: 'analytical'
  },
  {
    id: 'monthly-trends',
    name: 'Monthly Trends',
    description: 'Revenue trends over time',
    icon: TrendingUp,
    type: 'line',
    xAxis: 'date',
    yAxis: ['amount'],
    aggregation: 'sum',
    category: 'analytical'
  }
]

interface ChartTemplatesProps {
  onSelectTemplate: (template: ChartTemplate) => void
  onClose: () => void
}

export default function ChartTemplates({ onSelectTemplate, onClose }: ChartTemplatesProps) {
  const categories = {
    financial: { name: 'Financial', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' },
    operational: { name: 'Operational', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' },
    analytical: { name: 'Analytical', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chart Templates
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quick start with pre-configured chart templates
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartTemplates.map((template) => {
          const IconComponent = template.icon
          const categoryInfo = categories[template.category]
          
          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                  <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {template.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryInfo.color}`}>
                      {categoryInfo.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)} Chart
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      {template.aggregation.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need a custom chart? Create one from scratch with full configuration options.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Custom Chart
          </button>
        </div>
      </div>
    </div>
  )
}

export { chartTemplates, type ChartTemplate }
