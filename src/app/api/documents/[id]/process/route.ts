import { NextResponse, type NextRequest } from "next/server";
import { processDocument } from "@/lib/ingestion/process";
import { sameOriginRequest } from "@/lib/validation/origin";
import { failure, PublicError } from "@/lib/result";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!sameOriginRequest(request))
      throw new PublicError("This request is not allowed.", 403);
    const result = await processDocument((await params).id);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(failure(error), {
      status: error instanceof PublicError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
