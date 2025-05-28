// Cashfree Payment Configuration
const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID!,
  secretKey: process.env.CASHFREE_SECRET_KEY!,
  baseUrl: "https://api.cashfree.com", // Production URL
  version: "2023-08-01"
};

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  redirectUrl: string;
  notifyUrl: string;
  productName: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentSessionId?: string;
  paymentUrl?: string;
  orderId: string;
  error?: string;
}

export async function createPaymentSession(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const orderRequest = {
      order_id: request.orderId,
      order_amount: request.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: request.customerEmail,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        customer_phone: request.customerPhone || "9999999999",
      },
      order_meta: {
        return_url: request.redirectUrl,
        notify_url: request.notifyUrl,
      },
      order_note: `Payment for ${request.productName}`,
    };

    const response = await fetch(`${CASHFREE_CONFIG.baseUrl}/pg/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_CONFIG.appId,
        "x-client-secret": CASHFREE_CONFIG.secretKey,
        "x-api-version": CASHFREE_CONFIG.version,
      },
      body: JSON.stringify(orderRequest),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse Cashfree response:", parseError);
      return {
        success: false,
        orderId: request.orderId,
        error: "Invalid response from payment gateway",
      };
    }
    
    if (response.ok && (data.order_id || data.payment_session_id)) {
      return {
        success: true,
        paymentSessionId: data.payment_session_id,
        paymentUrl: data.payment_link || `${CASHFREE_CONFIG.baseUrl}/pg/view/order/${data.payment_session_id}`,
        orderId: request.orderId,
      };
    } else {
      console.error("Cashfree API error:", data);
      return {
        success: false,
        orderId: request.orderId,
        error: data.message || data.error_description || "Failed to create payment session",
      };
    }
  } catch (error: any) {
    console.error("Payment session creation failed:", error);
    return {
      success: false,
      orderId: request.orderId,
      error: error.message || "Payment processing error",
    };
  }
}

export async function verifyPayment(orderId: string): Promise<{
  success: boolean;
  paymentStatus: string;
  paymentId?: string;
  amount?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`${CASHFREE_CONFIG.baseUrl}/pg/orders/${orderId}/payments`, {
      method: "GET",
      headers: {
        "x-client-id": CASHFREE_CONFIG.appId,
        "x-client-secret": CASHFREE_CONFIG.secretKey,
        "x-api-version": CASHFREE_CONFIG.version,
      },
    });

    const data = await response.json();
    
    if (response.ok && data.length > 0) {
      const payment = data[0];
      return {
        success: true,
        paymentStatus: payment.payment_status,
        paymentId: payment.cf_payment_id,
        amount: payment.payment_amount,
      };
    } else {
      return {
        success: false,
        paymentStatus: "NOT_FOUND",
        error: "Payment not found",
      };
    }
  } catch (error: any) {
    console.error("Payment verification failed:", error);
    return {
      success: false,
      paymentStatus: "ERROR",
      error: error.message || "Payment verification error",
    };
  }
}

export async function getOrderStatus(orderId: string): Promise<{
  success: boolean;
  orderStatus: string;
  paymentStatus?: string;
  amount?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`${CASHFREE_CONFIG.baseUrl}/pg/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": CASHFREE_CONFIG.appId,
        "x-client-secret": CASHFREE_CONFIG.secretKey,
        "x-api-version": CASHFREE_CONFIG.version,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        orderStatus: data.order_status,
        paymentStatus: data.order_status,
        amount: data.order_amount,
      };
    } else {
      return {
        success: false,
        orderStatus: "NOT_FOUND",
        error: data.message || "Order not found",
      };
    }
  } catch (error: any) {
    console.error("Order status check failed:", error);
    return {
      success: false,
      orderStatus: "ERROR",
      error: error.message || "Order status check error",
    };
  }
}