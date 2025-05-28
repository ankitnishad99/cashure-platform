import { storage } from "./storage";

export interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  products: {
    total: number;
    active: number;
    topSelling: Array<{
      id: number;
      title: string;
      sales: number;
      revenue: number;
    }>;
  };
  customers: {
    total: number;
    returning: number;
    newThisMonth: number;
  };
  traffic: {
    profileViews: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  recentActivity: Array<{
    type: 'order' | 'product_created' | 'customer_signup';
    timestamp: Date;
    description: string;
    amount?: number;
  }>;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getCreatorAnalytics(creatorId: number): Promise<AnalyticsData> {
    try {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get all orders for the creator
      const allOrders = await storage.getOrdersByCreator(creatorId);
      const products = await storage.getProductsByCreator(creatorId);

      // Filter orders by time periods
      const thisMonthOrders = allOrders.filter(order => 
        new Date(order.createdAt!) >= thisMonth
      );
      const lastMonthOrders = allOrders.filter(order => 
        new Date(order.createdAt!) >= lastMonth && new Date(order.createdAt!) <= lastMonthEnd
      );
      const completedOrders = allOrders.filter(order => order.status === 'completed');

      // Calculate revenue
      const totalRevenue = completedOrders.reduce((sum, order) => 
        sum + parseFloat(order.creatorEarnings), 0
      );
      const thisMonthRevenue = thisMonthOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.creatorEarnings), 0);
      const lastMonthRevenue = lastMonthOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.creatorEarnings), 0);

      // Calculate growth rates
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
      const ordersGrowth = lastMonthOrders.length > 0 
        ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 
        : 0;

      // Get product performance
      const productSales = new Map<number, { sales: number; revenue: number }>();
      completedOrders.forEach(order => {
        if (order.productId) {
          const current = productSales.get(order.productId) || { sales: 0, revenue: 0 };
          productSales.set(order.productId, {
            sales: current.sales + 1,
            revenue: current.revenue + parseFloat(order.creatorEarnings)
          });
        }
      });

      const topSelling = await Promise.all(
        Array.from(productSales.entries())
          .sort((a, b) => b[1].sales - a[1].sales)
          .slice(0, 5)
          .map(async ([productId, stats]) => {
            const product = await storage.getProduct(productId);
            return {
              id: productId,
              title: product?.title || 'Unknown Product',
              sales: stats.sales,
              revenue: stats.revenue
            };
          })
      );

      // Get unique customers
      const uniqueCustomers = new Set(allOrders.map(order => order.customerEmail));
      const thisMonthCustomers = new Set(thisMonthOrders.map(order => order.customerEmail));

      // Calculate conversion and average order value
      const totalOrderValue = completedOrders.reduce((sum, order) => 
        sum + parseFloat(order.amount), 0
      );
      const avgOrderValue = completedOrders.length > 0 
        ? totalOrderValue / completedOrders.length 
        : 0;

      // Recent activity (last 10 activities)
      const recentActivity = allOrders
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 10)
        .map(order => ({
          type: 'order' as const,
          timestamp: new Date(order.createdAt!),
          description: `Order from ${order.customerName} - ${order.type}`,
          amount: parseFloat(order.amount)
        }));

      return {
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth: revenueGrowth
        },
        orders: {
          total: completedOrders.length,
          thisMonth: thisMonthOrders.filter(o => o.status === 'completed').length,
          lastMonth: lastMonthOrders.filter(o => o.status === 'completed').length,
          growth: ordersGrowth
        },
        products: {
          total: products.length,
          active: products.filter(p => p.isActive).length,
          topSelling
        },
        customers: {
          total: uniqueCustomers.size,
          returning: uniqueCustomers.size - thisMonthCustomers.size,
          newThisMonth: thisMonthCustomers.size
        },
        traffic: {
          profileViews: Math.floor(Math.random() * 1000) + 500, // Placeholder - would connect to real analytics
          conversionRate: completedOrders.length > 0 ? (completedOrders.length / uniqueCustomers.size) * 100 : 0,
          avgOrderValue
        },
        recentActivity
      };
    } catch (error) {
      console.error('Analytics calculation failed:', error);
      throw error;
    }
  }

  async getMonthlyTrends(creatorId: number, months: number = 6): Promise<MonthlyTrend[]> {
    try {
      const allOrders = await storage.getOrdersByCreator(creatorId);
      const completedOrders = allOrders.filter(order => order.status === 'completed');

      const trends: MonthlyTrend[] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const monthOrders = completedOrders.filter(order => {
          const orderDate = new Date(order.createdAt!);
          return orderDate >= month && orderDate < nextMonth;
        });

        const revenue = monthOrders.reduce((sum, order) => 
          sum + parseFloat(order.creatorEarnings), 0
        );

        const customers = new Set(monthOrders.map(order => order.customerEmail));

        trends.push({
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          orders: monthOrders.length,
          customers: customers.size
        });
      }

      return trends;
    } catch (error) {
      console.error('Monthly trends calculation failed:', error);
      throw error;
    }
  }

  async getProductAnalytics(productId: number): Promise<any> {
    try {
      const product = await storage.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const allOrders = await storage.getOrdersByCreator(product.creatorId);
      const productOrders = allOrders.filter(order => order.productId === productId);
      const completedOrders = productOrders.filter(order => order.status === 'completed');

      const totalRevenue = completedOrders.reduce((sum, order) => 
        sum + parseFloat(order.creatorEarnings), 0
      );

      const conversionData = productOrders.reduce((acc, order) => {
        const status = order.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        product,
        sales: {
          total: completedOrders.length,
          revenue: totalRevenue,
          avgPrice: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
        },
        conversion: conversionData,
        recentSales: productOrders
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 10)
      };
    } catch (error) {
      console.error('Product analytics calculation failed:', error);
      throw error;
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();