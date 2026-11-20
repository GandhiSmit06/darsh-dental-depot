/* eslint-disable @next/next/no-html-link-for-pages -- The storefront route handlers serve standalone HTML documents. */
import { PublicLayout } from "@/components/site/PublicLayout";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="grid min-h-[65svh] place-items-center px-5 py-12 text-center">
        <div>
          <p className="shelf-code">404</p>
          <h1 className="mt-3 text-4xl font-semibold">This shelf is empty.</h1>
          <p className="my-5 text-muted-foreground">
            We couldn’t find that page. Try the catalog or return to the depot homepage.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
              href="/"
            >
              Back to home
            </a>
            <a
              className="rounded-full border border-foreground px-6 py-3 font-semibold"
              href="/products"
            >
              Browse catalog
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
