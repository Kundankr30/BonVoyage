import { useState } from 'react'
import { Settings, AlertCircle, TrendingDown, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { mockCargoEnquiries } from '@/data/mockData'
import { formatCurrency, formatNumber, getRiskColor } from '@/lib/utils'

export default function CharterOptimizer() {
  const [selectedCargo, setSelectedCargo] = useState('')
  const [recommendation, setRecommendation] = useState<any>(null)

  const generateRecommendation = () => {
    // Mock recommendation
    setRecommendation({
      action: 'Wait',
      waitDays: 12,
      recommendedVessel: 'Panamax',
      currentFreight: 24.8,
      expectedFreight: 22.9,
      savings: 152000,
      totalCost: 2740000,
      risk: 'Medium',
      confidence: 84,
      comparison: [
        {
          option: 'Charter Now - Panamax',
          freight: 24.8,
          totalCost: 2892000,
          savings: 0,
          score: 72,
        },
        {
          option: 'Wait 10-14 Days - Panamax',
          freight: 22.9,
          totalCost: 2740000,
          savings: 152000,
          score: 94,
        },
        {
          option: 'Charter Now - Supramax',
          freight: 26.2,
          totalCost: 3048000,
          savings: -156000,
          score: 65,
        },
      ],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Charter Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          AI-powered charter timing and vessel selection optimization
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Optimization Parameters
          </CardTitle>
          <CardDescription>Select cargo to optimize charter decision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedCargo} onValueChange={setSelectedCargo}>
              <SelectTrigger>
                <SelectValue placeholder="Select cargo enquiry" />
              </SelectTrigger>
              <SelectContent>
                {mockCargoEnquiries.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.id.toUpperCase()} - {cargo.cargoType} {formatNumber(cargo.quantity)} MT
                    ({cargo.origin} → {cargo.destination})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generateRecommendation} disabled={!selectedCargo}>
              Optimize Charter
            </Button>
          </div>
        </CardContent>
      </Card>

      {recommendation && (
        <>
          {/* Recommendation */}
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                Recommended Option
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recommended Action
                    </label>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {recommendation.action.toUpperCase()}
                    </div>
                    {recommendation.waitDays && (
                      <p className="text-lg text-gray-700 dark:text-gray-300 mt-1">
                        {recommendation.waitDays} Days
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recommended Vessel Type
                    </label>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      {recommendation.recommendedVessel}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Route
                    </label>
                    <div className="text-lg text-gray-900 dark:text-gray-100 mt-1">
                      Newcastle → Paradip
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Expected Freight Rate
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(recommendation.expectedFreight)}/MT
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                      <TrendingDown className="w-4 h-4" />
                      {formatCurrency(recommendation.currentFreight - recommendation.expectedFreight)} lower than current
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Estimated Total Cost
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(recommendation.totalCost / 1000000, 'USD')}M
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Estimated Savings
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(recommendation.savings)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      vs chartering now
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Risk Level
                  </label>
                  <div className="mt-1">
                    <Badge className={getRiskColor(recommendation.risk)}>
                      {recommendation.risk}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Confidence
                  </label>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {recommendation.confidence}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Option Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Option Comparison</CardTitle>
              <CardDescription>All evaluated charter options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendation.comparison.map((option: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      option.score >= 90
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {option.option}
                          </div>
                          {option.score >= 90 && (
                            <Badge className="bg-green-600 text-white">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Freight:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(option.freight)}/MT
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(option.totalCost / 1000000, 'USD')}M
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Savings:</span>
                            <span className={`ml-2 font-medium ${
                              option.savings > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {option.savings > 0 ? '+' : ''}{formatCurrency(option.savings)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Score:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                              {option.score}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Market analysis indicates freight rates will decline over the next 10-14 days.
                    Waiting for this period could result in significant cost savings of approximately
                    {' '}{formatCurrency(recommendation.savings)}.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {recommendation.recommendedVessel} vessels show optimal capacity fit and availability
                    for your cargo requirements. Current vessel supply in this segment is adequate.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Risk level is {recommendation.risk.toLowerCase()} - market volatility exists but
                    forecast confidence is high. Monitor daily for any significant market shifts.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!recommendation && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Select a cargo enquiry to generate charter optimization recommendation
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
