import { revalidateTag } from "next/cache";
import { SITE_CONTENT_TAG } from "@darsh/backend/site-content/content";
import { verifyStaffRequest } from "@darsh/backend/site-content/auth";

/** Called by the dashboard after saving content so the site updates immediately. Staff only. */
export async function POST(request: Request) {
  const auth = await verifyStaffRequest(request);
  if (!auth.ok) {
    return Response.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status },
    );
  }
  revalidateTag(SITE_CONTENT_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
