import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench, Rocket, Printer, HardDrive, ShieldCheck, DatabaseBackup } from "lucide-react";

const features = [
  {
    icon: <Wrench className="h-8 w-8 text-primary" />,
    title: "PC & Laptop Repairs",
    description: "We handle everything from hardware failures to complex software issues on laptops and desktops, including component replacement.",
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: "System Upgrades",
    description: "Boost your PC or laptop's performance with SSD installation, RAM upgrades, and other component enhancements.",
  },
  {
    icon: <Printer className="h-8 w-8 text-primary" />,
    title: "Printer Services",
    description: "Expert repairs and replacement services for all major printer brands to get you back to printing smoothly.",
  },
  {
    icon: <HardDrive className="h-8 w-8 text-primary" />,
    title: "OS Installation",
    description: "Fresh installations and upgrades for Windows, macOS, and Linux to optimize performance and security.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Anti-virus & Security",
    description: "Protect your system from malware and viruses with top-tier security software like McAfee, NPAV, and more.",
  },
  {
    icon: <DatabaseBackup className="h-8 w-8 text-primary" />,
    title: "Data Recovery",
    description: "Professional data recovery services to retrieve lost files from failing hard drives and other storage media.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            We specialize in keeping your essential tech running perfectly, from hardware to software.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="font-headline">{feature.title}</CardTitle>
                <CardDescription className="pt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
