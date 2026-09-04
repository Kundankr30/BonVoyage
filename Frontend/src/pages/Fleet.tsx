import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Fleet() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Fleet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Fleet management and operations
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Fleet management - coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
