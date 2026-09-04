import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'

// Pages
import Dashboard from './pages/Dashboard'
import CargoEnquiries from './pages/CargoEnquiries'
import CargoDetail from './pages/CargoDetail'
import VesselEnquiries from './pages/VesselEnquiries'
import TonnageSearch from './pages/TonnageSearch'
import Vessels from './pages/Vessels'
import VesselDetail from './pages/VesselDetail'
import LiveMap from './pages/LiveMap'
import VoyageDistance from './pages/VoyageDistance'
import VoyageEstimator from './pages/VoyageEstimator'
import FreightForecast from './pages/FreightForecast'
import MarketIntelligence from './pages/MarketIntelligence'
import CharterOptimizer from './pages/CharterOptimizer'
import VesselRecommendation from './pages/VesselRecommendation'
import Ports from './pages/Ports'
import PortDetail from './pages/PortDetail'
import Fleet from './pages/Fleet'
import Certificates from './pages/Certificates'
import FleetCalendar from './pages/FleetCalendar'
import Marketplace from './pages/Marketplace'
import Alerts from './pages/Alerts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className={isDark ? 'dark' : ''}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div
              className={`transition-all duration-300 ${
                sidebarCollapsed ? 'ml-16' : 'ml-64'
              }`}
            >
              <Topbar onThemeToggle={toggleTheme} isDark={isDark} />
              <main className="p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/marketplace" element={<Marketplace />} />

                  <Route path="/enquiries/cargo" element={<CargoEnquiries />} />
                  <Route path="/enquiries/cargo/:id" element={<CargoDetail />} />
                  <Route path="/enquiries/vessel" element={<VesselEnquiries />} />

                  <Route path="/tonnage/search" element={<TonnageSearch />} />
                  <Route path="/vessels" element={<Vessels />} />
                  <Route path="/vessels/:id" element={<VesselDetail />} />
                  <Route path="/map" element={<LiveMap />} />

                  <Route path="/voyage/distance" element={<VoyageDistance />} />
                  <Route path="/voyage/estimator" element={<VoyageEstimator />} />

                  <Route path="/forecast" element={<FreightForecast />} />
                  <Route path="/market-intelligence" element={<MarketIntelligence />} />

                  <Route path="/optimization/charter" element={<CharterOptimizer />} />
                  <Route path="/optimization/vessels" element={<VesselRecommendation />} />

                  <Route path="/fleet" element={<Fleet />} />
                  <Route path="/fleet/certificates" element={<Certificates />} />
                  <Route path="/fleet/calendar" element={<FleetCalendar />} />

                  <Route path="/ports" element={<Ports />} />
                  <Route path="/ports/:id" element={<PortDetail />} />

                  <Route path="/alerts" element={<Alerts />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
