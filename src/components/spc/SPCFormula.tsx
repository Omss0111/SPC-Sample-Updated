import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Types for the component props
interface SPCFormulaCardProps {
  metrics: {
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
  };
  chartData: {
    limits: {
      xBarUcl: number;
      xBarLcl: number;
      xBarMean: number;
      rangeUcl: number;
      rangeLcl: number;
      rangeMean: number;
    };
  };
  sampleSize: number;
}

// Unbiased constants lookup table
const unbiasedConstants = [
  { sampleSize: 1, D2: 1.128, A2: 2.66, D3: 0, D4: 3.267 },
  { sampleSize: 2, D2: 1.128, A2: 1.88, D3: 0, D4: 3.267 },
  { sampleSize: 3, D2: 1.693, A2: 1.772, D3: 0, D4: 2.574 },
  { sampleSize: 4, D2: 2.059, A2: 0.796, D3: 0, D4: 2.282 },
  { sampleSize: 5, D2: 2.326, A2: 0.691, D3: 0, D4: 2.114 },
];

export function SPCFormulaCard({ metrics, chartData, sampleSize = 5 }: SPCFormulaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get constants for the current sample size
  const constants = unbiasedConstants.find(c => c.sampleSize === sampleSize) || unbiasedConstants[4];
  
  // Create a formula explanation with the actual values
  const formulas = {
    processCapability: {
      pp: `(USL - LSL) / (6 × StDev Overall) = (${metrics.usl.toFixed(1)} - ${metrics.lsl.toFixed(1)}) / (6 × ${metrics.stdDevOverall.toFixed(6)}) = ${metrics.pp.toFixed(2)}`,
      ppu: `(USL - X̄) / (3 × StDev Overall) = (${metrics.usl.toFixed(1)} - ${metrics.xBar.toFixed(3)}) / (3 × ${metrics.stdDevOverall.toFixed(6)}) = ${metrics.ppu.toFixed(2)}`,
      ppl: `(X̄ - LSL) / (3 × StDev Overall) = (${metrics.xBar.toFixed(3)} - ${metrics.lsl.toFixed(1)}) / (3 × ${metrics.stdDevOverall.toFixed(6)}) = ${metrics.ppl.toFixed(2)}`,
      ppk: `min(Ppu, Ppl) = min(${metrics.ppu.toFixed(2)}, ${metrics.ppl.toFixed(2)}) = ${metrics.ppk.toFixed(2)}`
    },
    processControl: {
      cp: `(USL - LSL) / (6 × StDev Within) = (${metrics.usl.toFixed(1)} - ${metrics.lsl.toFixed(1)}) / (6 × ${metrics.stdDevWithin.toFixed(6)}) = ${metrics.cp.toFixed(2)}`,
      cpu: `(USL - X̄) / (3 × StDev Within) = (${metrics.usl.toFixed(1)} - ${metrics.xBar.toFixed(3)}) / (3 × ${metrics.stdDevWithin.toFixed(6)}) = ${metrics.cpkUpper.toFixed(2)}`,
      cpl: `(X̄ - LSL) / (3 × StDev Within) = (${metrics.xBar.toFixed(3)} - ${metrics.lsl.toFixed(1)}) / (3 × ${metrics.stdDevWithin.toFixed(6)}) = ${metrics.cpkLower.toFixed(2)}`,
      cpk: `min(Cpu, Cpl) = min(${metrics.cpkUpper.toFixed(2)}, ${metrics.cpkLower.toFixed(2)}) = ${metrics.cpk.toFixed(2)}`
    },
    controlCharts: {
      xBarUcl: `X̄ + A2 × R̄ = ${metrics.xBar.toFixed(3)} + ${constants.A2} × ${metrics.movingRange.toFixed(6)} = ${chartData.limits.xBarUcl.toFixed(3)}`,
      xBarLcl: `X̄ - A2 × R̄ = ${metrics.xBar.toFixed(3)} - ${constants.A2} × ${metrics.movingRange.toFixed(6)} = ${chartData.limits.xBarLcl.toFixed(3)}`,
      rangeUcl: `D4 × R̄ = ${constants.D4} × ${metrics.movingRange.toFixed(6)} = ${chartData.limits.rangeUcl.toFixed(3)}`,
      rangeLcl: `D3 × R̄ = ${constants.D3} × ${metrics.movingRange.toFixed(6)} = ${chartData.limits.rangeLcl.toFixed(3)}`,
      stdDevWithin: `R̄ / D2 = ${metrics.movingRange.toFixed(6)} / ${constants.D2} = ${metrics.stdDevWithin.toFixed(6)}`
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mt-4">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-blue-600">SPC Formula Analysis</CardTitle>
            <CardDescription>Statistical Process Control metrics and formulas</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metrics">
            <TabsList className="mb-4">
              <TabsTrigger value="metrics">Process Metrics</TabsTrigger>
              <TabsTrigger value="constants">Unbiased Constants</TabsTrigger>
              {isExpanded && <TabsTrigger value="formulas">Formula Details</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="metrics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    Basic Statistics
                    <span className="text-gray-400 text-xs">(For n={sampleSize})</span>
                  </h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">X̄ (Process Mean)</TableCell>
                        <TableCell className="text-right">{metrics.xBar.toFixed(4)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">StDev Overall</TableCell>
                        <TableCell className="text-right">{metrics.stdDevOverall.toFixed(6)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">StDev Within</TableCell>
                        <TableCell className="text-right">{metrics.stdDevWithin.toFixed(6)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">R̄ (Average Range)</TableCell>
                        <TableCell className="text-right">{metrics.movingRange.toFixed(6)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Process Capability</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Cp</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          metrics.cp >= 1.33 ? "text-green-600" : 
                          metrics.cp >= 1.0 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {metrics.cp.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cpu/Cpl</TableCell>
                        <TableCell className="text-right">
                          {metrics.cpkUpper.toFixed(2)} / {metrics.cpkLower.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cpk</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          metrics.cpk >= 1.33 ? "text-green-600" : 
                          metrics.cpk >= 1.0 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {metrics.cpk.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Pp</TableCell>
                        <TableCell className="text-right">{metrics.pp.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ppk</TableCell>
                        <TableCell className="text-right">{metrics.ppk.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="constants">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sample Size</TableHead>
                      <TableHead>D2</TableHead>
                      <TableHead>A2</TableHead>
                      <TableHead>D3</TableHead>
                      <TableHead>D4</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unbiasedConstants.map((row) => (
                      <TableRow key={row.sampleSize} className={row.sampleSize === sampleSize ? "bg-blue-50" : ""}>
                        <TableCell className="font-medium">{row.sampleSize}</TableCell>
                        <TableCell>{row.D2}</TableCell>
                        <TableCell>{row.A2}</TableCell>
                        <TableCell>{row.D3}</TableCell>
                        <TableCell>{row.D4}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-start gap-1">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <p>These constants are used in calculating control limits. The highlighted row shows values for your current sample size (n={sampleSize}).</p>
                </div>
              </div>
            </TabsContent>
            
            {isExpanded && (
              <TabsContent value="formulas">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Process Capability Formulas</h3>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
                      <p><strong>Pp:</strong> {formulas.processCapability.pp}</p>
                      <p><strong>Ppu:</strong> {formulas.processCapability.ppu}</p>
                      <p><strong>Ppl:</strong> {formulas.processCapability.ppl}</p>
                      <p><strong>Ppk:</strong> {formulas.processCapability.ppk}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Process Control Formulas</h3>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
                      <p><strong>Cp:</strong> {formulas.processControl.cp}</p>
                      <p><strong>Cpu:</strong> {formulas.processControl.cpu}</p>
                      <p><strong>Cpl:</strong> {formulas.processControl.cpl}</p>
                      <p><strong>Cpk:</strong> {formulas.processControl.cpk}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Control Charts Formulas</h3>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
                      <p><strong>X-Bar UCL:</strong> {formulas.controlCharts.xBarUcl}</p>
                      <p><strong>X-Bar LCL:</strong> {formulas.controlCharts.xBarLcl}</p>
                      <p><strong>Range UCL:</strong> {formulas.controlCharts.rangeUcl}</p>
                      <p><strong>Range LCL:</strong> {formulas.controlCharts.rangeLcl}</p>
                      <p><strong>StDev Within:</strong> {formulas.controlCharts.stdDevWithin}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    <p className="font-medium text-blue-800 mb-1">Key Performance Indicators:</p>
                    <ul className="list-disc pl-5 space-y-1 text-blue-700">
                      <li>Cp/Cpk ≥ 1.33: Excellent capability</li>
                      <li>1.0 ≤ Cp/Cpk {'<'} 1.33: Acceptable capability</li>
                      <li>Cp/Cpk {'<'} 1.0: Poor capability, needs improvement</li>
                      <li>|Cpu - Cpl| {'<'} 0.2: Process is well-centered</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}