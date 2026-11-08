import "server-only";

import { defaultLists, defaultSettings } from "./defaults";
import { listEditableFields, SITE_PAGES, type SiteTemplates } from "./pages";

/** Everything the dashboard's Website Content editor needs to render its forms. */
export async function getSiteContentSchema(templates: SiteTemplates) {
  return {
    pages: SITE_PAGES,
    fields: await listEditableFields(templates),
    settings: defaultSettings,
    lists: defaultLists,
  };
}
