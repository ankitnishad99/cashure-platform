import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { 
  Heart, 
  Download, 
  Users, 
  Star, 
  Globe, 
  Instagram, 
  Youtube, 
  Twitter,
  Share2,
  Crown,
  Sparkles,
  TrendingUp,
  Gift
} from "lucide-react";
import { Link } from "wouter";

interface Creator {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  themeColor: string;
  socialLinks: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    memberCount: number;
    rating: number;
  };
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  coverImage: string;
  type: 'digital' | 'membership' | 'donation';
  sales: number;
  rating: number;
}

export default function CreatorStorefront() {
  const [match, params] = useRoute("/creator/:username");
  const username = params?.username;

  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ['/api/creator/profile', username],
    enabled: !!username,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/creator/products', username],
    enabled: !!username,
  });

  if (creatorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="animate-pulse">
          <div className="h-64 bg-muted/50"></div>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="h-8 bg-muted/50 rounded-xl w-64 mb-4"></div>
            <div className="h-4 bg-muted/50 rounded-lg w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-muted/50 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚀</div>
          <h1 className="text-2xl font-bold">Creator Not Found</h1>
          <p className="text-muted-foreground">This creator page doesn't exist or has been moved.</p>
          <Link href="/">
            <Button className="btn-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Creators
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Banner */}
      <div className="relative h-80 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br opacity-90"
          style={{
            background: creator.banner 
              ? `url(${creator.banner})` 
              : `linear-gradient(135deg, ${creator.themeColor || '#E03A3E'} 0%, ${creator.themeColor || '#FFD700'} 100%)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Floating Share Button */}
        <div className="absolute top-6 right-6">
          <Button size="icon" variant="ghost" className="glass text-white hover:bg-white/20">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Creator Profile */}
      <div className="relative max-w-6xl mx-auto px-4 -mt-20">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                <AvatarImage src={creator.avatar} alt={creator.displayName} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                  {creator.displayName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {creator.socialLinks?.youtube && (
                <a href={creator.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="outline" className="hover:bg-red-50 hover:border-red-200">
                    <Youtube className="w-4 h-4 text-red-600" />
                  </Button>
                </a>
              )}
              {creator.socialLinks?.instagram && (
                <a href={creator.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="outline" className="hover:bg-pink-50 hover:border-pink-200">
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </Button>
                </a>
              )}
              {creator.socialLinks?.twitter && (
                <a href={creator.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="outline" className="hover:bg-blue-50 hover:border-blue-200">
                    <Twitter className="w-4 h-4 text-blue-600" />
                  </Button>
                </a>
              )}
              {creator.socialLinks?.website && (
                <a href={creator.socialLinks.website} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="outline" className="hover:bg-green-50 hover:border-green-200">
                    <Globe className="w-4 h-4 text-green-600" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Creator Details */}
          <div className="flex-1 space-y-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-4xl font-bold gradient-text">{creator.displayName}</h1>
                <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
                  @{creator.username}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {creator.bio}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{creator.stats?.totalProducts || 0}</div>
                <div className="text-sm text-muted-foreground font-medium">Products</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent-foreground">{creator.stats?.totalSales || 0}</div>
                <div className="text-sm text-muted-foreground font-medium">Sales</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
                <div className="text-2xl font-bold text-green-600">{creator.stats?.memberCount || 0}</div>
                <div className="text-sm text-muted-foreground font-medium">Members</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-800/50">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-600 fill-current" />
                  <span className="text-2xl font-bold text-yellow-600">{creator.stats?.rating || 5.0}</span>
                </div>
                <div className="text-sm text-muted-foreground font-medium">Rating</div>
              </div>
            </div>

            {/* Support Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-primary flex-1 py-3 text-lg font-semibold rounded-xl">
                <Heart className="w-5 h-5 mr-2" />
                Support with Donation
              </Button>
              <Button variant="outline" className="px-6 py-3 rounded-xl font-semibold border-2 hover:bg-muted/50">
                <Gift className="w-5 h-5 mr-2" />
                Send Gift
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Digital Products</h2>
          <Badge variant="outline" className="text-sm">
            {products?.length || 0} Products Available
          </Badge>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted/50 rounded-t-2xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                  <div className="h-3 bg-muted/50 rounded w-full"></div>
                  <div className="h-8 bg-muted/50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <Card key={product.id} className="floating-card overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={product.coverImage || '/api/placeholder/400/200'} 
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${product.type === 'digital' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                        ${product.type === 'membership' ? 'bg-purple-100 text-purple-700 border-purple-200' : ''}
                        ${product.type === 'donation' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                      `}
                    >
                      {product.type === 'digital' && <Download className="w-3 h-3 mr-1" />}
                      {product.type === 'membership' && <Crown className="w-3 h-3 mr-1" />}
                      {product.type === 'donation' && <Heart className="w-3 h-3 mr-1" />}
                      {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span>{product.rating || 5.0}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold gradient-text">₹{product.price}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {product.sales || 0} sales
                      </div>
                    </div>
                    
                    <Button className="btn-primary rounded-xl">
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground">This creator hasn't added any products yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}