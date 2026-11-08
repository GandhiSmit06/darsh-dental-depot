"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Client-side redirect for render paths that require auth (e.g. dashboards). */
export function RedirectTo({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [router, href]);
  return null;
}
