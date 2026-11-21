import { Clock, Truck } from "lucide-react";
import { defaultSettings } from "@darsh/backend/site-content/defaults";
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
        <div className="depot-announcement">
          <div>
            <span>
              <Truck size={15} /> 2-Hour Clinic Delivery across Vadodara
            </span>
            <span className="depot-hours">
              <Clock size={15} /> {defaultSettings.hours}
            </span>
            <a href={`tel:+${defaultSettings.phoneRaw}`}>{defaultSettings.phone}</a>
          </div>
        </div>
      )}
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
