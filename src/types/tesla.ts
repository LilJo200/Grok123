export type VehicleModelId = 'models' | 'model3' | 'modelx' | 'modely' | 'cybertruck' | 'roadster';

export interface PaintOption {
  id: string;
  name: string;
  hex: string;
  secondaryHex?: string;
  price: number;
  description: string;
}

export interface WheelOption {
  id: string;
  name: string;
  size: string;
  price: number;
  rangeDeltaMiles: number;
}

export interface InteriorOption {
  id: string;
  name: string;
  hex: string;
  price: number;
  steeringOptions?: Array<'round' | 'yoke'>;
}

export interface VehicleTrim {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  acceleration0to60: number; // in seconds
  topSpeedMph: number;
  rangeMiles: number;
  peakHorsepower: number;
  drivetrain: string;
  standardFeatures: string[];
}

export interface VehicleModel {
  id: VehicleModelId;
  name: string;
  category: 'Sedan' | 'SUV' | 'Truck' | 'Supercar';
  headline: string;
  description: string;
  heroImage: string;
  trims: VehicleTrim[];
  paints: PaintOption[];
  wheels: WheelOption[];
  interiors: InteriorOption[];
  deliveryEstimateWeeks: string;
  federalTaxCreditEligible: boolean;
}

export type PaymentMethod = 'cash' | 'loan' | 'lease' | 'crypto';

export type CryptoCurrencyCode = 'BTC' | 'ETH' | 'DOGE' | 'SOL' | 'USDT';

export interface CryptoCurrency {
  code: CryptoCurrencyCode;
  name: string;
  symbol: string;
  usdPrice: number;
  network: string;
  recommendedFeeUsd: number;
  depositAddress: string;
  iconColor: string;
  precision: number;
}

export interface ConfigurationState {
  modelId: VehicleModelId;
  trimId: string;
  paintId: string;
  wheelId: string;
  interiorId: string;
  steeringType: 'round' | 'yoke';
  fullSelfDriving: boolean;
  enhancedAutopilot: boolean;
  towHitch: boolean;
  wallConnector: boolean;
  mobileConnector: boolean;
}

export interface LoanParams {
  downPaymentPercent: number; // e.g. 10 = 10%
  termMonths: number; // 36, 48, 60, 72, 84
  annualInterestRate: number; // e.g. 5.49
}

export interface LeaseParams {
  termMonths: number; // 24 or 36
  annualMileage: number; // 10000, 12000, 15000
  downPayment: number;
}

export interface CustomerOrder {
  orderNumber: string;
  vin: string;
  modelName: string;
  trimName: string;
  paintName: string;
  wheelName: string;
  interiorName: string;
  features: string[];
  totalPriceUsd: number;
  depositPaidUsd: number;
  paymentMethod: PaymentMethod;
  cryptoDetails?: {
    code: CryptoCurrencyCode;
    amount: number;
    txHash: string;
    rateUsd: number;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryLocation: string;
  deliveryType: 'home' | 'center';
  orderDate: string;
  estimatedDeliveryWindow: string;
}

export interface TestDriveBooking {
  bookingId: string;
  modelId: VehicleModelId;
  modelName: string;
  date: string;
  timeSlot: string;
  showroomLocation: string;
  fullName: string;
  email: string;
  phone: string;
  hasValidLicense: boolean;
}
