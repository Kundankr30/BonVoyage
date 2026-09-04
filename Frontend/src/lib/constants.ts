import type { VesselType, CargoType } from '@/types'

export const VESSEL_TYPES: VesselType[] = [
  'Capesize',
  'Panamax',
  'Supramax',
  'Handysize',
  'VLOC',
  'Bulk Carrier',
  'General Cargo',
]

export const CARGO_TYPES: CargoType[] = [
  'Coal',
  'Iron Ore',
  'Bauxite',
  'Fertilizer',
  'Grain',
  'Cement',
  'Steel',
  'General Cargo',
]

export const EAST_COAST_PORTS = [
  'Paradip',
  'Visakhapatnam',
  'Kakinada',
  'Krishnapatnam',
  'Chennai',
  'Ennore',
  'Tuticorin',
]

export const ORIGIN_PORTS = [
  'Newcastle (Australia)',
  'Richards Bay (South Africa)',
  'Balikpapan (Indonesia)',
  'Norfolk (USA)',
  'Rotterdam (Netherlands)',
  'Singapore',
  'Port Hedland (Australia)',
  'Dampier (Australia)',
]

export const ALL_PORTS = [...EAST_COAST_PORTS, ...ORIGIN_PORTS]

export const FORECAST_HORIZONS = [
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '6m', label: '6 Months' },
]

export const TRADING_REGIONS = [
  'Asia Pacific',
  'Indian Ocean',
  'Atlantic',
  'Pacific',
  'Mediterranean',
  'North Sea',
]

export const VESSEL_FLAGS = [
  'Panama',
  'Liberia',
  'Marshall Islands',
  'Hong Kong',
  'Singapore',
  'Malta',
  'Bahamas',
  'Greece',
  'China',
  'India',
]

export const DEFAULT_FUEL_PRICE = 650 // USD per MT
export const DEFAULT_CHARTER_RATE = 15000 // USD per day
export const NAUTICAL_MILE_TO_KM = 1.852
export const AVG_VESSEL_SPEED = 14 // knots
