// AnalysisResults.tsx

"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Loader2, LineChart as LineChartIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { AnalysisData } from "@/types";

interface AnalysisResultsProps {
  analysisData: AnalysisData;
  onDownload: () => void;
  downloading: boolean;
}

export default function AnalysisResults({
  analysisData,
  onDownload,
  downloading,
}: AnalysisResultsProps) {
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  // Components
  const renderMetricCard = (metrics: AnalysisData["metrics"]) => (
    <motion.div {...fadeIn}>
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600">Process Metrics</CardTitle>
          <CardDescription>Key statistical measures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "X-Bar", value: metrics.xBar },
              { label: "Std Dev Overall", value: metrics.stdDevOverall },
              { label: "Std Dev Within", value: metrics.stdDevWithin },
              { label: "Avg Range", value: metrics.avgRange },
              { label: "Cp", value: metrics.cp },
              { label: "Cpu", value: metrics.cpu },
              { label: "Cpl", value: metrics.cpl },
              { label: "Cpk", value: metrics.cpk },
              { label: "Pp", value: metrics.pp },
              { label: "Ppu", value: metrics.ppu },
              { label: "Ppl", value: metrics.ppl },
              { label: "Ppk", value: metrics.ppk },
              { label: "LSL", value: metrics.lsl },
              { label: "USL", value: metrics.usl },
              { label: "Target", value: metrics.target },
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

  const renderControlCharts = (chartData: AnalysisData["controlCharts"]) => (
    <motion.div {...fadeIn}>
      <Card className="shadow-md">
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
                  lcl: chartData.limits.Agostinho,
                },
                dataKey: "Value",
                stroke: "#8884d8",
                yLabel: "Value",
              },
              {
                title: "Range Chart",
                data: chartData.rangeData,
                limits: {
                  ucl: chartData.limits.rangeUcl,
                  mean: chartData.limits.rangeMean,
                  lcl: chartData.limits.rangeLcl,
                },
                dataKey: "Range",
                stroke: "#82ca9d",
                yLabel: "Range",
              },
            ].map((chart, i) => (
              <div key={i} className="h-56">
                <h3 className="text-sm font-medium mb-1">{chart.title}</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chart.data}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="x"
                      label={{ value: "Sample", position: "insideBottomRight", offset: -5 }}
                    />
                    <YAxis
                      label={{ value: chart.yLabel, angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine
                      y={chart.limits.ucl}
                      stroke="red"
                      strokeDasharray="3 3"
                      label="UCL"
                    />
                    <ReferenceLine
                      y={chart.limits.mean}
                      stroke="blue"
                      label={i === 0 ? "X-Bar" : "R-Bar"}
                    />
                    <ReferenceLine
                      y={chart.limits.lcl}
                      stroke="red"
                      strokeDasharray="3 3"
                      label="LCL"
                    />
                    <Line
                      type="monotone"
                      dataKey="y"
                      name={chart.dataKey}
                      stroke={chart.stroke}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderHistogram = ({
    data,
    stats,
    lsl,
    usl,
  }: {
    data: AnalysisData["distribution"]["data"];
    stats: AnalysisData["distribution"]["stats"];
    lsl: number;
    usl: number;
  }) => (
    <motion.div {...fadeIn}>
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600">Histogram</CardTitle>
          <CardDescription>Distribution of measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  label={{ value: "Value", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Frequency", angle: -90, position: "insideLeft" }}
                />
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

  const renderAnalysisCards = (analysis: {
    ssAnalysis: AnalysisData["ssAnalysis"];
    processInterpretation: AnalysisData["processInterpretation"];
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div {...fadeIn}>
        <Card className="shadow-md h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-600">3S Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { key: "processShift", label: "Process Shift" },
                { key: "processSpread", label: "Process Spread" },
                { key: "specialCausePresent", label: "Special Cause Present" },
                { key: "pointsOutsideLimits", label: "Points Outside Limits" },
                { key: "rangePointsOutsideLimits", label: "Range Points Outside Limits" },
                { key: "eightConsecutivePoints", label: "Eight Consecutive Points" },
                { key: "sixConsecutiveTrend", label: "Six Consecutive Trend" },
              ].map(({ key, label }) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span
                    className={cn(
                      "font-medium",
                      analysis.ssAnalysis[key as keyof AnalysisData["ssAnalysis"]].toLowerCase().includes("yes") ||
                      analysis.ssAnalysis[key as keyof AnalysisData["ssAnalysis"]].toLowerCase().includes("detected") ||
                      analysis.ssAnalysis[key as keyof AnalysisData["ssAnalysis"]].toLowerCase().includes("impossible")
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {analysis.ssAnalysis[key as keyof AnalysisData["ssAnalysis"]]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeIn}>
        <Card className="shadow-md h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-600">Process Interpretation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { key: "decisionRemark", label: "Decision Remark" },
                { key: "processPotential", label: "Process Potential" },
                { key: "processPerformance", label: "Process Performance" },
                { key: "processStability", label: "Process Stability" },
                { key: "processShift", label: "Process Shift" },
              ].map(({ key, label }) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span
                    className={cn(
                      "font-medium",
                      key === "decisionRemark" && analysis.processInterpretation.decisionRemark.includes("Stop")
                        ? "text-red-500"
                        : key === "decisionRemark" && analysis.processInterpretation.decisionRemark.includes("Excellent")
                        ? "text-green-500"
                        : "text-blue-500"
                    )}
                  >
                    {analysis.processInterpretation[key as keyof AnalysisData["processInterpretation"]]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Analysis Results</h2>
        </div>

        <Button
          variant="outline"
          onClick={onDownload}
          disabled={downloading}
          className="h-9"
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
      </div>

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
  );
}