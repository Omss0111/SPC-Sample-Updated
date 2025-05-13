import { format } from "date-fns";
import { AnalysisData, SSAnalysis, ProcessInterpretation } from "@/types/spc";

const calculateDistributionData = (data: number[], lsl: number, usl: number): { data: Array<{ x: number; y: number }>; numberOfBins: number } => {
  const zigZagX = [0, 10, 1, 8, 2, 9, 3, 7, 4, 6];
  const zigZagY = [10, 1, 8, 2, 9, 3, 7, 4, 6, 0];
  const histogramData = zigZagX.map((x, i) => ({ x, y: zigZagY[i] }));
  return { data: histogramData, numberOfBins: zigZagX.length };
};

export const analyzeData = (params: {
  startDate: Date;
  endDate: Date;
  selectedShifts: number[];
  material: string;
  operation: string;
  gauge: string;
}): AnalysisData => {
  const zigZagXBar = [0, 10, 1, 8, 2, 9, 3, 7, 4, 6];
  const zigZagRange = [10, 1, 8, 2, 9, 3, 7, 4, 6, 0];
  const xBarData = zigZagXBar.map((y, index) => ({ x: index + 1, y }));
  const rangeData = zigZagRange.map((y, index) => ({ x: index + 1, y }));

  const analysis: AnalysisData = {
    metrics: {
      xBar: 5,
      stdDevOverall: 3,
      stdDevWithin: 2,
      movingRange: 4,
      cp: 1.5,
      cpkUpper: 1.8,
      cpkLower: 1.7,
      cpk: 1.7,
      pp: 1.6,
      ppu: 1.9,
      ppl: 1.4,
      ppk: 1.4,
      lsl: 0,
      usl: 10
    },
    controlCharts: {
      xBarData,
      rangeData,
      limits: {
        xBarUcl: 12,
        xBarLcl: -2,
        xBarMean: 5,
        rangeUcl: 15,
        rangeLcl: 0,
        rangeMean: 5
      }
    },
    distribution: {
      data: calculateDistributionData([], 0, 10).data,
      stats: {
        mean: 5,
        stdDev: 3,
        target: 5
      },
      numberOfBins: 10
    },
    ssAnalysis: {
      processShift: "Yes",
      processSpread: "Yes",
      specialCause: "Variation Detected"
    } as SSAnalysis,
    processInterpretation: {
      shortTermCapability: "Process meets spec",
      shortTermCentered: "Centered",
      longTermPerformance: "Performance good",
      longTermCentered: "Centered"
    } as ProcessInterpretation
  };

  return analysis;
};

interface InspectionData {
  TrnDate: string;
  ShiftCode: number;
  MaterialCode: number;
  OperationCode: number;
  GuageCode: number;
  ActualSpecification: string;
  ToSpecification: string;
  FromSpecification: string;
}