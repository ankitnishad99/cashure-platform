import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CURRENCY, PLATFORM_FEE_PERCENTAGE, PRODUCT_TYPES, MEMBERSHIP_DURATION_OPTIONS, ORDER_TYPES } from "@/lib/constants";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Users, 
  Package, 
  Shield, 
  CheckCircle,
  CreditCard,
  Lock,
  Sparkles
} from "lucide-react";
import type { Product, User, InsertOrder } from "@shared/schema";

export default function Checkout() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: ""
  });

  const productId = params.productId;
  const isDonation = productId?.startsWith("donation-");
  const creatorId = isDonation ? productId?.split("-")[1] : null;
  const actualProductId = isDonation ? null : parseInt(productId || "0");

  // For donations, we need the creator info
  const { data: creator, isLoading: creatorLoading } = useQuery<User>({
    queryKey: [`/api/user/profile`],
    enabled: isDonation && !!creatorId,
  });

  // For products/memberships, we need the product info
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${actualProductId}`],
    enabled: !isDonation && !!actualProductId,
  });

  // Get creator info for products
  const { data: productCreator, isLoading: productCreatorLoading } = useQuery<User>({
    queryKey: [`/api/user/profile`],
    enabled: !!product?.creatorId,
  });

  const [donationAmount, setDonationAmount] = useState("100");

  const createOrderMutation = useMutation({
    mutationFn: (data: InsertOrder) => apiRequest("POST", "/api/orders", data),
    onSuccess: async (response) => {
      const order = await response.json();
      
      // Create real Cashfree payment session
      setIsProcessing(true);
      
      try {
        const paymentRequest = {
          orderId: `order_${order.id}`,
          amount: parseFloat(order.amount),
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          productName: isDonation ? "Donation" : product?.title || "Digital Product"
        };

        const paymentResponse = await apiRequest("POST", "/api/payments/create", paymentRequest);
        const paymentData = await paymentResponse.json();

        if (paymentData.success && paymentData.paymentUrl) {
          // Redirect to Cashfree payment page
          window.location.href = paymentData.paymentUrl;
        } else {
          throw new Error(paymentData.error || "Failed to create payment session");
        }
      } catch (error: any) {
        setIsProcessing(false);
        toast({
          title: "Payment setup failed",
          description: error.message || "Unable to process payment. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Order creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentCreator = isDonation ? creator : productCreator;
  const isLoading = isDonation ? creatorLoading : (productLoading || productCreatorLoading);

  useEffect(() => {
    if (!isLoading && !currentCreator && !isDonation) {
      setLocation("/");
    }
  }, [isLoading, currentCreator, isDonation, setLocation]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Customer information required",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    if (isDonation && parseFloat(donationAmount) < 10) {
      toast({
        title: "Minimum donation amount",
        description: "Minimum donation amount is ₹10.",
        variant: "destructive",
      });
      return;
    }

    const amount = isDonation ? parseFloat(donationAmount) : parseFloat(product?.price || "0");
    const platformFee = amount * (PLATFORM_FEE_PERCENTAGE / 100);
    const creatorEarnings = amount - platformFee;

    const orderData: InsertOrder = {
      creatorId: parseInt(isDonation ? creatorId! : product!.creatorId.toString()),
      customerEmail: customerInfo.email,
      customerName: customerInfo.name,
      productId: isDonation ? null : product!.id,
      amount: amount.toString(),
      platformFee: platformFee.toString(),
      creatorEarnings: creatorEarnings.toString(),
      type: isDonation ? ORDER_TYPES.DONATION : 
            product?.type === PRODUCT_TYPES.MEMBERSHIP ? ORDER_TYPES.MEMBERSHIP : ORDER_TYPES.PRODUCT,
      status: "pending"
    };

    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (!currentCreator || (!isDonation && !product)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The item you're trying to purchase doesn't exist or is no longer available.
            </p>
            <Button onClick={() => setLocation("/")}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amount = isDonation ? parseFloat(donationAmount) : parseFloat(product?.price || "0");
  const platformFee = amount * (PLATFORM_FEE_PERCENTAGE / 100);
  const creatorEarnings = amount - platformFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 hero-bg opacity-30"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-6 group"
          onClick={() => setLocation(`/creator/${currentCreator.username}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to {currentCreator.displayName}
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Product/Creator Info */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card className="glass border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src={currentCreator.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-lg">
                      {currentCreator.displayName?.charAt(0) || currentCreator.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{currentCreator.displayName}</h2>
                    <p className="text-muted-foreground">@{currentCreator.username}</p>
                    {currentCreator.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {currentCreator.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Verified Creator</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Secure Payment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product/Donation Details */}
            <Card className="glass border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {isDonation ? (
                    <>
                      <Heart className="w-5 h-5 text-primary" />
                      <CardTitle>Support {currentCreator.displayName}</CardTitle>
                    </>
                  ) : product?.type === PRODUCT_TYPES.MEMBERSHIP ? (
                    <>
                      <Users className="w-5 h-5 text-accent" />
                      <CardTitle>{product.title}</CardTitle>
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5 text-blue-500" />
                      <CardTitle>{product?.title}</CardTitle>
                    </>
                  )}
                </div>
                {!isDonation && (
                  <div className="flex items-center space-x-2">
                    <Badge variant={product?.type === PRODUCT_TYPES.MEMBERSHIP ? "secondary" : "default"}>
                      {product?.type === PRODUCT_TYPES.MEMBERSHIP ? "Membership" : "Digital Product"}
                    </Badge>
                    {product?.type === PRODUCT_TYPES.MEMBERSHIP && (
                      <Badge variant="outline">
                        {MEMBERSHIP_DURATION_OPTIONS.find(d => d.value === product.membershipDuration)?.label}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isDonation ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Help {currentCreator.displayName} create more amazing content by making a donation.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Donation Amount ({CURRENCY.symbol})</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="10"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="100"
                        className="text-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum donation: {CURRENCY.symbol}10
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {product?.description && (
                      <p className="text-muted-foreground">{product.description}</p>
                    )}
                    
                    {product?.type === PRODUCT_TYPES.PRODUCT && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">What you'll get:</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Instant download access</li>
                          <li>• High-quality digital files</li>
                          <li>• Lifetime access</li>
                          <li>• Email support</li>
                        </ul>
                      </div>
                    )}

                    {product?.type === PRODUCT_TYPES.MEMBERSHIP && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Membership benefits:</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Exclusive content access</li>
                          <li>• Priority support</li>
                          <li>• Community participation</li>
                          <li>• Regular updates</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="space-y-6">
            <Card className="glass border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Checkout</span>
                </CardTitle>
                <CardDescription>Complete your purchase securely</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePurchase} className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          required
                          className="transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                          required
                          className="transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Order Summary</h3>
                    <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                      <div className="flex justify-between">
                        <span>
                          {isDonation ? "Donation" : product?.title}
                        </span>
                        <span className="font-medium">
                          {CURRENCY.symbol}{amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Platform fee ({PLATFORM_FEE_PERCENTAGE}%)</span>
                        <span>{CURRENCY.symbol}{platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Creator receives</span>
                        <span>{CURRENCY.symbol}{creatorEarnings.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          {CURRENCY.symbol}{amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment Method</h3>
                    <div className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Secure Card Payment</p>
                          <p className="text-sm text-muted-foreground">
                            Powered by Cashfree • 256-bit SSL encryption
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your payment is secured with bank-grade encryption. We never store your card details.
                    </AlertDescription>
                  </Alert>

                  {/* Purchase Button */}
                  <Button 
                    type="submit" 
                    className="w-full btn-primary text-lg py-6"
                    disabled={createOrderMutation.isPending || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : createOrderMutation.isPending ? (
                      "Creating Order..."
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay {CURRENCY.symbol}{amount.toLocaleString()}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By proceeding, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card className="glass border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-around text-sm">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Verified</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
