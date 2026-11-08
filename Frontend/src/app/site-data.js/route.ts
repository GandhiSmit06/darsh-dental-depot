import { buildSiteDataScript } from "@darsh/backend/site-content/site-data";

/** Data for the marketing pages' scripts (window.DDD): settings, lists and live products. */
export async function GET() {
  return new Response(await buildSiteDataScript(), {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
