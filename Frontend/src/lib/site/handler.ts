import { renderSitePage, type SitePage } from "@darsh/backend/site-content/pages";
import { templates } from "./templates.generated";

export { templates };

/** GET handler that serves a marketing page with dashboard edits applied. */
export function sitePageHandler(page: SitePage) {
  return async function GET() {
    return new Response(await renderSitePage(templates, page), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };
}
