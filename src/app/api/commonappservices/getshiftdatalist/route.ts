// app/api/shifts/route.tsx
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Sample JSON object mimicking the shift data list API response
    const sampleShiftData = {
      "data": [
        {
          "ShiftId": 1010000001,
          "ShiftName": "SHIFT 1"
        },
        {
          "ShiftId": 1010000002,
          "ShiftName": "SHIFT 2"
        },
        {
          "ShiftId": 1010000003,
          "ShiftName": "SHIFT 3"
        }
      ],
      "success": true,
      "message": "Success"
    };

    return NextResponse.json(sampleShiftData, { status: 200 });
  } catch (error) {
    console.error("Error returning sample shift data:", error);
    return NextResponse.json(
      { error: "Failed to return sample shift data", success: false },
      { status: 500 }
    );
  }
}