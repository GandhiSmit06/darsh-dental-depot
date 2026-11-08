import "server-only";

import { renderSitePage, type SitePage } from "./pages";

/** GET handler that serves a marketing page with dashboard edits applied. */
export function sitePageHandler(page: SitePage) {
  return async function GET() {
    return new Response(await renderSitePage(page), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };
}
