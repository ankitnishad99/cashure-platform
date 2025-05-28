import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertCommunityAccessSchema, insertPayoutSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createPaymentSession, verifyPayment, getOrderStatus } from "./payment";
import { emailService } from "./email";
import { fileStorageService } from "./storage-service";
import { analyticsService } from "./analytics";
import { subscriptionManager } from "./subscription-manager";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });

  // User Routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile", error });
    }
  });

  app.put("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.user.userId, updates);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile", error });
    }
  });

  app.get("/api/user/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "Creator not found" });
      }
      res.json({ ...user, password: undefined, email: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creator", error });
    }
  });

  // Product Routes
  app.get("/api/products", authenticateToken, async (req: any, res) => {
    try {
      const products = await storage.getProductsByCreator(req.user.userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products", error });
    }
  });

  app.get("/api/products/creator/:creatorId", async (req, res) => {
    try {
      const products = await storage.getProductsByCreator(parseInt(req.params.creatorId));
      res.json(products.filter(p => p.isActive));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creator products", error });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product", error });
    }
  });

  app.post("/api/products", authenticateToken, async (req: any, res) => {
    try {
      const data = insertProductSchema.parse({
        ...req.body,
        creatorId: req.user.userId
      });
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.put("/api/products/:id", authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product || product.creatorId !== req.user.userId) {
        return res.status(404).json({ message: "Product not found" });
      }

      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product", error });
    }
  });

  app.delete("/api/products/:id", authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product || product.creatorId !== req.user.userId) {
        return res.status(404).json({ message: "Product not found" });
      }

      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product", error });
    }
  });

  // Order Routes
  app.get("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      const orders = await storage.getOrdersByCreator(req.user.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders", error });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      
      // Calculate platform fee (10%)
      const amount = parseFloat(data.amount);
      const platformFee = amount * 0.1;
      const creatorEarnings = amount - platformFee;

      const order = await storage.createOrder({
        ...data,
        platformFee: platformFee.toString(),
        creatorEarnings: creatorEarnings.toString()
      });

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.updateOrder(orderId, req.body);
      
      // Send email notifications when order is completed
      if (req.body.status === "completed") {
        try {
          // Get creator and product details
          const creator = await storage.getUser(order.creatorId);
          const product = order.productId ? await storage.getProduct(order.productId) : null;
          
          if (creator && order.customerName && order.customerEmail) {
            // Send purchase confirmation to customer
            await emailService.sendPurchaseConfirmation(
              order,
              { name: order.customerName, email: order.customerEmail },
              creator,
              product || undefined
            );
            
            // Send payment notification to creator
            await emailService.sendPaymentNotification(order, creator, product || undefined);
            
            console.log(`Email notifications sent for order ${orderId}`);
          }
        } catch (emailError) {
          console.error("Failed to send email notifications:", emailError);
          // Don't fail the order update if email fails
        }
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order", error });
    }
  });

  // Community Access Routes
  app.get("/api/community", authenticateToken, async (req: any, res) => {
    try {
      const communities = await storage.getCommunityAccessByCreator(req.user.userId);
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch communities", error });
    }
  });

  app.get("/api/community/creator/:creatorId", async (req, res) => {
    try {
      const communities = await storage.getCommunityAccessByCreator(parseInt(req.params.creatorId));
      res.json(communities.filter(c => c.isActive));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creator communities", error });
    }
  });

  app.post("/api/community", authenticateToken, async (req: any, res) => {
    try {
      const data = insertCommunityAccessSchema.parse({
        ...req.body,
        creatorId: req.user.userId
      });
      const community = await storage.createCommunityAccess(data);
      res.json(community);
    } catch (error) {
      res.status(400).json({ message: "Invalid community data", error });
    }
  });

  // Creator Storefront Routes
  app.get("/api/creator/profile/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const creator = await storage.getUserByUsername(username);
      
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      const stats = await storage.getCreatorStats(creator.id);
      
      const creatorProfile = {
        id: creator.id,
        username: creator.username,
        displayName: creator.displayName,
        bio: creator.bio,
        avatar: creator.avatar,
        banner: creator.banner,
        themeColor: creator.themeColor || '#E03A3E',
        socialLinks: creator.socialLinks || {},
        stats: {
          totalProducts: stats.totalProducts,
          totalSales: stats.totalOrders,
          memberCount: stats.totalMembers,
          rating: 5.0
        }
      };

      res.json(creatorProfile);
    } catch (error) {
      console.error("Error fetching creator profile:", error);
      res.status(500).json({ message: "Failed to fetch creator profile" });
    }
  });

  app.get("/api/creator/products/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const creator = await storage.getUserByUsername(username);
      
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      const products = await storage.getProductsByCreator(creator.id);
      
      const enhancedProducts = products
        .filter(product => product.isActive)
        .map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          coverImage: product.coverImage,
          type: product.type,
          sales: 0,
          rating: 5.0
        }));

      res.json(enhancedProducts);
    } catch (error) {
      console.error("Error fetching creator products:", error);
      res.status(500).json({ message: "Failed to fetch creator products" });
    }
  });

  // Advanced Analytics Routes
  app.get("/api/analytics/advanced", authenticateToken, async (req: any, res) => {
    try {
      const analyticsData = await analyticsService.getCreatorAnalytics(req.user.userId);
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching advanced analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/trends", authenticateToken, async (req: any, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const trends = await analyticsService.getMonthlyTrends(req.user.userId, months);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ message: "Failed to fetch trends" });
    }
  });

  // Payout Routes
  app.get("/api/payouts", authenticateToken, async (req: any, res) => {
    try {
      const payouts = await storage.getPayoutsByCreator(req.user.userId);
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payouts", error });
    }
  });

  app.post("/api/payouts", authenticateToken, async (req: any, res) => {
    try {
      const data = insertPayoutSchema.parse({
        ...req.body,
        creatorId: req.user.userId
      });
      const payout = await storage.createPayout(data);
      res.json(payout);
    } catch (error) {
      res.status(400).json({ message: "Invalid payout data", error });
    }
  });

  // Advanced Analytics Routes
  app.get("/api/analytics/dashboard", authenticateToken, async (req: any, res) => {
    try {
      const analytics = await analyticsService.getCreatorAnalytics(req.user.userId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics", error });
    }
  });

  app.get("/api/analytics/trends", authenticateToken, async (req: any, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const trends = await analyticsService.getMonthlyTrends(req.user.userId, months);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trends", error });
    }
  });

  app.get("/api/analytics/product/:productId", authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const analytics = await analyticsService.getProductAnalytics(productId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product analytics", error });
    }
  });

  // Legacy Analytics Routes (for compatibility)
  app.get("/api/analytics/earnings", authenticateToken, async (req: any, res) => {
    try {
      const earnings = await storage.getCreatorEarnings(req.user.userId);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch earnings", error });
    }
  });

  app.get("/api/analytics/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getCreatorStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats", error });
    }
  });

  // Subscription Management Routes
  app.get("/api/subscriptions/status/:creatorId", authenticateToken, async (req: any, res) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      const status = await subscriptionManager.checkMembershipStatus(req.user.userId, creatorId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to check subscription status", error });
    }
  });

  app.post("/api/subscriptions/renew/:membershipId", authenticateToken, async (req: any, res) => {
    try {
      const membershipId = parseInt(req.params.membershipId);
      const success = await subscriptionManager.renewMembership(membershipId);
      
      if (success) {
        res.json({ message: "Membership renewed successfully" });
      } else {
        res.status(400).json({ message: "Failed to renew membership" });
      }
    } catch (error) {
      res.status(500).json({ message: "Membership renewal failed", error });
    }
  });

  app.get("/api/subscriptions/analytics", authenticateToken, async (req: any, res) => {
    try {
      const analytics = await subscriptionManager.getMembershipAnalytics(req.user.userId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription analytics", error });
    }
  });

  // Admin Routes
  app.get("/api/admin/payouts", authenticateToken, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const payouts = await storage.getAllPendingPayouts();
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending payouts", error });
    }
  });

  app.put("/api/admin/payouts/:id", authenticateToken, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const payoutId = parseInt(req.params.id);
      const payout = await storage.updatePayout(payoutId, req.body);
      res.json(payout);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payout", error });
    }
  });

  // Payment Routes
  app.post("/api/payments/create", async (req, res) => {
    try {
      const { orderId, amount, customerEmail, customerName, customerPhone, productName } = req.body;
      
      const paymentRequest = {
        orderId,
        amount: parseFloat(amount),
        customerEmail,
        customerName,
        customerPhone,
        redirectUrl: `${req.protocol}://${req.get('host')}/payment/success?order_id=${orderId}`,
        notifyUrl: `${req.protocol}://${req.get('host')}/api/payments/webhook`,
        productName: productName || "Digital Product"
      };

      const result = await createPaymentSession(paymentRequest);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment session", error });
    }
  });

  app.post("/api/payments/verify/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const result = await verifyPayment(orderId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to verify payment", error });
    }
  });

  app.get("/api/payments/status/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const result = await getOrderStatus(orderId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to get order status", error });
    }
  });

  // File Storage Routes
  const upload = fileStorageService.getMulterConfig();

  app.post("/api/files/upload", authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await fileStorageService.uploadFile(req.file, req.user.userId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({ message: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ message: "File upload failed", error: error.message });
    }
  });

  app.get("/api/files/download/:orderId/:fileKey", async (req, res) => {
    try {
      const { orderId, fileKey } = req.params;
      
      // Verify order exists and is completed
      const order = await storage.getOrder(parseInt(orderId));
      if (!order || order.status !== "completed") {
        return res.status(403).json({ message: "Invalid or incomplete order" });
      }

      // Generate secure download link (valid for 30 minutes)
      const downloadLink = await fileStorageService.generateSecureDownloadLink(fileKey, 30);
      
      if (downloadLink.success) {
        res.json({
          downloadUrl: downloadLink.downloadUrl,
          expiresIn: downloadLink.expiresIn
        });
      } else {
        res.status(500).json({ message: downloadLink.error });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Download link generation failed", error: error.message });
    }
  });

  app.delete("/api/files/:fileKey", authenticateToken, async (req: any, res) => {
    try {
      const { fileKey } = req.params;
      
      // Check if user owns the file (simplified check)
      const metadata = await fileStorageService.getFileMetadata(fileKey);
      if (!metadata.success) {
        return res.status(404).json({ message: "File not found" });
      }

      const success = await fileStorageService.deleteFile(fileKey);
      
      if (success) {
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(500).json({ message: "File deletion failed" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "File deletion failed", error: error.message });
    }
  });

  // Email Routes
  app.post("/api/email/test", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email address required" });
      }
      
      const success = await emailService.sendTestEmail(email);
      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Email service error", error });
    }
  });

  // Cashfree Webhook for payment notifications
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { orderId, orderAmount, paymentStatus, referenceId } = req.body;
      
      if (paymentStatus === "SUCCESS") {
        // Update order status in your database
        const orderIdNum = parseInt(orderId.replace("order_", ""));
        await storage.updateOrder(orderIdNum, {
          status: "completed",
          paymentId: referenceId,
          paymentData: req.body
        });
      }
      
      res.status(200).json({ status: "OK" });
    } catch (error) {
      console.error("Webhook processing failed:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
