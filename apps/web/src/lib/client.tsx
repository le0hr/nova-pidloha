type GraphQLOptions = { revalidate?: number | false; tags?: string[]; cache?: RequestCache };

export function mediaUrl(path: string): string {
  return new URL(path, process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337').toString();
}

export async function graphqlFetch<T>(query: string, variables?: Record<string, unknown>, options: GraphQLOptions = {}): Promise<T> {
  const { revalidate = 60, tags, cache } = options;
  const base = process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
  const token = process.env.STRAPI_READ_TOKEN;
  const res = await fetch(`${base.replace(/\/$/, '')}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables }),
    ...(cache === 'no-store' ? { cache } : { next: { revalidate, tags }, cache }),
  });
  if (!res.ok) throw new Error(`CMS request failed (HTTP ${res.status})`);
  const json = await res.json() as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length || json.data === undefined) throw new Error(json.errors?.[0]?.message ?? 'CMS returned no data');
  return json.data;
}
