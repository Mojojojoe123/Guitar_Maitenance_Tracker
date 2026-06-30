export type GuitarType = 'electric' | 'acoustic' | 'bass' | 'other';
export type GuitarStatus = 'active' | 'in storage' | 'sold' | 'archived';
export type UsageLevel = 'light' | 'regular' | 'heavy/gigging';

export interface Guitar {
  id: string;
  name: string;
  brand: string;
  model: string;
  guitarType: GuitarType;
  numberOfStrings: number;
  tuning: string;
  scaleLength?: string;
  purchaseYear?: number;
  estimatedValue?: number;
  image?: string; // base64 or high-res Unsplash URL
  notes?: string;
  status: GuitarStatus;
  usageLevel: UsageLevel;
}

export interface MaintenanceEvent {
  id: string;
  guitarId: string;
  date: string; // YYYY-MM-DD format
  maintenanceType: string;
  details: string; // details or checklist items joined
  notes?: string;
  cost?: number;
  performedBy?: string;
  stringBrand?: string; // string change only
  stringType?: string; // string change only
  stringGauge?: string; // string change only
  photos?: string[]; // array of base64 photos
}

export interface ThresholdSetting {
  maintenanceType: string;
  yellowDays: number;
  redDays: number;
  appliesGlobally: boolean;
  optionalGuitarId?: string; // for guitar-specific overrides
}

export interface AppSettings {
  currency: string; // e.g. 'NZD', 'USD', 'EUR', 'GBP'
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  notificationsEnabled: boolean;
  language?: 'en' | 'ko';
}

export type MaintenanceStatus = 'green' | 'yellow' | 'red';
