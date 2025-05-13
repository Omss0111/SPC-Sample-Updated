"use client";

import { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  CalendarIcon, Download, Search, Filter, Loader2, LineChart as LineChartIcon
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, BarChart, Bar
} from "recharts";
import Link from "next/link";

// Data interfaces
interface ProcessMetrics {
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

interface ChartLimits {
  xBarUcl: number;
  xBarLcl: number;
  xBarMean: number;
  rangeUcl: number;
  rangeLcl: number;
  rangeMean: number;
}

interface ControlChartData {
  xBarData: Array<{x: number; y: number}>;
  rangeData: Array<{x: number; y: number}>;
  limits: ChartLimits;
}

interface DistributionData {
  data: Array<{x: number; y: number}>;
  stats: {
    mean: number;
    stdDev: number;
    target: number;
  };
  numberOfBins: number;
}

interface SSAnalysis {
  processShift: string;
  processSpread: string;
  specialCause: string;
}

interface ProcessInterpretation {
  shortTermCapability: string;
  shortTermCentered: string;
  longTermPerformance: string;
  longTermCentered: string;
}

interface AnalysisData {
  metrics: ProcessMetrics;
  controlCharts: ControlChartData;
  distribution: DistributionData;
  ssAnalysis: SSAnalysis;
  processInterpretation: ProcessInterpretation;
}

interface ShiftData {
  ShiftId: number;
  ShiftName: string;
}

interface MaterialData {
  MaterialCode: string;
  MaterialName: string;
}

interface OperationData {
  OperationCode: string;
  OperationName: string;
}

interface GuageData {
  GuageCode: string;
  GuageName: string;
}

export default function SPCAnalysisPage() {
  // State management
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [material, setMaterial] = useState("");
  const [operation, setOperation] = useState("");
  const [gauge, setGauge] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  // Data state
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [operations, setOperations] = useState<OperationData[]>([]);
  const [gauges, setGauges] = useState<GuageData[]>([]);

  // Data loading
  useEffect(() => {
    fetchData<ShiftData[]>("/api/shifts", (data) => setShifts(data));
  }, []);

  useEffect(() => {
    if (startDate && endDate && selectedShifts.length > 0) {
      fetchDataWithParams<MaterialData[]>("/api/materials", {
        fromDate: format(startDate, "dd/MM/yyyy"),
        toDate: format(endDate, "dd/MM/yyyy"),
        shiftIds: selectedShifts,
      }, (data) => setMaterials(data));
    }
  }, [startDate, endDate, selectedShifts]);

  useEffect(() => {
    if (material && selectedShifts.length > 0) {
      fetchDataWithParams<OperationData[]>("/api/operations", {
        fromDate: format(startDate, "dd/MM/yyyy"),
        toDate: format(endDate, "dd/MM/yyyy"),
        materialCode: material,
        shiftIds: selectedShifts,
      }, (data) => setOperations(data));
      setOperation("");
    } else {
      setOperations([]);
      setOperation("");
    }
  }, [material, startDate, endDate, selectedShifts]);

  useEffect(() => {
    if (operation && selectedShifts.length > 0) {
      const url = `/api/gauge?fromDate=${format(startDate, "dd/MM/yyyy")}&toDate=${format(endDate, "dd/MM/yyyy")}&materialCode=${material}&operationCode=${operation}`;
      fetchData<GuageData[]>(url, (data) => setGauges(data));
      setGauge("");
    } else {
      setGauges([]);
      setGauge("");
    }
  }, [operation, material, startDate, endDate, selectedShifts]);

  // Helper functions
  const fetchData = async <T,>(url: string, setterFn: (data: T) => void) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setterFn((data.data || data || []) as T);
    } catch {
      setError(`Failed to load data from ${url}`);
    }
  };

  const fetchDataWithParams = async <T,>(url: string, params: object, setterFn: (data: T) => void) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      setterFn((data || []) as T);
    } catch {
      setError(`Failed to load data from ${url}`);
    }
  };

  const handleShiftToggle = (shiftId: number) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) 
        ? prev.filter(id => id !== shiftId) 
        : [...prev, shiftId]
    );
  };

  const calculateDistributionData = (specifications: number[]) => {
    const numberOfBins = Math.ceil(Math.sqrt(specifications.length));
    const min = Math.min(...specifications);
    const max = Math.max(...specifications);
    const binWidth = (max - min) / numberOfBins;
    
    const binCounts = new Array(numberOfBins).fill(0);
    specifications.forEach(spec => {
      const binIndex = Math.min(
        Math.floor((spec - min) / binWidth),
        numberOfBins - 1
      );
      binCounts[binIndex]++;
    });

    return {
      data: binCounts.map((count, i) => ({
        x: min + (i * binWidth) + (binWidth / 2),
        y: count
      })),
      numberOfBins
    };
  };

  // Action handlers
  const handleAnalyze = async () => {
    if (!selectedShifts.length || !material || !operation || !gauge) {
      setError("Please select all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await fetch(
        `/api/pirinspectiondata?FromDate=${format(startDate, "dd/MM/yyyy")}&ToDate=${format(endDate, "dd/MM/yyyy")}&MaterialCode=${material}&OperationCode=${operation}&GuageCode=${gauge}`
      );
      const inspectionData = await response.json();

      const filteredData = inspectionData.filter((data: { ShiftCode: number; }) => 
        selectedShifts.includes(data.ShiftCode)
      );

      if (filteredData.length === 0) {
        setError("No data found for the selected criteria");
        setLoading(false);
        return;
      }

      // Extract and calculate metrics
      const specifications = filteredData.map((d: { ActualSpecification: string; }) => parseFloat(d.ActualSpecification));
      const mean = specifications.reduce((a: number, b: number) => a + b, 0) / specifications.length;
      const stdDev = Math.sqrt(
        specifications.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / (specifications.length - 1)
      );

      // Prepare chart data
      const xBarData = specifications.map((spec: number, i: number) => ({ x: i + 1, y: spec }));
      const rangeData = specifications.slice(1).map((spec: number, i: number) => ({
        x: i + 1,
        y: Math.abs(spec - specifications[i])
      }));

      // Calculate control limits
      const rangeMean = rangeData.reduce((a: number, b: {x: number; y: number}) => a + b.y, 0) / rangeData.length;
      const xBarUcl = mean + (2.66 * rangeMean);
      const xBarLcl = mean - (2.66 * rangeMean);
      const rangeUcl = 3.267 * rangeMean;
      const rangeLcl = 0;

      // Calculate process capability indices
      const usl = parseFloat(filteredData[0].ToSpecification);
      const lsl = parseFloat(filteredData[0].FromSpecification);
      const cp = (usl - lsl) / (6 * stdDev);
      const cpu = (usl - mean) / (3 * stdDev);
      const cpl = (mean - lsl) / (3 * stdDev);
      const cpk = Math.min(cpu, cpl);

      // Prepare distribution data
      const distributionData = calculateDistributionData(specifications);
      // Special cause analysis (simplified)
      const hasSpecialCause = xBarData.some((point: { x: number; y: number }) => 
        point.y > xBarUcl || point.y < xBarLcl
      );

      // Format the analysis data
      const analysis: AnalysisData = {
        metrics: {
          xBar: Number(mean.toFixed(4)),
          stdDevOverall: Number(stdDev.toFixed(4)),
          stdDevWithin: Number(stdDev.toFixed(4)),
          movingRange: Number(rangeMean.toFixed(4)),
          cp: Number(cp.toFixed(2)),
          cpkUpper: Number(cpu.toFixed(2)),
          cpkLower: Number(cpl.toFixed(2)),
          cpk: Number(cpk.toFixed(2)),
          pp: Number(cp.toFixed(2)),
          ppu: Number(cpu.toFixed(2)),
          ppl: Number(cpl.toFixed(2)),
          ppk: Number(cpk.toFixed(2)),
          lsl: Number(lsl.toFixed(4)),
          usl: Number(usl.toFixed(4))
        },
        controlCharts: {
          xBarData,
          rangeData,
          limits: {
            xBarUcl: Number(xBarUcl.toFixed(4)),
            xBarLcl: Number(xBarLcl.toFixed(4)),
            xBarMean: Number(mean.toFixed(4)),
            rangeUcl: Number(rangeUcl.toFixed(4)),
            rangeLcl: Number(rangeLcl.toFixed(4)),
            rangeMean: Number(rangeMean.toFixed(4))
          }
        },
        distribution: {
          data: distributionData.data,
          stats: {
            mean: Number(mean.toFixed(4)),
            stdDev: Number(stdDev.toFixed(4)),
            target: Number(((usl + lsl) / 2).toFixed(4))
          },
          numberOfBins: distributionData.numberOfBins
        },
        ssAnalysis: {
          processShift: hasSpecialCause ? "Yes" : "No",
          processSpread: rangeData.some((point: { x: number; y: number }) => point.y > rangeUcl) ? "Yes" : "No",
          specialCause: hasSpecialCause ? "Special Cause Detected" : "No Special Cause"
        },
        processInterpretation: {
          shortTermCapability: cp >= 1.33 ? "Process is highly capable" : cp >= 1.0 ? "Process is capable" : "Process is not capable",
          shortTermCentered: Math.abs(cpu - cpl) < 0.2 ? "Process is well centered" : "Process is not well centered",
          longTermPerformance: cpk >= 1.33 ? "Process performance is excellent" : cpk >= 1.0 ? "Process performance is acceptable" : "Process performance needs improvement",
          longTermCentered: Math.abs(mean - ((usl + lsl) / 2)) < (0.1 * (usl - lsl)) ? "Process is centered long-term" : "Process is not centered long-term"
        }
      };

      setAnalysisData(analysis);
    } catch {
      setError("Error analyzing data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!analysisData) {
      setError("No analysis data available to download");
      return;
    }

    setDownloading(true);

    try {
      const pdfResponse = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisData,
          parameters: {
            startDate: format(startDate, "PPP"),
            endDate: format(endDate, "PPP"),
            material: materials.find(m => m.MaterialCode === material)?.MaterialName || material,
            operation: operations.find(o => o.OperationCode === operation)?.OperationName || operation,
            gauge: gauges.find(g => g.GuageCode === gauge)?.GuageName || gauge,
          }
        }),
      });

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spc-analysis-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Error generating PDF report");
    } finally {
      setDownloading(false);
    }
  };

  // Reusable animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  // Component renders
  const renderDatePicker = (label: string, selected: Date, setDate: (date: Date) => void) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal text-sm h-9"
            size="sm"
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {format(selected, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => date && setDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderMetricCard = (metrics: ProcessMetrics) => (
    <motion.div {...fadeIn}>
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600">Process Metrics</CardTitle>
          <CardDescription>Key statistical measures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "X-Bar", value: metrics.xBar },
              { label: "Std Dev", value: metrics.stdDevOverall },
              { label: "Cp", value: metrics.cp },
              { label: "Cpk", value: metrics.cpk },
              { label: "Pp", value: metrics.pp },
              { label: "Ppk", value: metrics.ppk },
              { label: "LSL", value: metrics.lsl },
              { label: "USL", value: metrics.usl }
            ].map((item, i) => (
              <motion.div 
                key={item.label}
                className="p-3 bg-slate-50 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <div className="text-xs font-medium text-slate-500">{item.label}</div>
                <div className="text-lg font-bold">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderControlCharts = (chartData: ControlChartData) => (
    <motion.div {...fadeIn}>
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600">Control Charts</CardTitle>
          <CardDescription>X-Bar and Range Charts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                title: "X-Bar Chart",
                data: chartData.xBarData,
                limits: {
                  ucl: chartData.limits.xBarUcl,
                  mean: chartData.limits.xBarMean,
                  lcl: chartData.limits.xBarLcl
                },
                dataKey: "Value",
                stroke: "#8884d8",
                yLabel: "Value"
              },
              {
                title: "Range Chart",
                data: chartData.rangeData,
                limits: {
                  ucl: chartData.limits.rangeUcl,
                  mean: chartData.limits.rangeMean,
                  lcl: chartData.limits.rangeLcl
                },
                dataKey: "Range",
                stroke: "#82ca9d",
                yLabel: "Range"
              }
            ].map((chart, i) => (
              <div key={i} className="h-56">
                <h3 className="text-sm font-medium mb-1">{chart.title}</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" label={{ value: 'Sample', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: chart.yLabel, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={chart.limits.ucl} stroke="red" strokeDasharray="3 3" label="UCL" />
                    <ReferenceLine y={chart.limits.mean} stroke="blue" label={i === 0 ? "X-Bar" : "R-Bar"} />
                    <ReferenceLine y={chart.limits.lcl} stroke="red" strokeDasharray="3 3" label="LCL" />
                    <Line type="monotone" dataKey="y" name={chart.dataKey} stroke={chart.stroke} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderHistogram = ({ data, stats, lsl, usl }: {
    data: Array<{x: number; y: number}>;
    stats: {mean: number; stdDev: number; target: number};
    lsl: number;
    usl: number;
  }) => (
    <motion.div {...fadeIn}>
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600">Histogram</CardTitle>
          <CardDescription>Distribution of measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" label={{ value: 'Value', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <ReferenceLine x={lsl} stroke="red" label="LSL" />
                <ReferenceLine x={usl} stroke="red" label="USL" />
                <ReferenceLine x={stats.target} stroke="green" label="Target" />
                <Bar dataKey="y" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAnalysisCards = (analysisData: AnalysisData) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <motion.div {...fadeIn}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-600">3S Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analysisData.ssAnalysis).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className={cn(
                    "font-medium",
                    value.toLowerCase().includes("detected") || value === "Yes" ? "text-red-500" : "text-green-500"
                  )}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeIn}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-600">Process Interpretation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analysisData.processInterpretation).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="font-medium text-blue-500">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="container mx-auto py-4 px-4 md:px-6 space-y-4 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <LineChartIcon className="h-6 w-6" />
            SPC Analysis
          </h1>
          <p className="text-sm text-gray-500">Statistical Process Control</p>
        </div>
      </motion.div>

      {/* Analysis Parameters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <div>
                <CardTitle>Analysis Parameters</CardTitle>
                <CardDescription>Select process data to analyze</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* Date range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderDatePicker("Start Date", startDate, setStartDate)}
                {renderDatePicker("End Date", endDate, setEndDate)}
              </div>

              {/* Shifts */}
              <div className="space-y-1">
                <Label className="text-xs">Shifts</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {shifts.map((shift) => (
                    <div key={shift.ShiftId} className="flex items-center space-x-1">
                      <Checkbox 
                        id={`shift-${shift.ShiftId}`} 
                        checked={selectedShifts.includes(shift.ShiftId)}
                        onCheckedChange={() => handleShiftToggle(shift.ShiftId)}
                        className="h-3 w-3"
                      />
                      <Label htmlFor={`shift-${shift.ShiftId}`} className="text-xs">{shift.ShiftName}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Material */}
                <div className="space-y-1">
                  <Label className="text-xs">Material</Label>
                  <Select 
                    disabled={materials.length === 0} 
                    value={material} 
                    onValueChange={setMaterial}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Select Material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.MaterialCode} value={m.MaterialCode} className="text-sm">
                          {m.MaterialName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operation */}
                <div className="space-y-1">
                  <Label className="text-xs">Operation</Label>
                  <Select 
                    disabled={operations.length === 0 || !material} 
                    value={operation} 
                    onValueChange={setOperation}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Select Operation" />
                    </SelectTrigger>
                    <SelectContent>
                      {operations.map((o) => (
                        <SelectItem key={o.OperationCode} value={o.OperationCode} className="text-sm">
                          {o.OperationName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gauge */}
                <div className="space-y-1">
                  <Label className="text-xs">Gauge</Label>
                  <Select 
                    disabled={gauges.length === 0 || !operation} 
                    value={gauge} 
                    onValueChange={setGauge}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Select Gauge" />
                    </SelectTrigger>
                    <SelectContent>
                      {gauges.map((g) => (
                        <SelectItem key={g.GuageCode} value={g.GuageCode} className="text-sm">
                          {g.GuageName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  className="flex-1 h-9"
                  onClick={handleAnalyze} 
                  disabled={loading || !selectedShifts.length || !material || !operation || !gauge}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Data
                    </>
                  )}
                </Button>
                
                <AnimatePresence>
                  {analysisData && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1"
                    >
                      <Button 
                        variant="outline"
                        className="w-full h-9"
                        onClick={handleDownload} 
                        disabled={downloading}
                      >
                        {downloading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Report
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {renderMetricCard(analysisData.metrics)}
            {renderControlCharts(analysisData.controlCharts)}
            {renderHistogram({
              data: analysisData.distribution.data,
              stats: analysisData.distribution.stats,
              lsl: analysisData.metrics.lsl,
              usl: analysisData.metrics.usl,
            })}
            {renderAnalysisCards(analysisData)}
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="text-center text-lg text-gray-500 backdrop-blur-lg bg-muted/80 fixed bottom-0 left-0 right-0 py-2">
        &copy; {new Date().getFullYear()} SPC Analysis Tool. By <Link href="https://1ndrajeet.is-a.dev" className="text-amber-500 hover-underline">1ndrajeet</Link>.
      </footer>
    </div>
  );
}