import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { THEME_COLORS, SOCIAL_PLATFORMS } from "@/lib/constants";
import { 
  User, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Eye, 
  Save, 
  Camera,
  ExternalLink,
  Trash2
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function DashboardSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserType>) => apiRequest("PUT", "/api/user/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const ProfileSettings = () => {
    const [formData, setFormData] = useState({
      displayName: user?.displayName || "",
      username: user?.username || "",
      bio: user?.bio || "",
      themeColor: user?.themeColor || THEME_COLORS[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateProfileMutation.mutate(formData);
    };

    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-accent text-white">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" type="button">
              <Camera className="w-4 h-4 mr-2" />
              Change Avatar
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              placeholder="Your display name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="username"
            />
            <p className="text-xs text-muted-foreground">
              cashure.in/{formData.username || "username"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Tell your audience about yourself..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Theme Color */}
        <div className="space-y-4">
          <Label>Theme Color</Label>
          <div className="flex flex-wrap gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  formData.themeColor === color 
                    ? "border-foreground scale-110" 
                    : "border-muted"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleInputChange("themeColor", color)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="btn-primary" disabled={updateProfileMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    );
  };

  const SocialLinksSettings = () => {
    const [socialLinks, setSocialLinks] = useState(user?.socialLinks || {});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateProfileMutation.mutate({ socialLinks });
    };

    const handleLinkChange = (platform: string, url: string) => {
      setSocialLinks(prev => ({ ...prev, [platform]: url }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label htmlFor={platform.key}>{platform.label}</Label>
              <Input
                id={platform.key}
                type="url"
                value={socialLinks[platform.key] || ""}
                onChange={(e) => handleLinkChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="btn-primary" disabled={updateProfileMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Social Links
          </Button>
        </div>
      </form>
    );
  };

  const ModuleSettings = () => {
    const [modules, setModules] = useState(user?.enabledModules || {
      donations: true,
      products: false,
      memberships: false,
      community: false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateProfileMutation.mutate({ enabledModules: modules });
    };

    const handleModuleToggle = (module: string, enabled: boolean) => {
      setModules(prev => ({ ...prev, [module]: enabled }));
    };

    const modulesList = [
      {
        key: "donations",
        title: "Donations",
        description: "Accept one-time donations from supporters",
        icon: "💝"
      },
      {
        key: "products",
        title: "Digital Products",
        description: "Sell PDFs, videos, courses, and digital downloads",
        icon: "📦"
      },
      {
        key: "memberships",
        title: "Memberships",
        description: "Create subscription tiers for recurring revenue",
        icon: "👥"
      },
      {
        key: "community",
        title: "Community Access",
        description: "Gate access to private Telegram groups/channels",
        icon: "🔒"
      }
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {modulesList.map((module) => (
            <div key={module.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{module.icon}</div>
                <div>
                  <h4 className="font-semibold">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <Switch
                checked={modules[module.key]}
                onCheckedChange={(checked) => handleModuleToggle(module.key, checked)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="btn-primary" disabled={updateProfileMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Module Settings
          </Button>
        </div>
      </form>
    );
  };

  const PrivacySettings = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold">Profile Visibility</h4>
              <p className="text-sm text-muted-foreground">Make your profile discoverable</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold">Show Earnings</h4>
              <p className="text-sm text-muted-foreground">Display total earnings on profile</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive email updates about orders</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
          
          <div className="border border-destructive rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User, component: ProfileSettings },
    { id: "social", label: "Social Links", icon: Globe, component: SocialLinksSettings },
    { id: "modules", label: "Modules", icon: Palette, component: ModuleSettings },
    { id: "privacy", label: "Privacy", icon: Shield, component: PrivacySettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        <Button variant="outline" asChild>
          <a href={`/creator/${user?.username}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Public Profile
          </a>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === tab.id ? "btn-primary" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {(() => {
                const activeTabData = tabs.find(tab => tab.id === activeTab);
                const IconComponent = activeTabData?.icon;
                return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
              })()}
              <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
            </CardTitle>
            <CardDescription>
              {activeTab === "profile" && "Update your personal information and appearance"}
              {activeTab === "social" && "Connect your social media accounts"}
              {activeTab === "modules" && "Enable or disable monetization features"}
              {activeTab === "privacy" && "Control your privacy and account settings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveComponent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
