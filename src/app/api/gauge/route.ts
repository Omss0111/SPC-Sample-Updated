// app/api/gauge/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Parse URL parameters
    const url = new URL(request.url);
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const materialCode = url.searchParams.get('materialCode');
    const operationCode = url.searchParams.get('operationCode');

    // Log the parameters that would be used in a real API call
    console.log(`Would call: http://10.10.1.7:8304/api/productionappservices/getguagelist?FromDate=${fromDate}&ToDate=${toDate}&MaterialCode=${materialCode}&OperationCode=${operationCode}`);

    // Sample JSON object mimicking the gauge list API response
    const sampleGaugeData = [
        {
            "TrnNo": 0,
            "TrnDate": null,
            "TrnSubType": 0,
            "DocType": null,
            "StatusCode": 0,
            "CrtBy": null,
            "AssetCode": 0,
            "MaterialCode": 0,
            "OperationCode": 0,
            "MaterialName": null,
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
            "GuageCode": 1011100823,
            "GuageName": "THREAD PLUG GAUGE-M10X1.5 -6H",
            "FromSpecification": null,
            "ToSpecification": null,
            "ActualSpecification": null,
            "JobDate": null
        },
        {
            "TrnNo": 0,
            "TrnDate": null,
            "TrnSubType": 0,
            "DocType": null,
            "StatusCode": 0,
            "CrtBy": null,
            "AssetCode": 0,
            "MaterialCode": 0,
            "OperationCode": 0,
            "MaterialName": null,
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
            "GuageCode": 1011100967,
            "GuageName": "THREAD PLUG GAUGE M8X1.25 6H",
            "FromSpecification": null,
            "ToSpecification": null,
            "ActualSpecification": null,
            "JobDate": null
        },
        {
            "TrnNo": 0,
            "TrnDate": null,
            "TrnSubType": 0,
            "DocType": null,
            "StatusCode": 0,
            "CrtBy": null,
            "AssetCode": 0,
            "MaterialCode": 0,
            "OperationCode": 0,
            "MaterialName": null,
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
            "GuageCode": 1011101033,
            "GuageName": "THREAD RING GAUGE-M10X1.5 6g",
            "FromSpecification": null,
            "ToSpecification": null,
            "ActualSpecification": null,
            "JobDate": null
        },
        {
            "TrnNo": 0,
            "TrnDate": null,
            "TrnSubType": 0,
            "DocType": null,
            "StatusCode": 0,
            "CrtBy": null,
            "AssetCode": 0,
            "MaterialCode": 0,
            "OperationCode": 0,
            "MaterialName": null,
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
            "GuageCode": 1011101199,
            "GuageName": "PLUG GAUGE-M12X1.75 6H",
            "FromSpecification": null,
            "ToSpecification": null,
            "ActualSpecification": null,
            "JobDate": null
        }
    ]
    

    return NextResponse.json(sampleGaugeData, { status: 200 });
  } catch (error) {
    console.error("Error returning sample gauge list:", error);
    return NextResponse.json(
      { error: "Failed to return sample gauge list" },
      { status: 500 }
    );
  }
}