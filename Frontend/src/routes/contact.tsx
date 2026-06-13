import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Darsh Dental Depot" },
    { name: "description", content: "Reach out to Darsh Dental Depot for orders, support, and partnerships." },
  ]}),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
          <p className="text-muted-foreground mt-2">We'd love to hear from you.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { i: Phone, t: "Phone", v: "+91 98765 43210" },
            { i: Mail, t: "Email", v: "hello@darshdental.com" },
            { i: MapPin, t: "Address", v: "12, Linking Road, Mumbai" },
          ].map((c) => (
            <Card key={c.t} className="p-6 text-center">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center mx-auto mb-3">
                <c.i className="h-5 w-5" />
              </div>
              <div className="font-semibold">{c.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.v}</div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send a message</h2>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success("Message sent!"); }}>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1.5">First name</Label><Input /></div>
                <div><Label className="mb-1.5">Last name</Label><Input /></div>
              </div>
              <div><Label className="mb-1.5">Email</Label><Input type="email" /></div>
              <div><Label className="mb-1.5">Subject</Label><Input /></div>
              <div><Label className="mb-1.5">Message</Label><Textarea rows={5} /></div>
              <Button type="submit" className="w-full">Send message</Button>
            </form>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-full min-h-[400px] bg-accent grid place-items-center text-muted-foreground relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="relative text-center">
                <MapPin className="h-10 w-10 mx-auto text-primary" />
                <div className="font-semibold mt-2">Map placeholder</div>
                <div className="text-xs">12, Linking Road, Mumbai</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
