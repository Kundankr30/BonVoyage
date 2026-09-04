import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    // Indian numbering system (crores, lakhs)
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`
    } else {
      return `₹${amount.toLocaleString('en-IN')}`
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function getTrendColor(trend: number): string {
  if (trend > 0) return 'text-red-600 dark:text-red-400'
  if (trend < 0) return 'text-green-600 dark:text-green-400'
  return 'text-gray-600 dark:text-gray-400'
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Matched': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Chartered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Available': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'At Sea': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'In Port': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Under Maintenance': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Idle': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Valid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Expiring Soon': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Expired': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return priorityColors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export function getRiskColor(risk: string): string {
  const riskColors: Record<string, string> = {
    'Low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Very High': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return riskColors[risk] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export function getCongestionColor(level: string): string {
  const congestionColors: Record<string, string> = {
    'Low': 'text-green-600 dark:text-green-400',
    'Medium': 'text-yellow-600 dark:text-yellow-400',
    'High': 'text-orange-600 dark:text-orange-400',
    'Very High': 'text-red-600 dark:text-red-400',
  }
  return congestionColors[level] || 'text-gray-600 dark:text-gray-400'
}

export function calculateDaysBetween(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getDaysUntil(date: string): number {
  const targetDate = new Date(date)
  const today = new Date()
  const diffTime = targetDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 dark:text-green-400'
  if (score >= 75) return 'text-blue-600 dark:text-blue-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-orange-600 dark:text-orange-400'
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return 'Very High'
  if (confidence >= 75) return 'High'
  if (confidence >= 60) return 'Medium'
  return 'Low'
}
