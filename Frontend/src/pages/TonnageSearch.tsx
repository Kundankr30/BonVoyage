// Stub pages - to be expanded
import { Ship } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function TonnageSearch() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Tonnage Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Advanced vessel search and filtering
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Ship className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Tonnage search functionality - coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
