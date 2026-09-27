import { Router } from 'express';
import { db } from '../prisma/db';

export const marketRouter = Router();

// GET /api/market - Get market intelligence data
marketRouter.get('/', async (_req, res) => {
  try {
    // Get latest bunker prices by fuel type
    const bunkerPrices = await db.bunker_prices.findMany({
      orderBy: { date: 'desc' },
      take: 20,
    });

    const latestBunker = bunkerPrices.length > 0
      ? Number(bunkerPrices[0]!.price_usd_per_ton)
      : 650;

    // Get latest freight rates by vessel class
    const freightRates = await db.dry_bulk_freight_rates.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    });

    // Calculate indices by vessel class
    const ratesByClass = new Map<string, number[]>();
    for (const r of freightRates) {
      if (!ratesByClass.has(r.vessel_class)) {
        ratesByClass.set(r.vessel_class, []);
      }
      ratesByClass.get(r.vessel_class)!.push(Number(r.freight_rate_usd_per_ton));
    }

    const avgByClass = (className: string) => {
      const rates = ratesByClass.get(className);
      if (!rates || rates.length === 0) return 0;
      return Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2));
    };

    // Get commodity data
    const commodities = await db.commodity_data.findMany({
      orderBy: { date: 'desc' },
      take: 20,
    });

    const commodityPrices: Record<string, number> = {};
    for (const c of commodities) {
      if (c.commodity && c.price_usd_per_ton && !commodityPrices[c.commodity]) {
        commodityPrices[c.commodity] = Number(c.price_usd_per_ton);
      }
    }

    // Get vessel availability
    const vessels = await db.vessels.findMany();
    const availableCount = vessels.filter(
      (v) => v.availability_status === 'Available'
    ).length;

    // Get port congestion
    const ports = await db.ports.findMany();
    const avgCongestion = ports.reduce(
      (sum, p) => sum + Number(p.congestion_index || 0),
      0
    ) / (ports.length || 1);

    // Calculate BDI-like index from all rates
    const allRateValues = Array.from(ratesByClass.values()).flat();
    const bdiEstimate = allRateValues.length > 0
      ? Math.round(allRateValues.reduce((a, b) => a + b, 0) / allRateValues.length * 50)
      : 1248;

    const marketData = {
      balticDryIndex: bdiEstimate,
      capesizeIndex: Math.round(avgByClass('Capesize') * 70),
      panamaxIndex: Math.round(avgByClass('Panamax') * 55),
      supramaxIndex: Math.round(avgByClass('Supramax') * 45),
      handysizeIndex: Math.round(avgByClass('Handysize') * 40),
      bunkerPrice: latestBunker,
      commodityPrices,
      exchangeRates: { 'USD/INR': 83.25 },
      vesselSupply: vessels.length,
      cargoDemand: await db.shipments.count(),
      portCongestionIndex: Math.round(avgCongestion * 100),
      marketPressureScore: Math.round(avgCongestion * 100 + (1 - availableCount / (vessels.length || 1)) * 100) / 2,
      keyDrivers: [
        {
          factor: 'Bunker Prices',
          direction: 'stable' as const,
          impact: 'medium' as const,
        },
        {
          factor: 'Vessel Availability',
          direction: availableCount > vessels.length / 2 ? 'up' as const : 'down' as const,
          impact: 'high' as const,
        },
        {
          factor: 'Port Congestion',
          direction: avgCongestion > 0.5 ? 'up' as const : 'down' as const,
          impact: 'medium' as const,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    res.json(marketData);
  } catch (error: any) {
    console.error('Market data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/market/bunker-prices - Get bunker price history
marketRouter.get('/bunker-prices', async (req, res) => {
  try {
    const { port_id, fuel_type } = req.query;

    const where: any = {};
    if (port_id) where.port_id = String(port_id);
    if (fuel_type) where.fuel_type = String(fuel_type);

    const prices = await db.bunker_prices.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 50,
      include: { ports: true },
    });

    const mapped = prices.map((p) => ({
      date: p.date.toISOString().split('T')[0],
      port_id: p.ports.port_id,
      port_name: p.ports.port_name,
      fuel_type: p.fuel_type,
      price_usd_per_ton: Number(p.price_usd_per_ton),
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
