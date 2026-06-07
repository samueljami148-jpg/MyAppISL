export type MerchantType = "restaurant" | "cafe" | "coiffeur" | "barber" | "gym" | "other";
export type UserRole = "super_admin" | "merchant";
export type CardStatus = "active" | "reward_available" | "redeemed" | "disabled";
export type TransactionAction = "add_points" | "redeem_reward" | "custom_adjustment";

export type Merchant = {
  id: string;
  name: string;
  type: MerchantType;
  logo_url: string | null;
  primary_color: string;
  reward_required_points: number;
  reward_name: string;
  description: string;
  reward_redemption_mode: "reset" | "deduct";
  public_slug: string;
  created_at: string;
};

export type AppUser = {
  id: string;
  merchant_id: string | null;
  role: UserRole;
  email: string;
  created_at: string;
};

export type Customer = {
  id: string;
  merchant_id: string;
  first_name: string;
  phone: string;
  email: string | null;
  created_at: string;
};

export type LoyaltyCard = {
  id: string;
  merchant_id: string;
  customer_id: string;
  current_points: number;
  status: CardStatus;
  wallet_serial_number: string;
  apple_pass_registered: boolean;
  google_object_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LoyaltyCardWithCustomer = LoyaltyCard & {
  customers: Customer;
  merchants: Merchant;
};

export type Transaction = {
  id: string;
  merchant_id: string;
  card_id: string;
  action: TransactionAction;
  points: number;
  created_at: string;
};

export type Notification = {
  id: string;
  merchant_id: string;
  title: string;
  message: string;
  created_at: string;
};
