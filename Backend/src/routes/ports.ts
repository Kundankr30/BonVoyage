import { Router } from 'express';
import { db } from '../prisma/db';

export const portRouter = Router();

// GET /api/ports - List all ports
portRouter.get('/', async (_req, res) => {
  try {
    const ports = await db.ports.findMany();

    const mapped = ports.map((p) => ({
      id: p.port_id,
      name: p.port_name,
      country: p.country || 'Unknown',
      region: p.region || 'Unknown',
      location: {
        lat: Number(p.latitude),
        lng: Number(p.longitude),
      },
      maxDraft: Number(p.max_draft_m),
      maxVesselSize: Number(p.max_loa_m) * Number(p.max_beam_m) * Number(p.max_draft_m),
      max_loa_m: Number(p.max_loa_m),
      max_beam_m: Number(p.max_beam_m),
      berths: 10,
      handlingCapacity: Number(p.cargo_handling_rate_tpd) * 365,
      cargo_handling_rate_tpd: Number(p.cargo_handling_rate_tpd),
      congestion: getCongestionLevel(Number(p.congestion_index)),
      congestion_index: Number(p.congestion_index),
      averageWaitingTime: Number(p.avg_waiting_time_hrs),
      berth_availability_pct: Number(p.berth_availability_pct),
      portCharges: 85000,
    }));

    res.json(mapped);
  } catch (error: any) {
    console.error('Ports error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ports/:id - Get single port
portRouter.get('/:id', async (req, res) => {
  try {
    const port = await db.ports.findUnique({
      where: { port_id: req.params.id },
    });

    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }

    res.json({
      id: port.port_id,
      name: port.port_name,
      country: port.country || 'Unknown',
      region: port.region || 'Unknown',
      location: {
        lat: Number(port.latitude),
        lng: Number(port.longitude),
      },
      maxDraft: Number(port.max_draft_m),
      max_loa_m: Number(port.max_loa_m),
      max_beam_m: Number(port.max_beam_m),
      berths: 10,
      handlingCapacity: Number(port.cargo_handling_rate_tpd) * 365,
      cargo_handling_rate_tpd: Number(port.cargo_handling_rate_tpd),
      congestion: getCongestionLevel(Number(port.congestion_index)),
      congestion_index: Number(port.congestion_index),
      averageWaitingTime: Number(port.avg_waiting_time_hrs),
      berth_availability_pct: Number(port.berth_availability_pct),
      portCharges: 85000,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getCongestionLevel(index: number): string {
  if (index >= 0.75) return 'Very High';
  if (index >= 0.5) return 'High';
  if (index >= 0.25) return 'Medium';
  return 'Low';
}
