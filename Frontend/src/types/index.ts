export interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: VesselType;
  dwt: number;
  builtYear: number;
  flag: string;
  owner: string;
  operator: string;
  speed: number; // knots
  fuelConsumption: number; // MT/day
  draft: number; // meters
  length: number; // meters
  beam: number; // meters
  status: VesselStatus;
  currentLocation?: Location;
  openDate?: string;
  openPort?: string;
  destination?: string;
  eta?: string;
  heading?: number;
}

export type VesselType =
  | 'Capesize'
  | 'Panamax'
  | 'Supramax'
  | 'Handysize'
  | 'VLOC'
  | 'Bulk Carrier'
  | 'General Cargo';

export type VesselStatus =
  | 'Available'
  | 'At Sea'
  | 'In Port'
  | 'Chartered'
  | 'Under Maintenance'
  | 'Idle';

export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface Port {
  id: string;
  name: string;
  country: string;
  location: Location;
  maxDraft: number; // meters
  maxVesselSize: number; // DWT
  berths: number;
  handlingCapacity: number; // MT/year
  congestion: CongestionLevel;
  averageWaitingTime: number; // hours
  portCharges: number; // USD
  operatingConstraints?: string[];
}

export type CongestionLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface CargoEnquiry {
  id: string;
  cargoType: CargoType;
  quantity: number; // MT
  origin: string;
  destination: string;
  laycanStart: string;
  laycanEnd: string;
  preferredVesselType?: VesselType;
  status: EnquiryStatus;
  priority: Priority;
  supplier?: string;
  specification?: string;
  createdAt: string;
  updatedAt: string;
}

export type CargoType =
  | 'Coal'
  | 'Iron Ore'
  | 'Bauxite'
  | 'Fertilizer'
  | 'Grain'
  | 'Cement'
  | 'Steel'
  | 'General Cargo';

export type EnquiryStatus =
  | 'Open'
  | 'In Progress'
  | 'Matched'
  | 'Chartered'
  | 'Completed'
  | 'Cancelled';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface VesselEnquiry {
  id: string;
  vesselId?: string;
  vesselName: string;
  vesselType: VesselType;
  dwt: number;
  openDate: string;
  openPort: string;
  destination?: string;
  ownerBroker: string;
  fuelConsumption: number;
  status: EnquiryStatus;
  source: string;
  tradingRegion?: string;
  createdAt: string;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number; // nautical miles
  estimatedDays: number;
  waypoints?: Location[];
  canalTransit?: string[];
}

export interface Voyage {
  id: string;
  cargoId?: string;
  vesselId?: string;
  route: Route;
  estimatedCost: VoyageCost;
  estimatedDuration: number; // days
  status: string;
}

export interface VoyageCost {
  freight: number;
  fuel: number;
  port: number;
  canal: number;
  charter: number;
  demurrage: number;
  other: number;
  total: number;
  perMT: number;
}

export interface VoyageEstimate {
  cargo: {
    type: CargoType;
    quantity: number;
  };
  route: {
    origin: string;
    destination: string;
    distance: number;
  };
  vessel: {
    type: VesselType;
    dwt: number;
    speed: number;
    fuelConsumption: number;
  };
  costs: VoyageCost;
  operations: {
    loadingTime: number;
    dischargingTime: number;
    waitingTime: number;
    transitTime: number;
  };
  totalDuration: number;
}

export interface FreightForecast {
  commodity: CargoType;
  origin: string;
  destination: string;
  vesselType: VesselType;
  currentRate: number; // USD/MT
  forecastRate: number; // USD/MT
  change: number; // percentage
  changeAmount: number; // USD/MT
  trend: TrendDirection;
  confidence: number; // 0-100
  volatility: number; // 0-100
  horizon: ForecastHorizon;
  historicalData: FreightDataPoint[];
  forecastData: FreightDataPoint[];
  generatedAt: string;
}

export type TrendDirection = 'Increasing' | 'Decreasing' | 'Stable' | 'Volatile';

export type ForecastHorizon = '7d' | '14d' | '30d' | '90d' | '6m';

export interface FreightDataPoint {
  date: string;
  rate: number;
  confidence?: number;
}

export interface MarketData {
  balticDryIndex: number;
  capesizeIndex: number;
  panamaxIndex: number;
  supramaxIndex: number;
  handysizeIndex: number;
  bunkerPrice: number; // USD/MT
  commodityPrices: Record<string, number>;
  exchangeRates: Record<string, number>;
  vesselSupply: number;
  cargoDemand: number;
  portCongestionIndex: number;
  marketPressureScore: number;
  keyDrivers: MarketDriver[];
  updatedAt: string;
}

export interface MarketDriver {
  factor: string;
  direction: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
}

export interface CharterRecommendation {
  cargoId: string;
  recommendedVesselType: VesselType;
  recommendedAction: 'Charter Now' | 'Wait' | 'Monitor';
  waitDays?: number;
  currentFreight: number;
  expectedFreight: number;
  estimatedSavings: number;
  estimatedTotalCost: number;
  risk: RiskLevel;
  confidence: number;
  reasoning: string[];
  comparison: CharterOption[];
  generatedAt: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface CharterOption {
  vesselType: VesselType;
  timing: string;
  freight: number;
  totalCost: number;
  savings: number;
  score: number;
}

export interface VesselRecommendation {
  cargoId: string;
  vessels: RankedVessel[];
  criteria: RecommendationCriteria;
  generatedAt: string;
}

export interface RankedVessel {
  vessel: Vessel;
  score: number; // 0-100
  suitability: number; // 0-100
  estimatedFreight: number;
  estimatedCost: number;
  reasoning: string[];
  pros: string[];
  cons: string[];
}

export interface RecommendationCriteria {
  capacityFit: number;
  portCompatibility: number;
  availability: number;
  cost: number;
  fuelEfficiency: number;
  distance: number;
  age: number;
  draft: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionRequired?: boolean;
  read: boolean;
  createdAt: string;
}

export type AlertType =
  | 'freight_change'
  | 'vessel_availability'
  | 'port_congestion'
  | 'charter_opportunity'
  | 'market_event'
  | 'cargo_match'
  | 'forecast_update';

export interface Certificate {
  id: string;
  vesselId: string;
  vesselName: string;
  certificateType: string;
  issueDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  issuingAuthority?: string;
}

export interface CalendarEvent {
  id: string;
  type: 'vessel_availability' | 'laycan' | 'charter' | 'port_schedule' | 'maintenance' | 'cargo_shipment';
  title: string;
  startDate: string;
  endDate?: string;
  vesselId?: string;
  cargoId?: string;
  location?: string;
  description?: string;
}

export interface DashboardSummary {
  kpis: {
    currentFreight: number;
    forecastFreight: number;
    freightTrend: number;
    availableVessels: number;
    activeCargoEnquiries: number;
    activeVesselEnquiries: number;
    portCongestionIndex: number;
    estimatedSavings: number;
  };
  charts: {
    freightHistory: FreightDataPoint[];
    marketTrend: any[];
    vesselAvailability: any[];
    portCongestion: any[];
    supplyDemand: any[];
  };
  activeEnquiries: {
    cargo: CargoEnquiry[];
    vessel: VesselEnquiry[];
  };
  recommendedActions: RecommendedAction[];
  marketSummary: string[];
}

export interface RecommendedAction {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: Priority;
  potentialSaving?: number;
  actionUrl?: string;
}

export interface MarketplaceItem {
  id: string;
  type: 'vessel' | 'cargo' | 'charter';
  title: string;
  description: string;
  origin?: string;
  destination?: string;
  quantity?: number;
  dwt?: number;
  date: string;
  indicativeRate?: number;
  status: string;
  postedBy: string;
  postedAt: string;
}
