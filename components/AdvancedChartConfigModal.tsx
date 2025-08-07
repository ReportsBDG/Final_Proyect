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
  Mail,
  Palette,
  Eye,
  EyeOff,
  Grid3x3,
  Zap,
  Filter,
  TrendingDown,
  RotateCw
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
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ComposedChart,
  ReferenceLine
} from 'recharts'

interface AdvancedChartConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: AdvancedChartConfiguration) => void
  currentChart: any
  data: any[]
}

interface AdvancedChartConfiguration {
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
  { value: 'radar', label: 'Radar Chart', icon: Target, description: 'Compare multiple variables' }
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
  { name: 'Professional', type: 'categorical', colors: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'] },
  { name: 'Corporate Blue', type: 'sequential', colors: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'] },
  { name: 'Success Green', type: 'sequential', colors: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669'] },
  { name: 'Warning Orange', type: 'sequential', colors: ['#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#dc2626'] },
  { name: 'Modern Gradient', type: 'diverging', colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'] },
  { name: 'PowerBI Style', type: 'categorical', colors: ['#118dff', '#12239e', '#e66c37', '#6b007b', '#e044a7', '#744ec2'] }
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

export default function AdvancedChartConfigModal({ isOpen, onClose, onSave, currentChart, data }: AdvancedChartConfigModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [config, setConfig] = useState<AdvancedChartConfiguration>({
    title: currentChart?.title || 'New Advanced Chart',
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
    height: 400,
    margin: {
      top: 20,
      right: 30,
      bottom: 50,
      left: 60
    }
  })

  // Memoize field calculations
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

  useEffect(() => {
    if (currentChart) {
      setConfig(prev => ({
        ...prev,
        ...currentChart
      }))
    }
  }, [currentChart])

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

  const addReferenceLineField = () => {
    setConfig(prev => ({
      ...prev,
      referenceLines: [
        ...(prev.referenceLines || []),
        {
          value: 0,
          label: 'Reference Line',
          color: '#ef4444',
          style: 'dashed',
          axis: 'y'
        }
      ]
    }))
  }

  const removeReferenceLine = (index: number) => {
    setConfig(prev => ({
      ...prev,
      referenceLines: prev.referenceLines?.filter((_, i) => i !== index) || []
    }))
  }

  // Process data for charts
  const processChartData = () => {
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

    return Object.values(grouped).slice(0, 10) // Limit for preview
  }

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'paidamount' || name.toLowerCase().includes('amount')) {
      return [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)), name]
    }
    return [new Intl.NumberFormat('en-US').format(Number(value)), name]
  }

  // Render chart based on type
  const renderChart = () => {
    const chartData = processChartData()

    if (chartData.length === 0) {
      return (
        <div className="h-64 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure chart to see preview</p>
          </div>
        </div>
      )
    }

    const commonProps = {
      width: '100%',
      height: config.height || 300,
      data: chartData,
      margin: config.margin
    }

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              {config.yAxis.map((field, index) => (
                <Bar
                  key={field}
                  dataKey={field}
                  fill={config.colors[index % config.colors.length]}
                  radius={config.borderRadius || 0}
                  opacity={config.opacity || 1}
                  name={config.customLegendNames[field] || getFieldDisplayName(field)}
                />
              ))}
              {config.referenceLines?.map((line, index) => (
                <ReferenceLine
                  key={index}
                  y={line.value}
                  stroke={line.color}
                  strokeDasharray={line.style === 'dashed' ? '5 5' : undefined}
                  label={line.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              {config.yAxis.map((field, index) => (
                <Line
                  key={field}
                  type={config.subType === 'smooth' ? 'monotone' : config.subType === 'step' ? 'step' : 'linear'}
                  dataKey={field}
                  stroke={config.colors[index % config.colors.length]}
                  strokeWidth={config.borderWidth || 2}
                  opacity={config.opacity || 1}
                  name={config.customLegendNames[field] || getFieldDisplayName(field)}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              {config.yAxis.map((field, index) => (
                <Area
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stackId={config.subType === 'stacked' ? '1' : undefined}
                  stroke={config.colors[index % config.colors.length]}
                  fill={config.colors[index % config.colors.length]}
                  fillOpacity={config.opacity || 0.6}
                  name={config.customLegendNames[field] || getFieldDisplayName(field)}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = chartData.map(item => ({
          name: item.name,
          value: item[config.yAxis[0]] || 0
        }))
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={config.showDataLabels}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={config.colors[index % config.colors.length]}
                    opacity={config.opacity || 1}
                  />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={chartData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              {config.yAxis.map((field, index) => (
                <Scatter
                  key={field}
                  dataKey={field}
                  fill={config.colors[index % config.colors.length]}
                  opacity={config.opacity || 1}
                  name={config.customLegendNames[field] || getFieldDisplayName(field)}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        )

      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              {config.yAxis.map((field, index) => (
                <Radar
                  key={field}
                  dataKey={field}
                  stroke={config.colors[index % config.colors.length]}
                  fill={config.colors[index % config.colors.length]}
                  fillOpacity={config.opacity || 0.3}
                  name={config.customLegendNames[field] || getFieldDisplayName(field)}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        )

      case 'treemap':
        const treemapData = chartData.map(item => ({
          name: item.name,
          size: item[config.yAxis[0]] || 0,
          value: item[config.yAxis[0]] || 0
        }))
        return (
          <ResponsiveContainer {...commonProps}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill={config.colors[0]}
            />
          </ResponsiveContainer>
        )

      case 'waterfall':
      case 'funnel':
        // Para estos tipos de chart, usaremos un bar chart con styling especial
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              {config.yAxis.map((field, index) => (
                <Bar
                  key={field}
                  dataKey={field}
                  fill={config.colors[index % config.colors.length]}
                  opacity={config.opacity || 1}
                  name={config.customLegendNames[field] || getFieldDisplayName(field)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'bubble':
        // Para bubble chart, usamos scatter con tamaño variable
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={chartData}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              {config.showLegend && <Legend />}
              {config.yAxis.map((field, index) => (
                <Scatter
                  key={field}
                  dataKey={field}
                  fill={config.colors[index % config.colors.length]}
                  opacity={config.opacity || 0.7}
                  name={config.customLegendNames[field] || getFieldDisplayName(field)}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="h-64 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <div className="text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Chart type not implemented</p>
            </div>
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Advanced Chart Configuration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PowerBI-style chart builder with advanced customization options
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
        <div className="flex h-[80vh]">
          {/* Left Panel - Configuration */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {/* Tabs Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {[
                { id: 'basic', label: 'Basic', icon: Settings },
                { id: 'data', label: 'Data', icon: Database },
                { id: 'style', label: 'Style', icon: Palette },
                { id: 'advanced', label: 'Advanced', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* BASIC TAB */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Title and Subtitle */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Chart Information
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
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
                          Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={config.subtitle || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter subtitle..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chart Type */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Chart Type
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {CHART_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setConfig(prev => ({ ...prev, type: type.value as any }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            config.type === type.value
                              ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                          }`}
                          title={type.description}
                        >
                          <type.icon className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>

                    {/* Sub Type */}
                    {CHART_SUBTYPES[config.type as keyof typeof CHART_SUBTYPES] && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Chart Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {CHART_SUBTYPES[config.type as keyof typeof CHART_SUBTYPES].map((subType) => (
                            <button
                              key={subType.value}
                              onClick={() => setConfig(prev => ({ ...prev, subType: subType.value as any }))}
                              className={`p-2 rounded border-2 transition-all text-center ${
                                config.subType === subType.value
                                  ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                              }`}
                              title={subType.description}
                            >
                              <div className="text-sm font-medium">{subType.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Orientation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Orientation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'vertical', label: 'Vertical' },
                          { value: 'horizontal', label: 'Horizontal' }
                        ].map((orientation) => (
                          <button
                            key={orientation.value}
                            onClick={() => setConfig(prev => ({ ...prev, orientation: orientation.value as any }))}
                            className={`p-2 rounded border-2 transition-all text-center ${
                              config.orientation === orientation.value
                                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                            }`}
                          >
                            <div className="text-sm font-medium">{orientation.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chart Dimensions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Dimensions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          value={config.height}
                          onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          min="200"
                          max="800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DATA TAB */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Data Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Database className="w-5 h-5 mr-2 text-green-600" />
                      Data Configuration
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* X-Axis (Categories) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          X-Axis (Categories)
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
                        </div>
                      </div>

                      {/* Y-Axis (Values) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Y-Axis (Values)
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
                      <div className="grid grid-cols-4 gap-2">
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
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STYLE TAB */}
              {activeTab === 'style' && (
                <div className="space-y-6">
                  {/* Colors and Appearance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Palette className="w-5 h-5 mr-2 text-purple-600" />
                      Colors & Appearance
                    </h3>
                    
                    {/* Color Schemes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Color Scheme
                      </label>
                      <div className="space-y-2">
                        {COLOR_SCHEMES.map((scheme) => (
                          <button
                            key={scheme.name}
                            onClick={() => setConfig(prev => ({ ...prev, colors: scheme.colors, colorScheme: scheme.type as any }))}
                            className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex space-x-1">
                              {scheme.colors.slice(0, 6).map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {scheme.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Style Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Opacity
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={config.opacity}
                          onChange={(e) => setConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">{Math.round((config.opacity || 1) * 100)}%</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Border Width
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="1"
                          value={config.borderWidth}
                          onChange={(e) => setConfig(prev => ({ ...prev, borderWidth: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">{config.borderWidth}px</div>
                      </div>
                    </div>

                    {/* Style Toggles */}
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.gradientFill || false}
                          onChange={(e) => setConfig(prev => ({ ...prev, gradientFill: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gradient Fill</span>
                      </label>
                    </div>
                  </div>

                  {/* Legend Configuration */}
                  <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-blue-600" />
                      Legend Configuration
                    </h3>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={config.showLegend}
                        onChange={(e) => setConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Legend</span>
                    </label>

                    {config.showLegend && (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Legend Position */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Position
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            {LEGEND_POSITIONS.slice(0, 4).map((position) => (
                              <button
                                key={position.value}
                                onClick={() => setConfig(prev => ({ ...prev, legendPosition: position.value as any }))}
                                className={`p-2 rounded border-2 transition-all text-center text-sm ${
                                  config.legendPosition === position.value
                                    ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                                }`}
                              >
                                <div className="text-lg">{position.icon}</div>
                                <div className="text-xs">{position.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Legend Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Size
                          </label>
                          <div className="space-y-1">
                            {[
                              { value: 'small', label: 'Small' },
                              { value: 'medium', label: 'Medium' },
                              { value: 'large', label: 'Large' }
                            ].map((size) => (
                              <button
                                key={size.value}
                                onClick={() => setConfig(prev => ({ ...prev, legendSize: size.value as any }))}
                                className={`w-full p-2 rounded border-2 transition-all text-sm ${
                                  config.legendSize === size.value
                                    ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20'
                                }`}
                              >
                                {size.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Legend Names */}
                    {config.showLegend && config.yAxis.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Custom Legend Names
                        </label>
                        <div className="space-y-2">
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

                  {/* Grid and Axes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Grid3x3 className="w-5 h-5 mr-2 text-gray-600" />
                      Grid & Axes
                    </h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.showGrid}
                          onChange={(e) => setConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Grid Lines</span>
                      </label>

                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={config.showXAxisLabel}
                            onChange={(e) => setConfig(prev => ({ ...prev, showXAxisLabel: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">X-Axis Label</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={config.showYAxisLabel}
                            onChange={(e) => setConfig(prev => ({ ...prev, showYAxisLabel: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Y-Axis Label</span>
                        </label>
                      </div>

                      {config.showXAxisLabel && (
                        <input
                          type="text"
                          value={config.xAxisLabel || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, xAxisLabel: e.target.value }))}
                          placeholder="X-Axis Label"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      )}

                      {config.showYAxisLabel && (
                        <input
                          type="text"
                          value={config.yAxisLabel || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, yAxisLabel: e.target.value }))}
                          placeholder="Y-Axis Label"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ADVANCED TAB */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  {/* Data Labels */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Target className="w-5 h-5 mr-2 text-orange-600" />
                      Data Labels & Tooltips
                    </h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.showDataLabels}
                          onChange={(e) => setConfig(prev => ({ ...prev, showDataLabels: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Data Labels</span>
                      </label>

                      {config.showDataLabels && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Label Position
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {DATA_LABEL_POSITIONS.map((position) => (
                              <button
                                key={position.value}
                                onClick={() => setConfig(prev => ({ ...prev, dataLabelPosition: position.value as any }))}
                                className={`p-2 rounded border-2 transition-all text-center ${
                                  config.dataLabelPosition === position.value
                                    ? 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-800 dark:text-orange-200'
                                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 dark:border-gray-600 dark:hover:bg-orange-900/20'
                                }`}
                              >
                                <div className="text-lg">{position.icon}</div>
                                <div className="text-xs">{position.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.showTooltips}
                          onChange={(e) => setConfig(prev => ({ ...prev, showTooltips: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Tooltips</span>
                      </label>

                      {config.showTooltips && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tooltip Format
                          </label>
                          <select
                            value={config.tooltipFormat}
                            onChange={(e) => setConfig(prev => ({ ...prev, tooltipFormat: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            {TOOLTIP_FORMATS.map((format) => (
                              <option key={format.value} value={format.value}>
                                {format.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactivity */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <RotateCw className="w-5 h-5 mr-2 text-green-600" />
                      Interactivity
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.enableZoom}
                          onChange={(e) => setConfig(prev => ({ ...prev, enableZoom: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Zoom</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.enablePan}
                          onChange={(e) => setConfig(prev => ({ ...prev, enablePan: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Pan</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.enableBrush}
                          onChange={(e) => setConfig(prev => ({ ...prev, enableBrush: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Brush</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.enableCrosshair}
                          onChange={(e) => setConfig(prev => ({ ...prev, enableCrosshair: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Crosshair</span>
                      </label>
                    </div>
                  </div>

                  {/* Animations */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                      Animations
                    </h3>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={config.enableAnimations}
                        onChange={(e) => setConfig(prev => ({ ...prev, enableAnimations: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Animations</span>
                    </label>

                    {config.enableAnimations && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duration (ms)
                          </label>
                          <input
                            type="range"
                            min="100"
                            max="3000"
                            step="100"
                            value={config.animationDuration}
                            onChange={(e) => setConfig(prev => ({ ...prev, animationDuration: parseInt(e.target.value) }))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 mt-1">{config.animationDuration}ms</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Animation Type
                          </label>
                          <select
                            value={config.animationType}
                            onChange={(e) => setConfig(prev => ({ ...prev, animationType: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            {ANIMATION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reference Lines */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                      Reference Lines
                    </h3>
                    
                    <button
                      onClick={addReferenceLineField}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Add Reference Line
                    </button>

                    {config.referenceLines && config.referenceLines.length > 0 && (
                      <div className="space-y-3">
                        {config.referenceLines.map((line, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <input
                              type="number"
                              value={line.value}
                              onChange={(e) => {
                                const newLines = [...(config.referenceLines || [])]
                                newLines[index] = { ...line, value: parseFloat(e.target.value) }
                                setConfig(prev => ({ ...prev, referenceLines: newLines }))
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                              placeholder="Value"
                            />
                            <input
                              type="text"
                              value={line.label || ''}
                              onChange={(e) => {
                                const newLines = [...(config.referenceLines || [])]
                                newLines[index] = { ...line, label: e.target.value }
                                setConfig(prev => ({ ...prev, referenceLines: newLines }))
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                              placeholder="Label"
                            />
                            <button
                              onClick={() => removeReferenceLine(index)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Live Preview
            </h3>
            
            <div className="space-y-4">
              {/* Live Chart Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                {renderChart()}
              </div>

              {/* Configuration Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Configuration Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {config.type} {config.subType && `(${config.subType})`}
                    </span>
                  </div>
                  
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
                    <span className="text-gray-600 dark:text-gray-400">Height:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {config.height}px
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

              {/* PowerBI Features Badge */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg">
                <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  PowerBI-Style Features
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 px-2 py-1 rounded">
                    Advanced Charts
                  </span>
                  <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                    Interactive Features
                  </span>
                  <span className="text-xs bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200 px-2 py-1 rounded">
                    Custom Styling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Advanced chart configuration with {CHART_TYPES.length} chart types and {COLOR_SCHEMES.length} color schemes
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!config.xAxis || config.yAxis.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Advanced Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
