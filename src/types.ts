/**
 * PriceWise Types & Interfaces
 */

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  specifications: Record<string, string>;
  rating: number;
  currentPrice: number;
  originalMSRP: number;
  currency: string;
}

export interface PricePoint {
  date: string; // YYYY-MM-DD
  price: number;
}

export interface PriceHistory {
  lowest: number;
  highest: number;
  average: number;
  points: PricePoint[];
}

export type RecommendationStatus = 'WAIT' | 'BUY_NOW' | 'GOOD_DEAL' | 'EXPENSIVE';

export interface BuyWaitRecommendation {
  status: RecommendationStatus;
  statusLabel: string;
  relativeDiff: number; // e.g., 13 meaning 13% higher than normal, or -10 meaning 10% lower
  reason: string;
  bulletPoints: string[];
}

export interface PricePrediction {
  daysRange: string; // e.g. "7–14 days"
  expectedRange: string; // e.g. "₹39,999–₹40,999"
  confidence: number; // e.g. 78
  reasons: string[];
}

export interface FakeDiscountAnalysis {
  isPossibleFake: boolean;
  shownDiscount: string; // e.g. "₹59,999 → ₹39,999"
  analysis: string;
}

export interface ProductAlternative {
  name: string;
  similarity: number; // e.g. 92
  price: number;
  savings: number; // calculated savings
  imageUrl: string;
  betterFeature: string; // e.g. "Better Battery", "Cheaper option"
  comparison: Record<string, string>; // e.g. { Performance: 'Equal', Battery: '85% similarity' }
}

export interface PriceWiseResponse {
  product: Product;
  history: PriceHistory;
  recommendation: BuyWaitRecommendation;
  prediction: PricePrediction;
  fakeDiscount: FakeDiscountAnalysis;
  alternatives: ProductAlternative[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  productImg: string;
  targetPrice: number;
  currentPrice: number;
  isTriggered: boolean;
  currency: string;
  createdAt: string;
}

// Database representations & Architectural descriptions
export interface SystemArchitecture {
  module: string;
  description: string;
  technologies: string[];
}

export interface SchemaField {
  name: string;
  type: string;
  description: string;
  isPrimary?: boolean;
}

export interface DatabaseSchema {
  collectionName: string;
  description: string;
  fields: SchemaField[];
}
