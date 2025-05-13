// src/types.ts

export interface FormState {
  selectedShifts: string[];
  material: string;
  operation: string;
  gauge: string;
  sampleSize: string;
  startDate: Date;
  endDate: Date;
}

export interface Shift {
  ShiftId: string;
  ShiftName: string;
}

export interface Material {
  MaterialCode: string;
  MaterialName: string;
}

export interface Operation {
  OperationCode: string;
  OperationName: string;
}

export interface Gauge {
  GuageCode: string; // Note: Typo in "Guage" (should be "Gauge"), retained for consistency
  GuageName: string;
}

export interface InspectionData {
  ShiftCode: string;
  ActualSpecification: string;
  FromSpecification: string;
  ToSpecification: string;
}

export interface ChartPoint {
  x: number;
  y: number;
}

export interface DistributionData {
  data: { x: number; y: number }[];
  stats: {
    min: number;
    max: number;
    mean: number;
    target: number;
    binEdges: number[];
  };
}

export interface ControlChartLimits {
  xBarUcl: number;
  xBarMean: number;
  xBarLcl: number;
  rangeUcl: number;
  rangeMean: number;
  rangeLcl: number;
}

export interface ControlCharts {
  xBarData: ChartPoint[];
  rangeData: ChartPoint[];
  limits: ControlChartLimits;
}

export interface Metrics {
  xBar: number;
  stdDevOverall: number;
  stdDevWithin: number;
  avgRange: number;
  cp: number;
  cpu: number; // Added for upper process capability
  cpl: number; // Added for lower process capability
  cpk: number;
  pp: number;
  ppu: number; // Added for upper preliminary process capability
  ppl: number; // Added for lower preliminary process capability
  ppk: number;
  lsl: number;
  usl: number;
  target: number;
}

export interface SSAnalysis {
  pointsOutsideLimits: string;
  rangePointsOutsideLimits: string;
  eightConsecutivePoints: string;
  sixConsecutiveTrend: string;
  processShift: string; // Added to match ssAnalysis in AnalysisData
  processSpread: string; // Added to match ssAnalysis in AnalysisData
  specialCausePresent: string; // Added to match ssAnalysis in AnalysisData
}

export interface ProcessInterpretation {
  decisionRemark: string; // Added to match processInterpretation in AnalysisData
  processPotential: string;
  processPerformance: string;
  processStability: string;
  processShift: string;
}

export interface AnalysisData {
  metrics: Metrics; // Updated to reference the Metrics interface
  controlCharts: {
    xBarData: { x: number; y: number }[];
    rangeData: { x: number; y: number }[];
    limits: {
      xBarUcl: number;
      xBarMean: number;
      xBarLcl: number;
      Agostinho: number;
      rangeUcl: number;
      rangeMean: number;
      rangeLcl: number;
    };
  };
  distribution: {
    data: { x: number; y: number }[];
    stats: {
      min: number;
      max: number;
      mean: number;
      target: number;
      binEdges: number[];
    };
  };
  ssAnalysis: {
    processShift: string;
    processSpread: string;
    specialCausePresent: string;
    pointsOutsideLimits: string;
    rangePointsOutsideLimits: string;
    eightConsecutivePoints: string;
    sixConsecutiveTrend: string;
  };
  processInterpretation: {
    decisionRemark: string;
    processPotential: string;
    processPerformance: string;
    processStability: string;
    processShift: string;
  };
}