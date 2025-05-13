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

function calculateSubgroupXBar(measurements: number[], sampleSize: number): number[] {
  const xBarValues: number[] = [];
  
  if (sampleSize === 1) {
    // For individual values, each point is its own subgroup
    return measurements;
  }

  // For sample sizes 2-5, group measurements and calculate averages
  for (let i = 0; i < measurements.length; i += sampleSize) {
    const subgroup = measurements.slice(i, Math.min(i + sampleSize, measurements.length));
    if (subgroup.length > 0) {
      // Calculate average based on actual number of points in subgroup
      const subgroupAvg = subgroup.reduce((sum, val) => sum + val, 0) / subgroup.length;
      xBarValues.push(subgroupAvg);
    }
  }

  return xBarValues;
}

function calculateSubgroupRanges(measurements: number[], sampleSize: number): number[] {
  const ranges: number[] = [];

  if (sampleSize === 1) {
    // For individual values, calculate moving ranges between consecutive points
    for (let i = 1; i < measurements.length; i++) {
      ranges.push(Math.abs(measurements[i] - measurements[i - 1]));
    }
    return ranges;
  }

  // For sample sizes 2-5, calculate range within each complete subgroup
  for (let i = 0; i < measurements.length; i += sampleSize) {
    const subgroup = measurements.slice(i, Math.min(i + sampleSize, measurements.length));
    if (subgroup.length > 1) { // At least 2 points needed for range
      const range = Math.max(...subgroup) - Math.min(...subgroup);
      ranges.push(range);
    }
  }

  return ranges;
}

function calculateMean(data: number[]): number | null {
  if (data.length === 0) return null;
  return data.reduce((sum, value) => sum + value, 0) / data.length;
}

function calculateStdDev(data: number[], mean: number | null = null): number | null {
  if (data.length === 0) return null;
  const dataMean = mean ?? calculateMean(data);
  if (dataMean === null) return null;
  const squaredDiffs = data.map((value) => Math.pow(value - dataMean, 2));
  const variance = calculateMean(squaredDiffs);
  return variance !== null ? Math.sqrt(variance) : null;
}

function calculateDistributionData(data: number[], lsl: number, usl: number): AnalysisData["distribution"] | null {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const binCount = Math.ceil(Math.sqrt(data.length));
  const binWidth = range / binCount;
  const binStart = Math.min(min, lsl);

  const bins = Array(binCount).fill(0);
  const binEdges = Array(binCount + 1).fill(0).map((_, i) => binStart + i * binWidth);

  data.forEach((value) => {
    if (value === max) {
      bins[binCount - 1]++;
      return;
    }
    const binIndex = Math.floor((value - binStart) / binWidth);
    if (binIndex >= 0 && binIndex < binCount) bins[binIndex]++;
  });

  const histData = bins.map((count, i) => ({
    x: Number((binEdges[i] + binWidth / 2).toFixed(4)),
    y: count,
  }));

  return {
    data: histData,
    stats: {
      mean: calculateMean(data) ?? 0,
      target: (usl + lsl) / 2,
      binEdges,
      min: min,
      max: max,
    },
  };
}

export function calculateAnalysisData(
  inspectionData: InspectionData[],
  sampleSize: number = 5
): AnalysisData {
  const sampleSizeStr = sampleSize.toString();
  if (!controlChartConstants[sampleSizeStr]) {
    throw new Error("Sample size must be between 1 and 5");
  }

  // Extract and validate measurements
  const measurements = inspectionData
    .map(d => parseFloat(d.ActualSpecification))
    .filter(m => !isNaN(m));

  if (measurements.length < sampleSize) {
    throw new Error("Insufficient valid data for analysis");
  }

  // Get specification limits
  const lsl = parseFloat(inspectionData[0].FromSpecification);
  const usl = parseFloat(inspectionData[0].ToSpecification);
  const constants = controlChartConstants[sampleSizeStr];

  // Calculate subgroup statistics with proper handling of incomplete subgroups
  const xBarValues = calculateSubgroupXBar(measurements, sampleSize);
  const rangeValues = calculateSubgroupRanges(measurements, sampleSize);

  // Calculate overall statistics
  const grandMean = calculateMean(xBarValues) ?? 0;
  const avgRange = calculateMean(rangeValues) ?? 0;

  // Calculate control limits
  const xBarUcl = grandMean + constants.A2 * avgRange;
  const xBarLcl = grandMean - constants.A2 * avgRange;
  const rangeUcl = constants.D4 * avgRange;
  const rangeLcl = constants.D3 * avgRange;

  // Prepare chart data
  const xBarData = xBarValues.map((mean, i) => ({ x: i + 1, y: mean }));
  const rangeData = rangeValues.map((range, i) => ({ x: i + 1, y: range }));

  // Calculate process capability indices
  const stdDev = calculateStdDev(measurements) ?? 0;
  const withinStdDev = avgRange / constants.d2;

  // Prevent division by zero for capability indices
  const safeWithinStdDev = withinStdDev === 0 ? 0.000001 : withinStdDev;
  const safeStdDev = stdDev === 0 ? 0.000001 : stdDev;

  const cp = (usl - lsl) / (6 * safeWithinStdDev);
  const cpu = (usl - grandMean) / (3 * safeWithinStdDev);
  const cpl = (grandMean - lsl) / (3 * safeWithinStdDev);
  const cpk = Math.min(cpu, cpl);

  const pp = (usl - lsl) / (6 * safeStdDev);
  const ppu = (usl - grandMean) / (3 * safeStdDev);
  const ppl = (grandMean - lsl) / (3 * safeStdDev);
  const ppk = Math.min(ppu, ppl);

  // Analyze for special causes
  const pointsOutsideXBarLimits = xBarData.filter(
    point => point.y > xBarUcl || point.y < xBarLcl
  ).length;

  const pointsOutsideRangeLimits = rangeData.filter(
    point => point.y > rangeUcl || point.y < rangeLcl
  ).length;

  // Check for runs and trends
  let consecutiveAboveMean = 0;
  let consecutiveBelowMean = 0;
  let maxConsecutiveAbove = 0;
  let maxConsecutiveBelow = 0;
  let consecutiveIncreasing = 0;
  let consecutiveDecreasing = 0;

  for (let i = 0; i < xBarData.length; i++) {
    // Check for runs above/below mean
    if (xBarData[i].y > grandMean) {
      consecutiveAboveMean++;
      consecutiveBelowMean = 0;
      maxConsecutiveAbove = Math.max(maxConsecutiveAbove, consecutiveAboveMean);
    } else if (xBarData[i].y < grandMean) {
      consecutiveBelowMean++;
      consecutiveAboveMean = 0;
      maxConsecutiveBelow = Math.max(maxConsecutiveBelow, consecutiveBelowMean);
    } else {
      consecutiveAboveMean = 0;
      consecutiveBelowMean = 0;
    }

    // Check for trends
    if (i > 0) {
      if (xBarData[i].y > xBarData[i-1].y) {
        consecutiveIncreasing++;
        consecutiveDecreasing = 0;
      } else if (xBarData[i].y < xBarData[i-1].y) {
        consecutiveDecreasing++;
        consecutiveIncreasing = 0;
      } else {
        consecutiveIncreasing = 0;
        consecutiveDecreasing = 0;
      }
    }
  }

  const hasEightConsecutive = maxConsecutiveAbove >= 8 || maxConsecutiveBelow >= 8;
  const hasSixConsecutiveTrend = consecutiveIncreasing >= 6 || consecutiveDecreasing >= 6;

  return {
    metrics: {
      xBar: Number(grandMean.toFixed(4)),
      stdDevOverall: Number(stdDev.toFixed(4)),
      stdDevWithin: Number(withinStdDev.toFixed(4)),
      avgRange: Number(avgRange.toFixed(4)),
      cp: Number(isFinite(cp) ? cp.toFixed(2) : "0.00"),
      cpu: Number(isFinite(cpu) ? cpu.toFixed(2) : "0.00"),
      cpl: Number(isFinite(cpl) ? cpl.toFixed(2) : "0.00"),
      cpk: Number(isFinite(cpk) ? cpk.toFixed(2) : "0.00"),
      pp: Number(isFinite(pp) ? pp.toFixed(2) : "0.00"),
      ppu: Number(isFinite(ppu) ? ppu.toFixed(2) : "0.00"),
      ppl: Number(isFinite(ppl) ? ppl.toFixed(2) : "0.00"),
      ppk: Number(isFinite(ppk) ? ppk.toFixed(2) : "0.00"),
      lsl: Number(lsl.toFixed(3)),
      usl: Number(usl.toFixed(3)),
      target: Number(((usl + lsl) / 2).toFixed(3)),
    },
    controlCharts: {
      xBarData,
      rangeData,
      limits: {
        xBarUcl: Number(xBarUcl.toFixed(4)),
        xBarMean: Number(grandMean.toFixed(4)),
        xBarLcl: Number(xBarLcl.toFixed(4)),
        rangeUcl: Number(rangeUcl.toFixed(4)),
        rangeMean: Number(avgRange.toFixed(4)),
        rangeLcl: Number(rangeLcl.toFixed(4)),
        Agostinho: Number(
          (Math.abs(grandMean - calculateMean(measurements)!) / stdDev).toFixed(4)
        ),
      },
    },
    distribution: calculateDistributionData(measurements, lsl, usl) ?? {
      data: [],
      stats: { 
        mean: 0, 
        target: (usl + lsl) / 2, 
        binEdges: [],
        min: 0,
        max: 0 
      },
    },
    ssAnalysis: {
      processShift: cpk < 0.75 * cp ? "Yes" : "No",
      processSpread: cp < 1 ? "Yes" : "No",
      specialCausePresent: pp >= cp ? "Special Cause Detection impossible" : pp < 0.75 * cp ? "Yes" : "No",
      pointsOutsideLimits: pointsOutsideXBarLimits > 0 ? 
        `${pointsOutsideXBarLimits} Points Detected` : 
        "None",
      rangePointsOutsideLimits: pointsOutsideRangeLimits > 0 ? 
        `${pointsOutsideRangeLimits} Points Detected` : 
        "None",
      eightConsecutivePoints: hasEightConsecutive ? "Yes" : "No",
      sixConsecutiveTrend: hasSixConsecutiveTrend ? "Yes" : "No",
    },
    processInterpretation: {
      decisionRemark: cpk >= 1.67 ? "Process Excellent" :
                      cpk >= 1.45 ? "Process is more capable, Scope for Further Improvement" :
                      cpk >= 1.33 ? "Process is capable, Scope for Further Improvement" :
                      cpk >= 1.0 ? "Process is slightly capable, need 100% inspection" :
                      "Stop Process change, process design",
      processPotential: cp >= 1.33 ? "Excellent" : cp >= 1.0 ? "Good" : "Poor",
      processPerformance: cpk >= 1.33 ? "Excellent" : cpk >= 1.0 ? "Good" : "Poor",
      processStability: pointsOutsideXBarLimits === 0 && !hasEightConsecutive ? "Stable" : "Unstable",
      processShift: hasEightConsecutive ? "Present" : "Not Detected",
    },
  };
}

export { calculateAnalysisData }
