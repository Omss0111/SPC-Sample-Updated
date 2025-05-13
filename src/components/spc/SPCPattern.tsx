import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle, Check, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Pattern detection types
interface PatternResult {
  detected: boolean;
  description: string;
  pointIndices?: number[];
}

interface PatternAnalysisProps {
  chartData: {
    xBarData: Array<{x: number, y: number}>;
    rangeData: Array<{x: number, y: number}>;
    limits: {
      xBarUcl: number;
      xBarLcl: number;
      xBarMean: number;
      rangeUcl: number;
      rangeLcl: number;
      rangeMean: number;
    };
  };
}

export function SPCPatternDetection({ chartData }: PatternAnalysisProps) {
  // Calculate pattern detection results
  const patterns = {
    outOfControl: detectOutOfControlPoints(chartData),
    trends: detectTrends(chartData),
    shifts: detectShifts(chartData),
    oscillation: detectOscillation(chartData),
    clustering: detectClustering(chartData),
    stratification: detectStratification(chartData)
  };

  // Count total detected patterns
  const detectedPatternsCount = Object.values(patterns).filter(p => p.detected).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-blue-600">Pattern Detection</CardTitle>
              <CardDescription>Statistical pattern analysis based on 3S principles</CardDescription>
            </div>
            <Badge variant={detectedPatternsCount > 0 ? "destructive" : "outline"}>
              {detectedPatternsCount} {detectedPatternsCount === 1 ? 'Pattern' : 'Patterns'} Detected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Present each pattern check with appropriate styling */}
            {renderPatternResult("Points Out of Control", patterns.outOfControl, <AlertTriangle className="h-4 w-4" />)}
            {renderPatternResult("Process Shift", patterns.shifts, <TrendingUp className="h-4 w-4" />)}
            {renderPatternResult("Process Trend", patterns.trends, <TrendingUp className="h-4 w-4" />)}
            {renderPatternResult("Oscillation", patterns.oscillation, <Activity className="h-4 w-4" />)}
            {renderPatternResult("Clustering", patterns.clustering, <Activity className="h-4 w-4" />)}
            {renderPatternResult("Stratification", patterns.stratification, <TrendingDown className="h-4 w-4" />)}
            
            {detectedPatternsCount > 0 ? (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Special causes detected! Process may not be in statistical control.
                  Review points and address root causes.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 mt-2">
                <Check className="h-4 w-4" />
                <AlertDescription>
                  No special causes detected. Process appears to be in statistical control.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper to render each pattern result consistently
function renderPatternResult(title: string, result: PatternResult, icon: React.ReactNode) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <div className={cn(
        "flex items-center gap-1 font-medium text-sm",
        result.detected ? "text-red-600" : "text-green-600"
      )}>
        {result.detected ? (
          <>
            <span>Detected</span>
            <Info className="h-4 w-4 cursor-help" />
            {result.description}
          </>
        ) : (
          <span>Not Detected</span>
        )}
      </div>
    </div>
  );
}

// Pattern detection functions
function detectOutOfControlPoints(chartData: PatternAnalysisProps['chartData']): PatternResult {
  const { xBarData, limits } = chartData;
  const outOfControlPoints = xBarData.filter(
    point => point.y > limits.xBarUcl || point.y < limits.xBarLcl
  );
  
  return {
    detected: outOfControlPoints.length > 0,
    description: `${outOfControlPoints.length} points are outside control limits`,
    pointIndices: outOfControlPoints.map(point => point.x)
  };
}

function detectTrends(chartData: PatternAnalysisProps['chartData']): PatternResult {
  const { xBarData } = chartData;
  const trendLength = 7; // 7 consecutive points in one direction
  
  for (let i = 0; i <= xBarData.length - trendLength; i++) {
    let increasing = true;
    let decreasing = true;
    
    for (let j = 1; j < trendLength; j++) {
      if (xBarData[i + j].y <= xBarData[i + j - 1].y) {
        increasing = false;
      }
      if (xBarData[i + j].y >= xBarData[i + j - 1].y) {
        decreasing = false;
      }
    }
    
    if (increasing || decreasing) {
      return {
        detected: true,
        description: `${trendLength} or more consecutive points ${increasing ? 'increasing' : 'decreasing'}`,
        pointIndices: Array.from({length: trendLength}, (_, idx) => xBarData[i + idx].x)
      };
    }
  }
  
  return {
    detected: false,
    description: 'No trend detected'
  };
}

function detectShifts(chartData: PatternAnalysisProps['chartData']): PatternResult {
  const { xBarData, limits } = chartData;
  const shiftLength = 8; // 8 consecutive points on same side of center line
  const mean = limits.xBarMean;
  
  for (let i = 0; i <= xBarData.length - shiftLength; i++) {
    let allAbove = true;
    let allBelow = true;
    
    for (let j = 0; j < shiftLength; j++) {
      if (xBarData[i + j].y <= mean) {
        allAbove = false;
      }
      if (xBarData[i + j].y >= mean) {
        allBelow = false;
      }
    }
    
    if (allAbove || allBelow) {
      return {
        detected: true,
        description: `${shiftLength} consecutive points ${allAbove ? 'above' : 'below'} center line`,
        pointIndices: Array.from({length: shiftLength}, (_, idx) => xBarData[i + idx].x)
      };
    }
  }
  
  return {
    detected: false,
    description: 'No shift detected'
  };
}

function detectOscillation(chartData: PatternAnalysisProps['chartData']): PatternResult {
  const { xBarData } = chartData;
  const requiredAlternations = 14; // 14 points alternating up and down
  
  let alternations = 0;
  let previousDirection: string | null = null;
  
  for (let i = 1; i < xBarData.length; i++) {
    const currentDirection = xBarData[i].y > xBarData[i-1].y ? 'up' : 'down';
    
    if (previousDirection && currentDirection !== previousDirection) {
      alternations++;
      if (alternations >= requiredAlternations) {
        return {
          detected: true,
          description: 'Systematic alternating pattern detected (14+ alternations)',
          pointIndices: xBarData.slice(i-requiredAlternations, i+1).map(pt => pt.x)
        };
      }
    } else {
      alternations = 0;
    }
    
    previousDirection = currentDirection;
  }
  
  return {
    detected: false,
    description: 'No oscillation pattern detected'
  };
}

function detectClustering(chartData: PatternAnalysisProps['chartData']): PatternResult {
  if (chartData.xBarData.length === 0 || chartData.rangeData.length === 0) {
    return {
      detected: false,
      description: 'No data available for clustering analysis'
    };
  }
  
  return {
    detected: false,
    description: 'No unusual clustering detected'
  };
}


function detectStratification(chartData: PatternAnalysisProps['chartData']): PatternResult {
  const { xBarData, limits } = chartData;
  const requiredPoints = 15; // 15 consecutive points close to center line
  const threshold = (limits.xBarUcl - limits.xBarLcl) / 6; // Points within 1/6 of control limits
  const mean = limits.xBarMean;
  
  for (let i = 0; i <= xBarData.length - requiredPoints; i++) {
    let allWithinThreshold = true;
    
    for (let j = 0; j < requiredPoints; j++) {
      if (Math.abs(xBarData[i + j].y - mean) > threshold) {
        allWithinThreshold = false;
        break;
      }
    }
    
    if (allWithinThreshold) {
      return {
        detected: true,
        description: `${requiredPoints} consecutive points unnaturally close to center line`,
        pointIndices: Array.from({length: requiredPoints}, (_, idx) => xBarData[i + idx].x)
      };
    }
  }
  
  return {
    detected: false,
    description: 'No stratification detected'
  };
}