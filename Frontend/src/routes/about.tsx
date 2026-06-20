import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Target, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Darsh Dental Depot" },
    { name: "description", content: "Our story, mission and team behind Darsh Dental Depot." },
  ]}),
  component: AboutPage,
});

const team = [
  { name: "Darsh Patel", role: "Founder & CEO", img: "https://i.pravatar.cc/200?img=12" },
  { name: "Anjali Rao", role: "Head of Operations", img: "https://i.pravatar.cc/200?img=47" },
  { name: "Vikram Singh", role: "Logistics Lead", img: "https://i.pravatar.cc/200?img=15" },
  { name: "Meera Iyer", role: "Customer Success", img: "https://i.pravatar.cc/200?img=32" },
];

function AboutPage() {
  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-5xl font-bold tracking-tight">
          Our story
        </motion.h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Founded in 2014, Darsh Dental Depot began as a single storefront in Vadodara, Gujarat with one mission: make world-class
          dental materials accessible to every doctor and clinic in Vadodara. A decade later, we serve thousands of practices with
          premium products, fair pricing, and a team that genuinely cares about your craft.
        </p>
      </section>

      <section className="container mx-auto px-4 grid md:grid-cols-3 gap-6 pb-16">
        {[
          { i: Target, t: "Mission", d: "Empower every dental professional with reliable, authentic supplies — without friction." },
          { i: Eye, t: "Vision", d: "Become the most trusted dental supply platform across South Asia." },
          { i: Heart, t: "Values", d: "Integrity, speed, and an obsessive focus on clinician experience." },
        ].map((v) => (
          <Card key={v.t} className="p-6">
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
              <v.i className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">{v.t}</h3>
            <p className="text-sm text-muted-foreground mt-2">{v.d}</p>
          </Card>
        ))}
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Meet the team</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((m) => (
            <Card key={m.name} className="p-6 text-center">
              <img src={m.img} alt={m.name} className="h-24 w-24 rounded-full mx-auto object-cover" />
              <div className="mt-4 font-semibold">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.role}</div>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
