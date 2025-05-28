import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PRODUCT_TYPES, MEMBERSHIP_DURATION_OPTIONS, FILE_UPLOAD_LIMITS, CURRENCY } from "@/lib/constants";
import { Plus, Package, MoreHorizontal, Edit, Trash2, Eye, Upload, FileText } from "lucide-react";
import type { Product, InsertProduct } from "@shared/schema";

export default function DashboardProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Product created successfully!",
        description: "Your product is now live and ready for sale.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProduct> }) =>
      apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Product updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const ProductForm = () => {
    const [formData, setFormData] = useState<Partial<InsertProduct>>({
      title: editingProduct?.title || "",
      description: editingProduct?.description || "",
      price: editingProduct?.price || "0",
      type: editingProduct?.type || PRODUCT_TYPES.PRODUCT,
      membershipDuration: editingProduct?.membershipDuration || 30,
      isActive: editingProduct?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingProduct) {
        updateProductMutation.mutate({ id: editingProduct.id, data: formData });
      } else {
        createProductMutation.mutate(formData as InsertProduct);
      }
    };

    const handleInputChange = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter product title"
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
              placeholder="0"
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
            placeholder="Describe your product..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Product Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PRODUCT_TYPES.PRODUCT}>Digital Product</SelectItem>
                <SelectItem value={PRODUCT_TYPES.MEMBERSHIP}>Membership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.type === PRODUCT_TYPES.MEMBERSHIP && (
            <div className="space-y-2">
              <Label htmlFor="duration">Membership Duration</Label>
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
          )}
        </div>

        {formData.type === PRODUCT_TYPES.PRODUCT && (
          <div className="space-y-2">
            <Label>Product Files</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <Button variant="outline" type="button">
                    Choose Files
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload up to {FILE_UPLOAD_LIMITS.maxSize / (1024 * 1024)}MB per file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported: {FILE_UPLOAD_LIMITS.allowedExtensions.slice(0, 5).join(", ")} and more
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" className="btn-primary" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
            {editingProduct ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    );
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your digital products and memberships</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Create New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? "Update your product details below." 
                  : "Add a new digital product or membership to your store."
                }
              </DialogDescription>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="floating-card overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                {product.coverImage ? (
                  <img 
                    src={product.coverImage} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No cover image</p>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{product.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={product.type === PRODUCT_TYPES.MEMBERSHIP ? "secondary" : "default"}>
                        {product.type === PRODUCT_TYPES.MEMBERSHIP ? "Membership" : "Product"}
                      </Badge>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(product)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteProductMutation.mutate(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-sm mb-4 line-clamp-2">
                  {product.description || "No description provided"}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    {CURRENCY.symbol}{parseFloat(product.price).toLocaleString()}
                    {product.type === PRODUCT_TYPES.MEMBERSHIP && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /{MEMBERSHIP_DURATION_OPTIONS.find(d => d.value === product.membershipDuration)?.label.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first digital product or membership to start earning
            </p>
            <Button className="btn-primary" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
