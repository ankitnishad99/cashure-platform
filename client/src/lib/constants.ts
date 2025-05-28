export const PLATFORM_FEE_PERCENTAGE = 10;

export const FILE_UPLOAD_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'application/vnd.adobe.photoshop',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  allowedExtensions: [
    '.pdf', '.docx', '.pptx', '.zip', '.rar', '.mp4', '.mov', 
    '.mp3', '.wav', '.png', '.jpg', '.jpeg', '.psd', '.svg', 
    '.ai', '.xlsx', '.csv'
  ]
};

export const DONATION_LIMITS = {
  min: 10,
  max: 100000
};

export const MEMBERSHIP_DURATION_OPTIONS = [
  { value: 30, label: "1 Month" },
  { value: 90, label: "3 Months" },
  { value: 180, label: "6 Months" },
  { value: 365, label: "1 Year" }
];

export const ORDER_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded"
} as const;

export const PAYOUT_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  REJECTED: "rejected"
} as const;

export const PRODUCT_TYPES = {
  PRODUCT: "product",
  MEMBERSHIP: "membership"
} as const;

export const ORDER_TYPES = {
  DONATION: "donation",
  PRODUCT: "product",
  MEMBERSHIP: "membership"
} as const;

export const THEME_COLORS = [
  "#E03A3E", // Primary Red
  "#FFD700", // Accent Gold
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#06B6D4", // Cyan
];

export const SOCIAL_PLATFORMS = [
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@username" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "twitter", label: "Twitter", placeholder: "https://twitter.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
  { key: "website", label: "Website", placeholder: "https://yourwebsite.com" }
];

export const CURRENCY = {
  symbol: "₹",
  code: "INR",
  name: "Indian Rupee"
};

export const COMPANY_INFO = {
  name: "Cashure",
  tagline: "Premium monetization platform for Indian creators",
  email: "support@cashure.in",
  website: "https://cashure.in"
};
