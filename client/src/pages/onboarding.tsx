import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  User, 
  Palette, 
  Youtube, 
  Instagram, 
  Twitter, 
  Globe,
  Camera,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Gift,
  Crown,
  Heart,
  Zap,
  Target,
  Rocket
} from "lucide-react";

const steps = [
  { id: 1, title: "Profile Setup", description: "Tell us about yourself" },
  { id: 2, title: "Brand Identity", description: "Customize your appearance" },
  { id: 3, title: "Social Links", description: "Connect your accounts" },
  { id: 4, title: "First Product", description: "Create your first offering" },
  { id: 5, title: "Launch", description: "Go live with your store" }
];

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be less than 500 characters"),
});

const brandSchema = z.object({
  themeColor: z.string().min(1, "Please select a theme color"),
  avatar: z.string().optional(),
  banner: z.string().optional(),
});

const socialSchema = z.object({
  youtube: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  type: z.enum(["digital", "membership", "donation"]),
});

export default function CreatorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [brandData, setBrandData] = useState({});
  const [socialData, setSocialData] = useState({});
  const [productData, setProductData] = useState({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      username: "",
      bio: "",
    },
  });

  const brandForm = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      themeColor: "#E03A3E",
      avatar: "",
      banner: "",
    },
  });

  const socialForm = useForm({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      youtube: "",
      instagram: "",
      twitter: "",
      website: "",
    },
  });

  const productForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      type: "digital" as const,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  });

  const handleNextStep = async (data: any) => {
    if (currentStep === 1) {
      setProfileData(data);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setBrandData(data);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setSocialData(data);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setProductData(data);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      // Update profile with all collected data
      const completeProfile = {
        ...profileData,
        ...brandData,
        socialLinks: socialData,
        onboardingCompleted: true,
      };

      await updateProfileMutation.mutateAsync(completeProfile);
      
      // Create first product if provided
      if (productData && Object.keys(productData).length > 0) {
        await createProductMutation.mutateAsync(productData);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      
      toast({
        title: "🎉 Welcome to Cashure!",
        description: "Your creator profile is now live and ready to earn!",
      });

      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  const themeColors = [
    { name: "Passion Red", value: "#E03A3E", gradient: "from-red-500 to-pink-500" },
    { name: "Golden Sun", value: "#FFD700", gradient: "from-yellow-400 to-orange-500" },
    { name: "Ocean Blue", value: "#3B82F6", gradient: "from-blue-500 to-cyan-500" },
    { name: "Forest Green", value: "#10B981", gradient: "from-green-500 to-emerald-500" },
    { name: "Royal Purple", value: "#8B5CF6", gradient: "from-purple-500 to-indigo-500" },
    { name: "Sunset Orange", value: "#F97316", gradient: "from-orange-500 to-red-500" },
  ];

  const productTypes = [
    {
      id: "digital",
      title: "Digital Product",
      description: "Sell courses, ebooks, templates, or digital downloads",
      icon: Gift,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      examples: ["Online Courses", "eBooks", "Templates", "Music"]
    },
    {
      id: "membership",
      title: "Membership",
      description: "Create recurring subscriptions for exclusive content",
      icon: Crown,
      color: "bg-purple-50 border-purple-200 text-purple-700",
      examples: ["Monthly Coaching", "Premium Community", "Weekly Content"]
    },
    {
      id: "donation",
      title: "Donations",
      description: "Accept one-time or recurring support from your audience",
      icon: Heart,
      color: "bg-green-50 border-green-200 text-green-700",
      examples: ["Buy me a Coffee", "Support my Work", "Fan Funding"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Welcome to Cashure</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Let's set up your creator profile in just a few minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep > step.id 
                    ? 'bg-primary border-primary text-white' 
                    : currentStep === step.id
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="floating-card border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Step 1: Profile Setup */}
            {currentStep === 1 && (
              <form onSubmit={profileForm.handleSubmit(handleNextStep)} className="space-y-6">
                <div className="text-center mb-8">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                      {profileForm.watch("displayName")?.slice(0, 2).toUpperCase() || "YU"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" type="button" className="mt-2">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      placeholder="e.g., John Creator"
                      {...profileForm.register("displayName")}
                      className="h-12"
                    />
                    {profileForm.formState.errors.displayName && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.displayName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        cashure.in/
                      </span>
                      <Input
                        id="username"
                        placeholder="john_creator"
                        {...profileForm.register("username")}
                        className="h-12 pl-24"
                      />
                    </div>
                    {profileForm.formState.errors.username && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.username.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell your audience what you create and why they should support you..."
                    {...profileForm.register("bio")}
                    className="min-h-[120px] resize-none"
                  />
                  <div className="flex justify-between items-center">
                    {profileForm.formState.errors.bio && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.bio.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground ml-auto">
                      {profileForm.watch("bio")?.length || 0}/500
                    </p>
                  </div>
                </div>

                <Button type="submit" className="btn-primary w-full h-12">
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            )}

            {/* Step 2: Brand Identity */}
            {currentStep === 2 && (
              <form onSubmit={brandForm.handleSubmit(handleNextStep)} className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Your Theme Color</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {themeColors.map((color) => (
                      <div
                        key={color.value}
                        onClick={() => brandForm.setValue("themeColor", color.value)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                          brandForm.watch("themeColor") === color.value
                            ? "border-primary shadow-lg"
                            : "border-border hover:border-border"
                        }`}
                      >
                        <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${color.gradient} mb-3`}></div>
                        <p className="font-medium text-center">{color.name}</p>
                        {brandForm.watch("themeColor") === color.value && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Brand Assets (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Profile Picture</Label>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload your profile picture</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Choose File
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Banner Image</Label>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload a banner for your profile</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Choose File
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="btn-primary flex-1 h-12">
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Social Links */}
            {currentStep === 3 && (
              <form onSubmit={socialForm.handleSubmit(handleNextStep)} className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold mb-2">Connect Your Social Accounts</h3>
                  <p className="text-muted-foreground">
                    Link your social profiles to help fans find and connect with you
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 rounded-xl border border-border">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="youtube">YouTube Channel</Label>
                      <Input
                        id="youtube"
                        placeholder="https://youtube.com/@yourchannel"
                        {...socialForm.register("youtube")}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 rounded-xl border border-border">
                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/yourusername"
                        {...socialForm.register("instagram")}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 rounded-xl border border-border">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Twitter className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/yourusername"
                        {...socialForm.register("twitter")}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 rounded-xl border border-border">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        {...socialForm.register("website")}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="btn-primary flex-1 h-12">
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: First Product */}
            {currentStep === 4 && (
              <form onSubmit={productForm.handleSubmit(handleNextStep)} className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold mb-2">Create Your First Product</h3>
                  <p className="text-muted-foreground">
                    Start monetizing immediately with your first offering
                  </p>
                </div>

                {/* Product Type Selection */}
                <div>
                  <h4 className="font-semibold mb-4">Choose Product Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {productTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => productForm.setValue("type", type.id as any)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                          productForm.watch("type") === type.id
                            ? `border-primary shadow-lg ${type.color}`
                            : "border-border hover:border-border bg-card"
                        }`}
                      >
                        <div className="text-center">
                          <type.icon className="w-8 h-8 mx-auto mb-3" />
                          <h5 className="font-semibold mb-2">{type.title}</h5>
                          <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                          <div className="text-xs">
                            <p className="font-medium">Examples:</p>
                            <p className="text-muted-foreground">{type.examples.join(", ")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Master Class in Digital Marketing"
                      {...productForm.register("title")}
                      className="h-12"
                    />
                    {productForm.formState.errors.title && (
                      <p className="text-sm text-red-600">{productForm.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      placeholder="999"
                      type="number"
                      {...productForm.register("price")}
                      className="h-12"
                    />
                    {productForm.formState.errors.price && (
                      <p className="text-sm text-red-600">{productForm.formState.errors.price.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what customers will get, the benefits, and why they should buy..."
                    {...productForm.register("description")}
                    className="min-h-[120px] resize-none"
                  />
                  {productForm.formState.errors.description && (
                    <p className="text-sm text-red-600">{productForm.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="btn-primary flex-1 h-12">
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 5: Launch */}
            {currentStep === 5 && (
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Ready to Launch!</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Your creator profile is set up and ready to start earning. Your public storefront will be available at:
                  </p>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="font-mono text-lg text-primary">
                      cashure.in/{profileData.username || "your-username"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-700">Profile Created</h4>
                    <p className="text-sm text-green-600">Your brand is ready</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-blue-700">Product Ready</h4>
                    <p className="text-sm text-blue-600">Start earning today</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-purple-700">Go Live</h4>
                    <p className="text-sm text-purple-600">Share with fans</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={completeOnboarding}
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary w-full h-14 text-lg"
                  >
                    {updateProfileMutation.isPending ? (
                      <span>Setting up your profile...</span>
                    ) : (
                      <>
                        <Rocket className="w-6 h-6 mr-2" />
                        <span>Launch My Creator Profile</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    className="w-full h-12"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Edit
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}