// Polymarket Market types
export interface PolymarketMarket {
  id: string;
  slug?: string; // URL slug for Polymarket link
  question: string;
  description?: string;
  endDate: string;
  category: string;
  volume: number;
  liquidity: number;
  image?: string;
  outcomes: string[];
  outcomePrices: number[];
}

// Index types
export interface Index {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdByUsername?: string;
  isPublic: boolean;
  category?: string;
  markets: string[]; // Array of market IDs
  filters?: IndexFilters;
  createdAt: string;
  updatedAt?: string;
  marketCount?: number; // Optional count for display
  totalVolume?: number; // Optional total volume for display
  starCount?: number; // Number of stars
  isStarred?: boolean; // Whether current user has starred this index
}

export interface IndexFilters {
  categories?: string[];
  minVolume?: number;
  maxVolume?: number;
  minLiquidity?: number;
  maxEndDate?: string;
  minEndDate?: string;
  keywords?: string[];
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  isPaid: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  createdAt: string;
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt'>;
        Update: Partial<Omit<User, 'id' | 'createdAt'>>;
      };
      indexes: {
        Row: Index;
        Insert: Omit<Index, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Index, 'id' | 'createdAt' | 'updatedAt'>>;
      };
    };
  };
}
