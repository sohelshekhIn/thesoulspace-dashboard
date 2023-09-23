type PmtWebhookUpOrdrContactType = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
};

type PmtWebhookUpOrdrValueType = {
  offer?: {
    valid: boolean;
    offerCode: string;
    offerName: string;
    offerType: string;
    maxDiscount: number;
    discountAmount: number | null;
    discountPercentage: number;
  };
  grandTotal?: string;
  totalPrice?: number;
  totalQuantity?: number;
};

export { PmtWebhookUpOrdrContactType, PmtWebhookUpOrdrValueType };
