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

/**
 * Calculate the mean of an array of numbers
 * @param data - Array of numeric values
 * @returns Mean value or null if array is empty
 */
function calculateMean(data: number[]): number | null {
  if (data.length === 0) return null;
  return data.reduce((sum, value) => sum + value, 0) / data.length;
}

/**
 * Calculate standard deviation of an array of numbers
 * @param data - Array of numeric values
 * @param mean - Mean value (optional)
 * @returns Standard deviation or null if calculation fails
 */
function calculateStdDev(data: number[], mean: number | null = null): number | null {
  if (data.length === 0) return null;
  const dataMean = mean ?? calculateMean(data);
  if (dataMean === null) return null;
  const squaredDiffs = data.map((value) => Math.pow(value - dataMean, 2));
  const variance = calculateMean(squaredDiffs);
  return variance !== null ? Math.sqrt(variance) : null;
}

/**
 * Calculate subgroup X-bar values based on sample size
 * @param measurements - Original measurement values
 * @param sampleSize - Sample size (1-5)
 * @returns Array of X-bar values for each subgroup
 */
function calculateSubgroupXBar(measurements: number[], sampleSize: number): number[] {
  const xBarValues: number[] = [];
  
  if (sampleSize === 1) {
    // For sample size 1, each measurement is its own X-bar value
    return [...measurements];
  } else {
    // For sample sizes 2-5, group measurements into subgroups
    for (let i = 0; i < measurements.length; i += sampleSize) {
      const subgroup = measurements.slice(i, Math.min(i + sampleSize, measurements.length));
      // Include incomplete subgroups (as per paste-2.txt explanations)
      if (subgroup.length > 0) {
        const subgroupAvg = subgroup.reduce((sum, val) => sum + val, 0) / subgroup.length;
        xBarValues.push(subgroupAvg);
      }
    }
  }

  return xBarValues;
}

/**
 * Calculate subgroup ranges based on sample size
 * @param measurements - Original measurement values
 * @param sampleSize - Sample size (1-5)
 * @returns Array of range values for each subgroup
 */
function calculateSubgroupRanges(measurements: number[], sampleSize: number): number[] {
  const ranges: number[] = [];

  if (sampleSize === 1) {
    // For individual values, calculate moving ranges (MR) between consecutive points
    for (let i = 1; i < measurements.length; i++) {
      ranges.push(Math.abs(measurements[i] - measurements[i - 1]));
    }
  } else {
    // For sample sizes 2-5, calculate range within each subgroup
    for (let i = 0; i < measurements.length; i += sampleSize) {
      const subgroup = measurements.slice(i, Math.min(i + sampleSize, measurements.length));
      // Include incomplete subgroups as long as there are at least 2 values
      if (subgroup.length >= 2) {
        const range = Math.max(...subgroup) - Math.min(...subgroup);
        ranges.push(range);
      }
    }
  }

  return ranges;
}

/**
 * Calculate distribution data for histogram
 * @param data - Array of numeric values
 * @param lsl - Lower specification limit
 * @param usl - Upper specification limit
 * @returns Histogram data with stats or null if invalid
 */
function calculateDistributionData(
  data: number[],
  lsl: number,
  usl: number
): AnalysisData["distribution"] | null {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Get an appropriate bin count based on data size
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
      min,
      max,
      mean: calculateMean(data) ?? 0,
      target: (usl + lsl) / 2,
      binEdges,
    },
  };
}

/**
 * Analyze samples for runs and trends
 * @param data - Array of values to check
 * @returns Analysis results or null if invalid
 */
function analyzeRuns(data: number[]): {
  maxRunAbove: number;
  maxRunBelow: number;
  maxTrendUp: number;
  maxTrendDown: number;
} | null {
  if (data.length === 0) return null;
  
  const mean = calculateMean(data);
  if (mean === null) return null;

  let currentRunAbove = 0;
  let currentRunBelow = 0;
  let maxRunAbove = 0;
  let maxRunBelow = 0;
  
  // Check for runs above/below mean
  data.forEach((value) => {
    if (value > mean) {
      currentRunAbove++;
      currentRunBelow = 0;
      maxRunAbove = Math.max(maxRunAbove, currentRunAbove);
    } else if (value < mean) {
      currentRunBelow++;
      currentRunAbove = 0;
      maxRunBelow = Math.max(maxRunBelow, currentRunBelow);
    } else {
      // Equal to mean - reset both counters
      currentRunAbove = 0;
      currentRunBelow = 0;
    }
  });

  // Check for trends (increasing/decreasing)
  let currentTrendUp = 1;
  let currentTrendDown = 1;
  let maxTrendUp = 1;
  let maxTrendDown = 1;

  for (let i = 1; i < data.length; i++) {
    if (data[i] > data[i - 1]) {
      currentTrendUp++;
      currentTrendDown = 1;
      maxTrendUp = Math.max(maxTrendUp, currentTrendUp);
    } else if (data[i] < data[i - 1]) {
      currentTrendDown++;
      currentTrendUp = 1;
      maxTrendDown = Math.max(maxTrendDown, currentTrendDown);
    } else {
      // Equal values - reset both counters
      currentTrendUp = 1;
      currentTrendDown = 1;
    }
  }

  return {
    maxRunAbove,
    maxRunBelow,
    maxTrendUp,
    maxTrendDown
  };
}

/**
 * Calculate analysis data from inspection data
 * @param inspectionData - Raw inspection data from API
 * @param sampleSize - Sample size (1-5, defaults to 5)
 * @returns Calculated analysis data or throws error if invalid
 */
export function calculateAnalysisData(
  inspectionData: InspectionData[],
  sampleSize: number = 5
): AnalysisData {
  // Validate sampleSize
  const sampleSizeStr = sampleSize.toString();
  if (!controlChartConstants[sampleSizeStr] || sampleSize < 1 || sampleSize > 5) {
    throw new Error("Sample size must be between 1 and 5");
  }

  // Filter out invalid data and extract measurements
  const validData = inspectionData.filter((d) => {
    const actual = d.ActualSpecification;
    const fromSpec = d.FromSpecification;
    const toSpec = d.ToSpecification;
    return (
      actual != null &&
      !isNaN(parseFloat(actual)) &&
      fromSpec != null &&
      !isNaN(parseFloat(fromSpec)) &&
      toSpec != null &&
      !isNaN(parseFloat(toSpec))
    );
  });

  const measurements = validData.map((d) => parseFloat(d.ActualSpecification));
  if (measurements.length < sampleSize) {
    throw new Error("Insufficient valid data for analysis");
  }

  // Get specification limits
  const lsl = parseFloat(validData[0].FromSpecification);
  const usl = parseFloat(validData[0].ToSpecification);

  // Get constants
  const constants = controlChartConstants[sampleSizeStr];

  // Calculate basic statistics
  const mean = calculateMean(measurements);
  const stdDev = calculateStdDev(measurements, mean);
  if (mean === null || stdDev === null) throw new Error("Failed to calculate statistics");

  // Calculate subgroup statistics
  const xBarValues = calculateSubgroupXBar(measurements, sampleSize);
  const rangeValues = calculateSubgroupRanges(measurements, sampleSize);

  // Calculate control limits
  const grandMean = calculateMean(xBarValues) ?? 0;
  const avgRange = calculateMean(rangeValues) ?? 0;

  const xBarUcl = grandMean + constants.A2 * avgRange;
  const xBarLcl = grandMean - constants.A2 * avgRange;
  const rangeUcl = constants.D4 * avgRange;
  const rangeLcl = constants.D3 * avgRange;

  // Prepare chart data
  const xBarData = xBarValues.map((mean, i) => ({ x: i + 1, y: mean }));
  const rangeData = rangeValues.map((range, i) => ({ x: i + 1, y: range }));

  // Calculate within subgroup standard deviation
  const withinStdDev = sampleSize === 1 || constants.d2 === 0 ? stdDev : avgRange / constants.d2;

  // Prevent division by zero
  const safeWithinStdDev = withinStdDev === 0 ? 0.000001 : withinStdDev;
  const safeStdDev = stdDev === 0 ? 0.000001 : stdDev;

  // Calculate process capability indices
  const cp = (usl - lsl) / (6 * safeWithinStdDev);
  const cpu = (usl - grandMean) / (3 * safeWithinStdDev);
  const cpl = (grandMean - lsl) / (3 * safeWithinStdDev);
  const cpk = Math.min(cpu, cpl);

  // Calculate process performance indices
  const pp = (usl - lsl) / (6 * safeStdDev);
  const ppu = (usl - grandMean) / (3 * safeStdDev);
  const ppl = (grandMean - lsl) / (3 * safeStdDev);
  const ppk = Math.min(ppu, ppl);

  // Calculate distribution data
  const distribution = calculateDistributionData(measurements, lsl, usl) ?? {
    data: [],
    stats: { min: 0, max: 0, mean: 0, target: (usl + lsl) / 2, binEdges: [] },
  };

  // Analyze for special causes
  const runsAnalysis = analyzeRuns(xBarValues) ?? {
    maxRunAbove: 0,
    maxRunBelow: 0,
    maxTrendUp: 0,
    maxTrendDown: 0,
  };

  // Detect special causes
  const pointsOutsideXBarLimits = xBarData.filter(
    (point) => point.y > xBarUcl || point.y < xBarLcl
  ).length;
  const pointsOutsideRangeLimits = rangeData.filter(
    (point) => point.y > rangeUcl || point.y < rangeLcl
  ).length;
  const hasEightConsecutive = runsAnalysis.maxRunAbove >= 8 || runsAnalysis.maxRunBelow >= 8;
  const hasSixConsecutiveTrend = runsAnalysis.maxTrendUp >= 6 || runsAnalysis.maxTrendDown >= 6;

  // 3S Analysis
  const processShift = cpk < 0.75 * cp ? "Yes" : "No";
  const processSpread = cp < 1 ? "Yes" : "No";
  const specialCausePresent =
    pp >= cp
      ? "Special Cause Detection impossible"
      : pp < 0.75 * cp
      ? "Yes"
      : "No";

  // Decision Remark based on Cpk
  let decisionRemark: string;
  if (cpk >= 1.67) {
    decisionRemark = "Process Excellent";
  } else if (cpk >= 1.45) {
    decisionRemark = "Process is more capable, Scope for Further Improvement";
  } else if (cpk >= 1.33) {
    decisionRemark = "Process is capable, Scope for Further Improvement";
  } else if (cpk >= 1.0) {
    decisionRemark = "Process is slightly capable, need 100% inspection";
  } else {
    decisionRemark = "Stop Process change, process design";
  }

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
          (Math.abs(grandMean - distribution.stats.mean) / stdDev).toFixed(4))
      },
    },
    distribution,
    ssAnalysis: {
      processShift,
      processSpread,
      specialCausePresent,
      pointsOutsideLimits: pointsOutsideXBarLimits > 0
        ? `${pointsOutsideXBarLimits} Points Detected`
        : "None",
      rangePointsOutsideLimits: pointsOutsideRangeLimits > 0
        ? `${pointsOutsideRangeLimits} Points Detected`
        : "None",
      eightConsecutivePoints: hasEightConsecutive ? "Yes" : "No",
      sixConsecutiveTrend: hasSixConsecutiveTrend ? "Yes" : "No",
    },
    processInterpretation: {
      decisionRemark,
      processPotential: cp >= 1.33 ? "Excellent" : cp >= 1.0 ? "Good" : "Poor",
      processPerformance: cpk >= 1.33 ? "Excellent" : cpk >= 1.0 ? "Good" : "Poor",
      processStability:
        pointsOutsideXBarLimits === 0 && !hasEightConsecutive
          ? "Stable"
          : "Unstable",
      processShift: hasEightConsecutive ? "Present" : "Not Detected",
    },
  };
}
