import React, { useState, useEffect, useMemo } from 'react';
import { Home, Settings, Plus, Search, CheckCircle, Guitar as GuitarIcon, Sparkles } from 'lucide-react';
import { Guitar, MaintenanceEvent, ThresholdSetting, AppSettings } from './types';
import { INITIAL_GUITARS, INITIAL_EVENTS, DEFAULT_MAINTENANCE_TYPES, DEFAULT_THRESHOLDS } from './initialData';
import { getGuitarMaintenanceDetails, getThreshold } from './utils';
import { translations } from './translations';
import { getVal, setVal } from './db';

// Subcomponents
import SummaryCards from './components/SummaryCards';
import GuitarCard from './components/GuitarCard';
import DetailsView from './components/DetailsView';
import AddEditGuitarView from './components/AddEditGuitarView';
import LogMaintenanceView from './components/LogMaintenanceView';
import SettingsView from './components/SettingsView';
import ConfirmModal from './components/ConfirmModal';

type TabType = 'guitars' | 'settings';

interface ViewState {
  type: 'tab' | 'details' | 'add_edit' | 'log_maintenance';
  tab?: TabType;
  guitarId?: string;
  initialType?: string; // for preselected log types
  editEventId?: string; // for editing a maintenance record
}

export default function App() {
  // --- DATABASE STATE ---
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdSetting[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<string[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    notificationsEnabled: true,
    language: 'en'
  });
  const [dbLoading, setDbLoading] = useState(true);

  // --- STARTUP LOGIC LOADING FROM INDEXEDDB ---
  useEffect(() => {
    async function loadPersistentData() {
      try {
        let storedGuitars = await getVal<Guitar[]>('guitars');
        let storedEvents = await getVal<MaintenanceEvent[]>('events');
        let storedThresholds = await getVal<ThresholdSetting[]>('thresholds');
        let storedMaintTypes = await getVal<string[]>('maintenance_types');
        let storedSettings = await getVal<AppSettings>('app_settings');

        // Migrate/fallback to localStorage if IndexedDB has no data or is invalid for guitars
        if (!storedGuitars || !Array.isArray(storedGuitars)) {
          let fallbackGuitars = INITIAL_GUITARS;
          try {
            const localGuitars = localStorage.getItem('guitars_db');
            if (localGuitars) {
              const parsed = JSON.parse(localGuitars);
              if (Array.isArray(parsed)) fallbackGuitars = parsed;
            }
          } catch (e) {
            console.error('Failed to parse guitars from localStorage', e);
          }
          storedGuitars = fallbackGuitars;
          await setVal('guitars', storedGuitars);
        }

        // Migrate/fallback for events
        if (!storedEvents || !Array.isArray(storedEvents)) {
          let fallbackEvents = INITIAL_EVENTS;
          try {
            const localEvents = localStorage.getItem('events_db');
            if (localEvents) {
              const parsed = JSON.parse(localEvents);
              if (Array.isArray(parsed)) fallbackEvents = parsed;
            }
          } catch (e) {
            console.error('Failed to parse events from localStorage', e);
          }
          storedEvents = fallbackEvents;
          await setVal('events', storedEvents);
        }

        // Migrate/fallback for thresholds
        if (!storedThresholds || !Array.isArray(storedThresholds)) {
          let fallbackThresholds = DEFAULT_THRESHOLDS;
          try {
            const localThresholds = localStorage.getItem('thresholds_db');
            if (localThresholds) {
              const parsed = JSON.parse(localThresholds);
              if (Array.isArray(parsed)) fallbackThresholds = parsed;
            }
          } catch (e) {
            console.error('Failed to parse thresholds from localStorage', e);
          }
          storedThresholds = fallbackThresholds;
          await setVal('thresholds', storedThresholds);
        }

        // Migrate/fallback for maintenance types
        if (!storedMaintTypes || !Array.isArray(storedMaintTypes)) {
          let fallbackTypes = DEFAULT_MAINTENANCE_TYPES;
          try {
            const localMaintTypes = localStorage.getItem('maintenance_types_db');
            if (localMaintTypes) {
              const parsed = JSON.parse(localMaintTypes);
              if (Array.isArray(parsed)) fallbackTypes = parsed;
            }
          } catch (e) {
            console.error('Failed to parse maintenance types from localStorage', e);
          }
          storedMaintTypes = fallbackTypes;
          await setVal('maintenance_types', storedMaintTypes);
        }

        // Migrate/fallback for settings
        if (!storedSettings || typeof storedSettings !== 'object') {
          let fallbackSettings: AppSettings = {
            currency: 'USD',
            dateFormat: 'DD/MM/YYYY',
            notificationsEnabled: true,
            language: 'en'
          };
          try {
            const localSettings = localStorage.getItem('app_settings_db');
            if (localSettings) {
              const parsed = JSON.parse(localSettings);
              if (parsed && typeof parsed === 'object') {
                fallbackSettings = {
                  currency: parsed.currency || 'USD',
                  dateFormat: parsed.dateFormat || 'DD/MM/YYYY',
                  notificationsEnabled: parsed.notificationsEnabled !== false,
                  language: parsed.language || 'en'
                };
              }
            }
          } catch (e) {
            console.error('Failed to parse app settings from localStorage', e);
          }
          storedSettings = fallbackSettings;
          await setVal('app_settings', storedSettings);
        }

        // Clean mock data if they exist to keep data clean
        const filteredGuitars = (storedGuitars || []).filter(g => g && g.id && !['g1', 'g2', 'g3', 'g4', 'g5', 'g6'].includes(g.id));
        const filteredEvents = (storedEvents || []).filter(e => e && e.guitarId && !['g1', 'g2', 'g3', 'g4', 'g5', 'g6'].includes(e.guitarId));

        setGuitars(filteredGuitars);
        setEvents(filteredEvents);
        setThresholds(storedThresholds || DEFAULT_THRESHOLDS);
        setMaintenanceTypes(storedMaintTypes || DEFAULT_MAINTENANCE_TYPES);
        setAppSettings(storedSettings || {
          currency: 'USD',
          dateFormat: 'DD/MM/YYYY',
          notificationsEnabled: true,
          language: 'en'
        });
      } catch (err) {
        console.error('Failed to load IndexedDB data on startup', err);
      } finally {
        setDbLoading(false);
      }
    }
    loadPersistentData();
  }, []);

  // --- TRANSLATIONS ---
  const t = translations[appSettings.language || 'en'];

  // --- NAVIGATION STATE ---
  const [viewState, setViewState] = useState<ViewState>({ type: 'tab', tab: 'guitars' });

  // --- SCROLL PRESERVATION ---
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const listScrollYRef = React.useRef<number>(0);
  const detailsScrollRef = React.useRef<HTMLDivElement>(null);
  const detailsScrollYMapRef = React.useRef<Record<string, number>>({});

  const recordScrollPosition = () => {
    if (viewState.type === 'tab' && viewState.tab === 'guitars' && scrollContainerRef.current) {
      listScrollYRef.current = scrollContainerRef.current.scrollTop;
    }
    if (viewState.type === 'details' && viewState.guitarId && detailsScrollRef.current) {
      detailsScrollYMapRef.current[viewState.guitarId] = detailsScrollRef.current.scrollTop;
    }
  };

  // --- DYNAMIC SORTING UI STATE ---
  const [sortBy, setSortBy] = useState<'overdue' | 'string_age' | 'setup_age' | 'name'>('overdue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // --- POPSTATE HISTORY SYNCHRONIZATION ---
  const isPoppingRef = React.useRef(false);

  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        isPoppingRef.current = true;
        setViewState(event.state as ViewState);
      } else {
        isPoppingRef.current = true;
        setViewState({ type: 'tab', tab: 'guitars' });
      }
    };
    window.addEventListener('popstate', handlePopState);

    if (!window.history.state) {
      window.history.replaceState({ type: 'tab', tab: 'guitars' }, '', '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (nextState: ViewState) => {
    recordScrollPosition();
    window.history.pushState(nextState, '', '');
    setViewState(nextState);
  };

  const navigateReplace = (nextState: ViewState) => {
    recordScrollPosition();
    window.history.replaceState(nextState, '', '');
    setViewState(nextState);
  };

  const navigateBack = (fallbackState: ViewState) => {
    recordScrollPosition();
    if (window.history.state && window.history.state.type !== 'tab') {
      window.history.back();
    } else {
      window.history.replaceState(fallbackState, '', '');
      setViewState(fallbackState);
    }
  };

  // Restore scroll position when returning to the guitars tab list
  React.useLayoutEffect(() => {
    if (viewState.type === 'tab' && viewState.tab === 'guitars' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = listScrollYRef.current;
    }
    // Also clear details scroll positions when returning to the list/tabs so next enter starts at top
    if (viewState.type === 'tab') {
      detailsScrollYMapRef.current = {};
    }
  }, [viewState]);

  // Restore scroll position when returning to the instrument details view
  React.useLayoutEffect(() => {
    if (viewState.type === 'details' && viewState.guitarId && detailsScrollRef.current) {
      const savedScrollY = detailsScrollYMapRef.current[viewState.guitarId] || 0;
      detailsScrollRef.current.scrollTop = savedScrollY;
    }
  }, [viewState]);

  // --- LOCAL TRANSITIONS / UI STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Sync state helpers
  const saveGuitars = (updated: Guitar[]) => {
    setGuitars(updated);
    try {
      localStorage.setItem('guitars_db', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota exceeded, defaulting to IndexedDB', e);
    }
    setVal('guitars', updated);
  };

  const saveEvents = (updated: MaintenanceEvent[]) => {
    setEvents(updated);
    try {
      localStorage.setItem('events_db', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota exceeded, defaulting to IndexedDB', e);
    }
    setVal('events', updated);
  };

  const saveThresholds = (updated: ThresholdSetting[]) => {
    setThresholds(updated);
    try {
      localStorage.setItem('thresholds_db', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota exceeded, defaulting to IndexedDB', e);
    }
    setVal('thresholds', updated);
  };

  const saveMaintenanceTypes = (updated: string[]) => {
    setMaintenanceTypes(updated);
    try {
      localStorage.setItem('maintenance_types_db', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota exceeded, defaulting to IndexedDB', e);
    }
    setVal('maintenance_types', updated);
  };

  const saveAppSettings = (updated: AppSettings) => {
    setAppSettings(updated);
    try {
      localStorage.setItem('app_settings_db', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota exceeded, defaulting to IndexedDB', e);
    }
    setVal('app_settings', updated);
  };

  // Toast helper
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- CALCULATION LOGIC FOR METRICS & COUNTS ---
  // Overdue, Due Soon, All Good counts for active (non-archived/sold) guitars
  const summaryCounts = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    let allGood = 0;

    guitars.forEach(guitar => {
      // Exclude archived, sold, or in-storage guitars from active counts!
      if (guitar.status !== 'active') return;

      const details = getGuitarMaintenanceDetails(guitar, events, thresholds);
      if (details.overallStatus === 'red') overdue++;
      else if (details.overallStatus === 'yellow') dueSoon++;
      else allGood++;
    });

    return { overdue, dueSoon, allGood };
  }, [guitars, events, thresholds]);

  // --- CORE DESTRUCTIVE ACTION CONFIRMATION ---
  const triggerConfirmation = (title: string, message: string, onConfirm: () => void, confirmText = 'Delete') => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(null);
      }
    });
  };

  // --- HANDLERS ---
  
  // 1-Tap Quick Log Strings
  const handleQuickLogStrings = (guitarId: string) => {
    const guitar = guitars.find(g => g.id === guitarId);
    if (!guitar) return;

    // Find previous string change specifications for this guitar to duplicate
    const prevStringEvent = events
      .filter(e => e.guitarId === guitarId && e.maintenanceType === 'String Change')
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const stringBrand = prevStringEvent?.stringBrand || 'D\'Addario';
    const stringType = prevStringEvent?.stringType || 'Coated XL Nickel';
    const stringGauge = prevStringEvent?.stringGauge || '10-46';

    const newEvent: MaintenanceEvent = {
      id: `quick_string_${Date.now()}`,
      guitarId,
      date: new Date().toISOString().split('T')[0], // today
      maintenanceType: 'String Change',
      details: `⚡ Quick Strings Change: ${stringBrand} ${stringType} (${stringGauge})`,
      notes: 'Logged with 1-Tap Quick Action.',
      performedBy: 'Self',
      cost: 15,
      stringBrand,
      stringType,
      stringGauge
    };

    saveEvents([...events, newEvent]);
    showToast(`⚡ Strings changed for ${guitar.brand} ${guitar.name}!`);
  };

  // 1-Tap Quick Log Setup / Service
  const handleQuickLogSetup = (guitarId: string) => {
    const guitar = guitars.find(g => g.id === guitarId);
    if (!guitar) return;

    // Find previous setup scope
    const prevSetupEvent = events
      .filter(e => e.guitarId === guitarId && e.maintenanceType === 'Setup / Service')
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const details = prevSetupEvent?.details || 'Relief adjusted, Action lowered, Intonation set, Board oiled';

    const newEvent: MaintenanceEvent = {
      id: `quick_setup_${Date.now()}`,
      guitarId,
      date: new Date().toISOString().split('T')[0], // today
      maintenanceType: 'Setup / Service',
      details: `⚡ Quick Service completed: ${details}`,
      notes: 'Logged with 1-tap quick complete action.',
      performedBy: 'Self',
      cost: 0
    };

    saveEvents([...events, newEvent]);
    showToast(`🛠️ Service completed on ${guitar.brand} ${guitar.name}!`);
  };

  // Save or Update Guitar specifications
  const handleSaveGuitar = (
    guitarPayload: Omit<Guitar, 'id'> & { id?: string },
    stringChange?: { date: string; brand: string; type: string; gauge: string },
    setupService?: { date: string; details: string }
  ) => {
    let finalGuitars = [...guitars];
    let guitarId = guitarPayload.id;

    if (guitarId) {
      // Editing
      finalGuitars = guitars.map(g => g.id === guitarId ? { ...g, ...guitarPayload } as Guitar : g);
      saveGuitars(finalGuitars);
      showToast(`Guitar "${guitarPayload.name}" specifications updated!`);
    } else {
      // Adding new guitar
      guitarId = `guitar_${Date.now()}`;
      const newGuitar: Guitar = {
        ...guitarPayload,
        id: guitarId
      } as Guitar;
      finalGuitars.push(newGuitar);
      saveGuitars(finalGuitars);
      showToast(`"${guitarPayload.name}" added to collection!`);
    }

    // Now log the dynamic pre-filled events if supplied!
    let updatedEvents = [...events];
    let eventsModified = false;

    if (stringChange && stringChange.date) {
      // Check if we already have an event on this date for string change to avoid duplicating on re-save
      const exists = events.some(e => e.guitarId === guitarId && e.date === stringChange.date && e.maintenanceType === 'String Change');
      if (!exists) {
        const isKo = appSettings.language === 'ko';
        let stringDetails = '';
        if (
          (!stringChange.brand || stringChange.brand === 'Unspecified' || stringChange.brand === 'Details Unspecified' || stringChange.brand === '상세 미지정' || stringChange.brand === '미지정') &&
          (!stringChange.type || stringChange.type === 'Unspecified' || stringChange.type === '미지정') &&
          (!stringChange.gauge || stringChange.gauge === 'Unspecified' || stringChange.gauge === '미지정')
        ) {
          stringDetails = isKo ? '스트링 교체: 상세 미지정' : 'Changed strings: Details Unspecified';
        } else {
          const brandStr = stringChange.brand || (isKo ? '미지정' : 'Unspecified');
          const typeStr = stringChange.type ? ` ${stringChange.type}` : '';
          const gaugeStr = stringChange.gauge ? ` (${stringChange.gauge})` : ` (${isKo ? '미지정 게이지' : 'Unspecified Gauge'})`;
          stringDetails = isKo
            ? `스트링 교체완료: ${brandStr}${typeStr}${gaugeStr}`
            : `Changed strings: ${brandStr}${typeStr}${gaugeStr}`;
        }

        updatedEvents.push({
          id: `string_event_${Date.now()}`,
          guitarId,
          date: stringChange.date,
          maintenanceType: 'String Change',
          details: stringDetails,
          stringBrand: stringChange.brand,
          stringType: stringChange.type,
          stringGauge: stringChange.gauge,
          notes: '',
          performedBy: 'Self'
        });
        eventsModified = true;
      }
    }

    if (setupService && setupService.date) {
      const exists = events.some(e => e.guitarId === guitarId && e.date === setupService.date && e.maintenanceType === 'Setup / Service');
      if (!exists) {
        updatedEvents.push({
          id: `setup_event_${Date.now()}`,
          guitarId,
          date: setupService.date,
          maintenanceType: 'Setup / Service',
          details: setupService.details || (appSettings.language === 'ko' ? '셋업 / 정비: 상세 미지정' : 'Setup / Maintenance: Details Unspecified'),
          notes: '',
          performedBy: 'Self'
        });
        eventsModified = true;
      }
    }

    if (eventsModified) {
      saveEvents(updatedEvents);
    }

    // Redirect to details view if editing, or main list if adding new
    if (guitarPayload.id) {
      navigateBack({ type: 'details', guitarId: guitarPayload.id });
    } else {
      navigateBack({ type: 'tab', tab: 'guitars' });
    }
  };

  // Delete Guitar (Destructive!)
  const handleDeleteGuitar = (id: string) => {
    const guitar = guitars.find(g => g.id === id);
    if (!guitar) return;

    triggerConfirmation(
      'Delete Guitar',
      `Are you absolutely sure you want to delete the "${guitar.brand} ${guitar.name}"? This action is irreversible and will also purge all ${events.filter(e => e.guitarId === id).length} maintenance history logs!`,
      () => {
        // Filter out guitar and all of its related events
        saveGuitars(guitars.filter(g => g.id !== id));
        saveEvents(events.filter(e => e.guitarId !== id));
        showToast(`Guitar and all logs deleted.`);
        navigateReplace({ type: 'tab', tab: 'guitars' });
      },
      'Delete Instrument'
    );
  };

  // Toggle Archive status
  const handleArchiveToggle = (id: string) => {
    const guitar = guitars.find(g => g.id === id);
    if (!guitar) return;

    const currentArchived = guitar.status === 'archived';
    
    triggerConfirmation(
      currentArchived ? 'Unarchive Guitar' : 'Archive Guitar',
      currentArchived 
        ? `Unarchiving will bring "${guitar.name}" back into active view and start tracking health calculations.`
        : `Archiving "${guitar.name}" will keep its logs safe but exclude its warnings and due soon alarms from reminders.`,
      () => {
        saveGuitars(
          guitars.map(g => g.id === id ? { ...g, status: currentArchived ? 'active' : 'archived' } : g)
        );
        showToast(currentArchived ? 'Guitar activated!' : 'Guitar archived.');
      },
      currentArchived ? 'Unarchive' : 'Archive'
    );
  };

  // Log Maintenance custom action
  const handleLogMaintenanceEvent = (eventPayload: Omit<MaintenanceEvent, 'id'> & { id?: string }) => {
    if (eventPayload.id) {
      // Editing
      const updated = events.map(e => e.id === eventPayload.id ? { ...e, ...eventPayload } as MaintenanceEvent : e);
      saveEvents(updated);
      showToast(appSettings.language === 'ko' ? '정비 기록이 수정되었습니다!' : 'Maintenance log updated successfully!');
    } else {
      // Logging new
      const newEvent: MaintenanceEvent = {
        ...eventPayload,
        id: `maint_event_${Date.now()}`
      } as MaintenanceEvent;

      saveEvents([...events, newEvent]);
      showToast(`Service category "${eventPayload.maintenanceType}" logged successfully!`);
    }
    navigateBack({ type: 'details', guitarId: eventPayload.guitarId });
  };

  // Delete specific history log
  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    triggerConfirmation(
      'Delete Maintenance Record',
      `Delete the "${event.maintenanceType}" log from ${event.date}? This is irreversible.`,
      () => {
        saveEvents(events.filter(e => e.id !== eventId));
        showToast('Log entry removed.');
      }
    );
  };

  // Restore DB from file
  const handleRestoreBackup = (data: {
    guitars: Guitar[];
    events: MaintenanceEvent[];
    thresholds: ThresholdSetting[];
    maintenanceTypes: string[];
    settings: AppSettings;
  }) => {
    saveGuitars(data.guitars);
    saveEvents(data.events);
    saveThresholds(data.thresholds);
    saveMaintenanceTypes(data.maintenanceTypes);
    saveAppSettings(data.settings);
    showToast('Collection backup loaded successfully!');
  };

  // Reset entire DB to initial preloads
  const handleResetDatabase = () => {
    saveGuitars(INITIAL_GUITARS);
    saveEvents(INITIAL_EVENTS);
    saveThresholds(DEFAULT_THRESHOLDS);
    saveMaintenanceTypes(DEFAULT_MAINTENANCE_TYPES);
    saveAppSettings({
      currency: 'USD',
      dateFormat: 'DD/MM/YYYY',
      notificationsEnabled: true,
      language: appSettings.language || 'en'
    });
    navigateReplace({ type: 'tab', tab: 'guitars' });
    showToast('Demo collection database re-seeded!');
  };

  // --- HOME TAB SEARCH & FILTER LOGIC ---
  const homeFilteredGuitars = useMemo(() => {
    return guitars
      .filter(g => {
        // 1. Text search
        const s = searchTerm.toLowerCase();
        const matchesText = 
          g.name.toLowerCase().includes(s) ||
          g.brand.toLowerCase().includes(s) ||
          g.model.toLowerCase().includes(s) ||
          g.tuning.toLowerCase().includes(s);

        if (!matchesText) return false;

        // 2. Filter out active/archived based on showArchived toggle
        if (showArchived) {
          if (g.status !== 'archived') return false;
        } else {
          if (g.status !== 'active') return false;
        }

        // 3. Summary card metric filters
        if (summaryFilter !== 'all') {
          const details = getGuitarMaintenanceDetails(g, events, thresholds);
          if (summaryFilter === 'red') return details.overallStatus === 'red';
          if (summaryFilter === 'yellow') return details.overallStatus === 'yellow';
          if (summaryFilter === 'green') return details.overallStatus === 'green';
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'string_age') {
          const detailsA = getGuitarMaintenanceDetails(a, events, thresholds);
          const detailsB = getGuitarMaintenanceDetails(b, events, thresholds);
          const ageA = detailsA.stringDaysElapsed !== null ? detailsA.stringDaysElapsed : Infinity;
          const ageB = detailsB.stringDaysElapsed !== null ? detailsB.stringDaysElapsed : Infinity;
          if (ageA === ageB) return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`);
          return sortDirection === 'asc' ? ageB - ageA : ageA - ageB; // asc: oldest to new
        }
        
        if (sortBy === 'setup_age') {
          const detailsA = getGuitarMaintenanceDetails(a, events, thresholds);
          const detailsB = getGuitarMaintenanceDetails(b, events, thresholds);
          const ageA = detailsA.setupDaysElapsed !== null ? detailsA.setupDaysElapsed : Infinity;
          const ageB = detailsB.setupDaysElapsed !== null ? detailsB.setupDaysElapsed : Infinity;
          if (ageA === ageB) return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`);
          return sortDirection === 'asc' ? ageB - ageA : ageA - ageB; // asc: oldest to new
        }

        if (sortBy === 'name') {
          const nameA = `${a.brand} ${a.name}`.toLowerCase();
          const nameB = `${b.brand} ${b.name}`.toLowerCase();
          return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }

        // Default sort/overdue sort:
        // Precise continuous overdue score that sorts perfectly in both directions
        const getOverdueScore = (guitar: Guitar) => {
          const details = getGuitarMaintenanceDetails(guitar, events, thresholds);
          const stringThresh = getThreshold('String Change', thresholds, guitar.id);
          const setupThresh = getThreshold('Setup / Service', thresholds, guitar.id);

          const stringDays = details.stringDaysElapsed !== null ? details.stringDaysElapsed : 365;
          const setupDays = details.setupDaysElapsed !== null ? details.setupDaysElapsed : 365;

          const stringOverdueRed = stringDays - stringThresh.redDays;
          const setupOverdueRed = setupDays - setupThresh.redDays;

          const stringOverdueYellow = stringDays - stringThresh.yellowDays;
          const setupOverdueYellow = setupDays - setupThresh.yellowDays;

          let score = 0;
          if (details.overallStatus === 'red') {
            const maxRedOverdue = Math.max(
              details.stringStatus === 'red' ? stringOverdueRed : -Infinity,
              details.setupStatus === 'red' ? setupOverdueRed : -Infinity
            );
            score = 10000 + (maxRedOverdue !== -Infinity ? maxRedOverdue : 0);
          } else if (details.overallStatus === 'yellow') {
            const maxYellowOverdue = Math.max(
              details.stringStatus === 'yellow' ? stringOverdueYellow : -Infinity,
              details.setupStatus === 'yellow' ? setupOverdueYellow : -Infinity
            );
            score = 1000 + (maxYellowOverdue !== -Infinity ? maxYellowOverdue : 0);
          } else {
            const stringRemaining = stringThresh.yellowDays - stringDays;
            const setupRemaining = setupThresh.yellowDays - setupDays;
            score = -Math.min(stringRemaining, setupRemaining);
          }
          return score;
        };

        const scoreA = getOverdueScore(a);
        const scoreB = getOverdueScore(b);

        if (scoreA !== scoreB) {
          return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        }
        const nameA = `${a.brand} ${a.name}`.toLowerCase();
        const nameB = `${b.brand} ${b.name}`.toLowerCase();
        return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
  }, [guitars, events, thresholds, searchTerm, summaryFilter, showArchived, sortBy, sortDirection]);

  // --- RENDER ROUTER SYSTEM ---
  const renderContent = () => {
    if (viewState.type === 'details' && viewState.guitarId) {
      const g = guitars.find(g => g.id === viewState.guitarId);
      if (!g) return null;
      return (
        <DetailsView
          guitar={g}
          events={events}
          thresholds={thresholds}
          settings={appSettings}
          onBack={() => navigateBack({ type: 'tab', tab: 'guitars' })}
          onEdit={(id) => navigateTo({ type: 'add_edit', guitarId: id })}
          onLogMaintenance={(id, type) => navigateTo({ type: 'log_maintenance', guitarId: id, initialType: type })}
          onEditEvent={(guitarId, eventId) => navigateTo({ type: 'log_maintenance', guitarId, editEventId: eventId })}
          onDeleteEvent={handleDeleteEvent}
          scrollRef={detailsScrollRef}
        />
      );
    }

    if (viewState.type === 'add_edit') {
      return (
        <AddEditGuitarView
          guitarId={viewState.guitarId}
          guitars={guitars}
          events={events}
          maintenanceTypes={maintenanceTypes}
          settings={appSettings}
          onBack={() => {
            if (viewState.guitarId) {
              navigateBack({ type: 'details', guitarId: viewState.guitarId });
            } else {
              navigateBack({ type: 'tab', tab: 'guitars' });
            }
          }}
          onSave={handleSaveGuitar}
          onDelete={handleDeleteGuitar}
        />
      );
    }

    if (viewState.type === 'log_maintenance' && viewState.guitarId) {
      return (
        <LogMaintenanceView
          guitarId={viewState.guitarId}
          guitars={guitars}
          events={events}
          customTypes={maintenanceTypes}
          settings={appSettings}
          initialType={viewState.initialType}
          editEventId={viewState.editEventId}
          onBack={() => navigateBack({ type: 'details', guitarId: viewState.guitarId })}
          onSave={handleLogMaintenanceEvent}
        />
      );
    }

    // --- TAB SYSTEM ---
    const activeTab = viewState.tab || 'guitars';

    if (activeTab === 'settings') {
      return (
        <SettingsView
          guitars={guitars}
          events={events}
          thresholds={thresholds}
          maintenanceTypes={maintenanceTypes}
          settings={appSettings}
          onUpdateSettings={saveAppSettings}
          onUpdateThresholds={saveThresholds}
          onUpdateMaintenanceTypes={saveMaintenanceTypes}
          onRestoreBackup={handleRestoreBackup}
          onResetDatabase={handleResetDatabase}
          onBack={() => {
            if (window.history.state && window.history.state.tab === 'settings') {
              window.history.back();
            } else {
              navigateReplace({ type: 'tab', tab: 'guitars' });
            }
          }}
          showToast={showToast}
        />
      );
    }

    // Default 'guitars' list tab (Home View)
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-24" id="home-guitars-tab">
        {/* App Bar Header */}
        <div className="px-5 pb-4 safe-pt bg-[#111111] border-b border-white/5 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GuitarIcon className="h-5.5 w-5.5 text-green-500" />
            <h1 className="text-base font-black tracking-tight text-white font-display uppercase">{t.guitars}</h1>
          </div>
          
          <button
            type="button"
            id="top-add-instrument-btn"
            onClick={() => navigateTo({ type: 'add_edit' })}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-400 active:bg-green-600 text-black px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title={appSettings.language === 'ko' ? '새 악기 추가' : 'Add New Instrument'}
          >
            <Plus className="h-3.5 w-3.5 text-black stroke-[3]" />
            <span>{appSettings.language === 'ko' ? '추가' : 'Add'}</span>
          </button>
        </div>

        {/* Top Summary Cards, Scrollable list, Search Bar */}
        <div className="p-5 space-y-5">
          {/* Summary Metric Cards */}
          <SummaryCards
            overdueCount={summaryCounts.overdue}
            dueSoonCount={summaryCounts.dueSoon}
            allGoodCount={summaryCounts.allGood}
            activeFilter={summaryFilter}
            onFilterChange={setSummaryFilter}
            settings={appSettings}
          />

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
            <input
              type="text"
              id="home-search-input"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#111111] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-green-500/30"
            />
            {searchTerm && (
              <button
                type="button"
                id="home-clear-search-btn"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-2.5 text-white/40 hover:text-white"
              >
                {appSettings.language === 'ko' ? '지우기' : 'Clear'}
              </button>
            )}
          </div>

          {/* Collection Status Toggles */}
          <div className="flex items-center justify-between gap-2 bg-[#111111] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              id="view-active-tab-btn"
              onClick={() => setShowArchived(false)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                !showArchived 
                  ? 'bg-green-500 text-black font-bold shadow animate-fade-in' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <GuitarIcon className="h-3.5 w-3.5" />
              <span>{appSettings.language === 'ko' ? '활성' : 'Active'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${!showArchived ? 'bg-black/10 text-black' : 'bg-white/5 text-neutral-400'}`}>
                {guitars.filter(g => g.status === 'active').length}
              </span>
            </button>
            <button
              type="button"
              id="view-archived-tab-btn"
              onClick={() => setShowArchived(true)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                showArchived 
                  ? 'bg-amber-500 text-black font-bold shadow animate-fade-in' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{appSettings.language === 'ko' ? '보관됨' : 'Archived'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${showArchived ? 'bg-black/10 text-black' : 'bg-white/5 text-neutral-400'}`}>
                {guitars.filter(g => g.status === 'archived').length}
              </span>
            </button>
          </div>

          {/* Dynamic Sort Controls */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { key: 'overdue', labelEn: 'Overdue', labelKo: '알람 순' },
                { key: 'string_age', labelEn: 'String Age', labelKo: '스트링' },
                { key: 'setup_age', labelEn: 'Setup Age', labelKo: '셋업' },
                { key: 'name', labelEn: 'A-Z', labelKo: '가나다순' }
              ].map((item) => {
                const isActive = sortBy === item.key;
                const label = appSettings.language === 'ko' ? item.labelKo : item.labelEn;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(item.key as any);
                        setSortDirection(item.key === 'name' ? 'asc' : 'desc'); // Default to 'desc' for overdue, string_age, setup_age (most overdue/oldest first), and 'asc' for name
                      }
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight text-center flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-green-500/10 border-green-500 text-green-400 font-extrabold shadow' 
                        : 'bg-[#111111]/80 border-white/5 text-neutral-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <span>{label}</span>
                    {isActive && (
                      <span className="text-[9px] font-extrabold">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical list of Guitar Cards */}
          {homeFilteredGuitars.length === 0 ? (
            <div className="py-16 text-center space-y-3.5 border border-dashed border-white/5 rounded-2xl bg-white/2">
              {searchTerm.trim() ? (
                <>
                  <p className="text-sm font-semibold text-white/60">
                    {appSettings.language === 'ko' 
                      ? `"${searchTerm}"에 대한 검색 결과를 찾을 수 없습니다.` 
                      : `We couldn't find any instruments matching "${searchTerm}".`}
                  </p>
                  <p className="text-xs text-white/40 leading-relaxed max-w-xs mx-auto">
                    {appSettings.language === 'ko' 
                      ? '철자를 확인하거나 다른 검색어로 검색해 보세요.' 
                      : 'Try checking your spelling or search for another term.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-xs font-bold text-green-500 hover:text-green-400 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>{appSettings.language === 'ko' ? '검색어 초기화' : 'Clear search'}</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-white/60">{t.emptyCollection}</p>
                  <p className="text-xs text-white/40 leading-relaxed max-w-xs mx-auto">
                    {summaryFilter !== 'all' 
                      ? t.emptySubtextStatus 
                      : t.emptySubtextDefault
                    }
                  </p>
                  
                  {summaryFilter === 'all' && (
                    <button
                      type="button"
                      id="empty-state-add-btn"
                      onClick={() => navigateTo({ type: 'add_edit' })}
                      className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-green-500/10"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{t.catalogFirstGuitar}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3" id="home-guitar-cards-list">
              {homeFilteredGuitars.map(guitar => (
                <GuitarCard
                  key={guitar.id}
                  guitar={guitar}
                  events={events}
                  thresholds={thresholds}
                  settings={appSettings}
                  onViewDetails={(id: string) => navigateTo({ type: 'details', guitarId: id })}
                  onEdit={(id: string) => navigateTo({ type: 'add_edit', guitarId: id })}
                  onLogMaintenance={(id: string, type?: string) => navigateTo({ type: 'log_maintenance', guitarId: id, initialType: type })}
                  onQuickLogStrings={handleQuickLogStrings}
                  onQuickLogSetup={handleQuickLogSetup}
                  onArchiveToggle={handleArchiveToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- TAB NAVIGATION BAR ---
  const showBottomNav = viewState.type === 'tab';

  if (dbLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white font-sans max-w-md mx-auto shadow-2xl border-x border-white/5">
        <div className="flex flex-col items-center gap-4">
          <GuitarIcon className="h-12 w-12 text-green-500 animate-pulse" />
          <p className="text-xs font-semibold text-neutral-400 font-display uppercase tracking-wider">Loading Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-white h-screen relative flex flex-col font-sans max-w-md mx-auto shadow-2xl border-x border-white/5 overflow-hidden">
      
      {/* Toast Notification popover */}
      {toast && (
        <div className="pointer-events-none fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#111111] border border-green-500/30 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 max-w-[90%] animate-slide-up">
          <Sparkles className="h-4.5 w-4.5 text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Core Router view content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Bottom Navigation tab selector (visible ONLY on main screens) */}
      {showBottomNav && (
        <div 
          id="bottom-navigation-bar"
          className="fixed bottom-0 inset-x-0 bg-[#111111] border-t border-white/5 pt-2.5 safe-pb-nav flex items-center justify-center gap-24 max-w-md mx-auto z-40 shadow-2xl"
        >
          {/* Nav Item 1: Guitars */}
          <button
            type="button"
            id="nav-tab-guitars"
            onClick={() => {
              if (viewState.tab === 'settings') {
                window.history.back();
              } else {
                navigateReplace({ type: 'tab', tab: 'guitars' });
              }
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              viewState.tab === 'guitars' ? 'text-green-500' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <GuitarIcon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{t.guitars}</span>
          </button>

          {/* Nav Item 2: Settings */}
          <button
            type="button"
            id="nav-tab-settings"
            onClick={() => {
              if (viewState.tab !== 'settings') {
                navigateTo({ type: 'tab', tab: 'settings' });
              }
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              viewState.tab === 'settings' ? 'text-green-500' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{t.settings}</span>
          </button>
        </div>
      )}

      {/* Confirmation modal sheet */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}

    </div>
  );
}
