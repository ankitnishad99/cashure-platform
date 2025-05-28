import { storage } from "./storage";
import { emailService } from "./email";

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  isActive: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier?: SubscriptionTier;
  expiresAt?: Date;
  daysRemaining?: number;
  autoRenew: boolean;
}

export class SubscriptionManager {
  private static instance: SubscriptionManager;

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  // Check if user's membership is still active
  async checkMembershipStatus(userId: number, creatorId: number): Promise<SubscriptionStatus> {
    try {
      const memberships = await storage.getMembershipsByUser(userId);
      const activeMembership = memberships.find(m => 
        m.creatorId === creatorId && 
        m.isActive && 
        new Date(m.expiresAt) > new Date()
      );

      if (!activeMembership) {
        return { isActive: false, autoRenew: false };
      }

      const expiresAt = new Date(activeMembership.expiresAt);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Get product details for tier info
      const product = await storage.getProduct(activeMembership.productId);
      
      return {
        isActive: true,
        tier: product ? {
          id: product.id.toString(),
          name: product.title,
          price: parseFloat(product.price),
          duration: product.membershipDuration || 30,
          features: [], // Could be extracted from product description
          isActive: product.isActive || false
        } : undefined,
        expiresAt,
        daysRemaining,
        autoRenew: false // Would be stored in membership record
      };
    } catch (error) {
      console.error('Membership status check failed:', error);
      return { isActive: false, autoRenew: false };
    }
  }

  // Process membership renewal
  async renewMembership(membershipId: number): Promise<boolean> {
    try {
      const membership = await storage.getMembershipsByUser(membershipId);
      if (!membership.length) {
        return false;
      }

      const currentMembership = membership[0];
      const product = await storage.getProduct(currentMembership.productId);
      
      if (!product) {
        return false;
      }

      // Extend expiration date
      const currentExpiry = new Date(currentMembership.expiresAt);
      const newExpiry = new Date(currentExpiry.getTime() + (product.membershipDuration || 30) * 24 * 60 * 60 * 1000);

      await storage.updateMembership(currentMembership.id, {
        expiresAt: newExpiry
      });

      // Send renewal confirmation email
      const creator = await storage.getUser(currentMembership.creatorId);
      const customer = await storage.getUser(currentMembership.userId);

      if (creator && customer) {
        await emailService.sendOrderStatusUpdate(
          {
            id: currentMembership.orderId,
            customerName: customer.displayName || customer.username || 'Member',
            customerEmail: customer.email,
            amount: product.price,
            creatorId: creator.id,
            type: 'membership',
            status: 'renewed',
            platformFee: '0',
            creatorEarnings: product.price,
            paymentId: null,
            productId: product.id,
            paymentData: null,
            createdAt: new Date(),
            completedAt: new Date()
          },
          { name: customer.displayName || customer.username || 'Member', email: customer.email },
          'renewed'
        );
      }

      return true;
    } catch (error) {
      console.error('Membership renewal failed:', error);
      return false;
    }
  }

  // Check for expiring memberships and send notifications
  async checkExpiringMemberships(): Promise<void> {
    try {
      // This would typically be run as a scheduled job
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Get all active memberships expiring in 3 days
      // Note: This is a simplified implementation
      console.log('Checking for expiring memberships...');
      
      // In a real implementation, you'd query the database for expiring memberships
      // and send reminder emails to users
    } catch (error) {
      console.error('Expiring membership check failed:', error);
    }
  }

  // Get membership analytics for creator
  async getMembershipAnalytics(creatorId: number): Promise<any> {
    try {
      const memberships = await storage.getMembershipsByCreator(creatorId);
      const now = new Date();

      const active = memberships.filter(m => 
        m.isActive && new Date(m.expiresAt) > now
      );

      const expired = memberships.filter(m => 
        new Date(m.expiresAt) <= now
      );

      const expiringThisWeek = active.filter(m => {
        const expiryDate = new Date(m.expiresAt);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return expiryDate <= weekFromNow;
      });

      // Calculate monthly recurring revenue (MRR)
      const activeMemberships = active.length;
      const products = await storage.getProductsByCreator(creatorId);
      const membershipProducts = products.filter(p => p.type === 'membership');
      
      const avgMembershipPrice = membershipProducts.length > 0 
        ? membershipProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) / membershipProducts.length
        : 0;

      const mrr = activeMemberships * avgMembershipPrice;

      return {
        total: memberships.length,
        active: active.length,
        expired: expired.length,
        expiringThisWeek: expiringThisWeek.length,
        mrr,
        avgMembershipPrice,
        retentionRate: memberships.length > 0 ? (active.length / memberships.length) * 100 : 0
      };
    } catch (error) {
      console.error('Membership analytics calculation failed:', error);
      throw error;
    }
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();