import React, { useState } from 'react';
import { Settings, Shield, Plus, Trash2, Download, Upload, Info, Check, Bell, ToggleLeft, ToggleRight, RefreshCw, AlertTriangle, X, ArrowLeft } from 'lucide-react';
import { Guitar, MaintenanceEvent, ThresholdSetting, AppSettings } from '../types';
import { translations } from '../translations';
import { DEFAULT_MAINTENANCE_TYPES, DEFAULT_THRESHOLDS } from '../initialData';
import ConfirmModal from './ConfirmModal';

interface SettingsViewProps {
  guitars: Guitar[];
  events: MaintenanceEvent[];
  thresholds: ThresholdSetting[];
  maintenanceTypes: string[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateThresholds: (thresholds: ThresholdSetting[]) => void;
  onUpdateMaintenanceTypes: (types: string[]) => void;
  onRestoreBackup: (backupData: {
    guitars: Guitar[];
    events: MaintenanceEvent[];
    thresholds: ThresholdSetting[];
    maintenanceTypes: string[];
    settings: AppSettings;
  }) => void;
  onResetDatabase: () => void;
  onBack: () => void;
  showToast?: (message: string) => void;
}

export default function SettingsView({
  guitars,
  events,
  thresholds,
  maintenanceTypes,
  settings,
  onUpdateSettings,
  onUpdateThresholds,
  onUpdateMaintenanceTypes,
  onRestoreBackup,
  onResetDatabase,
  onBack,
  showToast
}: SettingsViewProps) {
  // Use local state for settings, thresholds, and maintenance categories to allow Save / Revert flow
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [localThresholds, setLocalThresholds] = useState<ThresholdSetting[]>(thresholds);
  const [localMaintenanceTypes, setLocalMaintenanceTypes] = useState<string[]>(maintenanceTypes);

  // Synchronize local state with props when the database is restored or reset
  // We use primitive checks to abide by the useEffect guidelines and avoid unnecessary re-renders.
  const settingsLang = settings.language;
  const settingsCurrency = settings.currency;
  const settingsDateFormat = settings.dateFormat;
  const settingsNotifications = settings.notificationsEnabled;
  const thresholdsLength = thresholds.length;
  const maintenanceTypesLength = maintenanceTypes.length;

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settingsLang, settingsCurrency, settingsDateFormat, settingsNotifications]);

  React.useEffect(() => {
    setLocalThresholds(thresholds);
  }, [thresholdsLength]);

  React.useEffect(() => {
    setLocalMaintenanceTypes(maintenanceTypes);
  }, [maintenanceTypesLength]);

  const t = translations[localSettings.language || 'en'];

  // Local state for adding threshold
  const [newThresholdType, setNewThresholdType] = useState('String Change');
  const [newYellowDays, setNewYellowDays] = useState<number | ''>(180);
  const [newRedDays, setNewRedDays] = useState<number | ''>(365);
  const [newGuitarOverride, setNewGuitarOverride] = useState('');

  // Local state for custom maintenance types
  const [newTypeName, setNewTypeName] = useState('');

  // Feedback notifications
  const [feedback, setFeedback] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {}
  });

  const triggerFeedback = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // 1. Export CSV of All Maintenance Events
  const handleExportCSV = () => {
    if (events.length === 0) {
      triggerFeedback(t.noLogsFound);
      return;
    }

    // CSV Headers
    const headers = ['Event ID', 'Guitar Name', 'Guitar Brand', 'Guitar Model', 'Date Completed', 'Maintenance Type', 'Details', 'Notes', 'Cost', 'Performed By', 'String Brand', 'String Gauge'];
    
    const rows = events.map(e => {
      const guitar = guitars.find(g => g.id === e.guitarId);
      return [
        e.id,
        guitar?.name || 'Unknown',
        guitar?.brand || 'Unknown',
        guitar?.model || 'Unknown',
        e.date,
        e.maintenanceType,
        `"${(e.details || '').replace(/"/g, '""')}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
        e.cost || '',
        e.performedBy || '',
        e.stringBrand || '',
        e.stringGauge || ''
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `guitar_maintenance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback(t.feedbackCsvDownloaded);
  };

  // 2. Export Full JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      guitars,
      events,
      thresholds: localThresholds,
      maintenanceTypes: localMaintenanceTypes,
      settings: localSettings,
      backupDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    link.setAttribute('download', `guitar_tracker_full_backup_${dateStr}_${timeStr}.json`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback(t.feedbackBackupDownloaded);
  };

  // 3. Restore Full JSON Backup from file
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.guitars && parsed.events && parsed.thresholds && parsed.maintenanceTypes && parsed.settings) {
          // Confirm backup restoration
          setConfirmState({
            isOpen: true,
            title: localSettings.language === 'ko' ? '백업 복원' : 'Restore Backup',
            message: t.restoreBackupConfirm,
            confirmText: localSettings.language === 'ko' ? '복원' : 'Restore',
            cancelText: localSettings.language === 'ko' ? '취소' : 'Cancel',
            onConfirm: () => {
              onRestoreBackup({
                guitars: parsed.guitars,
                events: parsed.events,
                thresholds: parsed.thresholds,
                maintenanceTypes: parsed.maintenanceTypes,
                settings: parsed.settings
              });
              triggerFeedback(t.feedbackRestored);
              setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
          });
        } else {
          alert('Invalid backup file. Missing critical backup properties.');
        }
      } catch (err) {
        alert('Failed to parse backup file. Please make sure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Add threshold
  const handleAddThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (newYellowDays === '' || newRedDays === '') {
      alert(localSettings.language === 'ko' ? '임계값을 입력해 주세요.' : 'Please enter valid threshold days.');
      return;
    }
    const newSetting: ThresholdSetting = {
      maintenanceType: newThresholdType,
      yellowDays: Number(newYellowDays),
      redDays: Number(newRedDays),
      appliesGlobally: !newGuitarOverride,
      optionalGuitarId: newGuitarOverride || undefined
    };

    // Replace if exact duplicate (type & override), otherwise append
    const updated = localThresholds.filter(t => 
      !(t.maintenanceType === newThresholdType && t.optionalGuitarId === (newGuitarOverride || undefined))
    );
    setLocalThresholds([...updated, newSetting]);
    triggerFeedback(`${t.feedbackThresholdConfigured}: ${newThresholdType}`);
  };

  // Delete threshold
  const handleDeleteThreshold = (idx: number) => {
    const updated = localThresholds.filter((_, i) => i !== idx);
    setLocalThresholds(updated);
    triggerFeedback(t.feedbackThresholdDeleted);
  };

  // Add custom maintenance type
  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTypeName.trim()) {
      const formatted = newTypeName.trim();
      if (!localMaintenanceTypes.includes(formatted)) {
        setLocalMaintenanceTypes([...localMaintenanceTypes, formatted]);
        setNewTypeName('');
        triggerFeedback(`${t.feedbackCategoryAdded} "${formatted}"`);
      } else {
        alert(localSettings.language === 'ko' ? '이미 존재하는 카테고리입니다.' : 'This maintenance category already exists.');
      }
    }
  };

  // Delete custom maintenance type
  const handleDeleteType = (typeToDelete: string) => {
    if (['String Change', 'Setup / Service'].includes(typeToDelete)) {
      alert(localSettings.language === 'ko' ? '기본 정비 카테고리는 삭제할 수 없습니다.' : 'Default critical maintenance categories cannot be deleted.');
      return;
    }
    
    setConfirmState({
      isOpen: true,
      title: localSettings.language === 'ko' ? '카테고리 삭제' : 'Delete Category',
      message: localSettings.language === 'ko' 
        ? `정말 "${typeToDelete}" 카테고리를 삭제하시겠습니까? 기존 정비 내역은 보존되지만, 더 이상 새 기록에 선택할 수 없게 됩니다.` 
        : `Are you sure you want to delete "${typeToDelete}"? Existing event logs of this category will remain, but you won't be able to select it for new logs.`,
      confirmText: localSettings.language === 'ko' ? '삭제' : 'Delete',
      cancelText: localSettings.language === 'ko' ? '취소' : 'Cancel',
      onConfirm: () => {
        const updated = localMaintenanceTypes.filter(t => t !== typeToDelete);
        setLocalMaintenanceTypes(updated);
        triggerFeedback(t.feedbackCategoryRemoved);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetSettings = () => {
    setConfirmState({
      isOpen: true,
      title: localSettings.language === 'ko' ? '설정 초기화' : 'Reset Settings',
      message: t.resetSettingsConfirm,
      confirmText: localSettings.language === 'ko' ? '초기화' : 'Reset',
      cancelText: localSettings.language === 'ko' ? '취소' : 'Cancel',
      onConfirm: () => {
        const defaultSettings: AppSettings = {
          currency: 'NZD',
          dateFormat: 'DD/MM/YYYY',
          notificationsEnabled: true,
          language: localSettings.language || 'en'
        };
        
        setLocalSettings(defaultSettings);
        setLocalThresholds(DEFAULT_THRESHOLDS);
        setLocalMaintenanceTypes(DEFAULT_MAINTENANCE_TYPES);
        
        onUpdateSettings(defaultSettings);
        onUpdateThresholds(DEFAULT_THRESHOLDS);
        onUpdateMaintenanceTypes(DEFAULT_MAINTENANCE_TYPES);
        
        triggerFeedback(t.feedbackSettingsReset);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveAll = () => {
    onUpdateSettings(localSettings);
    onUpdateThresholds(localThresholds);
    onUpdateMaintenanceTypes(localMaintenanceTypes);
    onBack();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-24 animate-fade-in" id="settings-view-container">
      {/* Header with Save & Revert (Back) */}
      <div className="px-5 pb-4 safe-pt bg-[#111111] border-b border-white/5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="settings-back-btn"
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            title={localSettings.language === 'ko' ? '돌아가기 (변경사항 무시)' : 'Go Back (Discard Changes)'}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-500" />
            <h1 className="text-sm font-bold font-display tracking-tight text-white uppercase tracking-wider">{t.appSettings}</h1>
          </div>
        </div>

        <button
          type="button"
          id="settings-save-btn"
          onClick={handleSaveAll}
          className="p-1 rounded-lg hover:bg-neutral-800 text-green-500 hover:text-green-400 cursor-pointer"
          title={localSettings.language === 'ko' ? '설정 저장' : 'Save Settings'}
        >
          <Check className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5 space-y-6 max-w-lg mx-auto w-full text-xs">

        {/* Dynamic floating feedback toast */}
        {feedback && (
          <div className="pointer-events-none fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-2xl animate-bounce">
            <Check className="h-4 w-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* 1. Regional / Format Preferences */}
        <div className="p-4 bg-[#111111] border border-white/5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-green-500 font-display uppercase tracking-wider">
            {t.formatPreferences}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5">{t.languageLabel}</label>
              <select
                id="language-select"
                value={localSettings.language || 'en'}
                onChange={e => setLocalSettings({ ...localSettings, language: e.target.value as any })}
                className="w-full bg-neutral-950 border border-white/5 rounded-lg px-2.5 py-2 text-white font-semibold cursor-pointer focus:outline-none focus:border-green-500/50"
              >
                <option value="en">{t.english}</option>
                <option value="ko">{t.korean}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.currencyCode}</label>
                <select
                  id="currency-select"
                  value={localSettings.currency}
                  onChange={e => setLocalSettings({ ...localSettings, currency: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/5 rounded-lg px-2.5 py-2 text-white font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="USD">Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">Pound (£)</option>
                  <option value="JPY">Yen (¥)</option>
                  <option value="KRW">Won (₩)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.dateDisplayFormat}</label>
                <select
                  id="date-format-select"
                  value={localSettings.dateFormat}
                  onChange={e => setLocalSettings({ ...localSettings, dateFormat: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-white/5 rounded-lg px-2.5 py-2 text-white font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Custom Threshold Settings per type */}
        <div className="p-4 bg-[#111111] border border-white/5 rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-amber-500 font-display uppercase tracking-wider">
              {t.serviceThresholdLimits}
            </h3>
            <p className="text-[10px] text-neutral-400">
              {t.customizeThresholdsSub}
            </p>
          </div>

          {/* Current thresholds list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {localThresholds.map((tItem, idx) => {
              const overrideGuitar = tItem.optionalGuitarId ? guitars.find(g => g.id === tItem.optionalGuitarId) : null;
              return (
                <div key={idx} className="p-2.5 bg-neutral-950 border border-white/5 rounded-lg flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">
                      {tItem.maintenanceType === 'String Change' ? t.stringsLabel : tItem.maintenanceType === 'Setup / Service' ? t.setupLabel : tItem.maintenanceType}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium">
                      {tItem.appliesGlobally ? t.globalSetting : t.overrideFor.replace('{name}', overrideGuitar?.name || 'Instrument')}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono block">
                      {localSettings.language === 'ko' ? '관리 필요' : 'Overdue'}: {tItem.yellowDays}d / {localSettings.language === 'ko' ? '관리 시급' : 'Critical'}: {tItem.redDays}d
                    </span>
                  </div>
                  
                  {/* Delete threshold unless it's the core default thresholds */}
                  {!(tItem.maintenanceType === 'String Change' && tItem.appliesGlobally) && 
                   !(tItem.maintenanceType === 'Setup / Service' && tItem.appliesGlobally) && (
                    <button
                      type="button"
                      id={`delete-threshold-${idx}`}
                      onClick={() => handleDeleteThreshold(idx)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded transition-all cursor-pointer"
                      title="Remove threshold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form to configure new override threshold */}
          <form onSubmit={handleAddThreshold} className="border-t border-white/5 pt-4 space-y-3">
            <span className="block font-bold text-white text-[10px] uppercase tracking-wider">{t.configureNewOverride}</span>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-500 mb-1">{localSettings.language === 'ko' ? '정비 유형' : 'Maintenance Type'}</label>
                <select
                  id="new-thresh-type"
                  value={newThresholdType}
                  onChange={e => setNewThresholdType(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/5 rounded px-2 py-1.5 text-white"
                >
                  {localMaintenanceTypes.filter(tType => ['String Change', 'Setup / Service'].includes(tType)).map(tType => (
                    <option key={tType} value={tType}>
                      {tType === 'String Change' ? t.stringsLabel : tType === 'Setup / Service' ? t.setupLabel : tType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{localSettings.language === 'ko' ? '악기 선택' : 'Instrument Override'}</label>
                <select
                  id="new-thresh-guitar-id"
                  value={newGuitarOverride}
                  onChange={e => setNewGuitarOverride(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/5 rounded px-2 py-1.5 text-white"
                >
                  <option value="">{localSettings.language === 'ko' ? '전체 악기 대상' : 'Global (All Instruments)'}</option>
                  {guitars.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-500 mb-1">{localSettings.language === 'ko' ? '관리 필요 (일)' : 'Overdue (Days)'}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="new-thresh-yellow-days"
                  value={newYellowDays}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setNewYellowDays('');
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) setNewYellowDays(num);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-white/5 rounded px-2.5 py-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{localSettings.language === 'ko' ? '관리 시급 (일)' : 'Critical (Days)'}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="new-thresh-red-days"
                  value={newRedDays}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setNewRedDays('');
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) setNewRedDays(num);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-white/5 rounded px-2.5 py-1 text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              id="save-override-btn"
              className="w-full py-2 bg-neutral-850 hover:bg-neutral-800 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
            >
              <Plus className="h-3.5 w-3.5 animate-pulse" />
              <span>{t.applyThresholdOverride}</span>
            </button>
          </form>
        </div>

        {/* 3. Manage Custom Maintenance Categories */}
        <div className="p-4 bg-[#111111] border border-white/5 rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-neutral-300 font-display uppercase tracking-wider">
              {t.maintenanceCategories}
            </h3>
            <p className="text-[10px] text-neutral-400">
              {t.maintenanceCategoriesSub}
            </p>
          </div>

          {/* Categories Grid List */}
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-neutral-950 rounded-lg border border-white/5">
            {localMaintenanceTypes.map((type, idx) => {
              const isDefault = ['String Change', 'Setup / Service'].includes(type);
              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-1.5 px-2 py-1 text-[10px] rounded border ${
                    isDefault 
                      ? 'bg-neutral-900 text-neutral-500 border-white/5' 
                      : 'bg-neutral-850 text-white border-white/10'
                  }`}
                >
                  <span>{type === 'String Change' ? t.stringsLabel : type === 'Setup / Service' ? t.setupLabel : type}</span>
                  {!isDefault && (
                    <button
                      type="button"
                      id={`delete-type-${idx}`}
                      onClick={() => handleDeleteType(type)}
                      className="text-neutral-400 hover:text-red-400 cursor-pointer"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddType} className="flex gap-2">
            <input
              type="text"
              id="new-maint-type-input"
              required
              placeholder={localSettings.language === 'ko' ? '예: 프렛 레벨링, 가습 점검' : 'e.g. Fret Level, Humidity Check'}
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              className="flex-1 bg-neutral-950 border border-white/5 rounded-lg px-2.5 py-2 text-white font-semibold focus:outline-none focus:border-green-500/50"
            />
            <button
              type="submit"
              id="add-maint-type-btn"
              className="px-3 py-2 bg-neutral-850 hover:bg-neutral-800 text-white font-bold rounded-lg cursor-pointer border border-white/5"
            >
              {t.addCategory}
            </button>
          </form>
        </div>

        {/* 4. Backup & Export Tools */}
        <div className="p-4 bg-[#111111] border border-white/5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-green-500 font-display uppercase tracking-wider">
            {t.dataStorageBackups}
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Export CSV button */}
            <button
              type="button"
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Download className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-white">{t.exportEventsCsv}</span>
              <span className="text-[9px] text-neutral-500">{t.forSpreadsheet}</span>
            </button>

            {/* Export JSON backup */}
            <button
              type="button"
              id="export-json-btn"
              onClick={handleExportJSON}
              className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Download className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-white">{t.fullJsonBackup}</span>
              <span className="text-[9px] text-neutral-500">{t.saveCompleteDatabase}</span>
            </button>
          </div>

          <div className="border-t border-white/5 pt-3">
            <label className="block text-neutral-400 font-medium mb-1.5">{t.restoreDatabaseBackup}</label>
            <div className="relative group flex items-center justify-center border border-dashed border-white/5 hover:border-green-500/50 bg-neutral-950 p-4 rounded-lg cursor-pointer transition-all">
              <input
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleRestoreJSON}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="json-restore-file"
              />
              <Upload className="h-4 w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-neutral-300">{t.chooseJsonBackupFile}</span>
            </div>
          </div>
        </div>

        {/* 5. Settings Reset */}
        <div className="p-4 bg-[#111111] border border-white/5 rounded-xl space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-500 font-display uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>{localSettings.language === 'ko' ? '초기화 옵션' : 'Reset Options'}</span>
            </h3>
            
            <div className="space-y-2">
              <div className="p-3 bg-neutral-950 rounded-lg border border-white/5 space-y-2">
                <span className="font-bold text-white block text-[11px]">
                  {localSettings.language === 'ko' ? '설정 및 정비 주기 초기화' : 'Reset Settings & Thresholds'}
                </span>
                <span className="text-[10px] text-neutral-500 block leading-normal">
                  {localSettings.language === 'ko'
                    ? '통화 단위, 날짜 표기 형식 및 모든 정비 주기 임계값을 기본값으로 복구합니다. 등록하신 악기나 정비 내역 로그는 지워지지 않습니다.'
                    : 'Revert format preferences, global thresholds, and categories to defaults. Your instruments and maintenance logs will remain safe.'}
                </span>
                <button
                  type="button"
                  id="reset-settings-btn"
                  onClick={handleResetSettings}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-amber-500 hover:text-amber-400 font-semibold rounded-lg border border-amber-500/20 cursor-pointer transition-colors text-center block text-[10px]"
                >
                  {t.resetSettingsBtn}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. About Box */}
        <div className="p-4 bg-[#111111] border border-white/5 rounded-xl flex items-start gap-3">
          <Info className="h-5 w-5 text-neutral-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white block">{t.aboutTitle}</span>
            <p className="text-neutral-500 leading-relaxed text-[10px] whitespace-pre-line">
              {t.aboutText}
            </p>
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
