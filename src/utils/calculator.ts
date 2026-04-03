export interface CalcInputs {
  batteryCapacity: number;
  currentSoc: number;
  targetSoc: number;
  chargerPower: number;
  efficiency: number;
  electricityPrice: number;
}

export interface CalcResults {
  energyToAdd: number;
  energyDrawn: number;
  chargeTimeHours: number;
  chargeTimeMinutes: number;
  cost: number;
  effectivePower: number;
}

export function calculate(inputs: CalcInputs): CalcResults {
  const {
    batteryCapacity,
    currentSoc,
    targetSoc,
    chargerPower,
    efficiency,
    electricityPrice,
  } = inputs;

  const socDelta = Math.max(0, targetSoc - currentSoc);
  const energyToAdd = (socDelta / 100) * batteryCapacity;
  const efficiencyFraction = efficiency / 100;
  const energyDrawn = efficiencyFraction > 0 ? energyToAdd / efficiencyFraction : 0;
  const totalHours = chargerPower > 0 ? energyDrawn / chargerPower : 0;
  const chargeTimeHours = Math.floor(totalHours);
  const chargeTimeMinutes = Math.round((totalHours - chargeTimeHours) * 60);
  const cost = energyDrawn * electricityPrice;
  const effectivePower = chargerPower * efficiencyFraction;

  return {
    energyToAdd,
    energyDrawn,
    chargeTimeHours,
    chargeTimeMinutes,
    cost,
    effectivePower,
  };
}

export function encodeParams(inputs: CalcInputs): string {
  const params = new URLSearchParams({
    cap: String(inputs.batteryCapacity),
    cur: String(inputs.currentSoc),
    tgt: String(inputs.targetSoc),
    pwr: String(inputs.chargerPower),
    eff: String(inputs.efficiency),
    pri: String(inputs.electricityPrice),
  });
  return params.toString();
}

export function decodeParams(search: string): Partial<CalcInputs> {
  const params = new URLSearchParams(search);
  const result: Partial<CalcInputs> = {};

  const cap = parseFloat(params.get('cap') ?? '');
  const cur = parseFloat(params.get('cur') ?? '');
  const tgt = parseFloat(params.get('tgt') ?? '');
  const pwr = parseFloat(params.get('pwr') ?? '');
  const eff = parseFloat(params.get('eff') ?? '');
  const pri = parseFloat(params.get('pri') ?? '');

  if (!isNaN(cap) && cap > 0) result.batteryCapacity = cap;
  if (!isNaN(cur) && cur >= 0 && cur <= 100) result.currentSoc = cur;
  if (!isNaN(tgt) && tgt >= 0 && tgt <= 100) result.targetSoc = tgt;
  if (!isNaN(pwr) && pwr > 0) result.chargerPower = pwr;
  if (!isNaN(eff) && eff >= 50 && eff <= 100) result.efficiency = eff;
  if (!isNaN(pri) && pri >= 0) result.electricityPrice = pri;

  return result;
}
