import { Router } from 'express';
import { db } from '../prisma/db';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', async (_req, res) => {
  try {
    // Get vessel counts
    const allVessels = await db.vessels.findMany();
    const availableVessels = allVessels.filter(
      (v) => v.availability_status === 'Available'
    );

    const shipments = await db.shipments.findMany();
    const freightHistory = await db.dry_bulk_freight_rates.findMany({
      orderBy: { date: 'desc' },
      take: 50,
    });
    const ratesByDate = new Map<string, number[]>();
    for (const r of freightHistory) {
      const dateStr = r.date.toISOString().split('T')[0]!;
      if (!ratesByDate.has(dateStr)) {
        ratesByDate.set(dateStr, []);
      }
      ratesByDate.get(dateStr)!.push(Number(r.freight_rate_usd_per_ton));
    }

    const freightChartData = Array.from(ratesByDate.entries())
      .map(([date, rates]) => ({
        date,
        rate: Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-8);

    // Get latest bunker price
    const latestBunker = await db.bunker_prices.findFirst({
      orderBy: { date: 'desc' },
    });

    // Get ports with high congestion
    const ports = await db.ports.findMany();
    const avgCongestion = ports.reduce(
      (sum, p) => sum + Number(p.congestion_index || 0),
      0
    ) / (ports.length || 1);

    // Latest optimization results
    const latestOptimization = await db.optimization_results.findFirst({
      orderBy: { created_at: 'desc' },
    });

    const currentRate = freightChartData.length > 0
      ? freightChartData[freightChartData.length - 1]!.rate
      : 0;
    const prevRate = freightChartData.length > 1
      ? freightChartData[freightChartData.length - 2]!.rate
      : currentRate;
    const freightTrend = prevRate > 0
      ? Number((((currentRate - prevRate) / prevRate) * 100).toFixed(1))
      : 0;

    const summary = {
      kpis: {
        currentFreight: currentRate,
        forecastFreight: latestOptimization
          ? Number(latestOptimization.predicted_freight_rate_usd_per_ton)
          : currentRate,
        freightTrend,
        availableVessels: availableVessels.length,
        activeCargoEnquiries: shipments.length,
        activeVesselEnquiries: allVessels.length,
        portCongestionIndex: Math.round(avgCongestion * 100),
        estimatedSavings: latestOptimization
          ? Number(latestOptimization.total_cost_usd || 0)
          : 0,
      },
      charts: {
        freightHistory: freightChartData,
        marketTrend: [],
        vesselAvailability: [],
        portCongestion: [],
        supplyDemand: [],
      },
      activeEnquiries: {
        cargo: shipments.slice(0, 3).map((s) => ({
          id: String(s.shipment_id),
          cargoType: s.commodity || 'General Cargo',
          quantity: Number(s.cargo_quantity_tons),
          origin: s.origin_port_id,
          destination: s.destination_port_id,
          laycanStart: s.earliest_charter_date?.toISOString() || '',
          laycanEnd: s.required_arrival_date?.toISOString() || '',
          preferredVesselType: s.preferred_vessel_class || 'Panamax',
          status: 'Open',
          priority: 'Medium',
          created_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        vessel: allVessels.slice(0, 3).map((v) => ({
          id: v.vessel_id,
          vessel_name: v.vessel_name,
          vessel_type: v.vessel_type || 'Panamax',
          dwt: Number(v.dwt),
          openDate: new Date().toISOString(),
          openPort: 'Open',
          ownerBroker: 'Direct Owner',
          fuelConsumption: Number(v.fuel_consumption_tpd),
          status: v.availability_status || 'Available',
          source: 'Database',
          created_at: new Date().toISOString(),
        })),
      },
      recommendedActions: latestOptimization
        ? [
            {
              id: String(latestOptimization.result_id),
              type: 'charter_opportunity',
              title: 'Latest Optimization Result Available',
              description: latestOptimization.recommendation_reason || 'Charter optimization recommendation ready.',
              priority: 'High',
              potentialSaving: Number(latestOptimization.total_cost_usd || 0),
              actionUrl: '/optimization/charter',
            },
          ]
        : [],
      marketSummary: [
        `Bunker Price: $${latestBunker ? Number(latestBunker.price_usd_per_ton) : 'N/A'}/MT`,
        `Available Vessels: ${availableVessels.length} out of ${allVessels.length}`,
        `Average Port Congestion: ${(avgCongestion * 100).toFixed(0)}%`,
        `Active Shipments: ${shipments.length}`,
      ],
    };

    res.json(summary);
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});
