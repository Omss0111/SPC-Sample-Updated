import axios from 'axios';
import { format } from 'date-fns';

// Change BASE_URL to use local API routes instead of the external API
const BASE_URL = '/api';

const headers = {
  'Content-Type': 'application/json'
};
console.log('BASE_URL:', BASE_URL, 'headers:', headers);
// 1. Get Shift List
export interface ShiftData {
  ShiftId: number;
  ShiftName: string;
}

export interface ShiftResponse {
  data: ShiftData[];
  success: boolean;
  message: string;
}

export const fetchShiftData = async (): Promise<ShiftResponse> => {
  const response = await axios.get(`${BASE_URL}/commonappservices/getshiftdatalist`);
  return response.data;
};

// 2. Get Material List
export interface MaterialData {
  MaterialCode: string;
  MaterialName: string;
}

export const fetchMaterialList = async (fromDate: Date, toDate: Date, shiftIds: number[]): Promise<MaterialData[]> => {
  const params = {
    FromDate: format(fromDate, 'dd/MM/yyyy'),
    ToDate: format(toDate, 'dd/MM/yyyy'),
  };
  
  const response = await axios.post(
    `${BASE_URL}/productionappservices/getmateriallist`, 
    shiftIds,
    { params }
  );
  return response.data;
};

// 3. Get Operation List
export interface OperationData {
  OperationCode: string;
  OperationName: string;
}

export const fetchOperationList = async (
  fromDate: Date, 
  toDate: Date, 
  materialCode: string, 
  shiftIds: number[]
): Promise<OperationData[]> => {
  const params = {
    FromDate: format(fromDate, 'dd/MM/yyyy'),
    ToDate: format(toDate, 'dd/MM/yyyy'),
    MaterialCode: materialCode,
  };
  
  const response = await axios.post(
    `${BASE_URL}/productionappservices/getoperationlist`,
    shiftIds,
    { params }
  );
  return response.data;
};

// 4. Get Gauge List
export interface GuageData {
  GuageCode: string;
  GuageName: string;
}

export const fetchGuageList = async (
  fromDate: Date, 
  toDate: Date, 
  materialCode: string, 
  operationCode: string, 
  shiftIds: number[]
): Promise<GuageData[]> => {
  const params = {
    FromDate: format(fromDate, 'dd/MM/yyyy'),
    ToDate: format(toDate, 'dd/MM/yyyy'),
    MaterialCode: materialCode,
    OperationCode: operationCode,
  };
  
  const response = await axios.post(
    `${BASE_URL}/productionappservices/getguagelist`,
    shiftIds,
    { params }
  );
  return response.data;
};

// 5. Get PIR Inspection Data List
export interface InspectionData {
  TrnDate: string;
  ShiftCode: number;
  ShiftName: string;
  GuageCode: string;
  GuageName: string;
  FromSpecification: string;
  ToSpecification: string;
  ActualSpecification: string;
}

export const fetchInspectionData = async (
  fromDate: Date,
  toDate: Date,
  materialCode: string,
  operationCode: string,
  guageCode: string,
  shiftIds: number[]
): Promise<InspectionData[]> => {
  const params = {
    FromDate: format(fromDate, 'dd/MM/yyyy'),
    ToDate: format(toDate, 'dd/MM/yyyy'),
    MaterialCode: materialCode,
    OperationCode: operationCode,
    GuageCode: guageCode,
  };
  
  const response = await axios.post(
    `${BASE_URL}/productionappservices/getpirinspectiondatalist`,
    shiftIds,
    { params }
  );
  return response.data;
};