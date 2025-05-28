import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PRODUCT_TYPES, MEMBERSHIP_DURATION_OPTIONS, CURRENCY } from "@/lib/constants";
import { Plus, Users, Crown, Calendar, TrendingUp, UserCheck } from "lucide-react";
import type { Product, Membership, InsertProduct } from "@shared/schema";

export default function DashboardMemberships() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: membershipProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    select: (data) => data?.filter(product => product.type === PRODUCT_TYPES.MEMBERSHIP) || [],
  });

  const { data: memberships, isLoading: membershipsLoading } = useQuery<Membership[]>({
    queryKey: ["/api/memberships"],
  });

  const createMembershipMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      toast({
        title: "Membership tier created!",
        description: "Your new membership tier is now available for purchase.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create membership",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate stats
  const stats = {
    totalTiers: membershipProducts?.length || 0,
    totalMembers: memberships?.filter(m => m.isActive).length || 0,
    monthlyRevenue: membershipProducts?.reduce((sum, product) => {
      const memberCount = memberships?.filter(m => m.productId === product.id && m.isActive).length || 0;
      return sum + (parseFloat(product.price) * memberCount);
    }, 0) || 0,
    avgDuration: membershipProducts?.length > 0
      ? membershipProducts.reduce((sum, p) => sum + (p.membershipDuration || 30), 0) / membershipProducts.length
      : 0
  };

  const MembershipForm = () => {
    const [formData, setFormData] = useState<Partial<InsertProduct>>({
      title: "",
      description: "",
      price: "99",
      type: PRODUCT_TYPES.MEMBERSHIP,
      membershipDuration: 30,
      isActive: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createMembershipMutation.mutate(formData as InsertProduct);
    };

    const handleInputChange = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tier Name *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Premium Tier"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ({CURRENCY.symbol}) *</Label>
            <Input
              id="price"
              type="number"
              min="1"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="99"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what members get with this tier..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Select 
            value={formData.membershipDuration?.toString()} 
            onValueChange={(value) => handleInputChange("membershipDuration", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMBERSHIP_DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" className="btn-primary" disabled={createMembershipMutation.isPending}>
            Create Membership Tier
          </Button>
        </div>
      </form>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Memberships</h1>
          <p className="text-muted-foreground">Manage membership tiers and track your subscribers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Tier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Membership Tier</DialogTitle>
              <DialogDescription>
                Set up a new membership tier with pricing and benefits for your supporters.
              </DialogDescription>
            </DialogHeader>
            <MembershipForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Tiers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTiers}</div>
            <p className="text-xs text-muted-foreground">Active tiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {CURRENCY.symbol}{stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Estimated monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgDuration)}</div>
            <p className="text-xs text-muted-foreground">Days average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Membership Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Tiers</CardTitle>
            <CardDescription>Your available membership options</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : membershipProducts && membershipProducts.length > 0 ? (
              <div className="space-y-4">
                {membershipProducts.map((product) => {
                  const memberCount = memberships?.filter(m => m.productId === product.id && m.isActive).length || 0;
                  const monthlyRevenue = parseFloat(product.price) * memberCount;
                  
                  return (
                    <div key={product.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{product.title}</h4>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {product.description || "No description provided"}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-primary font-semibold">
                              {CURRENCY.symbol}{parseFloat(product.price).toLocaleString()}
                              /{MEMBERSHIP_DURATION_OPTIONS.find(d => d.value === product.membershipDuration)?.label.toLowerCase()}
                            </span>
                            <span className="text-muted-foreground">
                              {memberCount} members
                            </span>
                            <span className="text-muted-foreground">
                              {CURRENCY.symbol}{monthlyRevenue.toLocaleString()}/month
                            </span>
                          </div>
                        </div>
                        <Crown className="w-5 h-5 text-accent ml-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No membership tiers</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first membership tier to start building recurring revenue
                </p>
                <Button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Tier
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card>
          <CardHeader>
            <CardTitle>Active Members</CardTitle>
            <CardDescription>Your current subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            {membershipsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : memberships && memberships.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {memberships
                  .filter(m => m.isActive)
                  .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
                  .map((membership) => {
                    const product = membershipProducts?.find(p => p.id === membership.productId);
                    const isExpiring = isExpiringSoon(membership.expiresAt);
                    
                    return (
                      <div key={membership.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{product?.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Member #{membership.userId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Expires {formatDate(membership.expiresAt)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isExpiring && (
                              <Badge variant="destructive" className="text-xs">
                                Expiring Soon
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {CURRENCY.symbol}{product ? parseFloat(product.price).toLocaleString() : "0"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active members</h3>
                <p className="text-muted-foreground">
                  Create membership tiers and share your page to get your first subscribers
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
