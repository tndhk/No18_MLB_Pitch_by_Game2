import { NextResponse, NextRequest } from "next/server";
import { getPitchData } from "@/dal/mlb";

export async function GET(request: NextRequest) {
  // Parse gamePk from URL path
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const gamePkStr = segments.pop() || '';
  const gamePk = parseInt(gamePkStr, 10);
  if (isNaN(gamePk)) {
    return NextResponse.json(
      { error: "Invalid gamePk parameter" },
      { status: 400 }
    );
  }

  try {
    const data = await getPitchData(gamePk);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in API route /api/pitch-data/${gamePk}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 