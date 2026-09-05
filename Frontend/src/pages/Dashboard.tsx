import { useState, useEffect } from 'react'
import { StatCard } from '@/components/layout/StatCard'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Ship,
  Package,
  Anchor,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockDashboardSummary } from '@/data/mockData'
import { formatCurrency, formatNumber, getStatusColor, getPriorityColor } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [data, setData] = useState(mockDashboardSummary)

  useEffect(() => {
    // In production, fetch from API
    setData(mockDashboardSummary)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          DASHBOARD
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Executive overview of freight and vessel operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Freight"
          value={data.kpis.currentFreight}
          format="currency"
          subtitle="per MT"
          icon={DollarSign}
        />
        <StatCard
          title="7-Day Forecast"
          value={data.kpis.forecastFreight}
          format="currency"
          subtitle="per MT"
          trend={data.kpis.freightTrend}
          icon={TrendingUp}
        />
        <StatCard
          title="Available Vessels"
          value={data.kpis.availableVessels}
          format="number"
          icon={Ship}
        />
        <StatCard
          title="Estimated Savings"
          value={data.kpis.estimatedSavings}
          format="currency"
          currency="INR"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Cargo Enquiries"
          value={data.kpis.activeCargoEnquiries}
          icon={Package}
        />
        <StatCard
          title="Active Vessel Enquiries"
          value={data.kpis.activeVesselEnquiries}
          icon={Ship}
        />
        <StatCard
          title="Port Congestion Index"
          value={data.kpis.portCongestionIndex}
          icon={Anchor}
        />
        <StatCard
          title="Freight Trend"
          value={data.kpis.freightTrend}
          format="percentage"
          trend={data.kpis.freightTrend}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Freight History & Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Freight Rate Trend & Forecast</CardTitle>
            <CardDescription>
              Historical rates with 3-week forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.charts.freightHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any) => [`$${value}/MT`, 'Freight']}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Market Summary</CardTitle>
            <CardDescription>Key market indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.marketSummary.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            AI-powered recommendations based on market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {action.title}
                    </h4>
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                  {action.potentialSaving && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
                      Potential Saving: {formatCurrency(action.potentialSaving)}
                    </p>
                  )}
                </div>
                {action.actionUrl && (
                  <Link to={action.actionUrl}>
                    <Button size="sm">View</Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cargo Enquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Cargo Enquiries</CardTitle>
                <CardDescription>Recent cargo requirements</CardDescription>
              </div>
              <Link to="/enquiries/cargo">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activeEnquiries.cargo.map((cargo) => (
                <Link
                  key={cargo.id}
                  to={`/enquiries/cargo/${cargo.id}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {cargo.cargoType} - {formatNumber(cargo.quantity)} MT
                    </div>
                    <Badge className={getStatusColor(cargo.status)}>
                      {cargo.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {cargo.origin} → {cargo.destination}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Laycan: {new Date(cargo.laycanStart).toLocaleDateString()} - {new Date(cargo.laycanEnd).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vessel Enquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Vessel Enquiries</CardTitle>
                <CardDescription>Available vessel positions</CardDescription>
              </div>
              <Link to="/enquiries/vessel">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activeEnquiries.vessel.map((vessel) => (
                <div
                  key={vessel.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {vessel.vesselName}
                    </div>
                    <Badge className={getStatusColor(vessel.status)}>
                      {vessel.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {vessel.vesselType} - {formatNumber(vessel.dwt)} DWT
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Open: {new Date(vessel.openDate).toLocaleDateString()} at {vessel.openPort}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
