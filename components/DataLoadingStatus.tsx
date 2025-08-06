'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react'

interface DataLoadingStatusProps {
  totalRecords: number
  isLoading: boolean
  error?: string
}

export default function DataLoadingStatus({ totalRecords, isLoading, error }: DataLoadingStatusProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (!isLoading) {
      setLastUpdate(new Date())
    }
  }, [isLoading, totalRecords])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estado de la Base de Datos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Carga de registros de Google Sheets
            </p>
          </div>
        </div>
        
        {isLoading && (
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Estado de Carga */}
        <div className={`p-3 rounded-lg border ${
          isLoading 
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
            : error 
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
              : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
        }`}>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            ) : error ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            <span className={`text-sm font-medium ${
              isLoading 
                ? 'text-blue-700 dark:text-blue-300'
                : error 
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-green-700 dark:text-green-300'
            }`}>
              {isLoading ? 'Cargando...' : error ? 'Error' : 'Completado'}
            </span>
          </div>
        </div>

        {/* Total de Registros */}
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalRecords.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Registros Cargados
            </div>
          </div>
        </div>

        {/* Última Actualización */}
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Última Actualización
            </div>
          </div>
        </div>
      </div>

      {/* Información de Dataset Grande */}
      {totalRecords > 1000 && !isLoading && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-700">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-700 dark:text-yellow-300">
                Dataset Grande Detectado
              </div>
              <div className="text-yellow-600 dark:text-yellow-400 mt-1">
                Se han cargado {totalRecords.toLocaleString()} registros. 
                {totalRecords >= 6000 && " ✅ Objetivo de 6000+ registros alcanzado."}
                {totalRecords < 6000 && " ⚠️ Esperaban 6000+ registros."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-700">
          <div className="text-sm text-red-700 dark:text-red-300">
            <div className="font-medium">Error al cargar datos:</div>
            <div className="mt-1">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}
