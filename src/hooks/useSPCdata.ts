import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  ShiftData, 
  MaterialData, 
  OperationData, 
  GuageData
} from "@/types/spc";

interface UseSPCDataParams {
  startDate: Date;
  endDate: Date;
  selectedShifts: number[];
  material: string;
  operation: string;
}

export function useSPCData({ 
  startDate, 
  endDate, 
  selectedShifts, 
  material, 
  operation 
}: UseSPCDataParams) {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [operations, setOperations] = useState<OperationData[]>([]);
  const [gauges, setGauges] = useState<GuageData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch shifts
  useEffect(() => {
    fetchData<ShiftData[]>("/api/shifts", (data) => setShifts(data));
  }, []);

  // Fetch materials when shifts and dates change
  useEffect(() => {
    if (startDate && endDate && selectedShifts.length > 0) {
      fetchDataWithParams<MaterialData[]>("/api/materials", {
        fromDate: format(startDate, "dd/MM/yyyy"),
        toDate: format(endDate, "dd/MM/yyyy"),
        shiftIds: selectedShifts,
      }, (data) => setMaterials(data));
    }
  }, [startDate, endDate, selectedShifts]);

  // Fetch operations when material changes
  useEffect(() => {
    if (material && selectedShifts.length > 0) {
      fetchDataWithParams<OperationData[]>("/api/operations", {
        fromDate: format(startDate, "dd/MM/yyyy"),
        toDate: format(endDate, "dd/MM/yyyy"),
        materialCode: material,
        shiftIds: selectedShifts,
      }, (data) => setOperations(data));
    } else {
      setOperations([]);
    }
  }, [material, startDate, endDate, selectedShifts]);

  // Fetch gauges when operation changes
  useEffect(() => {
    if (operation && selectedShifts.length > 0) {
      const url = `/api/gauge?fromDate=${format(startDate, "dd/MM/yyyy")}&toDate=${format(endDate, "dd/MM/yyyy")}&materialCode=${material}&operationCode=${operation}`;
      fetchData<GuageData[]>(url, (data) => setGauges(data));
    } else {
      setGauges([]);
    }
  }, [operation, material, startDate, endDate, selectedShifts]);

  const fetchData = async <T,>(url: string, setterFn: (data: T) => void) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setterFn((data.data || data || []) as T);
      setError(null);
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
      setError(null);
    } catch {
      setError(`Failed to load data from ${url}`);
    }
  };

  return {
    shifts,
    materials,
    operations,
    gauges,
    error
  };
}