'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Save,
  BarChart3,
  LineChart as LineIcon,
  PieChart,
  Settings,
  Database,
  Target,
  Layers,
  TrendingUp,
  Hash,
  Calendar,
  DollarSign,
  Building,
  FileText,
  User,
  Mail
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

interface ChartConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: ChartConfiguration) => void
  currentChart: any
  data: any[]
}

interface ChartConfiguration {
  title: string
  subtitle?: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'bubble' | 'radar' | 'waterfall' | 'funnel' | 'treemap'
  subType?: 'stacked' | 'clustered' | 'normalized' | 'smooth' | 'step'
  orientation?: 'vertical' | 'horizontal'

  // Ejes y datos
  xAxis: string
  yAxis: string[]
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min' | 'median' | 'std' | 'variance'

  // Leyenda avanzada
  showLegend: boolean
  legendPosition: 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  legendAlign: 'left' | 'center' | 'right'
  legendVerticalAlign: 'top' | 'middle' | 'bottom'
  customLegendNames: Record<string, string>
  legendStyle?: 'horizontal' | 'vertical'
  legendSize?: 'small' | 'medium' | 'large'

  // Grilla y ejes
  showGrid: boolean
  gridStyle?: 'solid' | 'dashed' | 'dotted'
  showXAxisLabel: boolean
  showYAxisLabel: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  xAxisRotation?: number
  yAxisRotation?: number

  // Estilos y colores
  colors: string[]
  colorScheme?: 'categorical' | 'sequential' | 'diverging' | 'custom'
  gradientFill?: boolean
  opacity?: number
  borderWidth?: number
  borderRadius?: number

  // Datos y etiquetas
  showDataLabels: boolean
  dataLabelPosition?: 'top' | 'center' | 'bottom' | 'inside' | 'outside'
  showTooltips: boolean
  tooltipFormat?: 'currency' | 'percentage' | 'number' | 'date'
  showValues: boolean

  // Zoom y interactividad
  enableZoom: boolean
  enablePan: boolean
  enableBrush: boolean
  enableCrosshair: boolean

  // Filtros avanzados
  filters?: {
    field: string
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with' | 'between' | 'in' | 'not_in'
    value: string | number | string[]
    condition?: 'and' | 'or'
  }[]

  // Formateo
  numberFormat?: {
    decimals: number
    useThousandSeparator: boolean
    prefix?: string
    suffix?: string
  }

  // Animaciones
  enableAnimations: boolean
  animationDuration?: number
  animationType?: 'ease' | 'ease-in' | 'ease-out' | 'linear'

  // Referencias y líneas de tendencia
  referenceLines?: {
    value: number
    label?: string
    color?: string
    style?: 'solid' | 'dashed' | 'dotted'
    axis: 'x' | 'y'
  }[]
  trendLines?: {
    type: 'linear' | 'polynomial' | 'exponential' | 'logarithmic'
    color?: string
    style?: 'solid' | 'dashed' | 'dotted'
  }[]

  // Dimensiones
  width?: string | number
  height?: string | number
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

const FIELD_ICONS: Record<string, any> = {
  patientName: User,
  office: Building,
  insurance: FileText,
  amount: DollarSign,
  status: Target,
  type: Layers,
  date: Calendar,
  email: Mail,
  id: Hash
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
  { value: 'line', label: 'Line Chart', icon: LineIcon, description: 'Show trends over time' },
  { value: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole' },
  { value: 'area', label: 'Area Chart', icon: TrendingUp, description: 'Show volume and trends' },
  { value: 'scatter', label: 'Scatter Plot', icon: Target, description: 'Show correlation between variables' },
  { value: 'bubble', label: 'Bubble Chart', icon: Target, description: 'Three-dimensional data visualization' },
  { value: 'radar', label: 'Radar Chart', icon: Target, description: 'Compare multiple variables' },
  { value: 'waterfall', label: 'Waterfall', icon: TrendingUp, description: 'Show cumulative effect' },
  { value: 'funnel', label: 'Funnel Chart', icon: TrendingUp, description: 'Show stages in a process' },
  { value: 'treemap', label: 'Treemap', icon: Layers, description: 'Hierarchical data visualization' }
]

const CHART_SUBTYPES = {
  bar: [
    { value: 'clustered', label: 'Clustered', description: 'Side-by-side bars' },
    { value: 'stacked', label: 'Stacked', description: 'Stacked bars' },
    { value: 'normalized', label: '100% Stacked', description: 'Normalized to 100%' }
  ],
  line: [
    { value: 'smooth', label: 'Smooth', description: 'Curved lines' },
    { value: 'step', label: 'Step', description: 'Step lines' }
  ],
  area: [
    { value: 'stacked', label: 'Stacked', description: 'Stacked areas' },
    { value: 'normalized', label: '100% Stacked', description: 'Normalized areas' }
  ]
}

const AGGREGATION_TYPES = [
  { value: 'sum', label: 'Sum', description: 'Add all values together' },
  { value: 'avg', label: 'Average', description: 'Calculate mean value' },
  { value: 'count', label: 'Count', description: 'Count number of records' },
  { value: 'max', label: 'Maximum', description: 'Find highest value' },
  { value: 'min', label: 'Minimum', description: 'Find lowest value' },
  { value: 'median', label: 'Median', description: 'Middle value' },
  { value: 'std', label: 'Std Dev', description: 'Standard deviation' },
  { value: 'variance', label: 'Variance', description: 'Statistical variance' }
]

const COLOR_SCHEMES = [
  { name: 'Categorical', type: 'categorical', colors: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'] },
  { name: 'Sequential Blues', type: 'sequential', colors: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'] },
  { name: 'Sequential Greens', type: 'sequential', colors: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669'] },
  { name: 'Diverging', type: 'diverging', colors: ['#dc2626', '#f97316', '#facc15', '#ffffff', '#22d3ee', '#3b82f6', '#1e40af'] },
  { name: 'Viridis', type: 'sequential', colors: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'] }
]

const DATA_LABEL_POSITIONS = [
  { value: 'top', label: 'Top', icon: '↑' },
  { value: 'center', label: 'Center', icon: '●' },
  { value: 'bottom', label: 'Bottom', icon: '↓' },
  { value: 'inside', label: 'Inside', icon: '⊙' },
  { value: 'outside', label: 'Outside', icon: '◯' }
]

const TOOLTIP_FORMATS = [
  { value: 'currency', label: 'Currency ($1,234.56)' },
  { value: 'percentage', label: 'Percentage (12.34%)' },
  { value: 'number', label: 'Number (1,234.56)' },
  { value: 'date', label: 'Date (Jan 1, 2024)' }
]

const ANIMATION_TYPES = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'linear', label: 'Linear' }
]

const GRID_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' }
]

const TREND_LINE_TYPES = [
  { value: 'linear', label: 'Linear' },
  { value: 'polynomial', label: 'Polynomial' },
  { value: 'exponential', label: 'Exponential' },
  { value: 'logarithmic', label: 'Logarithmic' }
]

const COLOR_PALETTES = [
  { name: 'Blue Shades', colors: ['#0ea5e9', '#3b82f6', '#1d4ed8', '#1e40af'] },
  { name: 'Green Shades', colors: ['#10b981', '#059669', '#047857', '#065f46'] },
  { name: 'Rainbow', colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'] },
  { name: 'Professional', colors: ['#1f2937', '#374151', '#6b7280', '#9ca3af'] },
  { name: 'Warm', colors: ['#dc2626', '#ea580c', '#d97706', '#ca8a04'] }
]

const LEGEND_POSITIONS = [
  { value: 'top', label: 'Top', icon: '↑' },
  { value: 'bottom', label: 'Bottom', icon: '↓' },
  { value: 'left', label: 'Left', icon: '←' },
  { value: 'right', label: 'Right', icon: '→' },
  { value: 'topLeft', label: 'Top Left', icon: '↖' },
  { value: 'topRight', label: 'Top Right', icon: '↗' },
  { value: 'bottomLeft', label: 'Bottom Left', icon: '↙' },
  { value: 'bottomRight', label: 'Bottom Right', icon: '↘' }
]

const LEGEND_ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: '⊣' },
  { value: 'center', label: 'Center', icon: '⊥' },
  { value: 'right', label: 'Right', icon: '⊢' }
]

const LEGEND_VERTICAL_ALIGN_OPTIONS = [
  { value: 'top', label: 'Top', icon: '⊤' },
  { value: 'middle', label: 'Middle', icon: '⊥' },
  { value: 'bottom', label: 'Bottom', icon: '⊥' }
]

export default function ChartConfigModal({ isOpen, onClose, onSave, currentChart, data }: ChartConfigModalProps) {
  const [config, setConfig] = useState<ChartConfiguration>({
    title: currentChart?.title || 'New Chart',
    subtitle: currentChart?.subtitle || '',
    type: currentChart?.type || 'bar',
    subType: currentChart?.subType || 'clustered',
    orientation: currentChart?.orientation || 'vertical',
    xAxis: '',
    yAxis: [],
    aggregation: 'sum',

    // Leyenda
    showLegend: true,
    legendPosition: 'bottom',
    legendAlign: 'center',
    legendVerticalAlign: 'bottom',
    legendStyle: 'horizontal',
    legendSize: 'medium',
    customLegendNames: {},

    // Grilla y ejes
    showGrid: true,
    gridStyle: 'solid',
    showXAxisLabel: false,
    showYAxisLabel: false,
    xAxisLabel: '',
    yAxisLabel: '',
    xAxisRotation: 0,
    yAxisRotation: 0,

    // Colores y estilos
    colors: ['#0ea5e9'],
    colorScheme: 'categorical',
    gradientFill: false,
    opacity: 1,
    borderWidth: 1,
    borderRadius: 0,

    // Datos y etiquetas
    showDataLabels: false,
    dataLabelPosition: 'top',
    showTooltips: true,
    tooltipFormat: 'number',
    showValues: false,

    // Interactividad
    enableZoom: false,
    enablePan: false,
    enableBrush: false,
    enableCrosshair: false,

    // Formateo
    numberFormat: {
      decimals: 0,
      useThousandSeparator: true,
      prefix: '',
      suffix: ''
    },

    // Animaciones
    enableAnimations: true,
    animationDuration: 1000,
    animationType: 'ease',

    // Referencias
    referenceLines: [],
    trendLines: [],

    // Dimensiones
    height: 300,
    margin: {
      top: 20,
      right: 30,
      bottom: 50,
      left: 40
    }
  })

  // Memoize field calculations to prevent infinite loops
  const availableFields = useMemo(() =>
    data && data.length > 0 ? Object.keys(data[0]) : [],
    [data]
  )

  const categoricalFields = useMemo(() =>
    availableFields.filter(field => {
      if (!data || data.length === 0) return false
      const sampleValue = data[0][field]
      return typeof sampleValue === 'string' || typeof sampleValue === 'boolean'
    }),
    [data, availableFields]
  )

  const numericFields = useMemo(() =>
    availableFields.filter(field => {
      if (!data || data.length === 0) return false
      const sampleValue = data[0][field]
      return typeof sampleValue === 'number'
    }),
    [data, availableFields]
  )

  const dateFields = useMemo(() =>
    availableFields.filter(field => {
      if (!data || data.length === 0) return false
      const sampleValue = data[0][field]
      return typeof sampleValue === 'string' && field.toLowerCase().includes('date')
    }),
    [data, availableFields]
  )

  useEffect(() => {
    if (currentChart) {
      setConfig({
        title: currentChart.title || 'New Chart',
        type: currentChart.type || 'bar',
        xAxis: currentChart.xAxis || categoricalFields[0] || '',
        yAxis: currentChart.yAxis || [numericFields[0]] || [],
        aggregation: currentChart.aggregation || 'sum',
        showLegend: currentChart.showLegend !== undefined ? currentChart.showLegend : true,
        legendPosition: currentChart.legendPosition || 'bottom',
        legendAlign: currentChart.legendAlign || 'center',
        legendVerticalAlign: currentChart.legendVerticalAlign || 'bottom',
        customLegendNames: currentChart.customLegendNames || {},
        showGrid: currentChart.showGrid !== undefined ? currentChart.showGrid : true,
        colors: currentChart.colors || ['#0ea5e9']
      })
    }
  }, [currentChart, categoricalFields, numericFields])

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const getFieldIcon = (fieldName: string) => {
    const IconComponent = FIELD_ICONS[fieldName] || Database
    return <IconComponent className="w-4 h-4" />
  }

  const getFieldDisplayName = (fieldName: string) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const addYAxisField = (field: string) => {
    if (!config.yAxis.includes(field)) {
      setConfig(prev => ({
        ...prev,
        yAxis: [...prev.yAxis, field]
      }))
    }
  }

  const removeYAxisField = (field: string) => {
    setConfig(prev => ({
      ...prev,
      yAxis: prev.yAxis.filter(f => f !== field),
      customLegendNames: { ...prev.customLegendNames, [field]: undefined }
    }))
  }

  const updateCustomLegendName = (field: string, customName: string) => {
    setConfig(prev => ({
      ...prev,
      customLegendNames: {
        ...prev.customLegendNames,
        [field]: customName || undefined
      }
    }))
  }

  // Process data for live preview
  const processPreviewData = () => {
    if (!data || data.length === 0 || !config.xAxis || config.yAxis.length === 0) return []

    const grouped: Record<string, any> = {}

    data.forEach(record => {
      const key = record[config.xAxis] || 'Unknown'
      const keyStr = String(key)

      if (!grouped[keyStr]) {
        grouped[keyStr] = {
          name: keyStr,
          count: 0,
          records: []
        }
        config.yAxis.forEach(field => {
          grouped[keyStr][field] = 0
        })
      }

      grouped[keyStr].count += 1
      grouped[keyStr].records.push(record)

      config.yAxis.forEach(field => {
        const value = record[field] || 0
        if (config.aggregation === 'sum') {
          grouped[keyStr][field] += Number(value) || 0
        } else if (config.aggregation === 'count') {
          grouped[keyStr][field] = grouped[keyStr].count
        } else if (config.aggregation === 'avg') {
          grouped[keyStr][field] = (grouped[keyStr][field] * (grouped[keyStr].count - 1) + (Number(value) || 0)) / grouped[keyStr].count
        } else if (config.aggregation === 'max') {
          grouped[keyStr][field] = Math.max(grouped[keyStr][field], Number(value) || 0)
        } else if (config.aggregation === 'min') {
          grouped[keyStr][field] = grouped[keyStr].count === 1 ? (Number(value) || 0) : Math.min(grouped[keyStr][field], Number(value) || 0)
        }
      })
    })

    return Object.values(grouped).slice(0, 8) // Limit for preview
  }

  const previewData = processPreviewData()

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

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'paidamount' || name.toLowerCase().includes('amount')) {
      return [formatCurrency(Number(value)), name]
    }
    return [formatNumber(Number(value)), name]
  }

  const renderLivePreview = () => {
    if (previewData.length === 0) {
      return (
        <div className="h-48 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <div className="text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Configure axes to see preview</p>
          </div>
        </div>
      )
    }

    switch (config.type) {
      case 'bar':
        return (
          <div className="h-48 bg-white dark:bg-gray-800 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={previewData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={formatTooltipValue} />
                {config.showLegend && (
                  <Legend
                    verticalAlign={config.legendVerticalAlign as any}
                    align={config.legendAlign as any}
                    wrapperStyle={{
                      paddingTop: config.legendPosition === 'top' ? '0px' : '10px',
                      paddingBottom: config.legendPosition === 'bottom' ? '0px' : '10px'
                    }}
                    formatter={(value) => config.customLegendNames[value] || getFieldDisplayName(value)}
                  />
                )}
                {config.yAxis.map((field, index) => (
                  <Bar
                    key={field}
                    dataKey={field}
                    fill={config.colors[index % config.colors.length]}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )

      case 'line':
        return (
          <div className="h-48 bg-white dark:bg-gray-800 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={previewData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={formatTooltipValue} />
                {config.showLegend && (
                  <Legend
                    verticalAlign={config.legendVerticalAlign as any}
                    align={config.legendAlign as any}
                    wrapperStyle={{
                      paddingTop: config.legendPosition === 'top' ? '0px' : '10px',
                      paddingBottom: config.legendPosition === 'bottom' ? '0px' : '10px'
                    }}
                    formatter={(value) => config.customLegendNames[value] || getFieldDisplayName(value)}
                  />
                )}
                {config.yAxis.map((field, index) => (
                  <Line
                    key={field}
                    type="monotone"
                    dataKey={field}
                    stroke={config.colors[index % config.colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )

      case 'area':
        return (
          <div className="h-48 bg-white dark:bg-gray-800 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={previewData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={formatTooltipValue} />
                {config.showLegend && (
                  <Legend
                    verticalAlign={config.legendVerticalAlign as any}
                    align={config.legendAlign as any}
                    wrapperStyle={{
                      paddingTop: config.legendPosition === 'top' ? '0px' : '10px',
                      paddingBottom: config.legendPosition === 'bottom' ? '0px' : '10px'
                    }}
                    formatter={(value) => config.customLegendNames[value] || getFieldDisplayName(value)}
                  />
                )}
                {config.yAxis.map((field, index) => (
                  <Area
                    key={field}
                    type="monotone"
                    dataKey={field}
                    stackId="1"
                    stroke={config.colors[index % config.colors.length]}
                    fill={config.colors[index % config.colors.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )

      case 'pie':
        const pieData = previewData.map(item => ({
          name: item.name,
          value: item[config.yAxis[0]] || 0
        }))
        return (
          <div className="h-48 bg-white dark:bg-gray-800 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip formatter={formatTooltipValue} />
                {config.showLegend && (
                  <Legend
                    verticalAlign={config.legendVerticalAlign as any}
                    align={config.legendAlign as any}
                    wrapperStyle={{
                      paddingTop: config.legendPosition === 'top' ? '0px' : '10px',
                      paddingBottom: config.legendPosition === 'bottom' ? '0px' : '10px'
                    }}
                    formatter={(value) => config.customLegendNames[value] || getFieldDisplayName(value)}
                  />
                )}
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={config.colors[index % config.colors.length]}
                    />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Chart Configuration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure your chart like a pivot table with dynamic variables
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[70vh]">
          {/* Left Panel - Configuration */}
          <div className="w-2/3 p-6 overflow-y-auto space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Basic Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter chart title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHART_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setConfig(prev => ({ ...prev, type: type.value as any }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          config.type === type.value
                            ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                        }`}
                        title={type.description}
                      >
                        <type.icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Configuration (Pivot Style) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-green-600" />
                Data Configuration (Pivot Table Style)
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* X-Axis (Categories) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    X-Axis (Categories/Rows)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    {categoricalFields.map((field) => (
                      <label key={field} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <input
                          type="radio"
                          name="xAxis"
                          checked={config.xAxis === field}
                          onChange={() => setConfig(prev => ({ ...prev, xAxis: field }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          {getFieldIcon(field)}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getFieldDisplayName(field)}
                          </span>
                        </div>
                      </label>
                    ))}
                    {dateFields.map((field) => (
                      <label key={field} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <input
                          type="radio"
                          name="xAxis"
                          checked={config.xAxis === field}
                          onChange={() => setConfig(prev => ({ ...prev, xAxis: field }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          {getFieldIcon(field)}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getFieldDisplayName(field)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Y-Axis (Values) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Y-Axis (Values/Columns)
                  </label>
                  
                  {/* Selected Fields */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected Variables:</div>
                    <div className="flex flex-wrap gap-2">
                      {config.yAxis.map((field) => (
                        <span
                          key={field}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {getFieldIcon(field)}
                          <span className="ml-1">{getFieldDisplayName(field)}</span>
                          <button
                            onClick={() => removeYAxisField(field)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Available Fields */}
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    {numericFields.map((field) => (
                      <button
                        key={field}
                        onClick={() => addYAxisField(field)}
                        className={`w-full flex items-center space-x-3 p-2 rounded transition-colors ${
                          config.yAxis.includes(field)
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                        disabled={config.yAxis.includes(field)}
                      >
                        <div className="flex items-center space-x-2">
                          {getFieldIcon(field)}
                          <span className="text-sm font-medium">
                            {getFieldDisplayName(field)}
                          </span>
                        </div>
                        {config.yAxis.includes(field) && (
                          <span className="text-xs">✓ Selected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aggregation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Aggregation Method
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AGGREGATION_TYPES.map((agg) => (
                    <button
                      key={agg.value}
                      onClick={() => setConfig(prev => ({ ...prev, aggregation: agg.value as any }))}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        config.aggregation === agg.value
                          ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-800 dark:text-green-200'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:hover:bg-green-900/20'
                      }`}
                      title={agg.description}
                    >
                      <div className="text-sm font-medium">{agg.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{agg.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-600" />
                Display Options
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* General Options */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.showLegend}
                      onChange={(e) => setConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Legend</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.showGrid}
                      onChange={(e) => setConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Grid Lines</span>
                  </label>
                </div>

                {/* Color Palette */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Color Palette
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {COLOR_PALETTES.map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() => setConfig(prev => ({ ...prev, colors: palette.colors }))}
                        className="w-full flex items-center space-x-3 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex space-x-1">
                          {palette.colors.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {palette.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend Configuration */}
            {config.showLegend && (
              <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                  Legend Configuration
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Legend Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {LEGEND_POSITIONS.map((position) => (
                        <button
                          key={position.value}
                          onClick={() => setConfig(prev => ({ ...prev, legendPosition: position.value as any }))}
                          className={`p-2 rounded-lg border-2 transition-all text-center ${
                            config.legendPosition === position.value
                              ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          <div className="text-lg mb-1">{position.icon}</div>
                          <div className="text-xs font-medium">{position.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Legend Alignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Horizontal Align
                    </label>
                    <div className="space-y-2">
                      {LEGEND_ALIGN_OPTIONS.map((align) => (
                        <button
                          key={align.value}
                          onClick={() => setConfig(prev => ({ ...prev, legendAlign: align.value as any }))}
                          className={`w-full p-2 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                            config.legendAlign === align.value
                              ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          <span className="text-lg">{align.icon}</span>
                          <span className="text-sm font-medium">{align.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vertical Alignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Vertical Align
                    </label>
                    <div className="space-y-2">
                      {LEGEND_VERTICAL_ALIGN_OPTIONS.map((align) => (
                        <button
                          key={align.value}
                          onClick={() => setConfig(prev => ({ ...prev, legendVerticalAlign: align.value as any }))}
                          className={`w-full p-2 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                            config.legendVerticalAlign === align.value
                              ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          <span className="text-lg">{align.icon}</span>
                          <span className="text-sm font-medium">{align.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Legend Names */}
                {config.yAxis.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Custom Legend Names
                    </label>
                    <div className="space-y-3">
                      {config.yAxis.map((field) => (
                        <div key={field} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 flex-1">
                            {getFieldIcon(field)}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
                              {getFieldDisplayName(field)}:
                            </span>
                          </div>
                          <input
                            type="text"
                            value={config.customLegendNames[field] || ''}
                            onChange={(e) => updateCustomLegendName(field, e.target.value)}
                            placeholder={`Default: ${getFieldDisplayName(field)}`}
                            className="flex-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Live Preview
            </h3>
            
            <div className="space-y-4">
              {/* Live Chart Preview */}
              {renderLivePreview()}

              {/* Configuration Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Configuration Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">X-Axis:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {config.xAxis ? getFieldDisplayName(config.xAxis) : 'Not selected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Y-Axis:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {config.yAxis.length > 0 ? `${config.yAxis.length} variable(s)` : 'None selected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Aggregation:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {config.aggregation}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chart Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {config.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation */}
              <div className="space-y-2">
                {!config.xAxis && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Please select X-Axis variable</span>
                  </div>
                )}
                {config.yAxis.length === 0 && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Please select at least one Y-Axis variable</span>
                  </div>
                )}
                {config.xAxis && config.yAxis.length > 0 && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Configuration is valid</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!config.xAxis || config.yAxis.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  )
}
