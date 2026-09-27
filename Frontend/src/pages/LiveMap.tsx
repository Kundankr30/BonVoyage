import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ship, Anchor, AlertCircle, Layers } from 'lucide-react'
import { api } from '@/lib/api'
import { formatNumber, getStatusColor, getCongestionColor } from '@/lib/utils'
import type { Vessel, Port } from '@/types'

// Custom ship icon
const shipIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA3OGQ0IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTIxIDEwaC00VjRoLTR2Nkg5VjRINXY2SDFzMyA1IDExIDVjOCAwIDExLTUgMTEtNXoiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// Custom port icon
const portIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZWY0NDQ0IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

function MapControls({ 
  showVessels, setShowVessels, 
  showPorts, setShowPorts,
  showRoutes, setShowRoutes
}: {
  showVessels: boolean; setShowVessels: (v: boolean) => void;
  showPorts: boolean; setShowPorts: (v: boolean) => void;
  showRoutes: boolean; setShowRoutes: (v: boolean) => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Map Layers
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showVessels}
              onChange={(e) => setShowVessels(e.target.checked)}
              className="rounded"
            />
            <Ship className="w-4 h-4" />
            Vessels
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showPorts}
              onChange={(e) => setShowPorts(e.target.checked)}
              className="rounded"
            />
            <Anchor className="w-4 h-4" />
            Ports
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="rounded"
            />
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
            Trade Routes
          </label>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LiveMap() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [selectedPort, setSelectedPort] = useState<Port | null>(null)
  
  const [showVessels, setShowVessels] = useState(true)
  const [showPorts, setShowPorts] = useState(true)
  const [showRoutes, setShowRoutes] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vesselsData, portsData] = await Promise.all([
          api.getVesselPositions(),
          api.getPorts(),
        ])
        
        // Add random coordinates to vessels for demonstration on the map
        // since DB doesn't track live GPS positions
        const vesselsWithLocation = vesselsData.map((v: any, index: number) => ({
          ...v,
          currentLocation: {
            // Spawn strictly in the ocean (Bay of Bengal / Andaman Sea)
            lat: 5 + (Math.random() * 10),    // Lat: 5 to 15
            lng: 85 + (Math.random() * 10),   // Lng: 85 to 95
            name: 'At Sea'
          }
        }))
        
        setVessels(vesselsWithLocation)
        setPorts(portsData)
      } catch (err) {
        console.error('Failed to fetch map data:', err)
      }
    }
    fetchData()
  }, [])

  // Sample route from Newcastle to Paradip
  const sampleRoute = [
    [-32.9283, 151.7817], // Newcastle
    [-35.0, 140.0],
    [-30.0, 120.0],
    [-20.0, 105.0],
    [-10.0, 95.0],
    [5.0, 88.0],
    [15.0, 85.0],
    [20.2961, 85.8245], // Paradip
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Live Maritime Map
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time vessel positions, ports, and shipping routes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            {vessels.length} Vessels Tracked
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            {ports.length} Ports
          </Badge>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[calc(100vh-16rem)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <MapControls 
          showVessels={showVessels} setShowVessels={setShowVessels}
          showPorts={showPorts} setShowPorts={setShowPorts}
          showRoutes={showRoutes} setShowRoutes={setShowRoutes}
        />
        <MapContainer
          center={[10, 90]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Vessels */}
          {showVessels && vessels.map((vessel) => (
            vessel.currentLocation && (
              <Marker
                key={vessel.id}
                position={[vessel.currentLocation.lat, vessel.currentLocation.lng]}
                icon={shipIcon}
                eventHandlers={{
                  click: () => setSelectedVessel(vessel),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <Ship className="w-4 h-4" />
                      {vessel.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{vessel.type}</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Speed:</span>
                        <span className="font-medium">{vessel.speed} kn</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Destination:</span>
                        <span className="font-medium">{vessel.destination || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status:</span>
                        <Badge className={getStatusColor(vessel.status)}>
                          {vessel.status}
                        </Badge>
                      </div>
                      {vessel.eta && (
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-gray-500">ETA:</span>
                          <span className="font-medium">
                            {new Date(vessel.eta).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Ports */}
          {showPorts && ports.map((port) => (
            <Marker
              key={port.id}
              position={[port.location.lat, port.location.lng]}
              icon={portIcon}
              eventHandlers={{
                click: () => setSelectedPort(port),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-lg mb-2">
                    {port.name}, {port.country}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Max Draft:</span> {port.maxDraft}m
                    </div>
                    <div>
                      <span className="font-medium">Max Vessel:</span>{' '}
                      {formatNumber(port.maxVesselSize)} DWT
                    </div>
                    <div>
                      <span className="font-medium">Berths:</span> {port.berths}
                    </div>
                    <div>
                      <span className="font-medium">Congestion:</span>{' '}
                      <span className={getCongestionColor(port.congestion)}>
                        {port.congestion}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Avg Wait:</span>{' '}
                      {port.averageWaitingTime}h
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Sample Route */}
          {showRoutes && (
            <Polyline
              positions={sampleRoute as [number, number][]}
              pathOptions={{
                color: '#0ea5e9',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10',
              }}
            />
          )}
        </MapContainer>

        
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-blue-600" />
              <span>Vessel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Port</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-blue-500" />
              <span>Route</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>High Congestion</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
