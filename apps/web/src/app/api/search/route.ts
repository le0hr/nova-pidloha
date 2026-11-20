import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/services/search.service";

/** Header search suggestions: GET /api/search?q=… */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 100);
  try {
    return NextResponse.json(await searchSuggestions(query), { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return NextResponse.json({ categories: [], products: [], total: 0 }, { status: 502 });
  }
}
