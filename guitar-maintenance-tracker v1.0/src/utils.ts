import { Guitar, MaintenanceEvent, ThresholdSetting, MaintenanceStatus } from './types';

export function getDuration(startDateStr: string, endDateStr?: string) {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }
  
  // Normalize both dates to midnight to avoid hours differences
  const startNormalized = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endNormalized = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  const totalMs = endNormalized.getTime() - startNormalized.getTime();
  const totalDays = Math.max(0, Math.floor(totalMs / (1000 * 60 * 60 * 24)));
  
  let years = endNormalized.getFullYear() - startNormalized.getFullYear();
  let months = endNormalized.getMonth() - startNormalized.getMonth();
  let days = endNormalized.getDate() - startNormalized.getDate();
  
  if (days < 0) {
    months -= 1;
    // Get days in the previous month of endNormalized
    const prevMonth = new Date(endNormalized.getFullYear(), endNormalized.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays
  };
}

export function formatCompactDuration(startDateStr: string, endDateStr?: string): string {
  const { years, months, days, totalDays } = getDuration(startDateStr, endDateStr);
  if (totalDays === 0) return '0d';
  
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (days > 0 || parts.length === 0) parts.push(`${days}d`);
  
  return parts.join(' ');
}

export function formatLongDuration(startDateStr: string, endDateStr?: string): string {
  const { years, months, days, totalDays } = getDuration(startDateStr, endDateStr);
  if (totalDays === 0) return '0 days';
  
  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} year${years > 1 ? 's' : ''}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? 's' : ''}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

export function formatDate(dateStr: string, format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  } else {
    return `${year}-${month}-${day}`;
  }
}

// Full month name formatting for details screen (e.g. "22 Sep 2025")
export function formatDateHuman(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbolMap: Record<string, string> = {
    USD: '$',
    NZD: '$',
    AUD: '$',
    CAD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    KRW: '₩'
  };
  
  const symbol = symbolMap[currency] || '$';
  return `${symbol}${amount.toLocaleString()}`;
}

export function calculateStatus(daysElapsed: number, yellowDays: number, redDays: number): MaintenanceStatus {
  if (daysElapsed >= redDays) return 'red';
  if (daysElapsed >= yellowDays) return 'yellow';
  return 'green';
}



// For threshold, find if there is a guitar-specific override, otherwise use the global threshold, otherwise use the standard default
export function getThreshold(
  maintenanceType: string,
  thresholds: ThresholdSetting[],
  guitarId: string
): { yellowDays: number; redDays: number } {
  // First, look for guitar-specific override
  const override = thresholds.find(t => t.maintenanceType === maintenanceType && t.optionalGuitarId === guitarId);
  if (override) {
    return { yellowDays: override.yellowDays, redDays: override.redDays };
  }
  // Second, look for global setting
  const globalSetting = thresholds.find(t => t.maintenanceType === maintenanceType && t.appliesGlobally);
  if (globalSetting) {
    return { yellowDays: globalSetting.yellowDays, redDays: globalSetting.redDays };
  }
  // Standard defaults if none exists
  if (maintenanceType === 'String Change') {
    return { yellowDays: 180, redDays: 365 };
  }
  if (maintenanceType === 'Setup / Service') {
    return { yellowDays: 365, redDays: 730 };
  }
  // Default for other types
  return { yellowDays: 180, redDays: 365 };
}

export interface GuitarMaintenanceDetails {
  lastStringChangeDate: string | null;
  stringDaysElapsed: number | null;
  stringStatus: MaintenanceStatus;
  
  lastSetupDate: string | null;
  setupDaysElapsed: number | null;
  setupStatus: MaintenanceStatus;
  
  overallStatus: MaintenanceStatus;
}

export function getGuitarMaintenanceDetails(
  guitar: Guitar,
  events: MaintenanceEvent[],
  thresholds: ThresholdSetting[]
): GuitarMaintenanceDetails {
  const guitarEvents = events.filter(e => e.guitarId === guitar.id);
  
  // Latest String Change event
  const stringEvents = guitarEvents
    .filter(e => e.maintenanceType === 'String Change')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastStringEvent = stringEvents[0] || null;
  
  // Latest Setup / Service event
  const setupEvents = guitarEvents
    .filter(e => e.maintenanceType === 'Setup / Service')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastSetupEvent = setupEvents[0] || null;
  
  // Calculate String details
  let stringDaysElapsed: number | null = null;
  let stringStatus: MaintenanceStatus = 'green';
  if (lastStringEvent) {
    const { totalDays } = getDuration(lastStringEvent.date);
    stringDaysElapsed = totalDays;
    const threshold = getThreshold('String Change', thresholds, guitar.id);
    stringStatus = calculateStatus(totalDays, threshold.yellowDays, threshold.redDays);
  } else {
    stringStatus = 'red'; // Needs strings tracked
  }
  
  // Calculate Setup details
  let setupDaysElapsed: number | null = null;
  let setupStatus: MaintenanceStatus = 'green';
  if (lastSetupEvent) {
    const { totalDays } = getDuration(lastSetupEvent.date);
    setupDaysElapsed = totalDays;
    const threshold = getThreshold('Setup / Service', thresholds, guitar.id);
    setupStatus = calculateStatus(totalDays, threshold.yellowDays, threshold.redDays);
  } else {
    setupStatus = 'red'; // Needs setup tracked
  }
  
  // Overall status is the worst of strings and setup
  let overallStatus: MaintenanceStatus = 'green';
  if (stringStatus === 'red' || setupStatus === 'red') {
    overallStatus = 'red';
  } else if (stringStatus === 'yellow' || setupStatus === 'yellow') {
    overallStatus = 'yellow';
  }
  
  return {
    lastStringChangeDate: lastStringEvent ? lastStringEvent.date : null,
    stringDaysElapsed,
    stringStatus,
    
    lastSetupDate: lastSetupEvent ? lastSetupEvent.date : null,
    setupDaysElapsed,
    setupStatus,
    
    overallStatus
  };
}

