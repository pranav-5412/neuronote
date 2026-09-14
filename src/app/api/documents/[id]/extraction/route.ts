import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/repositories/session";
import { uuid } from "@/lib/validation/input";
import { failure, PublicError } from "@/lib/result";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!uuid.safeParse(id).success)
      throw new PublicError("This document is not available.", 404);
    const { client, user } = await getSessionContext();
    const { data, error } = await client
      .from("documents")
      .select("extracted_pages,extracted_at,extraction_warnings,chunk_count")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data)
      throw new PublicError("This document is not available.", 404);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(failure(error), {
      status: error instanceof PublicError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
