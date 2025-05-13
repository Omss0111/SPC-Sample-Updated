"use client";

import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { 
 
  ControlCharts,
  Histogram,
  AnalysisCards
} from "@/components/spc/ChartComponent";
import { useSPCData } from "@/hooks/useSPCdata";
import { analyzeData } from "@/lib/spcAnalysis";
import { AnalysisData } from "@/types/spc";
import { ControlPanel } from "@/components/spc/ControlPanel";
import { MetricCard } from "@/components/spc/MetricCards";

export default function SPCDashboardPage() {
  // Analysis parameters state
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [material, setMaterial] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [gauge, setGauge] = useState<string>("");
  
  // Analysis state
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Fetch data using the hook
  const { shifts, materials, operations, gauges, error: dataError } = useSPCData({
    startDate,
    endDate,
    selectedShifts,
    material,
    operation
  });

  // Initialize selected shifts when shifts are loaded
  useEffect(() => {
    if (shifts.length > 0 && selectedShifts.length === 0) {
      setSelectedShifts(shifts.map(shift => shift.ShiftId));
    }
  }, [shifts, selectedShifts]);

  // Handle shift toggle
  const handleShiftToggle = (shiftId: number) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId)
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  // Run analysis
  const handleAnalyze = async () => {
    if (!material || !operation || !gauge) {
      setAnalysisError("Please select all required parameters");
      return;
    }

    setLoading(true);
    setAnalysisError(null);

    try {
      const result = await analyzeData({
        startDate,
        endDate,
        selectedShifts,
        material,
        operation,
        gauge
      });

      if (result) {
        setAnalysisData(result);
      } else {
        setAnalysisError("Analysis failed. Please check your parameters and try again.");
      }
    } catch (error) {
      setAnalysisError("An error occurred during analysis");
      console.error(error);
    } finally {
      setLoading(false);
      setDownloading(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Statistical Process Control Dashboard</h1>
      
      {/* Control Panel */}
      <ControlPanel
        startDate={startDate}
        endDate={endDate}
        selectedShifts={selectedShifts}
        material={material}
        operation={operation}
        gauge={gauge}
        error={dataError || analysisError}
        loading={loading}
        downloading={downloading}
        hasAnalysisData={!!analysisData}
        shifts={shifts}
        materials={materials}
        operations={operations}
        gauges={gauges}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onShiftToggle={handleShiftToggle}
        onMaterialChange={setMaterial}
        onOperationChange={setOperation}
        onGaugeChange={setGauge}
        onAnalyze={handleAnalyze}
      />
      
      {/* Analysis Results */}
      {analysisData && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          
          {/* Metrics Card */}
          <MetricCard metrics={analysisData.metrics} />
          
          {/* Control Charts */}
          <ControlCharts chartData={analysisData.controlCharts} />
          
          {/* Histogram */}
          <Histogram 
            data={analysisData.distribution.data}
            stats={analysisData.distribution.stats}
            lsl={analysisData.metrics.lsl}
            usl={analysisData.metrics.usl}
          />
          
          {/* Analysis Cards */}
          <AnalysisCards 
            ssAnalysis={analysisData.ssAnalysis}
            processInterpretation={analysisData.processInterpretation}
          />
        </div>
      )}
    </div>
  );
}