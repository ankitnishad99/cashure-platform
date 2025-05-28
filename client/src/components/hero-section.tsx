import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, PlayCircle, Shield, Zap, Percent, Download, Heart, Sparkles, TrendingUp, Users, DollarSign } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 hero-bg min-h-screen flex items-center overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto mobile-padding sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Premium Hero Content */}
          <div className="animate-fade-in text-center lg:text-left space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  🚀 Trusted by 10,000+ Indian Creators
                </span>
              </div>
            </div>
            
            {/* Hero Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.9] tracking-tight">
                <span className="block">Monetize Your</span>
                <span className="gradient-text block animate-glow">Creative Passion</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                The most <span className="text-foreground font-semibold">beautiful creator monetization platform</span> designed for Indian YouTubers, influencers, and educators. Sell digital products, accept donations, and build premium communities.
              </p>
            </div>
            
            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth/register">
                <Button className="btn-primary text-lg px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-primary/25 transition-all duration-500 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center space-x-3">
                    <Sparkles className="w-5 h-5" />
                    <span>Start Creating Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                </Button>
              </Link>
              
              <Button variant="outline" className="glass text-lg px-8 py-4 rounded-2xl font-semibold border-2 border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group">
                <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span>Watch Demo</span>
              </Button>
            </div>
            
            {/* Premium Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/20">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold gradient-text">₹10M+</div>
                <div className="text-sm text-muted-foreground font-medium">Creator Earnings</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold gradient-text">50K+</div>
                <div className="text-sm text-muted-foreground font-medium">Products Sold</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold gradient-text">99.9%</div>
                <div className="text-sm text-muted-foreground font-medium">Uptime</div>
              </div>
            </div>

          </div>

          {/* Premium Dashboard Showcase */}
          <div className="relative animate-slide-up lg:animate-fade-in">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-30"></div>
            
            <div className="relative space-y-6">
              {/* Main Dashboard Card */}
              <Card className="floating-card border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Creator Dashboard
                    </div>
                  </div>
                  
                  {/* Revenue Cards */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary via-primary to-primary/80 text-white">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <div className="relative">
                        <div className="flex items-center space-x-2 mb-3">
                          <DollarSign className="w-5 h-5 opacity-80" />
                          <span className="text-sm font-medium opacity-90">Total Revenue</span>
                        </div>
                        <div className="text-3xl font-black mb-2">₹1,24,567</div>
                        <div className="flex items-center space-x-2 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span className="opacity-90">+23% this month</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-accent via-accent to-accent/80 text-accent-foreground">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-black/10 rounded-full -mr-10 -mt-10"></div>
                      <div className="relative">
                        <div className="flex items-center space-x-2 mb-3">
                          <Users className="w-5 h-5 opacity-80" />
                          <span className="text-sm font-medium opacity-90">Active Customers</span>
                        </div>
                        <div className="text-3xl font-black mb-2">2,847</div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Sparkles className="w-4 h-4" />
                          <span className="opacity-90">+156 this week</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Recent Activity</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">Course Sale: "Advanced React Patterns"</div>
                          <div className="text-sm text-muted-foreground">₹2,499 • @priya_dev • 2 minutes ago</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">+₹2,249</div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">New Donation</div>
                          <div className="text-sm text-muted-foreground">₹500 • Anonymous supporter • 5 minutes ago</div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">+₹450</div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">New Premium Member</div>
                          <div className="text-sm text-muted-foreground">Monthly subscription • @rahul_learns • 8 minutes ago</div>
                        </div>
                        <div className="text-lg font-bold text-purple-600">+₹899</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Achievement Badges */}
              <div className="absolute -top-6 -right-6 animate-float">
                <div className="glass rounded-2xl p-4 border border-accent/20 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-foreground">Live Sales</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 animate-float" style={{animationDelay: '1s'}}>
                <div className="glass rounded-2xl p-4 border border-primary/20 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
