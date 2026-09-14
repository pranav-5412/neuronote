import { NextResponse, type NextRequest } from "next/server";
import { getSessionContext } from "@/lib/repositories/session";
import { uploadDocument } from "@/lib/services/documents";
import { sameOriginRequest } from "@/lib/validation/origin";
import { boundedFormData } from "@/lib/validation/files";
import { failure, PublicError } from "@/lib/result";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(request: NextRequest) {
  try {
    if (!sameOriginRequest(request))
      throw new PublicError("This upload request is not allowed.", 403);
    await getSessionContext();
    const form = await boundedFormData(request);
    const file = form.get("file");
    const brainId = form.get("brainId");
    if (!(file instanceof File) || typeof brainId !== "string")
      throw new PublicError("Choose a file and its brain.");
    const id = await uploadDocument(
      file,
      brainId,
      form.get("pasted") === "true",
    );
    return NextResponse.json(
      { ok: true, id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(failure(error), {
      status: error instanceof PublicError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
