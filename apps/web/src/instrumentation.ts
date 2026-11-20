export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Build the search index shortly after start, so the first visitor's search does not wait for it.
  setTimeout(() => {
    import("@/lib/services/search.service").then(module => module.warmSearchIndex()).catch(() => undefined);
  }, 3000);
}
