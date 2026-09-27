import { Router } from 'express';
import { db } from '../prisma/db';

export const weatherRouter = Router();

// GET /api/weather - Get weather data for a port
weatherRouter.get('/', async (req, res) => {
  try {
    const { port_id, date } = req.query;

    const where: any = {};
    if (port_id) where.port_id = String(port_id);

    const weather = await db.weather.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 10,
      include: { ports: true },
    });

    const mapped = weather.map((w) => ({
      id: Number(w.id),
      date: w.date.toISOString().split('T')[0],
      port_id: w.port_id,
      port_name: w.ports.port_name,
      wind_speed_knots: Number(w.wind_speed_knots),
      wave_height_m: Number(w.wave_height_m),
      visibility_nm: Number(w.visibility_nm),
      condition: w.condition,
      storm_warning: w.storm_warning,
    }));

    res.json(mapped);
  } catch (error: any) {
    console.error('Weather error:', error);
    res.status(500).json({ error: error.message });
  }
});
