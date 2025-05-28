import { users, products, orders, memberships, communityAccess, payouts, type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type Membership, type InsertMembership, type CommunityAccess, type InsertCommunityAccess, type Payout, type InsertPayout } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCreator(creatorId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCreator(creatorId: number): Promise<Order[]>;
  getOrdersByCustomer(customerEmail: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;
  
  // Memberships
  getMembershipsByUser(userId: number): Promise<Membership[]>;
  getMembershipsByCreator(creatorId: number): Promise<Membership[]>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembership(id: number, updates: Partial<InsertMembership>): Promise<Membership>;
  
  // Community Access
  getCommunityAccessByCreator(creatorId: number): Promise<CommunityAccess[]>;
  createCommunityAccess(access: InsertCommunityAccess): Promise<CommunityAccess>;
  updateCommunityAccess(id: number, updates: Partial<InsertCommunityAccess>): Promise<CommunityAccess>;
  
  // Payouts
  getPayoutsByCreator(creatorId: number): Promise<Payout[]>;
  getAllPendingPayouts(): Promise<Payout[]>;
  createPayout(payout: InsertPayout): Promise<Payout>;
  updatePayout(id: number, updates: Partial<InsertPayout>): Promise<Payout>;
  
  // Analytics
  getCreatorEarnings(creatorId: number): Promise<{ total: number; thisMonth: number; }>;
  getCreatorStats(creatorId: number): Promise<{ totalOrders: number; totalProducts: number; totalMembers: number; }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private memberships: Map<number, Membership>;
  private communityAccess: Map<number, CommunityAccess>;
  private payouts: Map<number, Payout>;
  private currentUserId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentMembershipId: number;
  private currentCommunityAccessId: number;
  private currentPayoutId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.memberships = new Map();
    this.communityAccess = new Map();
    this.payouts = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentMembershipId = 1;
    this.currentCommunityAccessId = 1;
    this.currentPayoutId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCreator(creatorId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.creatorId === creatorId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    
    const updatedProduct: Product = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Orders
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCreator(creatorId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.creatorId === creatorId);
  }

  async getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.customerEmail === customerEmail);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder: Order = {
      ...order,
      ...updates,
      completedAt: updates.status === "completed" ? new Date() : order.completedAt
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Memberships
  async getMembershipsByUser(userId: number): Promise<Membership[]> {
    return Array.from(this.memberships.values()).filter(membership => membership.userId === userId);
  }

  async getMembershipsByCreator(creatorId: number): Promise<Membership[]> {
    return Array.from(this.memberships.values()).filter(membership => membership.creatorId === creatorId);
  }

  async createMembership(insertMembership: InsertMembership): Promise<Membership> {
    const id = this.currentMembershipId++;
    const membership: Membership = {
      ...insertMembership,
      id,
      createdAt: new Date()
    };
    this.memberships.set(id, membership);
    return membership;
  }

  async updateMembership(id: number, updates: Partial<InsertMembership>): Promise<Membership> {
    const membership = this.memberships.get(id);
    if (!membership) throw new Error("Membership not found");
    
    const updatedMembership: Membership = {
      ...membership,
      ...updates
    };
    this.memberships.set(id, updatedMembership);
    return updatedMembership;
  }

  // Community Access
  async getCommunityAccessByCreator(creatorId: number): Promise<CommunityAccess[]> {
    return Array.from(this.communityAccess.values()).filter(access => access.creatorId === creatorId);
  }

  async createCommunityAccess(insertAccess: InsertCommunityAccess): Promise<CommunityAccess> {
    const id = this.currentCommunityAccessId++;
    const access: CommunityAccess = {
      ...insertAccess,
      id,
      createdAt: new Date()
    };
    this.communityAccess.set(id, access);
    return access;
  }

  async updateCommunityAccess(id: number, updates: Partial<InsertCommunityAccess>): Promise<CommunityAccess> {
    const access = this.communityAccess.get(id);
    if (!access) throw new Error("Community access not found");
    
    const updatedAccess: CommunityAccess = {
      ...access,
      ...updates
    };
    this.communityAccess.set(id, updatedAccess);
    return updatedAccess;
  }

  // Payouts
  async getPayoutsByCreator(creatorId: number): Promise<Payout[]> {
    return Array.from(this.payouts.values()).filter(payout => payout.creatorId === creatorId);
  }

  async getAllPendingPayouts(): Promise<Payout[]> {
    return Array.from(this.payouts.values()).filter(payout => payout.status === "pending");
  }

  async createPayout(insertPayout: InsertPayout): Promise<Payout> {
    const id = this.currentPayoutId++;
    const payout: Payout = {
      ...insertPayout,
      id,
      requestedAt: new Date(),
      processedAt: null
    };
    this.payouts.set(id, payout);
    return payout;
  }

  async updatePayout(id: number, updates: Partial<InsertPayout>): Promise<Payout> {
    const payout = this.payouts.get(id);
    if (!payout) throw new Error("Payout not found");
    
    const updatedPayout: Payout = {
      ...payout,
      ...updates,
      processedAt: (updates.status === "completed" || updates.status === "rejected") ? new Date() : payout.processedAt
    };
    this.payouts.set(id, updatedPayout);
    return updatedPayout;
  }

  // Analytics
  async getCreatorEarnings(creatorId: number): Promise<{ total: number; thisMonth: number; }> {
    const orders = Array.from(this.orders.values()).filter(order => 
      order.creatorId === creatorId && order.status === "completed"
    );
    
    const total = orders.reduce((sum, order) => sum + parseFloat(order.creatorEarnings || "0"), 0);
    
    const thisMonth = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt!);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, order) => sum + parseFloat(order.creatorEarnings || "0"), 0);

    return { total, thisMonth };
  }

  async getCreatorStats(creatorId: number): Promise<{ totalOrders: number; totalProducts: number; totalMembers: number; }> {
    const totalOrders = Array.from(this.orders.values()).filter(order => 
      order.creatorId === creatorId && order.status === "completed"
    ).length;
    
    const totalProducts = Array.from(this.products.values()).filter(product => 
      product.creatorId === creatorId && product.isActive
    ).length;
    
    const totalMembers = Array.from(this.memberships.values()).filter(membership => 
      membership.creatorId === creatorId && membership.isActive
    ).length;

    return { totalOrders, totalProducts, totalMembers };
  }
}

export const storage = new MemStorage();
