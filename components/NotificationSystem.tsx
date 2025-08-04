'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Notification } from '@/types'

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
}

const NotificationItem = ({ notification, onRemove }: NotificationItemProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto-close if specified
    if (notification.autoClose && notification.duration) {
      const autoCloseTimer = setTimeout(() => {
        handleRemove()
      }, notification.duration)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(autoCloseTimer)
      }
    }
    
    return () => clearTimeout(timer)
  }, [notification.autoClose, notification.duration])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getTypeClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100'
    }
  }

  const getIconColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-500 dark:text-green-400'
      case 'error':
        return 'text-red-500 dark:text-red-400'
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400'
      default:
        return 'text-blue-500 dark:text-blue-400'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
        border rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full
        ${getTypeClasses()}
      `}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {notification.title}
          </h3>
          <p className="text-sm mt-1 opacity-90">
            {notification.message}
          </p>
          <p className="text-xs mt-2 opacity-70">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar for auto-close */}
      {notification.autoClose && notification.duration && (
        <div className="mt-3 w-full bg-black bg-opacity-20 rounded-full h-1">
          <div 
            className="bg-current h-1 rounded-full transition-all duration-100 ease-linear"
            style={{
              animation: `shrink ${notification.duration}ms linear`,
              width: '100%'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  if (notifications.length === 0) return null

  return (
    <>
      {/* Overlay for mobile */}
      {notifications.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10" />
        </div>
      )}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-h-screen overflow-hidden">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={onRemove}
            />
          ))}
        </div>
        
        {/* Clear All Button */}
        {notifications.length > 1 && (
          <button
            onClick={() => notifications.forEach(n => onRemove(n.id))}
            className="w-full px-3 py-2 text-sm bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Clear All ({notifications.length})
          </button>
        )}
      </div>
      
      {/* CSS for animation */}
      <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  )
}
