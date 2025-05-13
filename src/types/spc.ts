// Process metrics types
export interface ProcessMetrics {
    xBar: number;
    stdDevOverall: number;
    stdDevWithin: number;
    movingRange: number;
    cp: number;
    cpkUpper: number;
    cpkLower: number;
    cpk: number;
    pp: number;
    ppu: number;
    ppl: number;
    ppk: number;
    lsl: number;
    usl: number;
  }
  
  export interface ChartLimits {
    xBarUcl: number;
    xBarLcl: number;
    xBarMean: number;
    rangeUcl: number;
    rangeLcl: number;
    rangeMean: number;
  }
  
  export interface ControlChartData {
    xBarData: Array<{x: number; y: number}>;
    rangeData: Array<{x: number; y: number}>;
    limits: ChartLimits;
  }
  
  export interface DistributionData {
    data: Array<{x: number; y: number}>;
    stats: {
      mean: number;
      stdDev: number;
      target: number;
    };
    numberOfBins: number;
  }
  
  export interface SSAnalysis {
    processShift: string;
    processSpread: string;
    specialCause: string;
  }
  
  export interface ProcessInterpretation {
    shortTermCapability: string;
    shortTermCentered: string;
    longTermPerformance: string;
    longTermCentered: string;
  }
  
  export interface AnalysisData {
    metrics: ProcessMetrics;
    controlCharts: ControlChartData;
    distribution: DistributionData;
    ssAnalysis: SSAnalysis;
    processInterpretation: ProcessInterpretation;
  }
  
  // API data types
  export interface ShiftData {
    ShiftId: number;
    ShiftName: string;
  }
  
  export interface MaterialData {
    MaterialCode: string;
    MaterialName: string;
  }
  
  export interface OperationData {
    OperationCode: string;
    OperationName: string;
  }
  
  export interface GuageData {
    GuageCode: string;
    GuageName: string;
  }
  
  export interface InspectionData {
    ShiftCode: number;
    ActualSpecification: string;
    FromSpecification: string;
    ToSpecification: string;
  }
  
  // Parameters
  export interface AnalysisParameters {
    startDate: Date;
    endDate: Date;
    selectedShifts: number[];
    material: string;
    operation: string;
    gauge: string;
  }