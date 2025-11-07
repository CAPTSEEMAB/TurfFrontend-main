import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">About TurfBooksNBA</h1>
          
          <div className="space-y-6">
            <p className="text-lg text-foreground/80">
              TurfBook is your premier platform for discovering and booking sports facilities. 
              We connect sports enthusiasts with the best turfs and courts in their area.
            </p>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-foreground/80">
                  To make sports accessible to everyone by providing a seamless booking 
                  experience for quality sports facilities. Whether you're organizing a 
                  casual match or a competitive tournament, we help you find the perfect venue.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
                <div className="space-y-3">
                  {[
                    "Wide selection of verified sports facilities",
                    "Real-time availability and instant booking",
                    "Transparent pricing with no hidden fees",
                    "Easy booking management and cancellation",
                    "Quality assured venues with premium amenities",
                    "Dedicated customer support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                <p className="text-foreground/80">
                  Have questions or feedback? We'd love to hear from you! 
                  Contact us at <a href="mailto:support@turfbook.com" className="text-primary hover:underline">support@turfbook.com</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
