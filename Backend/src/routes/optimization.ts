import { Router } from 'express';
import axios from 'axios';
import { db } from '../prisma/db';
import { ML_ENGINE_URL } from '../server';
import { runOptimization } from '../services/optimizationService';

export const optimizationRouter = Router();

// POST /api/optimization/charter - Run optimization via ML Engine
optimizationRouter.post('/charter', async (req, res) => {
  try {
    const shipment_id = req.body.shipmentId || req.body.shipment_id;

    if (!shipment_id) {
      return res.status(400).json({ error: 'shipment_id is required' });
    }

    const result = await runOptimization(Number(shipment_id));

    // Get the shipment details for the response
    const shipment = await db.shipments.findUnique({
      where: { shipment_id: BigInt(shipment_id) },
      include: {
        origin_port: true,
        destination_port: true,
      },
    });

    // Get the recommended vessel details
    let vessel_name = 'Unknown';
    if (result.recommendedVessel) {
      const vessel = await db.vessels.findUnique({
        where: { vessel_id: String(result.recommendedVessel) },
      });
      if (vessel) vessel_name = vessel.vessel_name;
    }

    res.json({
      ...result,
      vessel_name,
      origin_port: shipment?.origin_port.port_name || '',
      destination_port: shipment?.destination_port.port_name || '',
      commodity: shipment?.commodity || '',
      cargoQuantity: shipment ? Number(shipment.cargo_quantity_tons) : 0,
    });
  } catch (error: any) {
    console.error('Optimization error:', error);

    res.status(500).json({
      error: error.message || 'Error running optimization',
    });
  }
});

// GET /api/optimization/results - Get all optimization results
optimizationRouter.get('/results', async (_req, res) => {
  try {
    const results = await db.optimization_results.findMany({
      include: {
        shipments: {
          include: {
            origin_port: true,
            destination_port: true,
          },
        },
        vessels: true,
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    const mapped = results.map((r) => ({
      result_id: Number(r.result_id),
      shipment_id: Number(r.shipments.shipment_id),
      vessel_id: r.vessel_id,
      vessel_name: r.vessels?.vessel_name || 'Unknown',
      origin_port: r.shipments.origin_port.port_name,
      destination_port: r.shipments.destination_port.port_name,
      commodity: r.shipments.commodity,
      cargoQuantity: Number(r.shipments.cargo_quantity_tons),
      recommended_charter_date: r.recommended_charter_date?.toISOString() || '',
      predictedFreightRate: Number(r.predicted_freight_rate_usd_per_ton),
      freightCost: Number(r.freight_cost_usd),
      fuelCost: Number(r.fuel_cost_usd),
      portCost: Number(r.port_cost_usd),
      demurrageCost: Number(r.demurrage_cost_usd),
      totalCost: Number(r.total_cost_usd),
      risk_score: Number(r.risk_score),
      recommendation_reason: r.recommendation_reason,
      created_at: r.created_at?.toISOString() || '',
    }));

    res.json(mapped);
  } catch (error: any) {
    console.error('Results error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/optimization/results/:shipment_id - Get latest optimization result for a shipment
optimizationRouter.get('/results/:shipment_id', async (req, res) => {
  try {
    const result = await db.optimization_results.findFirst({
      where: { shipment_id: BigInt(req.params.shipment_id) },
      include: {
        shipments: {
          include: {
            origin_port: true,
            destination_port: true,
          },
        },
        vessels: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!result) {
      return res.status(404).json({ error: 'No optimization result found for this shipment' });
    }

    res.json({
      result_id: Number(result.result_id),
      shipment_id: Number(result.shipments.shipment_id),
      vessel_id: result.vessel_id,
      vessel_name: result.vessels?.vessel_name || 'Unknown',
      origin_port: result.shipments.origin_port.port_name,
      destination_port: result.shipments.destination_port.port_name,
      commodity: result.shipments.commodity,
      cargoQuantity: Number(result.shipments.cargo_quantity_tons),
      recommended_charter_date: result.recommended_charter_date?.toISOString() || '',
      predictedFreightRate: Number(result.predicted_freight_rate_usd_per_ton),
      freightCost: Number(result.freight_cost_usd),
      fuelCost: Number(result.fuel_cost_usd),
      portCost: Number(result.port_cost_usd),
      demurrageCost: Number(result.demurrage_cost_usd),
      totalCost: Number(result.total_cost_usd),
      risk_score: Number(result.risk_score),
      recommendation_reason: result.recommendation_reason,
      created_at: result.created_at?.toISOString() || '',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
