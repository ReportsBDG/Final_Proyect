# 🗂️ Integración con Google Sheets - Dashboard Dental Analytics

## ✅ Estado de la Integración

La integración con Google Sheets ha sido **completamente implementada** y está lista para usar. El proyecto ahora puede conectarse directamente a la base de datos de Google Sheets y mostrar datos en tiempo real.

## 🚀 Características Implementadas

### ✅ Conexión con Google Sheets
- **URL del Google Apps Script**: Configurada y funcional
- **Proxy API**: Implementado para evitar problemas de CORS
- **Manejo de errores**: Sistema robusto de fallback a datos de ejemplo
- **Reintentos automáticos**: 3 intentos con backoff exponencial

### ✅ Procesamiento de Datos
- **Validación de datos**: Verificación de integridad de registros
- **Transformación**: Mapeo correcto de campos de Google Sheets
- **Cache**: Sistema de caché de 5 minutos para optimizar rendimiento

### ✅ Interfaz de Usuario
- **Dashboard principal**: Actualizado para usar datos reales
- **Página de prueba**: `/test-google-sheets` para verificar conexión
- **Estados de carga**: Indicadores visuales durante la carga
- **Manejo de errores**: Interfaz amigable para errores de conexión

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `lib/google-script.ts` - Configuración y funciones de Google Script
- `app/api/proxy/route.ts` - Proxy API para evitar CORS
- `components/GoogleSheetsTest.tsx` - Componente de prueba
- `app/test-google-sheets/page.tsx` - Página de prueba

### Archivos Modificados
- `services/dataService.ts` - Integrado con nueva configuración
- `app/page.tsx` - Actualizado para usar datos reales
- `package.json` - Dependencias adicionales instaladas

## 🔧 Configuración

### Variables de Entorno (Opcional)
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Google Script URL (opcional, ya está hardcodeado)
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbz-hSsHHk5lcYtRc_XLC20hV24XneVFSLbrm-MuYnaJYqWHJZ75JjU1E6GtCe6oF6yQ/exec

# Builder.io API Key (si lo usas)
NEXT_PUBLIC_BUILDER_API_KEY=1a331b8efe624f48afd153f0f950ca1b
```

### Dependencias Instaladas
```bash
npm install clsx tailwind-merge class-variance-authority
```

## 🧪 Cómo Probar la Integración

### 1. Página de Prueba
Visita `http://localhost:3002/test-google-sheets` para verificar la conexión:

- ✅ Muestra estado de conexión en tiempo real
- ✅ Lista todos los registros de Google Sheets
- ✅ Estadísticas de datos (total, pagados, pendientes, denegados)
- ✅ Información de debug para troubleshooting

### 2. Dashboard Principal
Visita `http://localhost:3002` para ver el dashboard con datos reales:

- ✅ Métricas calculadas desde Google Sheets
- ✅ Tabla de registros con datos reales
- ✅ Filtros funcionando con datos reales
- ✅ Gráficos actualizados con datos reales

## 📊 Estructura de Datos

### Campos Principales (Requeridos)
```typescript
interface PatientRecord {
  timestamp: string;           // Fecha y hora del registro
  insurancecarrier: string;    // Compañía de seguros
  offices: string;            // Oficina dental
  patientname: string;        // Nombre del paciente
  paidamount: number;         // Monto pagado
  claimstatus: string;        // Estado de la reclamación
}
```

### Campos Opcionales
```typescript
  typeofinteraction?: string;  // Tipo de procedimiento
  patientdob?: string;        // Fecha de nacimiento
  dos?: string;               // Fecha de servicio
  productivityamount?: number; // Monto de productividad
  missingdocsorinformation?: string; // Documentos faltantes
  howweproceeded?: string;    // Cómo se procedió
  escalatedto?: string;       // A quién se escaló
  commentsreasons?: string;   // Comentarios y razones
  emailaddress?: string;      // Email del paciente
  status?: string;            // Estado adicional
  timestampbyinteraction?: string; // Timestamp de interacción
```

## 🔄 Flujo de Datos

1. **Cliente** → Solicita datos al dashboard
2. **Dashboard** → Llama a `dataService.fetchPatientRecords()`
3. **DataService** → Usa `fetchFromGoogleScript()` de `lib/google-script.ts`
4. **Google Script** → Se conecta a Google Sheets vía proxy API
5. **Proxy API** → Hace la petición HTTP a Google Apps Script
6. **Google Apps Script** → Retorna datos de la hoja de cálculo
7. **Datos** → Se procesan, validan y transforman
8. **UI** → Se actualiza con datos reales

## 🛠️ Solución de Problemas

### Error de CORS
- ✅ **Solución**: Proxy API implementado en `/api/proxy`
- **Verificar**: Que el archivo `app/api/proxy/route.ts` existe

### Datos no cargan
- ✅ **Solución**: Sistema de fallback a datos de ejemplo
- **Verificar**: Consola del navegador para errores específicos
- **Probar**: Página `/test-google-sheets` para diagnóstico

### Errores de TypeScript
- ✅ **Solución**: Tipos actualizados en `types/index.ts`
- **Verificar**: Que todas las dependencias estén instaladas

### Conexión lenta
- ✅ **Solución**: Cache de 5 minutos implementado
- **Optimización**: Reintentos con backoff exponencial

## 📈 Métricas Disponibles

### Dashboard Principal
- **Total Revenue**: Suma de todos los montos pagados
- **Claims Processed**: Total de registros procesados
- **Average Claim**: Promedio de montos por claim
- **Active Offices**: Número de oficinas activas
- **Today's Claims**: Claims del día actual
- **System Status**: Estado del sistema

### Filtros Disponibles
- **Global Search**: Búsqueda por nombre o email
- **Office Filter**: Filtro por oficina específica
- **Status Filter**: Filtro por estado de claim
- **Date Range**: Filtro por rango de fechas

## 🎯 Próximos Pasos

### Funcionalidades Adicionales (Opcionales)
1. **Actualización en tiempo real**: WebSockets para datos en vivo
2. **Exportación directa**: Exportar a Excel/PDF desde Google Sheets
3. **Notificaciones**: Alertas cuando hay nuevos registros
4. **Dashboard personalizable**: Configuración de widgets por usuario

### Optimizaciones
1. **Paginación**: Para grandes volúmenes de datos
2. **Búsqueda avanzada**: Filtros más sofisticados
3. **Gráficos interactivos**: Más tipos de visualizaciones
4. **Modo offline**: Cache local para uso sin conexión

## 📞 Soporte

Si encuentras problemas:

1. **Verifica la conexión**: Usa `/test-google-sheets`
2. **Revisa la consola**: Errores en Developer Tools
3. **Verifica la URL**: Google Script URL en `lib/google-script.ts`
4. **Reinicia el servidor**: `npm run dev`

## ✅ Resumen

La integración está **100% funcional** y lista para producción. El dashboard ahora:

- ✅ Se conecta automáticamente a Google Sheets
- ✅ Muestra datos reales en tiempo real
- ✅ Maneja errores graciosamente
- ✅ Proporciona fallback a datos de ejemplo
- ✅ Incluye sistema de caché para optimización
- ✅ Tiene interfaz de prueba para diagnóstico

**¡La integración está completa y funcionando! 🎉** 