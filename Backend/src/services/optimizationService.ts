import { db } from '../prisma/db';
import axios from 'axios';
import { ML_ENGINE_URL } from '../server';
import {
  calculateDistanceNm, calculateVoyageDays, isVesselFeasible, calculateFreightCost,
  calculateFuelCost, calculatePortCost, checkArrivalFeasibility, determineMarketEntry,
  calculateDemurrage, calculateRiskScore, calculateTotalCost, selectBestOption
} from './calculations';

export async function runOptimization(shipmentId: number) {
  const shipment = await db.shipments.findUnique({
    where: { shipment_id: BigInt(shipmentId) },
    include: { origin_port: true, destination_port: true }
  });

  if (!shipment) throw new Error('Shipment not found');
  const vessels = await db.vessels.findMany({
    where: { vessel_type: shipment.preferred_vessel_class || undefined }
  });
  const feasibleVessels = vessels.filter(v => isVesselFeasible(v, shipment, shipment.destination_port));

  if (feasibleVessels.length === 0) {
    throw new Error('No feasible vessel found');
  }

  const options = [];
  const bunkerPriceEntry = await db.bunker_prices.findFirst({
    where: {
      port_id: shipment.origin_port_id,
      fuel_type: 'VLSFO'
    },
    orderBy: { date: 'desc' }
  });
  
  const bunkerPrice = bunkerPriceEntry ? Number(bunkerPriceEntry.price_usd_per_ton) : 500.0;

  // Get latest freight rate
  const latestRateEntry = await db.dry_bulk_freight_rates.findFirst({
    where: {
      origin_port: shipment.origin_port.port_name,
      destination_port: shipment.destination_port.port_name,
    },
    orderBy: { date: 'desc' }
  });
  
  const latestRate = latestRateEntry ? Number(latestRateEntry.freight_rate_usd_per_ton) : 15.0;

  // Get weather
  let weather = await db.weather.findFirst({
    where: {
      port_id: shipment.destination_port_id,
      date: { lte: shipment.earliest_charter_date || new Date() }
    },
    orderBy: { date: 'desc' }
  });
  
  if (!weather) {
    weather = {
      wind_speed_knots: 10.0 as any,
      wave_height_m: 1.0 as any,
      visibility_nm: 10.0 as any,
      condition: "Clear",
      storm_warning: false
    } as any;
  }

  for (const vessel of feasibleVessels) {
    const distanceNm = calculateDistanceNm(shipment.origin_port, shipment.destination_port);
    const voyageDays = calculateVoyageDays(distanceNm, Number(vessel.speed_knots));
    let predictedFreightRate: number;
    try {
      const mlResponse = await axios.post(`${ML_ENGINE_URL}/predict_freight`, {
        origin_port: shipment.origin_port.port_name,
        destination_port: shipment.destination_port.port_name,
        vessel_class: vessel.vessel_type || ''
      });
      predictedFreightRate = mlResponse.data.predicted_rate;
    } catch (error) {
      console.warn(`ML Engine prediction failed, falling back to latest rate: ${(error as any).message}`);
      predictedFreightRate = latestRate;
    }

    const freightCost = calculateFreightCost(Number(shipment.cargo_quantity_tons), predictedFreightRate);
    const fuelResult = calculateFuelCost(vessel, distanceNm, bunkerPrice);
    const portResult = calculatePortCost(shipment.destination_port, Number(shipment.cargo_quantity_tons));
    
    const arrivalResult = checkArrivalFeasibility(
      shipment.earliest_charter_date || new Date(),
      voyageDays,
      portResult.waitingHours,
      portResult.handlingDays,
      shipment.required_arrival_date || new Date()
    );

    const totalTransitDays = voyageDays + (portResult.waitingHours / 24) + portResult.handlingDays;
    const reqArrival = shipment.required_arrival_date || new Date();
    const latestSafeCharterDate = new Date(reqArrival);
    latestSafeCharterDate.setUTCDate(latestSafeCharterDate.getUTCDate() - Math.round(totalTransitDays));

    const marketResult = determineMarketEntry(
      latestRate,
      predictedFreightRate,
      shipment.earliest_charter_date || new Date(),
      latestSafeCharterDate
    );

    const demurrageResult = calculateDemurrage(portResult.waitingHours, portResult.handlingDays, 2, 20000);

    const slackDays = Math.floor(((shipment.required_arrival_date || new Date()).getTime() - arrivalResult.estimatedArrivalDate.getTime()) / (1000 * 3600 * 24));
    
    const riskResult = calculateRiskScore(
      Number(shipment.destination_port.congestion_index),
      Number(shipment.destination_port.berth_availability_pct),
      portResult.waitingHours,
      slackDays,
      Number(weather.wind_speed_knots),
      Number(weather.wave_height_m),
      Number(weather.visibility_nm),
      weather.condition || '',
      weather.storm_warning || false
    );

    const totalCost = freightCost + fuelResult.fuelCostUsd + portResult.portCostUsd + demurrageResult.demurrageCostUsd;

    options.push({
      vessel_id: vessel.vessel_id,
      vessel_name: vessel.vessel_name,
      total_cost_usd: totalCost,
      risk_score: riskResult.riskScore,
      arrival_feasible: arrivalResult.isFeasible,
      recommended_charter_date: marketResult.recommendedCharterDate,
      market_direction: marketResult.marketDirection,
      market_recommendation: marketResult.recommendation,
      predicted_freight_rate: predictedFreightRate,
      freight_cost_usd: freightCost,
      fuel_cost_usd: fuelResult.fuelCostUsd,
      port_cost_usd: portResult.portCostUsd,
      demurrage_cost_usd: demurrageResult.demurrageCostUsd
    });
  }

  const bestOption = selectBestOption(options);
  if (!bestOption) throw new Error('Could not determine best option');

  const result = await db.optimization_results.create({
    data: {
      shipment_id: BigInt(shipmentId),
      vessel_id: bestOption.vessel_id,
      recommended_charter_date: bestOption.recommended_charter_date,
      predicted_freight_rate_usd_per_ton: bestOption.predicted_freight_rate,
      freight_cost_usd: bestOption.freight_cost_usd,
      fuel_cost_usd: bestOption.fuel_cost_usd,
      port_cost_usd: bestOption.port_cost_usd,
      demurrage_cost_usd: bestOption.demurrage_cost_usd,
      total_cost_usd: bestOption.total_cost_usd,
      risk_score: bestOption.risk_score,
      recommendation_reason: "Feasible vessel with lowest estimated total cost and acceptable risk."
    }
  });

  return {
    resultId: Number(result.result_id),
    shipmentId: Number(result.shipment_id),
    recommendedVessel: result.vessel_id,
    recommendedCharterDate: result.recommended_charter_date,
    predictedFreightRate: Number(result.predicted_freight_rate_usd_per_ton),
    freightCost: Number(result.freight_cost_usd),
    fuelCost: Number(result.fuel_cost_usd),
    portCost: Number(result.port_cost_usd),
    demurrageCost: Number(result.demurrage_cost_usd),
    totalCost: Number(result.total_cost_usd),
    riskScore: Number(result.risk_score),
    recommendationReason: result.recommendation_reason
  };
}
