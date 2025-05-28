import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: text("avatar"),
  banner: text("banner"),
  themeColor: text("theme_color").default("#E03A3E"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isProfileComplete: boolean("is_profile_complete").default(false),
  isActive: boolean("is_active").default(true),
  role: text("role").default("creator"), // creator, admin
  socialLinks: jsonb("social_links"), // {twitter: "", youtube: "", instagram: ""}
  enabledModules: jsonb("enabled_modules").default('{"donations": true, "products": false, "memberships": false, "community": false}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  coverImage: text("cover_image"),
  files: jsonb("files"), // [{filename: "", url: "", size: 0}]
  type: text("type").notNull(), // product, membership
  membershipDuration: integer("membership_duration"), // in days, null for products
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  productId: integer("product_id").references(() => products.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  creatorEarnings: decimal("creator_earnings", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // donation, product, membership
  status: text("status").default("pending"), // pending, completed, failed, refunded
  paymentId: text("payment_id"),
  paymentData: jsonb("payment_data"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const communityAccess = pgTable("community_access", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  telegramLink: text("telegram_link").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, processing, completed, rejected
  bankDetails: jsonb("bank_details"), // {accountNumber: "", ifsc: "", upi: ""}
  kycDocuments: jsonb("kyc_documents"), // {pan: "", aadhar: "", bankProof: ""}
  adminNotes: text("admin_notes"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at")
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true
});

export const insertCommunityAccessSchema = createInsertSchema(communityAccess).omit({
  id: true,
  createdAt: true
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  requestedAt: true,
  processedAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;

export type CommunityAccess = typeof communityAccess.$inferSelect;
export type InsertCommunityAccess = z.infer<typeof insertCommunityAccessSchema>;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
