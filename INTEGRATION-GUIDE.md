# 🚀 Guía de Integración - Dashboard Dental Analytics

## 📋 Información del Proyecto Original
- **Proyecto**: Bays Dental Analytics Dashboard
- **Framework**: Next.js 14 + TypeScript
- **Base de Datos**: Google Sheets (Google Apps Script)
- **API Key**: `1a331b8efe624f48afd153f0f950ca1b` (Builder.io)

---

## 🔗 Datos de Conexión con Google Sheets

### URL del Google Apps Script
```
https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec
```

### Estructura de Datos Completa
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
  dos?: string
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

---

## 📁 Archivos Necesarios para la Integración

### 1. Configuración de Google Script (`lib/google-script.ts`)
```typescript
// Configuración para Google Apps Script
export const GOOGLE_SCRIPT_CONFIG = {
  url: "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec",
  timeout: 10000,
  retries: 3,
  useProxy: true,
  useFallbackData: false
}

// Tipos de respuesta esperados
export interface GoogleScriptResponse {
  success: boolean
  data?: any[]
  error?: string
  message?: string
}

// Datos de ejemplo para desarrollo
const fallbackData = [
  {
    timestamp: "2024-01-15T10:30:00Z",
    insurancecarrier: "Delta Dental",
    offices: "Downtown Office",
    patientname: "John Smith",
    paidamount: 150.00,
    claimstatus: "Paid",
    typeofinteraction: "Cleaning",
    patientdob: "1985-03-15",
    dos: "2024-01-10",
    productivityamount: 200.00,
    status: "Completed"
  },
  {
    timestamp: "2024-01-15T11:15:00Z",
    insurancecarrier: "Aetna",
    offices: "Uptown Office",
    patientname: "Sarah Johnson",
    paidamount: 300.00,
    claimstatus: "Pending",
    typeofinteraction: "Root Canal",
    patientdob: "1990-07-22",
    dos: "2024-01-12",
    productivityamount: 450.00,
    status: "In Progress"
  },
  {
    timestamp: "2024-01-15T12:00:00Z",
    insurancecarrier: "Cigna",
    offices: "Downtown Office",
    patientname: "Mike Davis",
    paidamount: 75.00,
    claimstatus: "Denied",
    typeofinteraction: "Checkup",
    patientdob: "1978-11-08",
    dos: "2024-01-08",
    productivityamount: 100.00,
    status: "Needs Review"
  }
]

// Función principal para obtener datos
export async function fetchFromGoogleScript(): Promise<any[]> {
  const { url, timeout, retries, useFallbackData, useProxy } = GOOGLE_SCRIPT_CONFIG
  
  if (useFallbackData) {
    console.log('Usando datos de ejemplo (modo de desarrollo)')
    return fallbackData
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const fetchUrl = useProxy ? '/api/proxy' : url
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(timeout)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return processData(data.data || data)
      
    } catch (error) {
      console.error(`Intento ${attempt} falló:`, error)
      
      if (attempt === retries) {
        console.log('Usando datos de respaldo debido a errores de conexión')
        return fallbackData
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  
  return fallbackData
}

// Procesar datos recibidos
function processData(data: any[]): any[] {
  return data.map(item => ({
    timestamp: item.timestamp || item.Timestamp,
    insurancecarrier: item.insurancecarrier || item.Carrier,
    offices: item.offices || item.Office,
    patientname: item.patientname || item.Patient,
    paidamount: parseFloat(item.paidamount || item.PaidAmount || 0),
    claimstatus: item.claimstatus || item.Status,
    typeofinteraction: item.typeofinteraction || item.Type,
    patientdob: item.patientdob || item.DOB,
    dos: item.dos || item.DOS,
    productivityamount: parseFloat(item.productivityamount || item.ProductivityAmount || 0),
    missingdocsorinformation: item.missingdocsorinformation || item.MissingDocs,
    howweproceeded: item.howweproceeded || item.HowProceeded,
    escalatedto: item.escalatedto || item.EscalatedTo,
    commentsreasons: item.commentsreasons || item.Comments,
    emailaddress: item.emailaddress || item.Email,
    status: item.status || item.Status,
    timestampbyinteraction: item.timestampbyinteraction || item.TimestampByInteraction
  }))
}

// Validar datos de pacientes
export function validatePatientData(data: any[]): boolean {
  return Array.isArray(data) && data.length > 0 && 
         data.every(item => item.patientname && item.offices)
}
```

### 2. Proxy API (`app/api/proxy/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = "https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec"
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en proxy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets' }, 
      { status: 500 }
    )
  }
}
```

### 3. Dependencias (`package.json`)
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "recharts": "^2.8.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
```

### 4. Configuración de Tailwind (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
}
```

### 5. Estilos Globales (`app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
}
```

---

## 🛠️ Pasos de Integración

### Paso 1: Instalar Dependencias
```bash
npm install recharts lucide-react date-fns clsx tailwind-merge class-variance-authority
npm install -D tailwindcss autoprefixer postcss
```

### Paso 2: Configurar Tailwind
```bash
npx tailwindcss init -p
```

### Paso 3: Crear Archivos de Configuración
1. Crear `lib/google-script.ts`
2. Crear `app/api/proxy/route.ts`
3. Actualizar `tailwind.config.js`
4. Actualizar `app/globals.css`

### Paso 4: Implementar en Componente Principal
```typescript
"use client"

import { useEffect, useState } from 'react'
import { fetchFromGoogleScript, validatePatientData } from '@/lib/google-script'

export default function DashboardPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const patientData = await fetchFromGoogleScript()
        
        if (validatePatientData(patientData)) {
          setData(patientData)
        } else {
          setError('Datos inválidos recibidos')
        }
      } catch (err) {
        setError('Error al cargar datos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Dashboard Dental Analytics</h1>
      <p>Total de registros: {data.length}</p>
      {/* Aquí implementar tus componentes */}
    </div>
  )
}
```

---

## 📊 Datos de Ejemplo Disponibles

### Campos Principales:
- **timestamp**: Fecha y hora del registro
- **insurancecarrier**: Compañía de seguros
- **offices**: Oficina dental
- **patientname**: Nombre del paciente
- **paidamount**: Monto pagado
- **claimstatus**: Estado de la reclamación
- **typeofinteraction**: Tipo de procedimiento

### Campos Opcionales:
- **patientdob**: Fecha de nacimiento
- **dos**: Fecha de servicio
- **productivityamount**: Monto de productividad
- **missingdocsorinformation**: Documentos faltantes
- **howweproceeded**: Cómo se procedió
- **escalatedto**: A quién se escaló
- **commentsreasons**: Comentarios y razones
- **emailaddress**: Email del paciente
- **status**: Estado adicional
- **timestampbyinteraction**: Timestamp de interacción

---

## 🔧 Configuraciones Adicionales

### Para Builder.io (si lo usas):
```env
NEXT_PUBLIC_BUILDER_API_KEY=1a331b8efe624f48afd153f0f950ca1b
```

### Variables de Entorno (.env.local):
```env
# Google Script URL (opcional, ya está hardcodeado)
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec
```

---

## 🚨 Solución de Problemas

### Error de CORS:
- El proxy API ya está configurado para evitar problemas de CORS
- Si persiste, verificar que el archivo `/api/proxy/route.ts` esté en la ubicación correcta

### Datos no cargan:
- Verificar la URL del Google Script
- Revisar la consola del navegador para errores
- Los datos de respaldo se cargarán automáticamente si hay problemas

### Errores de TypeScript:
- Asegurar que todas las dependencias estén instaladas
- Verificar que los tipos estén correctamente definidos

---

## 📞 Soporte

Si necesitas ayuda con la integración:
1. Verificar que todos los archivos estén en las ubicaciones correctas
2. Revisar la consola del navegador para errores
3. Confirmar que las dependencias estén instaladas
4. Verificar la conectividad con Google Sheets

---

**¡Listo para integrar! 🎉** 