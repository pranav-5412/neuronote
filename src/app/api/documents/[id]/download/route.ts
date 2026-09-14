import { NextResponse } from "next/server";
import { documentDownload } from "@/lib/services/documents";
import { failure, PublicError } from "@/lib/result";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.redirect(await documentDownload(id), {
      status: 303,
      headers: {
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    return NextResponse.json(failure(error), {
      status: error instanceof PublicError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
