import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CreatorShowcase() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Built for <span className="gradient-text">Indian Creators</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful creators who are already monetizing their content and building sustainable income streams.
          </p>
        </div>

        {/* Creator Profile Preview */}
        <div className="max-w-4xl mx-auto">
          <Card className="floating-card shadow-2xl border-0 overflow-hidden">
            {/* Profile Header */}
            <div 
              className="relative h-48 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=400')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-end space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" 
                  alt="Creator profile" 
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                <div className="text-white">
                  <h3 className="text-2xl font-bold">Rahul Kumar</h3>
                  <p className="text-white/90">@rahultech • Tech Educator</p>
                  <p className="text-sm text-white/80">50k+ YouTube subscribers</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* About Section */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold mb-4">About</h4>
                  <p className="text-muted-foreground mb-6">
                    I help aspiring developers master web development through practical tutorials and real-world projects. Join me on this coding journey! 🚀
                  </p>

                  {/* Featured Products */}
                  <h4 className="text-lg font-semibold mb-4">Featured Products</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <img 
                          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                          alt="React.js Course" 
                          className="w-full h-24 object-cover rounded-lg mb-3"
                        />
                        <h5 className="font-semibold mb-2">React.js Complete Course</h5>
                        <p className="text-sm text-muted-foreground mb-3">Master React from basics to advanced concepts</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">₹1,999</span>
                          <Button size="sm" className="btn-primary">
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <img 
                          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                          alt="JavaScript Guide" 
                          className="w-full h-24 object-cover rounded-lg mb-3"
                        />
                        <h5 className="font-semibold mb-2">JavaScript Guide PDF</h5>
                        <p className="text-sm text-muted-foreground mb-3">Comprehensive JS reference guide</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">₹499</span>
                          <Button size="sm" className="btn-primary">
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Sidebar */}
                <div>
                  {/* Support Section */}
                  <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground mb-6">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-3">Support My Work</h4>
                      <p className="text-sm mb-4 opacity-90">Help me create more quality content</p>
                      <input 
                        type="number" 
                        placeholder="₹100" 
                        className="w-full p-3 rounded-lg text-foreground bg-background mb-4" 
                        min="10"
                      />
                      <Button className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
                        Donate Now
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Membership Tiers */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Memberships</h4>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h5 className="font-semibold mb-2">Basic Tier</h5>
                        <p className="text-2xl font-bold text-primary mb-2">₹99/month</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Access to exclusive tutorials and Q&A sessions
                        </p>
                        <Button className="w-full btn-primary">
                          Join Now
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h5 className="font-semibold mb-2">Premium Community</h5>
                        <p className="text-2xl font-bold text-accent mb-2">₹199/month</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Private Telegram group + code reviews
                        </p>
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                          Join Community
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
