export function checkArrivalFeasibility(
  charterDate: Date,
  voyageDays: number,
  waitingHours: number,
  handlingDays: number,
  requiredArrivalDate: Date
) {
  const waitingDays = waitingHours / 24;
  const totalDays = voyageDays + waitingDays + handlingDays;
  
  const estimatedArrivalDate = new Date(charterDate);
  estimatedArrivalDate.setUTCDate(estimatedArrivalDate.getUTCDate() + Math.round(totalDays));
  
  const isFeasible = estimatedArrivalDate <= requiredArrivalDate;
  
  return {
    voyageDays,
    waitingDays,
    handlingDays,
    totalDays,
    estimatedArrivalDate,
    requiredArrivalDate,
    isFeasible
  };
}

export function calculateDemurrage(
  waitingHours: number,
  handlingDays: number,
  allowedPortDays: number,
  demurrageRatePerDay: number
) {
  const waitingDays = waitingHours / 24;
  const actualPortDays = waitingDays + handlingDays;
  const excessDays = Math.max(0, actualPortDays - allowedPortDays);
  const demurrageCost = excessDays * demurrageRatePerDay;

  return {
    waitingDays,
    handlingDays,
    actualPortDays,
    allowedPortDays,
    excessDays,
    demurrageCostUsd: demurrageCost
  };
}

export function selectBestOption(options: any[], costTolerance = 0.05) {
  if (!options || options.length === 0) return null;

  const lowestCost = Math.min(...options.map(o => o.total_cost_usd));
  const acceptableOptions = options.filter(o => o.total_cost_usd <= lowestCost * (1 + costTolerance));
  
  return acceptableOptions.reduce((best, current) => 
    current.risk_score < best.risk_score ? current : best
  );
}

export function isVesselFeasible(vessel: any, shipment: any, destinationPort: any) {
  if (vessel.availability_status !== "Available") return false;
  if (Number(vessel.dwt) < Number(shipment.cargo_quantity_tons)) return false;
  if (Number(vessel.draft_m) > Number(destinationPort.max_draft_m)) return false;
  if (Number(vessel.loa_m) > Number(destinationPort.max_loa_m)) return false;
  if (Number(vessel.beam_m) > Number(destinationPort.max_beam_m)) return false;
  return true;
}

export function findFeasibleVessels(vessels: any[], shipment: any, destinationPort: any) {
  return vessels.filter(v => isVesselFeasible(v, shipment, destinationPort));
}

export function calculateFreightCost(cargoQuantity: number, freightRate: number) {
  return cargoQuantity * freightRate;
}

export function calculateFuelCost(vessel: any, distanceNm: number, bunkerPrice: number) {
  const voyageDays = distanceNm / (Number(vessel.speed_knots) * 24);
  const fuelUsed = voyageDays * Number(vessel.fuel_consumption_tpd);
  const fuelCost = fuelUsed * bunkerPrice;

  return {
    voyageDays,
    fuelUsedTons: fuelUsed,
    fuelCostUsd: fuelCost
  };
}

export function determineMarketEntry(
  latestRate: number,
  predictedRate: number,
  earliestCharterDate: Date,
  latestSafeCharterDate: Date
) {
  const rateChangePct = ((predictedRate - latestRate) / latestRate) * 100;
  
  let marketDirection = "";
  let recommendation = "";
  
  if (rateChangePct > 2) {
    marketDirection = "RISING";
    recommendation = "CHARTER_EARLY";
  } else if (rateChangePct < -2) {
    marketDirection = "FALLING";
    recommendation = "CONSIDER_WAITING";
  } else {
    marketDirection = "STABLE";
    recommendation = "CHARTER_NEAR_EARLIEST_DATE";
  }
  
  const recommendedCharterDate = recommendation === "CONSIDER_WAITING" 
    ? latestSafeCharterDate 
    : earliestCharterDate;
    
  return {
    latestRate,
    predictedRate,
    rateChangePct,
    marketDirection,
    recommendation,
    recommendedCharterDate
  };
}

export function calculatePortCost(port: any, cargoQuantity: number) {
  const handlingCostPerTon = 2.0;
  const waitingCostPerHour = 1000.0;
  
  const handlingRate = Number(port.cargo_handling_rate_tpd);
  const handlingDays = cargoQuantity / handlingRate;
  const handlingCost = cargoQuantity * handlingCostPerTon;
  
  const waitingHours = Number(port.avg_waiting_time_hrs);
  const waitingCost = waitingHours * waitingCostPerHour;
  
  const congestionIndex = Number(port.congestion_index);
  const congestionSurcharge = handlingCost * congestionIndex * 0.10;
  
  const portCost = handlingCost + waitingCost + congestionSurcharge;
  
  return {
    handlingDays,
    handlingCostUsd: handlingCost,
    waitingHours,
    waitingCostUsd: waitingCost,
    congestionSurchargeUsd: congestionSurcharge,
    portCostUsd: portCost
  };
}

export function calculateRiskScore(
  congestionIndex: number,
  berthAvailabilityPct: number,
  waitingHours: number,
  slackDays: number,
  windSpeedKnots: number,
  waveHeightM: number,
  visibilityNm: number,
  condition: string,
  stormWarning: boolean
) {
  const congestionRisk = congestionIndex * 100;
  const berthRisk = 100 - berthAvailabilityPct;
  const portRisk = (congestionRisk + berthRisk) / 2;
  
  let waitingRisk = (waitingHours / 120) * 100;
  waitingRisk = Math.min(100, Math.max(0, waitingRisk));
  
  let scheduleRisk = ((10 - slackDays) / 10) * 100;
  scheduleRisk = Math.min(100, Math.max(0, scheduleRisk));
  
  let windRisk = 0;
  if (windSpeedKnots >= 30) windRisk = 100;
  else if (windSpeedKnots >= 20) windRisk = 60;
  else if (windSpeedKnots >= 15) windRisk = 30;
  
  let waveRisk = 0;
  if (waveHeightM >= 5) waveRisk = 100;
  else if (waveHeightM >= 3) waveRisk = 60;
  else if (waveHeightM >= 2) waveRisk = 30;
  
  let visibilityRisk = 0;
  if (visibilityNm < 2) visibilityRisk = 100;
  else if (visibilityNm < 5) visibilityRisk = 60;
  else if (visibilityNm < 8) visibilityRisk = 30;
  
  const cond = condition.toLowerCase();
  let conditionRisk = 0;
  if (['storm', 'thunderstorm'].includes(cond)) conditionRisk = 100;
  else if (['rain', 'fog'].includes(cond)) conditionRisk = 40;
  else if (['cloudy', 'overcast'].includes(cond)) conditionRisk = 20;
  
  const stormRisk = stormWarning ? 100 : 0;
  
  const weatherRisk = 0.25 * windRisk + 0.25 * waveRisk + 0.20 * visibilityRisk + 0.15 * conditionRisk + 0.15 * stormRisk;
  
  const riskScore = 0.30 * portRisk + 0.30 * weatherRisk + 0.25 * scheduleRisk + 0.15 * waitingRisk;
  
  return {
    congestionRisk,
    berthRisk,
    portRisk,
    waitingRisk,
    scheduleRisk,
    windRisk,
    waveRisk,
    visibilityRisk,
    conditionRisk,
    stormRisk,
    weatherRisk,
    riskScore
  };
}

export function calculateTotalCost(freightCost: number, fuelCost: number, portCost: number, demurrageCost: number) {
  const totalCost = freightCost + fuelCost + portCost + demurrageCost;
  return {
    freightCostUsd: freightCost,
    fuelCostUsd: fuelCost,
    portCostUsd: portCost,
    demurrageCostUsd: demurrageCost,
    totalCostUsd: totalCost
  };
}

export function calculateDistanceNm(originPort: any, destinationPort: any) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const lat1 = radians(Number(originPort.latitude));
  const lon1 = radians(Number(originPort.longitude));
  const lat2 = radians(Number(destinationPort.latitude));
  const lon2 = radians(Number(destinationPort.longitude));
  
  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;
  
  const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  
  const earthRadiusNm = 3440.065;
  return earthRadiusNm * c;
}

export function calculateVoyageDays(distanceNm: number, speedKnots: number) {
  return distanceNm / (speedKnots * 24);
}
