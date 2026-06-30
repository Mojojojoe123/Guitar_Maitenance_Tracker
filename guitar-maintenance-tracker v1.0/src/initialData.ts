import { Guitar, MaintenanceEvent, ThresholdSetting } from './types';

export const DEFAULT_MAINTENANCE_TYPES = [
  'String Change',
  'Setup / Service',
  'Clean',
  'Fret Work',
  'Electronics Clean / Repair',
  'Nut Work',
  'Intonation',
  'Action Adjustment',
  'Truss Rod / Relief Adjustment',
  'Pickup Height Adjustment',
  'Other'
];

export const DEFAULT_THRESHOLDS: ThresholdSetting[] = [
  {
    maintenanceType: 'String Change',
    yellowDays: 180,
    redDays: 365,
    appliesGlobally: true
  },
  {
    maintenanceType: 'Setup / Service',
    yellowDays: 365,
    redDays: 730,
    appliesGlobally: true
  }
];

export const INITIAL_GUITARS: Guitar[] = [];

export const INITIAL_EVENTS: MaintenanceEvent[] = [];
