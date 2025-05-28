import * as brevo from '@getbrevo/brevo';
import { Order, User, Product } from '../shared/schema';

// Initialize Brevo client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

export interface EmailTemplate {
  templateId: number;
  to: { email: string; name?: string }[];
  params?: Record<string, any>;
  subject?: string;
}

export class EmailService {
  private static instance: EmailService;
  private senderEmail: string = 'noreply@cashure.in';
  private senderName: string = 'Cashure';

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendTransactionalEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.to = template.to;
      sendSmtpEmail.templateId = template.templateId;
      sendSmtpEmail.params = template.params || {};
      sendSmtpEmail.sender = { email: this.senderEmail, name: this.senderName };
      
      if (template.subject) {
        sendSmtpEmail.subject = template.subject;
      }

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Email sent successfully to ${template.to[0].email}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Purchase confirmation email to customer
  async sendPurchaseConfirmation(order: Order, customer: { name: string; email: string }, creator: User, product?: Product): Promise<boolean> {
    const template: EmailTemplate = {
      templateId: 1, // You'll create this template in Brevo dashboard
      to: [{ email: customer.email, name: customer.name }],
      params: {
        customer_name: customer.name,
        creator_name: creator.displayName || creator.username,
        creator_username: creator.username,
        product_name: product?.title || 'Donation',
        amount: order.amount,
        order_id: order.id,
        purchase_date: new Date().toLocaleDateString('en-IN'),
        platform_name: 'Cashure'
      }
    };

    return await this.sendTransactionalEmail(template);
  }

  // Payment received notification to creator
  async sendPaymentNotification(order: Order, creator: User, product?: Product): Promise<boolean> {
    const template: EmailTemplate = {
      templateId: 2, // You'll create this template in Brevo dashboard
      to: [{ email: creator.email, name: creator.displayName || creator.username }],
      params: {
        creator_name: creator.displayName || creator.username,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        product_name: product?.title || 'Donation',
        amount: order.amount,
        creator_earnings: order.creatorEarnings,
        order_id: order.id,
        purchase_date: new Date().toLocaleDateString('en-IN'),
        platform_name: 'Cashure'
      }
    };

    return await this.sendTransactionalEmail(template);
  }

  // Welcome email for new creators
  async sendWelcomeEmail(user: User): Promise<boolean> {
    const template: EmailTemplate = {
      templateId: 3, // You'll create this template in Brevo dashboard
      to: [{ email: user.email, name: user.displayName || user.username }],
      params: {
        creator_name: user.displayName || user.username,
        creator_username: user.username,
        profile_url: `https://cashure.in/${user.username}`,
        dashboard_url: 'https://cashure.in/dashboard',
        platform_name: 'Cashure'
      }
    };

    return await this.sendTransactionalEmail(template);
  }

  // Order status update email
  async sendOrderStatusUpdate(order: Order, customer: { name: string; email: string }, status: string): Promise<boolean> {
    const template: EmailTemplate = {
      templateId: 4, // You'll create this template in Brevo dashboard
      to: [{ email: customer.email, name: customer.name }],
      params: {
        customer_name: customer.name,
        order_id: order.id,
        order_status: status,
        amount: order.amount,
        update_date: new Date().toLocaleDateString('en-IN'),
        platform_name: 'Cashure'
      }
    };

    return await this.sendTransactionalEmail(template);
  }

  // Product delivery email (for digital products)
  async sendProductDelivery(order: Order, customer: { name: string; email: string }, product: Product, downloadLink?: string): Promise<boolean> {
    const template: EmailTemplate = {
      templateId: 5, // You'll create this template in Brevo dashboard
      to: [{ email: customer.email, name: customer.name }],
      params: {
        customer_name: customer.name,
        product_name: product.title,
        order_id: order.id,
        download_link: downloadLink || '#',
        product_description: product.description,
        delivery_date: new Date().toLocaleDateString('en-IN'),
        platform_name: 'Cashure'
      }
    };

    return await this.sendTransactionalEmail(template);
  }

  // Monthly earnings report for creators
  async sendMonthlyReport(creator: User, earnings: { total: number; thisMonth: number; orders: number }): Promise<boolean> {
    const template: EmailTemplate = {
      templateId: 6, // You'll create this template in Brevo dashboard
      to: [{ email: creator.email, name: creator.displayName || creator.username }],
      params: {
        creator_name: creator.displayName || creator.username,
        monthly_earnings: earnings.thisMonth,
        total_earnings: earnings.total,
        orders_count: earnings.orders,
        report_month: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        dashboard_url: 'https://cashure.in/dashboard',
        platform_name: 'Cashure'
      }
    };

    return await this.sendTransactionalEmail(template);
  }

  // Test email function
  async sendTestEmail(email: string): Promise<boolean> {
    const template: EmailTemplate = {
      templateId: 7, // You'll create this template in Brevo dashboard
      to: [{ email, name: 'Test User' }],
      params: {
        test_message: 'This is a test email from Cashure email system.',
        sent_at: new Date().toISOString(),
        platform_name: 'Cashure'
      }
    };

    return await this.sendTransactionalEmail(template);
  }
}

export const emailService = EmailService.getInstance();