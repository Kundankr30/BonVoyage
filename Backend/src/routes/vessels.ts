import { Router } from 'express';
import { db } from '../prisma/db';

export const vesselRouter = Router();

// GET /api/vessels - List all vessels with optional type filter
vesselRouter.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;

    const where: any = {};
    if (type) where.vessel_type = String(type);
    if (status) where.availability_status = String(status);

    const vessels = await db.vessels.findMany({ where });

    const mapped = vessels.map((v) => ({
      id: v.vessel_id,
      name: v.vessel_name,
      imo: `IMO${v.vessel_id}`,
      type: v.vessel_type || 'Panamax',
      dwt: Number(v.dwt),
      builtYear: 2020,
      flag: 'Unknown',
      owner: 'Unknown',
      operator: 'Unknown',
      speed: Number(v.speed_knots),
      fuelConsumption: Number(v.fuel_consumption_tpd),
      draft: Number(v.draft_m),
      length: Number(v.loa_m),
      beam: Number(v.beam_m),
      status: v.availability_status || 'Available',
    }));

    res.json(mapped);
  } catch (error: any) {
    console.error('Vessels error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vessels/positions - Get all vessel positions (for map)
vesselRouter.get('/positions', async (_req, res) => {
  try {
    const vessels = await db.vessels.findMany();
    const mapped = vessels.map((v) => ({
      id: v.vessel_id,
      name: v.vessel_name,
      type: v.vessel_type || 'Panamax',
      dwt: Number(v.dwt),
      speed: Number(v.speed_knots),
      fuelConsumption: Number(v.fuel_consumption_tpd),
      draft: Number(v.draft_m),
      length: Number(v.loa_m),
      beam: Number(v.beam_m),
      status: v.availability_status || 'Available',
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vessels/:id - Get single vessel
vesselRouter.get('/:id', async (req, res) => {
  try {
    const vessel = await db.vessels.findUnique({
      where: { vessel_id: req.params.id },
    });

    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    res.json({
      id: vessel.vessel_id,
      name: vessel.vessel_name,
      imo: `IMO${vessel.vessel_id}`,
      type: vessel.vessel_type || 'Panamax',
      dwt: Number(vessel.dwt),
      builtYear: 2020,
      flag: 'Unknown',
      owner: 'Unknown',
      operator: 'Unknown',
      speed: Number(vessel.speed_knots),
      fuelConsumption: Number(vessel.fuel_consumption_tpd),
      draft: Number(vessel.draft_m),
      length: Number(vessel.loa_m),
      beam: Number(vessel.beam_m),
      status: vessel.availability_status || 'Available',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vessels - Create new vessel
vesselRouter.post('/', async (req, res) => {
  try {
    const { vessel_id, vessel_name, vessel_type, dwt, loa_m, beam_m, draft_m, fuel_consumption_tpd, speed_knots, availability_status } = req.body;
    
    const vessel = await db.vessels.create({
      data: {
        vessel_id,
        vessel_name,
        vessel_type,
        dwt,
        loa_m,
        beam_m,
        draft_m,
        fuel_consumption_tpd,
        speed_knots,
        availability_status: availability_status || 'Available',
      }
    });

    res.status(201).json(vessel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
