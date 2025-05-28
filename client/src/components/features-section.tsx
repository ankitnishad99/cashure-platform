import { Card, CardContent } from "@/components/ui/card";
import { Package, Heart, Users, MessageCircle } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: "Digital Products",
      description: "Sell PDFs, videos, courses, and digital downloads with secure delivery and automatic fulfillment.",
      details: "Supports 15+ file formats up to 10MB",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Heart,
      title: "One-time Donations",
      description: "Accept support from your audience with customizable donation amounts starting from ₹10.",
      details: "Instant payment processing",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Users,
      title: "Memberships",
      description: "Create multiple membership tiers with manual renewals to build recurring revenue streams.",
      details: "Flexible pricing tiers",
      gradient: "from-primary to-pink-600"
    },
    {
      icon: MessageCircle,
      title: "Telegram Communities",
      description: "Gate access to your private Telegram groups and channels with secure invite link management.",
      details: "Automated access control",
      gradient: "from-accent to-orange-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="gradient-text block">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built specifically for Indian creators with tools that understand your audience and monetization needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="floating-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="text-sm text-muted-foreground/80 font-medium">
                  {feature.details}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
