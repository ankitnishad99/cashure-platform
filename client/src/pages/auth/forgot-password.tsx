import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsEmailSent(true);
      toast({
        title: "Reset link sent!",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Failed to send reset email",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 hero-bg opacity-50"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back to login */}
        <Link href="/auth/login">
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to sign in
          </Button>
        </Link>

        <Card className="glass border-0 shadow-2xl animate-fade-in">
          <CardHeader className="text-center space-y-6">
            <div className="flex justify-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isEmailSent 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                  : "bg-gradient-to-r from-primary to-accent"
              }`}>
                {isEmailSent ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <Zap className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {isEmailSent ? "Check your email" : "Forgot password?"}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {isEmailSent 
                  ? "We've sent a password reset link to your email address."
                  : "Enter your email address and we'll send you a link to reset your password."
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-600">Email sent to {email}</span>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Didn't receive the email? Check your spam folder or</p>
                  <Button 
                    variant="link" 
                    className="px-0 font-semibold"
                    onClick={() => {
                      setIsEmailSent(false);
                      setEmail("");
                    }}
                  >
                    try again
                  </Button>
                </div>

                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
