# Dental Analytics Dashboard

A comprehensive, professional dashboard for dental clinics to manage patient data, insurance claims, and financial analytics. Built with modern web technologies for optimal performance and user experience.

![Dashboard Preview](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Dental+Analytics+Dashboard)

## 🚀 Features

### 📊 Dashboard Overview
- **Real-time KPI Cards**: Total revenue, claims processed, average claims, active offices
- **Quick Stats Header**: Live metrics with trend indicators and system status
- **Professional Medical UI**: Clean, modern interface designed for healthcare professionals

### 🔍 Advanced Filtering System
- **Date Range Filtering**: Custom date selection with quick presets
- **Multi-select Filters**: Offices, insurance carriers, claim status, interaction types
- **Global Search**: Search across patient names, emails, and comments
- **Advanced Filters**: How proceeded, escalated to, missing documents
- **Filter State Management**: Active filter counter and quick clear options

### 📈 Interactive Analytics Charts
- **Multiple Chart Types**: Bar, line, pie, doughnut, area, and polar area charts
- **Configurable Displays**: Toggle legends, labels, and animations
- **Real-time Data**: Claims distribution, revenue by office, insurance performance
- **Trend Analysis**: Monthly revenue and claims trends
- **Treatment Analytics**: Interaction types and average payments

### 📋 Comprehensive Data Table
- **Advanced Sorting**: Multi-column sorting with visual indicators
- **Pagination**: Configurable items per page (10, 25, 50, 100)
- **Column Management**: Show/hide columns based on user preferences
- **Row Selection**: Single and bulk selection with actions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📤 Export Functionality
- **Excel Export**: Full data export with multiple sheets (data, summary, analytics)
- **PDF Reports**: Professional reports with charts, metrics, and data tables
- **CSV Export**: Simple comma-separated values for data analysis
- **Customizable Options**: Select columns, date ranges, and include charts

### 🔄 Google Apps Script Integration
- **Real-time Data Sync**: Direct connection to Google Sheets via Apps Script
- **Error Handling**: Comprehensive error management with fallback to demo data
- **Data Validation**: Client-side validation with server-side integrity checks
- **Caching System**: Intelligent caching for improved performance

### 🎨 User Experience
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Responsive Design**: Fully responsive across all device sizes
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Notifications**: Toast notifications for actions, errors, and confirmations
- **Loading States**: Skeleton loaders and progress indicators

## 🛠 Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom medical theme
- **Charts**: Recharts for interactive data visualization
- **Icons**: Lucide React for consistent iconography
- **Exports**: XLSX, jsPDF, html2canvas for data export
- **Date Handling**: date-fns for date manipulation
- **State Management**: React hooks with optimized re-renders

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Google Apps Script deployment (optional, falls back to demo data)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dental-analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Google Apps Script URL:
   ```env
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## 🔗 Google Apps Script Integration

### Script Setup

1. **Create a new Google Apps Script project**
2. **Set up your Google Sheet** with the following columns:
   - timestamp, insurancecarrier, offices, patientname, paidamount
   - claimstatus, typeofinteraction, patientdob, dos, productivityamount
   - missingdocsorinformation, howweproceeded, escalatedto
   - commentsreasons, emailaddress, status, timestampbyinteraction

3. **Deploy the script** as a web app with execute permissions for "Anyone"

### Sample Google Apps Script Code

```javascript
function doGet(e) {
  const action = e.parameter.action || 'getAllRecords';
  
  switch (action) {
    case 'getAllRecords':
      return getAllRecords();
    case 'getFilteredRecords':
      return getFilteredRecords(e.parameter);
    case 'ping':
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    default:
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllRecords() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const records = data.slice(1).map(row => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  });
  
  return ContentService.createTextOutput(JSON.stringify(records))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 📊 Data Structure

### Patient Record Interface
```typescript
interface PatientRecord {
  timestamp: string
  insurancecarrier: string
  offices: string
  patientname: string
  paidamount: number
  claimstatus: string
  typeofinteraction?: string
  patientdob?: string
  dos?: string // Date of Service
  productivityamount?: number
  missingdocsorinformation?: string
  howweproceeded?: string
  escalatedto?: string
  commentsreasons?: string
  emailaddress?: string
  status?: string
  timestampbyinteraction?: string
}
```

## 🎯 Key Performance Indicators (KPIs)

### Financial Metrics
- **Total Revenue**: Sum of all paid amounts
- **Average Claim**: Mean payment per claim
- **Collection Rate**: Percentage of successful collections

### Operational Metrics
- **Claims Processed**: Total number of processed claims
- **Active Offices**: Number of operational office locations
- **Processing Time**: Average time from submission to resolution

### Time-based Metrics
- **Today's Claims**: Claims submitted today
- **Weekly Claims**: Claims from the past 7 days
- **Monthly Claims**: Claims from the current month

## 🔧 Configuration

### Dashboard Settings
- **Refresh Interval**: Auto-refresh data every N seconds
- **Default Date Range**: Initial date range for filters
- **Items Per Page**: Default pagination size
- **Theme Preference**: Light, dark, or system theme

### Export Options
- **Default Format**: CSV, Excel, or PDF
- **Include Charts**: Whether to include visualizations in exports
- **Column Selection**: Which columns to include in exports
- **Date Range**: Filter exports by date range

## 📱 Responsive Design

### Desktop (1024px+)
- Full sidebar navigation
- Multi-column chart layout
- Extended data table with all columns
- Advanced filtering options

### Tablet (768px - 1023px)
- Collapsible sidebar
- Two-column chart layout
- Condensed data table
- Touch-optimized controls

### Mobile (< 768px)
- Bottom navigation
- Single-column layout
- Card-based data display
- Swipe gestures for navigation

## 🔒 Security & Privacy

### Data Protection
- **Client-side Processing**: All calculations performed in browser
- **Secure Connections**: HTTPS required for production
- **No Data Storage**: No patient data stored on servers
- **HIPAA Compliance**: Designed with healthcare privacy in mind

### Access Control
- **Role-based Permissions**: Different access levels for staff roles
- **Session Management**: Secure session handling
- **Audit Logging**: Track user actions and data access

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=your-production-script-url
NEXT_PUBLIC_APP_NAME="Your Clinic Name - Analytics"
NEXT_PUBLIC_API_TIMEOUT=30000
```

### Recommended Hosting
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Easy deployment with continuous integration
- **AWS**: Enterprise-grade hosting with custom domains

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **TypeScript**: All code must be typed
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is enforced
- **Responsive**: All features must work on mobile devices

## 📞 Support

### Documentation
- **API Reference**: Complete API documentation
- **Component Library**: Reusable component documentation
- **Deployment Guide**: Step-by-step deployment instructions

### Getting Help
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Community discussions and questions
- **Email Support**: Direct support for implementation help

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 About

Designed specifically for dental practices to streamline operations, improve patient care, and enhance financial performance through data-driven insights. The dashboard provides real-time visibility into practice performance while maintaining the highest standards of data security and user experience.

### Key Benefits
- **Operational Efficiency**: Reduce administrative overhead
- **Financial Visibility**: Real-time revenue and claim tracking
- **Data-Driven Decisions**: Comprehensive analytics and reporting
- **Staff Productivity**: Intuitive interface reduces training time
- **Patient Satisfaction**: Faster claim processing and resolution

---

**Built with ❤️ for the dental community**
