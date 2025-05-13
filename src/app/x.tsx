"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, Search, Download } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

// Type definitions
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

interface ProcessMetricsData {
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

interface HistogramData {
  bin: number;
  frequency: number;
}

interface ControlChartData {
  sampleId: number;
  value: number;
  ucl?: number;
  lcl?: number;
  mean?: number;
}

export default function SPCAnalysis() {
  // State for form inputs
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [material, setMaterial] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [gauge, setGauge] = useState<string>("");

  // State for data
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [operations, setOperations] = useState<OperationData[]>([]);
  const [gauges, setGauges] = useState<GuageData[]>([]);

  // State for UI control
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for analysis results
  const [analysisData, setAnalysisData] = useState<{
    metrics: ProcessMetricsData;
    controlCharts?: {
      xBarData: ControlChartData[];
      rChartData: ControlChartData[];
    };
    distribution?: {
      histogramData: HistogramData[];
    };
  } | null>(null);

  // Fetch shift data on component mount
  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        // In a demo environment, we'll use mock data instead of real API calls
        // const response = await fetch("/api/spec/shifts");
        // if (!response.ok) {
        //   throw new Error("Failed to fetch shift data");
        // }
        // const data: ShiftData[] = await response.json();

        // Mock data for shifts
        const data: ShiftData[] = [
          { ShiftId: 1010000001, ShiftName: "SHIFT 1" },
          { ShiftId: 1010000002, ShiftName: "SHIFT 2" },
          { ShiftId: 1010000003, ShiftName: "SHIFT 3" }
        ];

        setShifts(data);
      } catch (err) {
        setError("Error connecting to API");
        console.error("Error fetching shifts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  // Load materials when date range and shifts are selected
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!startDate || !endDate || selectedShifts.length === 0) return;

      setLoading(true);
      try {
        // Mock data for materials
        const data: MaterialData[] = [
          { MaterialCode: "1010110569", MaterialName: "TURBO ADAPTOR DV0.0.32.101.0.PR" },
          { MaterialCode: "1010110570", MaterialName: "CONNECTOR HOUSING AC-PR" },
          { MaterialCode: "1010110571", MaterialName: "ENGINE MOUNT BRACKET-PR" }
        ];

        setMaterials(data);
      } catch (err) {
        setError("Error loading materials");
        console.error("Error fetching materials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [startDate, endDate, selectedShifts]);

  // Load operations when material is selected
  useEffect(() => {
    const fetchOperations = async () => {
      if (!material || !startDate || !endDate || selectedShifts.length === 0)
        return;

      setLoading(true);
      try {
        // Mock data for operations
        const data: OperationData[] = [
          { OperationCode: "1010000001", OperationName: "1st OPERATION" },
        ];

        setOperations(data);
      } catch (err) {
        setError("Error loading operations");
        console.error("Error fetching operations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, [material, startDate, endDate, selectedShifts]);

  // Load gauges when operation is selected
  useEffect(() => {
    const fetchGauges = async () => {
      if (
        !operation ||
        !material ||
        !startDate ||
        !endDate ||
        selectedShifts.length === 0
      )
        return;

      setLoading(true);
      try {
        // Mock data for gauges
        const data: GuageData[] = [
          { GuageCode: "1011100823", GuageName: "THREAD PLUG GAUGE-M10X1.5 -6H" },
          { GuageCode: "1011100967", GuageName: "THREAD PLUG GAUGE M8X1.25 6H" }
        ];

        setGauges(data);
      } catch (err) {
        setError("Error loading gauges");
        console.error("Error fetching gauges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGauges();
  }, [operation, material, startDate, endDate, selectedShifts]);

  const handleShiftSelection = (value: string) => {
    setSelectedShifts([parseInt(value)]);
  };

  // Generate mock analysis data based on real-world SPC patterns
  const generateMockAnalysisData = () => {
    // Process metrics
    const metrics: ProcessMetricsData = {
      xBar: 10.02,
      stdDevOverall: 0.005,
      stdDevWithin: 0.004,
      movingRange: 0.003,
      cp: 1.12,
      cpkUpper: 1.25,
      cpkLower: 0.99,
      cpk: 0.99,
      pp: 1.12,
      ppu: 1.25,
      ppl: 0.99,
      ppk: 0.99,
      lsl: 10.0,
      usl: 10.5,
    };

    // Control chart data
    const xBarData: ControlChartData[] = [];
    const rChartData: ControlChartData[] = [];

    // Use the values from the sample data
    const actualValues = [10.013, 10.014, 10.015, 10.016, 10.017, 10.024, 10.026, 10.025, 10.025, 10.022];

    for (let i = 0; i < actualValues.length; i++) {
      xBarData.push({
        sampleId: i + 1,
        value: parseFloat(actualValues[i].toString()),
        ucl: 10.03,
        lcl: 10.01,
        mean: 10.02,
      });

      // Calculate range for R chart (if there's a previous point)
      const range = i > 0 ? Math.abs(parseFloat(actualValues[i].toString()) - parseFloat(actualValues[i - 1].toString())) : 0;
      rChartData.push({
        sampleId: i + 1,
        value: range,
        ucl: 0.015,
        lcl: 0,
        mean: 0.005,
      });
    }

    // Histogram data
    const histogramData: HistogramData[] = [
      { bin: 10.01, frequency: 160 },
      { bin: 10.015, frequency: 40 },
      { bin: 10.02, frequency: 60 },
      { bin: 10.025, frequency: 10 },
    ];

    return {
      metrics,
      controlCharts: {
        xBarData,
        rChartData,
      },
      distribution: {
        histogramData,
      },
    };
  };

  const handleAnalyze = async () => {
    if (
      !startDate ||
      !endDate ||
      !material ||
      !operation ||
      !gauge ||
      selectedShifts.length === 0
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const data = generateMockAnalysisData();
      setAnalysisData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error analyzing data");
      console.error("Error analyzing data:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!analysisData) {
      setError("No analysis data to download");
      return;
    }

    setDownloading(true);

    try {
      // In a real application, this would call an API endpoint that
      // generates and returns a PDF report
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Report would be downloaded in a real application");
    } catch (err) {
      setError("Error generating report");
      console.error("Error downloading report:", err);
    } finally {
      setDownloading(false);
    }
  };


  // Helper function to render process metric cards
  const renderProcessMetrics = () => {
    if (!analysisData?.metrics) return null;

    const { metrics } = analysisData;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Process Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">X-Bar (Mean)</div>
              <div className="text-xl font-bold">{metrics.xBar.toFixed(4)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Standard Deviation</div>
              <div className="text-xl font-bold">{metrics.stdDevOverall.toFixed(4)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Moving Range</div>
              <div className="text-xl font-bold">{metrics.movingRange.toFixed(4)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">
                Cp (Process Capability)
              </div>
              <div className="text-xl font-bold">{metrics.cp.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">
                Cpk (Process Capability Index)
              </div>
              <div className="text-xl font-bold">{metrics.cpk.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">
                Ppk (Process Performance)
              </div>
              <div className="text-xl font-bold">{metrics.ppk.toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Process Interpretation</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Short-term Capability (Cp):</span>{" "}
                {metrics.cp >= 1.33 ? (
                  <span className="text-green-600">Process is capable</span>
                ) : (
                  <span className="text-red-600">Process needs improvement</span>
                )}
              </p>
              <p className="text-sm">
                <span className="font-medium">Short-term Centered (Cpk):</span>{" "}
                {metrics.cpk >= 1.33 ? (
                  <span className="text-green-600">Process is centered</span>
                ) : (
                  <span className="text-red-600">
                    Process centering needs improvement
                  </span>
                )}
              </p>
              <p className="text-sm">
                <span className="font-medium">Long-term Performance (Pp):</span>{" "}
                {metrics.pp >= 1.33 ? (
                  <span className="text-green-600">Process is performing well</span>
                ) : (
                  <span className="text-red-600">
                    Long-term performance needs improvement
                  </span>
                )}
              </p>
              <p className="text-sm">
                <span className="font-medium">Long-term Centered (Ppk):</span>{" "}
                {metrics.ppk >= 1.33 ? (
                  <span className="text-green-600">Process is stable</span>
                ) : (
                  <span className="text-red-600">
                    Long-term stability needs improvement
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to render the distribution analysis chart
  const renderDistributionChart = () => {
    if (!analysisData?.distribution) return null;

    const { histogramData } = analysisData.distribution;
    const { metrics } = analysisData;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Distribution Analysis
          </CardTitle>
          <div className="text-sm text-gray-500">Number of Bins: {histogramData.length} (√n rule)</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Mean</div>
              <div className="text-xl font-bold">{metrics.xBar.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Std Dev</div>
              <div className="text-xl font-bold">{metrics.stdDevOverall.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Target</div>
              <div className="text-xl font-bold">{((metrics.lsl + metrics.usl) / 2).toFixed(2)}</div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="bin"
                  tickFormatter={(value) => value.toFixed(3)}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Frequency"]}
                  labelFormatter={(label) => `Bin: ${parseFloat(label).toFixed(3)}`}
                />
                <Bar dataKey="frequency" fill="#3b82f6" />
                <ReferenceLine
                  x={metrics.xBar}
                  stroke="#10b981"
                  strokeWidth={2}
                  label={{ value: "Mean", position: "top" }}
                />
                <ReferenceLine
                  x={(metrics.lsl + metrics.usl) / 2}
                  stroke="#ef4444"
                  strokeWidth={2}
                  label={{ value: "Target", position: "top" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex mt-4 justify-center gap-8">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm">Frequency</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Mean</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm">Target</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to render the control charts
  const renderControlCharts = () => {
    if (!analysisData?.controlCharts) return null;

    const { xBarData, rChartData } = analysisData.controlCharts;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Control Charts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">X-Bar Chart</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={xBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sampleId" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
                    <YAxis domain={[10.005, 10.035]} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                      name="Sample Mean"
                      dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <ReferenceLine
                      y={xBarData[0].ucl}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{ value: "UCL", position: "right" }}
                    />
                    <ReferenceLine
                      y={xBarData[0].mean}
                      stroke="#10b981"
                      label={{ value: "CL", position: "right" }}
                    />
                    <ReferenceLine
                      y={xBarData[0].lcl}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{ value: "LCL", position: "right" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">R Chart (Moving Range)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sampleId" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
                    <YAxis domain={[0, 0.02]} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      activeDot={{ r: 8 }}
                      name="Moving Range"
                      dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                    <ReferenceLine
                      y={rChartData[0].ucl}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{ value: "UCL", position: "right" }}
                    />
                    <ReferenceLine
                      y={rChartData[0].mean}
                      stroke="#10b981"
                      label={{ value: "CL", position: "right" }}
                    />
                    {rChartData[0].lcl !== 0 && (
                      <ReferenceLine
                        y={rChartData[0].lcl}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{ value: "LCL", position: "right" }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to render the process capability metrics
  const renderProcessCapability = () => {
    if (!analysisData?.metrics) return null;

    const { metrics } = analysisData;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Process Capability Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Process Location</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500">X-Bar (Mean)</div>
                <div className="text-xl font-bold">{metrics.xBar.toFixed(4)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variation Metrics</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Standard Deviation (Overall)</div>
                  <div className="text-lg font-bold">{metrics.stdDevOverall.toFixed(4)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Standard Deviation (Within)</div>
                  <div className="text-lg font-bold">{metrics.stdDevWithin.toFixed(4)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Moving Range (R-bar)</div>
                  <div className="text-lg font-bold">{metrics.movingRange.toFixed(4)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Process Capability (Short-term)</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Cp</div>
                  <div className="text-lg font-bold">{metrics.cp.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Cpk Upper</div>
                  <div className="text-lg font-bold">{metrics.cpkUpper.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Cpk Lower</div>
                  <div className="text-lg font-bold">{metrics.cpkLower.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Cpk</div>
                  <div className="text-lg font-bold">{metrics.cpk.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Process Performance (Long-term)</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Pp</div>
                  <div className="text-lg font-bold">{metrics.pp.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Ppu</div>
                  <div className="text-lg font-bold">{metrics.ppu.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Ppl</div>
                  <div className="text-lg font-bold">{metrics.ppl.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-500">Ppk</div>
                  <div className="text-lg font-bold">{metrics.ppk.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if(loading) { 
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  } 
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">SPC Analysis</h1>
      <p className="text-gray-500 mb-6">Statistical Process Control</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Parameters
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="font-medium text-base mb-2 block">Date Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div>
              <Label className="font-medium text-base mb-2 block">Shift</Label>
              <Select onValueChange={handleShiftSelection}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem
                      key={shift.ShiftId}
                      value={shift.ShiftId.toString()}
                    >
                      {shift.ShiftName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-medium text-base mb-2 block">Material</Label>
              <Select
                onValueChange={(value) => setMaterial(value)}
                disabled={!startDate || !endDate || selectedShifts.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem
                      key={material.MaterialCode}
                      value={material.MaterialCode}
                    >
                      {material.MaterialName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-medium text-base mb-2 block">Operation</Label>
              <Select
                onValueChange={(value) => setOperation(value)}
                disabled={
                  !material || !startDate || !endDate || selectedShifts.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  {operations.map((operation) => (
                    <SelectItem
                      key={operation.OperationCode}
                      value={operation.OperationCode.toString()}
                    >
                      {operation.OperationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-medium text-base mb-2 block">Gauge</Label>
              <Select
                onValueChange={(value) => setGauge(value)}
                disabled={
                  !operation ||
                  !material ||
                  !startDate ||
                  !endDate ||
                  selectedShifts.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gauge" />
                </SelectTrigger>
                <SelectContent>
                  {gauges.map((gauge) => (
                    <SelectItem
                      key={gauge.GuageCode}
                      value={gauge.GuageCode.toString()}
                    >
                      {gauge.GuageName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-x-4 mt-6 flex">
            <Button
              onClick={handleAnalyze}
              disabled={
                analyzing ||
                !startDate ||
                !endDate ||
                !material ||
                !operation ||
                !gauge ||
                selectedShifts.length === 0
              }
              className="flex items-center"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading || !analysisData}
              className="flex items-center"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisData && (
        <>
          {renderProcessMetrics()}
          {renderControlCharts()}
          {renderDistributionChart()}
          {renderProcessCapability()}
        </>
      )}
    </div>
  );
}