
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, Search, Loader2, CalendarIcon } from "lucide-react";
import { ShiftData, MaterialData, OperationData, GuageData } from "@/types/spc";

interface ControlPanelProps {
  startDate: Date;
  endDate: Date;
  selectedShifts: number[];
  material: string;
  operation: string;
  gauge: string;
  error: string | null;
  loading: boolean;
  downloading: boolean;
  hasAnalysisData: boolean;
  shifts: ShiftData[];
  materials: MaterialData[];
  operations: OperationData[];
  gauges: GuageData[];
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onShiftToggle: (shiftId: number) => void;
  onMaterialChange: (value: string) => void;
  onOperationChange: (value: string) => void;
  onGaugeChange: (value: string) => void;
  onAnalyze: () => void;
}

export function ControlPanel({
  startDate,
  endDate,
  selectedShifts,
  material,
  operation,
  gauge,
  error,
  loading,
  shifts,
  materials,
  operations,
  gauges,
  onStartDateChange,
  onEndDateChange,
  onShiftToggle,
  onMaterialChange,
  onOperationChange,
  onGaugeChange,
  onAnalyze
}: ControlPanelProps) {
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

  return (
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
              {renderDatePicker("Start Date", startDate, onStartDateChange)}
              {renderDatePicker("End Date", endDate, onEndDateChange)}
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
                      onCheckedChange={() => onShiftToggle(shift.ShiftId)}
                      className="h-3 w-3"
                    />
                    <Label htmlFor={`shift-${shift.ShiftId}`} className="text-xs">{shift.ShiftName}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Material</Label>
                <Select value={material} onValueChange={onMaterialChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((item) => (
                      <SelectItem key={item.MaterialCode} value={item.MaterialCode}>
                        {item.MaterialName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Operation</Label>
                <Select value={operation} onValueChange={onOperationChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.map((item) => (
                      <SelectItem key={item.OperationCode} value={item.OperationCode}>
                        {item.OperationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Gauge</Label>
                <Select value={gauge} onValueChange={onGaugeChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select gauge" />
                  </SelectTrigger>
                  <SelectContent>
                    {gauges.map((item) => (
                      <SelectItem key={item.GuageCode} value={item.GuageCode}>
                        {item.GuageName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              
              <Button
                size="sm"
                onClick={onAnalyze}
                disabled={loading || !material || !operation || !gauge}
              >
                {loading ? (
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
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}