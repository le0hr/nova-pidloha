import { NextResponse, type NextRequest } from "next/server";
import type { CatalogParams } from "@/lib/catalog/state";
import { getCatalogContext } from "@/lib/services/catalog-page.service";
import { countProducts, getProducts } from "@/lib/services/catalog.service";

/** One catalog page as JSON, with the same filters and sorting as the page URL ("Показати ще"); `count=1`: only the total. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const context = await getCatalogContext(category, { details: false });
  if (!context) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const query: CatalogParams = {};
  for (const key of new Set(request.nextUrl.searchParams.keys())) {
    const values = request.nextUrl.searchParams.getAll(key);
    query[key] = values.length > 1 ? values : values[0];
  }
  try {
    if (query.count) {
      delete query.count;
      return NextResponse.json({ total: await countProducts(query, context.filters, context.scope) });
    }
    const { products, pagination } = await getProducts(query, context.filters, context.scope);
    return NextResponse.json({ products, pagination });
  } catch (error) {
    console.error("Unable to load catalog page:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Catalog is unavailable" }, { status: 502 });
  }
}
