import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function FleetCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Calendar
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Maritime operations calendar
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Calendar view - coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
