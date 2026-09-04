# Quick Setup Guide

## Installation Options

### Option 1: Using Bun (Recommended)

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start development server
bun run dev
```

### Option 2: Using npm (Alternative)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 3: Using yarn (Alternative)

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

## First Run

1. Navigate to the project directory:
```bash
cd freight-chartering-platform
```

2. Install dependencies (choose one option above)

3. Start the development server:
```bash
bun run dev  # or npm run dev / yarn dev
```

4. Open your browser to `http://localhost:5173`

## What You'll See

The platform includes:

✅ **Dashboard** - Executive overview with KPIs and charts
✅ **Cargo Enquiries** - Full CRUD for cargo requirements
✅ **Vessel Enquiries** - Vessel position tracking
✅ **Live Map** - Interactive maritime map with vessels and ports
✅ **Voyage Distance** - Calculate routes and costs
✅ **Freight Forecast** - AI-powered rate predictions
✅ **Market Intelligence** - Baltic indices and market data
✅ **Charter Optimizer** - Charter timing recommendations
✅ **Certificates** - Certificate tracking with alerts
✅ **Marketplace** - Browse vessels and cargo
✅ **Alerts** - Real-time notifications

## Current State

- ✅ All pages created
- ✅ Full routing configured
- ✅ Mock data integrated
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Professional maritime UI

## Next Steps

1. **Backend Integration**
   - Set `VITE_API_URL` in `.env`
   - Connect to FastAPI backend
   - Replace mock data with real API calls

2. **Customization**
   - Update branding/colors in `tailwind.config.js`
   - Modify mock data in `src/data/mockData.ts`
   - Adjust constants in `src/lib/constants.ts`

## Troubleshooting

### Port already in use
```bash
# Vite will automatically try the next available port
# Or specify a different port:
bun run dev --port 3000
```

### Dependencies issues
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

## Project Structure

```
src/
├── pages/           # 19 pages (Dashboard, Cargo, Vessels, Map, etc.)
├── components/      # UI components (Button, Card, Table, etc.)
├── lib/            # API client, utilities, constants
├── types/          # TypeScript definitions
└── data/           # Mock data
```

All pages are fully routed and functional with mock data!
