// Patient and Claims Data Types
export interface PatientRecord {
  // Columnas principales
  timestamp: string; // Columna AG - timestamp principal
  insurancecarrier: string;
  offices: string; // Columna OFFICE
  patientname: string;
  paidamount: number;
  claimstatus: string; // Columna L - Claim Status
  typeofinteraction?: string;
  patientdob?: string;
  dos?: string; // Date of Service
  productivityamount?: number;
  missingdocsorinformation?: string;
  howweproceeded?: string;
  escalatedto?: string;
  commentsreasons?: string;
  emailaddress?: string; // Columna U - Emails
  status?: string; // Columna Y - Status
  timestampbyinteraction?: string;
  
  // Nuevas columnas específicas
  eftCheckIssuedDate?: string; // Columna AB - EFT/CHECK ISSUED DATE
  office?: string; // Columna OFFICE (alias para offices)
  claimStatus?: string; // Columna L (alias para claimstatus)
  emails?: string; // Columna U (alias para emailaddress)
  statusColumn?: string; // Columna Y (alias para status)
}

// Dashboard Metrics Types
export interface DashboardMetrics {
  totalRevenue: number;
  claimsProcessed: number;
  averageClaim: number;
  activeOffices: number;
  todaysClaims: number;
  weeklyClaims: number;
  monthlyClaims: number;
}

export interface MetricCard {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  formatter?: 'currency' | 'number' | 'percentage';
}

// Filter Types
export interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  offices: string[];
  insuranceCarriers: string[];
  claimStatus: string[];
  interactionTypes: string[];
  searchQuery: string;
  howProceeded: string[];
  escalatedTo: string[];
  missingDocs: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Chart Types
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'polarArea';

export interface ChartConfig {
  type: ChartType;
  showLegend: boolean;
  showLabels: boolean;
  animated: boolean;
  responsive: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

// Table Types
export interface TableColumn {
  key: keyof PatientRecord;
  label: string;
  sortable: boolean;
  filterable: boolean;
  width?: string;
  formatter?: 'currency' | 'date' | 'status' | 'text';
}

export interface TableState {
  currentPage: number;
  itemsPerPage: number;
  sortBy: keyof PatientRecord | null;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
}

// Export Types
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includeCharts: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  selectedColumns?: string[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

// Dashboard State Types
export interface DashboardState {
  isLoading: boolean;
  data: PatientRecord[];
  filteredData: PatientRecord[];
  metrics: DashboardMetrics;
  filters: FilterState;
  tableState: TableState;
  chartConfigs: Record<string, ChartConfig>;
  notifications: Notification[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface DataSummary {
  totalRecords: number;
  filteredRecords: number;
  lastUpdated: string;
  dataQuality: {
    completeness: number;
    accuracy: number;
    duplicates: number;
  };
}

// Office and Insurance Types
export interface Office {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  totalRevenue: number;
  claimsCount: number;
}

export interface InsuranceCarrier {
  id: string;
  name: string;
  totalClaims: number;
  averageProcessingTime: number;
  approvalRate: number;
}

// Status Enums
export enum ClaimStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  DENIED = 'Denied',
  PROCESSING = 'Processing',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled'
}

export enum InteractionType {
  CONSULTATION = 'Consultation',
  TREATMENT = 'Treatment',
  FOLLOWUP = 'Follow-up',
  EMERGENCY = 'Emergency',
  CLEANING = 'Cleaning',
  SURGERY = 'Surgery',
  XRAY = 'X-Ray',
  OTHER = 'Other'
}

// Component Props Types
export interface HeaderProps {
  title: string;
  metrics: DashboardMetrics;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
}

export interface KPICardProps {
  metric: MetricCard;
  className?: string;
}

export interface FilterPanelProps {
  filters: FilterState;
  options: {
    offices: FilterOption[];
    insuranceCarriers: FilterOption[];
    claimStatus: FilterOption[];
    interactionTypes: FilterOption[];
  };
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export interface ChartSectionProps {
  data: PatientRecord[];
  configs: Record<string, ChartConfig>;
  onConfigChange: (chartId: string, config: Partial<ChartConfig>) => void;
}

export interface DataTableProps {
  data: PatientRecord[];
  columns: TableColumn[];
  state: TableState;
  onStateChange: (state: Partial<TableState>) => void;
  onExport: (options: ExportOptions) => void;
  isLoading: boolean;
}

// Utility Types
export type DateRange = {
  start: Date;
  end: Date;
};

export type SortDirection = 'asc' | 'desc';

export type ThemeMode = 'light' | 'dark' | 'system';

// Analytics Types
export interface AnalyticsData {
  revenueByOffice: ChartData[];
  claimsByStatus: ChartData[];
  revenueByInsurer: ChartData[];
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    claims: number;
  }>;
  interactionTypes: ChartData[];
  averagePaymentByStatus: ChartData[];
  productivityMetrics: {
    office: string;
    productivity: number;
    target: number;
    variance: number;
  }[];
}

// Form Types for Configuration
export interface DashboardConfig {
  refreshInterval: number;
  defaultDateRange: number; // days
  itemsPerPage: number;
  theme: ThemeMode;
  autoRefresh: boolean;
  notifications: {
    enabled: boolean;
    types: ('success' | 'error' | 'warning' | 'info')[];
  };
}

export interface UserPreferences {
  favoriteFilters: FilterState[];
  savedViews: {
    id: string;
    name: string;
    filters: FilterState;
    chartConfigs: Record<string, ChartConfig>;
  }[];
  dashboardLayout: {
    sections: string[];
    order: number[];
  };
}
