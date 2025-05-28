import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";
import { Zap, Menu, Sun, Moon, Sparkles } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#creators", label: "For Creators" },
    { href: "#support", label: "Support" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
      isScrolled 
        ? "glass backdrop-blur-xl border-b border-white/10" 
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Premium Logo */}
          <Link href="/" className="flex items-center space-x-3 group relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary via-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-primary/25 transition-all duration-300 group-hover:scale-110">
                <Zap className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gradient-text tracking-tight">Cashure</span>
              <span className="text-xs text-muted-foreground/60 font-medium -mt-1">Creator Platform</span>
            </div>
          </Link>

          {/* Premium Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group py-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300 ease-out"></div>
              </a>
            ))}
          </div>

          {/* Premium CTA Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:flex w-10 h-10 rounded-xl border border-border/50 hover:border-border hover:bg-accent/10 transition-all duration-300 interactive-element"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-accent" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </Button>
            
            {/* Sign In Button */}
            <Link href="/auth/login">
              <Button 
                variant="ghost" 
                className="hidden md:flex px-6 py-2.5 rounded-xl font-medium text-foreground hover:bg-muted/50 transition-all duration-300 interactive-element border border-transparent hover:border-border/30"
              >
                Sign In
              </Button>
            </Link>
            
            {/* Premium CTA Button */}
            <Link href="/auth/register">
              <Button className="btn-primary px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <span className="relative z-10 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Start Creating</span>
                  <span className="sm:hidden">Join</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>

            {/* Premium Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden w-10 h-10 rounded-xl border border-border/50 hover:border-border hover:bg-accent/10 transition-all duration-300"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 p-0 border-l border-border/20 glass">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b border-border/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-md opacity-30"></div>
                          <div className="relative w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <span className="text-lg font-bold gradient-text">Cashure</span>
                          <p className="text-xs text-muted-foreground">Creator Platform</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="w-9 h-9 rounded-lg"
                      >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile Navigation */}
                  <div className="flex-1 p-6 space-y-2">
                    {navLinks.map((link, index) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300 interactive-element"
                        onClick={() => setIsOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                  
                  {/* Mobile CTA Section */}
                  <div className="p-6 border-t border-border/20 space-y-3">
                    <Link href="/auth/login">
                      <Button 
                        variant="outline" 
                        className="w-full py-3 rounded-xl font-medium border-border/50 hover:border-border transition-all duration-300" 
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button 
                        className="btn-primary w-full py-3 rounded-xl font-semibold shadow-lg" 
                        onClick={() => setIsOpen(false)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Creating
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
