import { InspectionData, AnalysisData } from "@/types";

// Control chart constants for sample sizes 1 to 5 as provided
const controlChartConstants: {
  [key: string]: { A2: number; D3: number; D4: number; d2: number };
} = {
  "1": { A2: 2.66, D3: 0, D4: 3.267, d2: 1.128 },
  "2": { A2: 1.88, D3: 0, D4: 3.267, d2: 1.128 },
  "3": { A2: 1.772, D3: 0, D4: 2.574, d2: 1.693 },
  "4": { A2: 0.796, D3: 0, D4: 2.282, d2: 2.059 },
  "5": { A2: 0.691, D3: 0, D4: 2.114, d2: 2.326 },
};

function calculateMean(data: number[]): number | null {
  if (data.length === 0) return null;
  const filtered = data.filter(v => Number.isFinite(v));
  return filtered.length ? filtered.reduce((sum, val) => sum + val, 0) / filtered.length : null;
}

function calculateStdDev(data: number[], mean: number | null = null): number | null {
  if (data.length === 0) return null;
  const m = mean ?? calculateMean(data);
  if (m == null) return null;
  const squaredDiffs = data.map(v => Math.pow(v - m, 2)).filter(Number.isFinite);
  const variance = calculateMean(squaredDiffs);
  return variance != null ? Math.sqrt(variance) : null;
}

function calculateDistributionData(data: number[], lsl: number, usl: number): AnalysisData["distribution"] | null {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const binCount = Math.ceil(Math.sqrt(data.length));
  const binWidth = range / binCount;
  const binStart = Math.min(min, lsl);
  const bins = Array(binCount).fill(0);
  const binEdges = Array(binCount + 1).fill(0).map((_, i) => binStart + i * binWidth);

  data.forEach((v) => {
    if (!Number.isFinite(v)) return;
    const index = v === max ? binCount - 1 : Math.floor((v - binStart) / binWidth);
    if (index >= 0 && index < binCount) bins[index]++;
  });

  const histData = bins.map((count, i) => ({ x: Number((binEdges[i] + binWidth / 2).toFixed(4)), y: count }));

  return {
    data: histData,
    stats: {
      min,
      max,
      mean: calculateMean(data) ?? 0,
      target: (lsl + usl) / 2,
      binEdges,
    },
  };
}

function analyzeRuns(data: number[]): {
  runsAbove: number;
  runsBelow: number;
  maxRunLength: number;
  maxTrendUp: number;
  maxTrendDown: number;
} | null {
  if (!data.length) return null;
  const mean = calculateMean(data);
  if (mean === null) return null;

  let runsAbove = 0, runsBelow = 0, maxRunLength = 0, currentRun = 0;
  let prevAboveMean: boolean | null = null;

  data.forEach(value => {
    const isAbove = value > mean;
    if (prevAboveMean === null) {
      prevAboveMean = isAbove;
      currentRun = 1;
    } else if (isAbove === prevAboveMean) {
      currentRun++;
    } else {
      if (prevAboveMean) runsAbove++; else runsBelow++;
      maxRunLength = Math.max(maxRunLength, currentRun);
      currentRun = 1;
      prevAboveMean = isAbove;
    }
  });

  if (prevAboveMean !== null) {
    if (prevAboveMean) runsAbove++; else runsBelow++;
    maxRunLength = Math.max(maxRunLength, currentRun);
  }

  let maxTrendUp = 0, maxTrendDown = 0, trendUp = 1, trendDown = 1;
  for (let i = 1; i < data.length; i++) {
    if (data[i] > data[i - 1]) {
      trendUp++;
      trendDown = 1;
    } else if (data[i] < data[i - 1]) {
      trendDown++;
      trendUp = 1;
    } else {
      trendUp = trendDown = 1;
    }
    maxTrendUp = Math.max(maxTrendUp, trendUp);
    maxTrendDown = Math.max(maxTrendDown, trendDown);
  }

  return { runsAbove, runsBelow, maxRunLength, maxTrendUp, maxTrendDown };
}

export function calculateAnalysisData(inspectionData: InspectionData[], sampleSize: number = 5): AnalysisData {
  const sampleKey = sampleSize.toString();
  if (!controlChartConstants[sampleKey]) throw new Error("Invalid sample size");

  const validData = inspectionData.filter(d => {
    const a = parseFloat(d.ActualSpecification);
    const l = parseFloat(d.FromSpecification);
    const u = parseFloat(d.ToSpecification);
    return Number.isFinite(a) && Number.isFinite(l) && Number.isFinite(u);
  });

  const measurements = validData.map(d => parseFloat(d.ActualSpecification));
  if (measurements.length < sampleSize) throw new Error("Insufficient data");

  const lsl = parseFloat(validData[0].FromSpecification);
  const usl = parseFloat(validData[0].ToSpecification);
  const constants = controlChartConstants[sampleKey];

  let subgroupRanges: number[] = [];
  let subgroupMeans: number[] = [];

  if (sampleSize === 1) {
    for (let i = 1; i < measurements.length; i++) {
      const mr = Math.abs(measurements[i] - measurements[i - 1]);
      if (Number.isFinite(mr)) subgroupRanges.push(mr);
    }
    subgroupMeans = measurements.map(v => Number.isFinite(v) ? v : 0);
  } else {
    for (let i = 0; i < measurements.length; i += sampleSize) {
      const group = measurements.slice(i, i + sampleSize);
      if (group.length) {
        subgroupMeans.push(calculateMean(group) ?? 0);
        subgroupRanges.push(Math.max(...group) - Math.min(...group));
      }
    }
  }

  const grandMean = calculateMean(subgroupMeans) ?? 0;
  const avgRange = calculateMean(subgroupRanges) ?? 0;
  const stdDev = calculateStdDev(measurements, grandMean) ?? 0;

  const xBarUcl = grandMean + constants.A2 * avgRange;
  const xBarLcl = grandMean - constants.A2 * avgRange;
  const rangeUcl = constants.D4 * avgRange;
  const rangeLcl = constants.D3 * avgRange;

  const withinStdDev = sampleSize === 1 ? avgRange / constants.d2 : avgRange / constants.d2;

  const cp = (usl - lsl) / (6 * withinStdDev);
  const cpu = (usl - grandMean) / (3 * withinStdDev);
  const cpl = (grandMean - lsl) / (3 * withinStdDev);
  const cpk = Math.min(cpu, cpl);

  const pp = (usl - lsl) / (6 * stdDev);
  const ppu = (usl - grandMean) / (3 * stdDev);
  const ppl = (grandMean - lsl) / (3 * stdDev);
  const ppk = Math.min(ppu, ppl);

  const distribution = calculateDistributionData(measurements, lsl, usl) ?? { data: [], stats: { min: 0, max: 0, mean: 0, target: (lsl + usl) / 2, binEdges: [] } };
  const runs = analyzeRuns(subgroupMeans) ?? { runsAbove: 0, runsBelow: 0, maxRunLength: 0, maxTrendUp: 0, maxTrendDown: 0 };

  const xBarData = subgroupMeans.map((y, i) => ({ x: i + 1, y }));
  const rangeData = subgroupRanges.map((y, i) => ({ x: i + 1, y }));

  return {
    metrics: {
      xBar: grandMean,
      stdDevOverall: stdDev,
      stdDevWithin: withinStdDev,
      avgRange,
      cp, cpu, cpl, cpk, pp, ppu, ppl, ppk,
      lsl, usl, target: (lsl + usl) / 2,
    },
    controlCharts: {
      xBarData,
      rangeData,
      limits: {
        xBarUcl, xBarMean: grandMean, xBarLcl,
        rangeUcl, rangeMean: avgRange, rangeLcl,
        Agostinho: Math.abs(grandMean - distribution.stats.mean) / stdDev,
      }
    },
    distribution,
    ssAnalysis: {
      processShift: cpk < 0.75 * cp ? "Yes" : "No",
      processSpread: cp < 1 ? "Yes" : "No",
      specialCausePresent: pp >= cp ? "Special Cause Detection impossible" : pp < 0.75 * cp ? "Yes" : "No",
      pointsOutsideLimits: xBarData.filter(p => p.y > xBarUcl || p.y < xBarLcl).length > 0 ? "Points Detected" : "None",
      rangePointsOutsideLimits: rangeData.filter(p => p.y > rangeUcl || p.y < rangeLcl).length > 0 ? "Points Detected" : "None",
      eightConsecutivePoints: runs.maxRunLength >= 8 ? "Yes" : "No",
      sixConsecutiveTrend: Math.max(runs.maxTrendUp, runs.maxTrendDown) >= 6 ? "Yes" : "No",
    },
    processInterpretation: {
      decisionRemark: cpk >= 1.67 ? "Process Excellent" : cpk >= 1.45 ? "Process more capable, improve" : cpk >= 1.33 ? "Process capable" : cpk >= 1.0 ? "Slightly capable" : "Stop and fix",
      processPotential: cp >= 1.33 ? "Excellent" : cp >= 1.0 ? "Good" : "Poor",
      processPerformance: cpk >= 1.33 ? "Excellent" : cpk >= 1.0 ? "Good" : "Poor",
      processStability: xBarData.every(p => p.y >= xBarLcl && p.y <= xBarUcl) && !runs.maxRunLength ? "Stable" : "Unstable",
      processShift: runs.maxRunLength >= 8 ? "Present" : "Not Detected",
    }
  };
}