import { Ship } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function VesselDetail() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Vessel Details
        </h1>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Ship className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Vessel detail page - coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
