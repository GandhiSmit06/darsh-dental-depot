import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { PublicLayout } from "./PublicLayout";

export function PortalEntry({
  children,
  register = false,
  recovery = false,
}: {
  children: ReactNode;
  register?: boolean;
  recovery?: boolean;
}) {
  const benefits = register
    ? ["Direct depot pricing", "Clinic delivery across Vadodara", "GST invoices for your orders"]
    : [
        "Full order history with delivery status",
        "Download GST invoices",
        "Reorder your regular materials",
        "Depot pricing for registered clinics",
      ];

  return (
    <PublicLayout hideFooter>
      <div className="portal-entry">
        <aside className="portal-visual">
          <span className="portal-watermark" aria-hidden="true">
            {register ? "JOIN" : "PORTAL"}
          </span>
          <img
            src={register ? "/site/assets/img/shelf.png" : "/site/assets/img/depot.png"}
            alt=""
          />
          <div className="portal-story">
            <p>
              {register ? "Free registration" : recovery ? "Account recovery" : "Doctor portal"}
            </p>
            <h2>
              {register ? (
                <>
                  Join the <em>depot network.</em>
                </>
              ) : recovery ? (
                <>
                  Regain access to <em>your clinic portal.</em>
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
        <div className={register ? "portal-form portal-form-register" : "portal-form"}>
          <div>{children}</div>
        </div>
      </div>
    </PublicLayout>
  );
}
