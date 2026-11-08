import { getSiteContentSchema } from "@darsh/backend/site-content/schema";
import { templates } from "@/lib/site/handler";

/** Editable fields + defaults for the dashboard's Website Content editor. */
export async function GET() {
  return Response.json(await getSiteContentSchema(templates));
}
