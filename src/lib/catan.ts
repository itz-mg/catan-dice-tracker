import type { Roll } from "./storage";

export const CATAN_PROBABILITIES: Record<number, number> = {
  2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36, 7: 6/36,
  8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36
};

export const DICE_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const PIPS_COUNT: Record<number, number> = {
  2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1
};

export function getExpectedRolls(totalRolls: number, value: number): number {
  return totalRolls * (CATAN_PROBABILITIES[value] || 0);
}

export function calcStats(rolls: Roll[]) {
  const total = rolls.length;
  if (total === 0) {
    return {
      total: 0,
      avg: 0,
      mostCommon: 0,
      leastCommon: 0,
      sevenCount: 0,
      sevenPercent: 0,
      distribution: DICE_VALUES.reduce((acc, v) => ({ ...acc, [v]: 0 }), {} as Record<number, number>)
    };
  }

  const distribution = DICE_VALUES.reduce((acc, v) => ({ ...acc, [v]: 0 }), {} as Record<number, number>);
  let sum = 0;
  
  for (const r of rolls) {
    distribution[r.value]++;
    sum += r.value;
  }
  
  const avg = Number((sum / total).toFixed(2));
  
  let mostCommon = 0;
  let highestCount = -1;
  let leastCommon = 0;
  let lowestCount = Infinity;
  
  for (const v of DICE_VALUES) {
    const count = distribution[v];
    if (count > highestCount) {
      highestCount = count;
      mostCommon = v;
    }
    if (count < lowestCount) {
      lowestCount = count;
      leastCommon = v;
    }
  }
  
  const sevenCount = distribution[7];
  const sevenPercent = Number(((sevenCount / total) * 100).toFixed(1));

  return {
    total,
    avg,
    mostCommon,
    leastCommon,
    sevenCount,
    sevenPercent,
    distribution
  };
}
