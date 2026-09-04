# Maritime Intelligence Platform

A production-quality **Intelligent Freight Forecasting & Vessel Chartering Platform** built with React, TypeScript, and Vite. This platform helps optimize bulk cargo procurement and vessel chartering from overseas origins to ports on the East Coast of India.

## Overview

This is a professional maritime SaaS application designed for:
- Shipping companies
- Chartering desks
- Commodity traders
- Procurement teams
- Logistics companies

## Features

### Core Functionality

#### Dashboard
- Real-time KPIs (freight rates, vessel availability, estimated savings)
- Historical and forecast freight rate charts
- Active enquiries overview
- AI-powered recommended actions
- Market summary

#### Cargo & Vessel Enquiries
- Cargo enquiry management
- Vessel position tracking
- Automated vessel matching
- Freight cost estimation
- Laycan management

#### Live Maritime Map
- Real-time vessel tracking
- Port information and congestion levels
- Route visualization
- Interactive filtering

#### Voyage Planning
- **Distance Calculator**: Calculate sea distance and voyage parameters
- **Voyage Estimator**: Comprehensive cost estimation with fuel, port charges, and canal fees

#### Forecasting
- **Freight Forecast**: AI-powered freight rate predictions with confidence intervals
- **Market Intelligence**: Baltic indices, bunker prices, supply/demand analysis

#### Optimization
- **Charter Optimizer**: AI-powered charter timing recommendations (Charter Now vs Wait)
- **Vessel Recommendation**: Ranked vessel matches with suitability scores

#### Fleet Management
- Fleet overview and status
- Certificate tracking and expiry alerts
- Operations calendar

#### Marketplace
- Browse vessels, cargo, and charter opportunities
- Post enquiries to the marketplace

#### Alerts
- Real-time freight rate changes
- Vessel availability updates
- Port congestion warnings
- Charter opportunities

## Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: React Leaflet
- **API State**: TanStack Query
- **Validation**: Zod
- **Date Handling**: date-fns

## Project Structure

```
src/
├── assets/              # Static assets
├── components/
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components (Sidebar, Topbar, StatCard)
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── CargoEnquiries.tsx
│   ├── VesselEnquiries.tsx
│   ├── LiveMap.tsx
│   ├── VoyageDistance.tsx
│   ├── FreightForecast.tsx
│   ├── MarketIntelligence.tsx
│   ├── CharterOptimizer.tsx
│   └── ... (other pages)
├── types/              # TypeScript type definitions
├── lib/
│   ├── api.ts         # API client
│   ├── utils.ts       # Utility functions
│   └── constants.ts   # Application constants
├── data/
│   └── mockData.ts    # Mock data for development
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- Node.js 18+ (for compatibility)

### Installation

1. Clone the repository:
```bash
cd freight-chartering-platform
```

2. Install dependencies:
```bash
bun install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
bun run build
```

Preview the production build:
```bash
bun run preview
```

## Backend Integration

The frontend is designed to work with a separate FastAPI backend. The API client is located at `src/lib/api.ts`.

### API Endpoints

The platform expects the following backend endpoints:

- `GET /api/dashboard/summary` - Dashboard data
- `GET /api/vessels` - List vessels
- `GET /api/vessels/:id` - Get vessel details
- `GET /api/cargo-enquiries` - List cargo enquiries
- `POST /api/cargo-enquiries` - Create cargo enquiry
- `GET /api/vessel-enquiries` - List vessel enquiries
- `GET /api/ports` - List ports
- `POST /api/voyage/distance` - Calculate voyage distance
- `POST /api/voyage/estimate` - Estimate voyage cost
- `POST /api/forecast` - Get freight forecast
- `GET /api/market` - Get market data
- `POST /api/optimization/charter` - Get charter recommendations
- `POST /api/optimization/vessels` - Get vessel recommendations
- `GET /api/alerts` - Get alerts
- `GET /api/certificates` - Get certificates
- `GET /api/marketplace` - Get marketplace items

### Mock Data

Currently, the application uses mock data from `src/data/mockData.ts`. To switch to real API:

1. Set `VITE_API_URL` in `.env`
2. Ensure the backend is running
3. The API client will automatically use the backend

## Features in Detail

### Freight Forecasting

AI-powered freight rate forecasting with:
- Historical data analysis
- Multi-horizon predictions (7d, 14d, 30d, 90d, 6m)
- Confidence intervals
- Market driver analysis

### Charter Optimization

Intelligent charter decision support:
- Charter Now vs Wait recommendations
- Vessel type comparison
- Cost-benefit analysis
- Risk assessment
- Estimated savings calculation

### Vessel Matching

Automated vessel suitability scoring based on:
- Cargo capacity fit
- Port compatibility
- Vessel availability
- Cost efficiency
- Draft compatibility
- Distance and routing

### Market Intelligence

Comprehensive market data:
- Baltic Dry Index and sub-indices
- Bunker prices
- Commodity prices
- Exchange rates
- Supply/demand balance
- Port congestion index

## Dark Mode

The application supports dark mode. Toggle using the moon/sun icon in the top navigation bar.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Deployment

### Vercel

```bash
bun run build
# Deploy dist/ folder
```

### Docker

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build
CMD ["bun", "run", "preview", "--host", "0.0.0.0"]
```

## Contributing

This is a production application. For enterprise deployments, contact the development team.

## License

Proprietary - All rights reserved

## Roadmap

### Phase 1 (Current)
- ✅ Core UI/UX
- ✅ Dashboard
- ✅ Enquiry management
- ✅ Live map
- ✅ Voyage calculators
- ✅ Freight forecasting
- ✅ Market intelligence
- ✅ Charter optimization

### Phase 2 (Upcoming)
- [ ] Backend integration
- [ ] Advanced vessel search
- [ ] Port detail pages
- [ ] Voyage estimator with detailed operations
- [ ] Certificate document management
- [ ] Calendar with event management
- [ ] User authentication
- [ ] Role-based access control

### Phase 3 (Future)
- [ ] Real-time WebSocket updates
- [ ] Advanced analytics
- [ ] Report generation
- [ ] Email notifications
- [ ] Mobile app
- [ ] API for third-party integrations

## Support

For technical support or feature requests, please contact the development team.

---

Built with ⚓ for the maritime industry
