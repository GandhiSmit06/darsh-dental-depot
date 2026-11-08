import { NextResponse } from "next/server";
import { defaultLists, defaultSettings } from "@/lib/site/defaults";
import { listEditableFields, SITE_PAGES } from "@/lib/site/pages";

/** Editable fields + defaults for the dashboard's Website Content editor. */
export async function GET() {
  return NextResponse.json({
    pages: SITE_PAGES,
    fields: await listEditableFields(),
    settings: defaultSettings,
    lists: defaultLists,
  });
}
