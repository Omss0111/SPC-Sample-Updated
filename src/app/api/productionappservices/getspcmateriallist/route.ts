// app/api/materials/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Sample JSON object mimicking the material list API response
    const sampleMaterialData = [
        {
            "TrnNo": 0,
            "TrnDate": null,
            "TrnSubType": 0,
            "DocType": null,
            "StatusCode": 0,
            "CrtBy": null,
            "AssetCode": 0,
            "MaterialCode": 1010110569,
            "OperationCode": 0,
            "MaterialName": "TURBO ADAPTOR DV0.0.32.101.0.PR",
            "JobNo": 0,
            "JobNoString": null,
            "ShortTrnNo": null,
            "OperationName": null,
            "FirstPieceApprovals": null,
            "ProcessInpections": null,
            "AssetName": null,
            "ChgBy": null,
            "ShiftCode": 0,
            "ShiftName": null,
            "JobStatus": 0,
            "PirType": 0,
            "ReasonCode": 0,
            "ReasonName": null,
            "StringTrnNo": null,
            "GuageCode": 0,
            "GuageName": null,
            "FromSpecification": null,
            "ToSpecification": null,
            "ActualSpecification": null,
            "JobDate": null
        },
        
    ]

    return NextResponse.json(sampleMaterialData, { status: 200 });
  } catch (error) {
    console.error("Error returning sample material list:", error);
    return NextResponse.json(
      { error: "Failed to return sample material list" },
      { status: 500 }
    );
  }
}