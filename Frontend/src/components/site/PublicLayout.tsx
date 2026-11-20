import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PublicLayout({
  children,
  hideAnnouncementBar = false,
  hideFooter = false,
}: {
  children: ReactNode;
  hideAnnouncementBar?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!hideAnnouncementBar && (
        <div className="depot-announcement">Clinic delivery across Vadodara</div>
      )}
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
