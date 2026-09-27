import { Router } from 'express';
import { db } from '../prisma/db';

export const shipmentRouter = Router();

// GET /api/shipments - List all shipments (used as cargo enquiries)
shipmentRouter.get('/', async (_req, res) => {
  try {
    const shipments = await db.shipments.findMany({
      include: {
        origin_port: true,
        destination_port: true,
      },
    });

    const mapped = shipments.map((s) => ({
      id: String(s.shipment_id),
      cargoType: s.commodity || 'General Cargo',
      quantity: Number(s.cargo_quantity_tons),
      origin: s.origin_port.port_name,
      origin_port_id: s.origin_port_id,
      destination: s.destination_port.port_name,
      destination_port_id: s.destination_port_id,
      laycanStart: s.earliest_charter_date?.toISOString() || '',
      laycanEnd: s.required_arrival_date?.toISOString() || '',
      preferredVesselType: s.preferred_vessel_class || 'Panamax',
      status: 'Open',
      priority: 'Medium',
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    res.json(mapped);
  } catch (error: any) {
    console.error('Shipments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shipments/:id - Get single shipment
shipmentRouter.get('/:id', async (req, res) => {
  try {
    const shipment = await db.shipments.findUnique({
      where: { shipment_id: BigInt(req.params.id) },
      include: {
        origin_port: true,
        destination_port: true,
      },
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({
      id: String(shipment.shipment_id),
      cargoType: shipment.commodity || 'General Cargo',
      quantity: Number(shipment.cargo_quantity_tons),
      origin: shipment.origin_port.port_name,
      origin_port_id: shipment.origin_port_id,
      destination: shipment.destination_port.port_name,
      destination_port_id: shipment.destination_port_id,
      laycanStart: shipment.earliest_charter_date?.toISOString() || '',
      laycanEnd: shipment.required_arrival_date?.toISOString() || '',
      preferredVesselType: shipment.preferred_vessel_class || 'Panamax',
      status: 'Open',
      priority: 'Medium',
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/shipments - Create new shipment
shipmentRouter.post('/', async (req, res) => {
  try {
    const { origin_port_id, destination_port_id, commodity, cargo_quantity_tons, earliest_charter_date, required_arrival_date, preferred_vessel_class } = req.body;

    const shipment = await db.shipments.create({
      data: {
        origin_port_id,
        destination_port_id,
        commodity,
        cargo_quantity_tons,
        earliest_charter_date: earliest_charter_date ? new Date(earliest_charter_date) : null,
        required_arrival_date: required_arrival_date ? new Date(required_arrival_date) : null,
        preferred_vessel_class,
      },
      include: {
        origin_port: true,
        destination_port: true,
      },
    });

    res.status(201).json({
      id: String(shipment.shipment_id),
      cargoType: shipment.commodity || 'General Cargo',
      quantity: Number(shipment.cargo_quantity_tons),
      origin: shipment.origin_port.port_name,
      destination: shipment.destination_port.port_name,
      status: 'Open',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
