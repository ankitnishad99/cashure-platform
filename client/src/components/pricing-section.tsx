import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export function PricingSection() {
  const features = [
    "Unlimited digital products",
    "Custom creator page",
    "Donation functionality",
    "Membership management",
    "Telegram integration",
    "Analytics dashboard",
    "24/7 support"
  ];

  const competitors = [
    { name: "Gumroad", fee: "10% + ₹25", subtext: "Per transaction" },
    { name: "Cashure", fee: "10%", subtext: "Total cost", highlight: true },
    { name: "Ko-fi", fee: "5% + ₹35", subtext: "Per transaction" }
  ];

  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto mobile-padding sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mobile-text">
            No hidden fees, no monthly subscriptions. We only succeed when you succeed.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          <Card className="floating-card shadow-2xl border-0 relative overflow-hidden mobile-card">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
            
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center relative z-10">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                Most Popular Choice
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Pay Per Transaction</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text">10%</span>
                <span className="text-base sm:text-lg lg:text-xl text-muted-foreground ml-2">commission</span>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8">
                Only pay when you earn. No upfront costs, no monthly fees, no hidden charges.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/auth/register">
                <Button className="btn-primary text-lg px-8 py-4 rounded-full w-full mb-6">
                  Start Creating for Free
                </Button>
              </Link>

              <p className="text-sm text-muted-foreground">
                No credit card required. Start earning in minutes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">How We Compare</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {competitors.map((competitor, index) => (
              <div key={index} className="text-center">
                <div className={`text-lg font-semibold mb-2 ${competitor.highlight ? 'gradient-text' : ''}`}>
                  {competitor.name}
                </div>
                <div className={`text-3xl font-bold mb-2 ${
                  competitor.highlight ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {competitor.fee}
                </div>
                <div className={`text-sm ${
                  competitor.highlight ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {competitor.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
