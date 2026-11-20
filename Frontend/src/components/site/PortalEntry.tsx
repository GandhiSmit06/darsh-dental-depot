import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { PublicLayout } from "./PublicLayout";

export function PortalEntry({
  children,
  register = false,
}: {
  children: ReactNode;
  register?: boolean;
}) {
  const benefits = register
    ? ["Direct depot pricing", "Clinic delivery across Vadodara", "GST invoices for your orders"]
    : ["Track your clinic orders", "Download GST invoices", "Reorder your regular materials"];

  return (
    <PublicLayout hideFooter hideAnnouncementBar>
      <div className="portal-entry">
        <aside className="portal-visual">
          <img
            src={register ? "/site/assets/img/shelf.png" : "/site/assets/img/depot.png"}
            alt=""
          />
          <div className="portal-story">
            <p>{register ? "Clinic registration" : "Doctor portal"}</p>
            <h2>
              {register ? (
                <>
                  Join the <em>depot network.</em>
                </>
              ) : (
                <>
                  Your depot, <em>in your pocket.</em>
                </>
              )}
            </h2>
            <ul>
              {benefits.map((item) => (
                <li key={item}>
                  <Check size={18} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="portal-form">
          <div>{children}</div>
        </div>
      </div>
    </PublicLayout>
  );
}
