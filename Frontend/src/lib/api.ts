import type {
  Vessel,
  Port,
  CargoEnquiry,
  VesselEnquiry,
  Voyage,
  VoyageEstimate,
  FreightForecast,
  MarketData,
  CharterRecommendation,
  VesselRecommendation,
  DashboardSummary,
  Alert,
  Certificate,
  CalendarEvent,
  MarketplaceItem,
  Route,
} from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request('/api/dashboard/summary')
  }

  // Vessels
  async getVessels(params?: Record<string, any>): Promise<Vessel[]> {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/vessels${query ? `?${query}` : ''}`)
  }

  async getVessel(id: string): Promise<Vessel> {
    return this.request(`/api/vessels/${id}`)
  }

  async getVesselPositions(): Promise<Vessel[]> {
    return this.request('/api/vessels/positions')
  }

  // Cargo Enquiries
  async getCargoEnquiries(params?: Record<string, any>): Promise<CargoEnquiry[]> {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/cargo-enquiries${query ? `?${query}` : ''}`)
  }

  async getCargoEnquiry(id: string): Promise<CargoEnquiry> {
    return this.request(`/api/cargo-enquiries/${id}`)
  }

  async createCargoEnquiry(data: Partial<CargoEnquiry>): Promise<CargoEnquiry> {
    return this.request('/api/cargo-enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCargoEnquiry(id: string, data: Partial<CargoEnquiry>): Promise<CargoEnquiry> {
    return this.request(`/api/cargo-enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Vessel Enquiries
  async getVesselEnquiries(params?: Record<string, any>): Promise<VesselEnquiry[]> {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/vessel-enquiries${query ? `?${query}` : ''}`)
  }

  async createVesselEnquiry(data: Partial<VesselEnquiry>): Promise<VesselEnquiry> {
    return this.request('/api/vessel-enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Ports
  async getPorts(): Promise<Port[]> {
    return this.request('/api/ports')
  }

  async getPort(id: string): Promise<Port> {
    return this.request(`/api/ports/${id}`)
  }

  // Voyage
  async calculateDistance(origin: string, destination: string, vesselType?: string): Promise<Route> {
    return this.request('/api/voyage/distance', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, vesselType }),
    })
  }

  async estimateVoyage(data: any): Promise<VoyageEstimate> {
    return this.request('/api/voyage/estimate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Forecast
  async getFreightForecast(params: {
    commodity: string
    origin: string
    destination: string
    vesselType: string
    horizon: string
  }): Promise<FreightForecast> {
    return this.request('/api/forecast', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // Market
  async getMarketData(): Promise<MarketData> {
    return this.request('/api/market')
  }

  // Optimization
  async getCharterRecommendation(cargoId: string, params?: any): Promise<CharterRecommendation> {
    return this.request('/api/optimization/charter', {
      method: 'POST',
      body: JSON.stringify({ cargoId, ...params }),
    })
  }

  async getVesselRecommendations(cargoId: string): Promise<VesselRecommendation> {
    return this.request('/api/optimization/vessels', {
      method: 'POST',
      body: JSON.stringify({ cargoId }),
    })
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.request('/api/alerts')
  }

  async markAlertRead(id: string): Promise<void> {
    return this.request(`/api/alerts/${id}/read`, {
      method: 'POST',
    })
  }

  // Certificates
  async getCertificates(vesselId?: string): Promise<Certificate[]> {
    const query = vesselId ? `?vesselId=${vesselId}` : ''
    return this.request(`/api/certificates${query}`)
  }

  // Calendar
  async getCalendarEvents(start: string, end: string): Promise<CalendarEvent[]> {
    return this.request(`/api/calendar?start=${start}&end=${end}`)
  }

  // Marketplace
  async getMarketplaceItems(type?: string): Promise<MarketplaceItem[]> {
    const query = type ? `?type=${type}` : ''
    return this.request(`/api/marketplace${query}`)
  }
}

export const api = new ApiClient(API_BASE)
