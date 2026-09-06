import { cn, formatCurrency, formatNumber, formatPercentage, getTrendColor } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon?: React.ElementType
  format?: 'currency' | 'number' | 'percentage' | 'none'
  currency?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  format = 'none',
  currency = 'USD',
}: StatCardProps) {
  const formattedValue = (() => {
    if (typeof value === 'string') return value
    switch (format) {
      case 'currency':
        return formatCurrency(value, currency)
      case 'number':
        return formatNumber(value)
      case 'percentage':
        return formatPercentage(value)
      default:
        return value.toString()
    }
  })()

  const TrendIcon = trend
    ? trend > 0
      ? TrendingUp
      : trend < 0
      ? TrendingDown
      : Minus
    : null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm tracking-normal font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
              {formattedValue}
            </p>
            {subtitle && (
              <span className="text-xs font-light text-gray-500 dark:text-gray-400">
                {subtitle}
              </span>
            )}
          </div>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span className={cn('text-sm font-medium', getTrendColor(trend))}>
                {formatPercentage(trend)}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        )}
      </div>
    </div>
  )
}
