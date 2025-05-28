import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Eye,
  Calendar,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/advanced', timeRange],
  });

  const { data: trends } = useQuery({
    queryKey: ['/api/analytics/trends', { months: 6 }],
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted/50 rounded-2xl"></div>
          <div className="h-80 bg-muted/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const metricsCards = [
    {
      title: "Total Revenue",
      value: `₹${analytics?.revenue?.total?.toLocaleString() || 0}`,
      change: analytics?.revenue?.growth || 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Total Orders",
      value: analytics?.orders?.total?.toLocaleString() || 0,
      change: analytics?.orders?.growth || 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Total Customers",
      value: analytics?.customers?.total?.toLocaleString() || 0,
      change: ((analytics?.customers?.newThisMonth || 0) / Math.max(analytics?.customers?.total || 1, 1) * 100),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.traffic?.conversionRate?.toFixed(1) || 0}%`,
      change: 2.1,
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800"
    }
  ];

  const revenueData = trends?.map(trend => ({
    month: trend.month,
    revenue: trend.revenue,
    orders: trend.orders,
    customers: trend.customers
  })) || [];

  const topProducts = analytics?.products?.topSelling || [];

  const COLORS = ['#E03A3E', '#FFD700', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Deep insights into your creator business performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { label: "7D", value: "7d" },
              { label: "30D", value: "30d" },
              { label: "90D", value: "90d" },
              { label: "1Y", value: "1y" }
            ].map(option => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(option.value)}
                className={`rounded-none border-0 ${
                  timeRange === option.value 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted/50"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => (
          <Card key={index} className={`floating-card border-0 shadow-lg ${metric.bgColor} ${metric.borderColor} border overflow-hidden group hover:shadow-xl transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className={`flex items-center space-x-1 text-sm ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{Math.abs(metric.change).toFixed(1)}%</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Revenue Trends</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    +{analytics?.revenue?.growth?.toFixed(1) || 0}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E03A3E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#E03A3E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#E03A3E" 
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{product.revenue?.toLocaleString()}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span>+12%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="floating-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentActivity?.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'order' ? 'bg-green-100 text-green-600' :
                        activity.type === 'product_created' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'order' && <ShoppingBag className="w-5 h-5" />}
                        {activity.type === 'product_created' && <Award className="w-5 h-5" />}
                        {activity.type === 'customer_signup' && <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-right">
                        <p className="font-bold text-green-600">+₹{activity.amount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px'
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#E03A3E" strokeWidth={3} dot={{ fill: '#E03A3E', strokeWidth: 2, r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text">₹{analytics?.revenue?.total?.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <span className="font-medium">This Month</span>
                      <span className="font-bold text-green-600">₹{analytics?.revenue?.thisMonth?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <span className="font-medium">Last Month</span>
                      <span className="font-bold text-blue-600">₹{analytics?.revenue?.lastMonth?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <span className="font-medium">Growth Rate</span>
                      <span className={`font-bold ${(analytics?.revenue?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(analytics?.revenue?.growth || 0) >= 0 ? '+' : ''}{analytics?.revenue?.growth?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{product.revenue?.toLocaleString()}</p>
                        <div className="flex items-center text-sm text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +15%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Digital Products', value: 65, color: '#E03A3E' },
                        { name: 'Memberships', value: 25, color: '#FFD700' },
                        { name: 'Donations', value: 10, color: '#10B981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Digital Products', value: 65, color: '#E03A3E' },
                        { name: 'Memberships', value: 25, color: '#FFD700' },
                        { name: 'Donations', value: 10, color: '#10B981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="customers" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="floating-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-2xl font-bold text-blue-600">{analytics?.customers?.total || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Customers</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <div className="text-2xl font-bold text-green-600">{analytics?.customers?.returning || 0}</div>
                      <div className="text-sm text-muted-foreground">Returning</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Order Value</span>
                      <span className="font-bold">₹{analytics?.traffic?.avgOrderValue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="font-bold">{analytics?.traffic?.conversionRate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Profile Views</span>
                      <span className="font-bold">{analytics?.traffic?.profileViews?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}