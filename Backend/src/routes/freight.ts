import { Router } from 'express';
import { db } from '../prisma/db';

export const freightRouter = Router();

// POST /api/forecast - Get freight forecast data from DB
freightRouter.post('/', async (req, res) => {
  try {
    const { origin, destination, vessel_type, horizon } = req.body;

    // Normalize port names (strip country info like "Newcastle (Australia)" -> "Newcastle")
    const origin_port = origin?.replace(/\s*\(.*\)/, '') || '';
    const destPort = destination || '';

    // Get historical freight rates from dry_bulk_freight_rates
    const rates = await db.dry_bulk_freight_rates.findMany({
      where: {
        origin_port: { contains: origin_port },
        destination_port: { contains: destPort },
        ...(vessel_type ? { vessel_class: vessel_type } : {}),
      },
      orderBy: { date: 'asc' },
    });

    if (rates.length === 0) {
      // Try broader search if specific route not found
      const allRates = await db.dry_bulk_freight_rates.findMany({
        orderBy: { date: 'asc' },
        take: 50,
      });

      if (allRates.length === 0) {
        return res.status(404).json({
          error: 'No freight rate data found',
        });
      }

      return buildForecastResponse(res, allRates, horizon);
    }

    return buildForecastResponse(res, rates, horizon);
  } catch (error: any) {
    console.error('Freight forecast error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forecast/rates - Get raw freight rates
freightRouter.get('/rates', async (req, res) => {
  try {
    const { origin, destination, vessel_type, limit } = req.query;

    const where: any = {};
    if (origin) where.origin_port = { contains: String(origin) };
    if (destination) where.destination_port = { contains: String(destination) };
    if (vessel_type) where.vessel_class = String(vessel_type);

    const rates = await db.dry_bulk_freight_rates.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? Number(limit) : 100,
    });

    const mapped = rates.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      origin_port: r.origin_port,
      destination_port: r.destination_port,
      vessel_class: r.vessel_class,
      rate: Number(r.freight_rate_usd_per_ton),
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forecast/routes - Get available routes for freight rates
freightRouter.get('/routes', async (_req, res) => {
  try {
    const routes = await db.routes.findMany({
      include: {
        origin_port: true,
        destination_port: true,
      },
    });

    const mapped = routes.map((r) => ({
      route_code: r.route_code,
      route_name: r.route_name,
      origin_port: r.origin_port.port_name,
      origin_port_id: r.origin_port_id,
      destination_port: r.destination_port.port_name,
      destination_port_id: r.destination_port_id,
      vessel_class: r.vessel_class,
      distance_nm: Number(r.distance_nm),
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function buildForecastResponse(res: any, rates: any[], horizon: string | undefined) {
  // Build historical data grouped by week
  const ratesByWeek = new Map<string, number[]>();

  for (const r of rates) {
    const date = new Date(r.date);
    // Get ISO week start (Monday)
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    const weekKey = weekStart.toISOString().split('T')[0]!;

    if (!ratesByWeek.has(weekKey)) {
      ratesByWeek.set(weekKey, []);
    }
    ratesByWeek.get(weekKey)!.push(Number(r.freight_rate_usd_per_ton));
  }

  const historicalData = Array.from(ratesByWeek.entries())
    .map(([date, rateArr]) => ({
      date,
      rate: Number((rateArr.reduce((a, b) => a + b, 0) / rateArr.length).toFixed(4)),
      type: 'historical' as const,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Take last 10 weeks
  const recentHistory = historicalData.slice(-10);
  const currentRate = recentHistory.length > 0 ? recentHistory[recentHistory.length - 1]!.rate : 0;

  // Simple forecast: linear regression on recent data
  const forecastWeeks = horizon === '7d' ? 1 : horizon === '14d' ? 2 : horizon === '90d' ? 13 : horizon === '6m' ? 26 : 4;
  const forecastData: { date: string; rate: number; confidence: number; type: string }[] = [];

  // Calculate trend from recent history
  let trend = 0;
  if (recentHistory.length >= 2) {
    const first = recentHistory[0]!.rate;
    const last = recentHistory[recentHistory.length - 1]!.rate;
    trend = (last - first) / recentHistory.length;
  }

  const lastDate = recentHistory.length > 0
    ? new Date(recentHistory[recentHistory.length - 1]!.date)
    : new Date();

  for (let i = 1; i <= forecastWeeks; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i * 7);
    const forecastRate = Number((currentRate + trend * i).toFixed(4));
    const confidence = Math.max(50, Math.round(95 - i * 3));

    forecastData.push({
      date: forecastDate.toISOString().split('T')[0]!,
      rate: Math.max(0, forecastRate),
      confidence,
      type: 'forecast',
    });
  }

  const forecastRate = forecastData.length > 0 ? forecastData[forecastData.length - 1]!.rate : currentRate;
  const change = currentRate > 0 ? ((forecastRate - currentRate) / currentRate) * 100 : 0;

  res.json({
    currentRate,
    forecastRate,
    change: Number(change.toFixed(2)),
    changeAmount: Number((forecastRate - currentRate).toFixed(4)),
    trend: change < -1 ? 'Decreasing' : change > 1 ? 'Increasing' : 'Stable',
    confidence: forecastData.length > 0 ? forecastData[0]!.confidence : 50,
    volatility: Math.round(Math.abs(change) * 2),
    data: [...recentHistory, ...forecastData],
  });
}
