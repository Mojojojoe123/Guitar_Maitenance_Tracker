import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Camera, Trash2, Archive, X } from 'lucide-react';
import { Guitar, MaintenanceEvent, GuitarType, GuitarStatus, UsageLevel, AppSettings } from '../types';
import ImagePresetsModal from './ImagePresetsModal';
import { translations } from '../translations';

interface AddEditGuitarViewProps {
  guitarId?: string; // If provided, we are editing
  guitars: Guitar[];
  events: MaintenanceEvent[];
  maintenanceTypes: string[];
  settings: AppSettings;
  onBack: () => void;
  onSave: (
    guitar: Omit<Guitar, 'id'> & { id?: string },
    stringChange?: { date: string; brand: string; type: string; gauge: string },
    setupService?: { date: string; details: string }
  ) => void;
  onDelete?: (id: string) => void;
}

const TUNING_OPTIONS = [
  'Standard (E A D G B e)',
  'Standard Bass (E A D G)',
  'Drop D (D A D G B e)',
  'Half-Step Down (Eb Ab Db Gb Bb eb)',
  'DADGAD (D A D G A d)',
  'Drop C (C G C F A d)',
  'Open G (D G D G B d)',
  'Other / Custom'
];

export default function AddEditGuitarView({
  guitarId,
  guitars,
  events,
  maintenanceTypes,
  settings,
  onBack,
  onSave,
  onDelete
}: AddEditGuitarViewProps) {
  const t = translations[settings.language || 'en'];
  const isEditing = !!guitarId;
  const guitar = isEditing ? guitars.find(g => g.id === guitarId) : null;

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
  const currencySymbol = symbolMap[settings.currency] || '$';

  const getTuningLabel = (option: string) => {
    if (option === 'Standard (E A D G B e)') return t.tuningStandard;
    if (option === 'Standard Bass (E A D G)') return t.tuningStandardBass;
    if (option === 'Drop D (D A D G B e)') return t.tuningDropD;
    if (option === 'Half-Step Down (Eb Ab Db Gb Bb eb)') return t.tuningHalfStepDown;
    if (option === 'DADGAD (D A D G A d)') return t.tuningDadgad;
    if (option === 'Drop C (C G C F A d)') return t.tuningDropC;
    if (option === 'Open G (D G D G B d)') return t.tuningOpenG;
    if (option === 'Other / Custom') return t.tuningOtherCustom;
    return option;
  };

  const getSetupItemLabel = (item: string) => {
    if (settings.language !== 'ko') return item;
    const itemMap: Record<string, string> = {
      'String Change': '스트링 교체',
      'Setup / Service': '셋업 / 정비',
      'Clean': '클리닝 / 소독',
      'Fret Work': '프렛 레벨 및 가공',
      'Electronics Clean / Repair': '전자 부품 수리 및 청소',
      'Nut Work': '너트 가공 및 높이',
      'Intonation': '피치(인토네이션) 세팅',
      'Action Adjustment': '줄높이(액션) 조정',
      'Truss Rod / Relief Adjustment': '트러스로드 / 넥 조정',
      'Pickup Height Adjustment': '픽업 높이 밸런스 조정',
      'Other': '기타 정비',
      'Neck Relief / Truss Rod': '넥 릴리프 / 트러스로드 조정',
      'Intonation Adjust': '피치(인토네이션) 조정',
      'Nut Height / Slots': '너트 높이 / 슬롯 가공',
      'Fret Level & Polish': '프렛 드레싱 및 광택',
      'Pickup Height': '픽업 높이 밸런스 조정',
      'Full Setup & Polish': '종합 전체 셋업 및 크리닝',
      'Fretboard Clean & Oiling': '지판 청소 및 레몬오일 도포',
      'Bridge / Tremolo Adjust': '브릿지 및 트레몰로 수평세팅'
    };
    return itemMap[item] || item;
  };

  const toggleSetupItem = (item: string) => {
    const label = getSetupItemLabel(item);
    if (setupDetailChips.includes(label)) {
      setSetupDetailChips(setupDetailChips.filter(i => i !== label));
    } else {
      setSetupDetailChips([...setupDetailChips, label]);
    }
  };

  const checklistCategories = maintenanceTypes.filter(type => type !== 'String Change' && type !== 'Setup / Service');

  // Basic Details State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [guitarType, setGuitarType] = useState<GuitarType>('electric');
  const [numberOfStrings, setNumberOfStrings] = useState(6);
  const [tuning, setTuning] = useState('Standard (E A D G B e)');
  const [customTuning, setCustomTuning] = useState('');
  const [scaleLength, setScaleLength] = useState('');
  const [purchaseYear, setPurchaseYear] = useState<number | ''>('');
  const [estimatedValue, setEstimatedValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<GuitarStatus>('active');
  const [usageLevel, setUsageLevel] = useState<UsageLevel>('regular');
  const [image, setImage] = useState('');

  // Maintenance Default pre-fills State
  const [lastStringChangeDate, setLastStringChangeDate] = useState('');
  const [stringBrand, setStringBrand] = useState('');
  const [stringType, setStringType] = useState('');
  const [stringGauge, setStringGauge] = useState('');

  const [lastSetupDate, setLastSetupDate] = useState('');
  const [setupDetailChips, setSetupDetailChips] = useState<string[]>([]);
  const [newChipText, setNewChipText] = useState('');

  // Image preset picker
  const [presetModalOpen, setPresetModalOpen] = useState(false);

  // Protection from re-renders overwriting edits
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && guitar && !hasInitialized) {
      setHasInitialized(true);
      setName(guitar.name || '');
      setBrand(guitar.brand || '');
      setModel(guitar.model || '');
      setGuitarType(guitar.guitarType);
      setNumberOfStrings(guitar.numberOfStrings);
      
      if (TUNING_OPTIONS.includes(guitar.tuning)) {
        setTuning(guitar.tuning);
      } else {
        setTuning('Other / Custom');
        setCustomTuning(guitar.tuning);
      }
      
      setScaleLength(guitar.scaleLength || '');
      setPurchaseYear(guitar.purchaseYear || '');
      setEstimatedValue(guitar.estimatedValue || '');
      setNotes(guitar.notes || '');
      setStatus(guitar.status);
      setUsageLevel(guitar.usageLevel);
      setImage(guitar.image || '');

      // Load latest maintenance events for pre-fills
      const guitarEvents = events.filter(e => e.guitarId === guitarId);
      
      // Strings Change
      const stringEvs = guitarEvents
        .filter(e => e.maintenanceType === 'String Change')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (stringEvs.length > 0) {
        setLastStringChangeDate(stringEvs[0].date);
        setStringBrand(stringEvs[0].stringBrand || '');
        setStringType(stringEvs[0].stringType || '');
        setStringGauge(stringEvs[0].stringGauge || '');
      }

      // Setup/Service
      const setupEvs = guitarEvents
        .filter(e => e.maintenanceType === 'Setup / Service')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (setupEvs.length > 0) {
        setLastSetupDate(setupEvs[0].date);
        const detailsStr = setupEvs[0].details || '';
        const splitDetails = detailsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        const checklistCategories = maintenanceTypes.filter(type => type !== 'String Change' && type !== 'Setup / Service');
        
        const matchedChips: string[] = [];
        const unmatchedChips: string[] = [];
        
        splitDetails.forEach(d => {
          // Ignore default placeholders
          const isPlaceholder = [
            'Setup / Maintenance: Details Unspecified',
            'Setup & general adjustments',
            'General full service and relief setup',
            '셋업 / 정비: 상세 미지정',
            '종합 전체 셋업 및 조정'
          ].includes(d);
          if (isPlaceholder) return;

          const matched = checklistCategories.some(cat => {
            const catLabel = getSetupItemLabel(cat);
            return d === cat || d === catLabel;
          });
          if (matched) {
            const cat = checklistCategories.find(cat => {
              const catLabel = getSetupItemLabel(cat);
              return d === cat || d === catLabel;
            });
            if (cat) {
              matchedChips.push(getSetupItemLabel(cat));
            }
          } else {
            unmatchedChips.push(d);
          }
        });
        
        setSetupDetailChips(matchedChips);
        if (unmatchedChips.length > 0) {
          setNewChipText(unmatchedChips.join(', '));
        }
      }
    }
  }, [isEditing, guitarId, guitar, events, hasInitialized]);

  // Adjust number of strings based on guitar type
  useEffect(() => {
    if (!isEditing) {
      if (guitarType === 'bass') {
        setNumberOfStrings(4);
        setTuning('Standard Bass (E A D G)');
      } else {
        setNumberOfStrings(6);
        setTuning('Standard (E A D G B e)');
      }
    }
  }, [guitarType, isEditing]);

  const addChip = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChipText.trim()) {
      if (!setupDetailChips.includes(newChipText.trim())) {
        setSetupDetailChips([...setupDetailChips, newChipText.trim()]);
      }
      setNewChipText('');
    }
  };

  const removeChip = (indexToRemove: number) => {
    setSetupDetailChips(setupDetailChips.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const cleanName = (name || '').trim();
    if (!cleanName) {
      setShowValidationErrors(true);
      const nameInput = document.getElementById('guitar-name-input');
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    const cleanTuning = (tuning || '').trim();
    const cleanCustomTuning = (customTuning || '').trim();
    const finalTuning = cleanTuning === 'Other / Custom' ? cleanCustomTuning : cleanTuning;

    const guitarPayload: Omit<Guitar, 'id'> & { id?: string } = {
      ...(isEditing && { id: guitarId }),
      name: cleanName,
      brand: (brand || '').trim() || 'Generic',
      model: (model || '').trim() || 'Unspecified',
      guitarType,
      numberOfStrings: Number(numberOfStrings),
      tuning: finalTuning || 'Standard (E A D G B e)',
      scaleLength: (scaleLength || '').trim() || undefined,
      purchaseYear: purchaseYear ? Number(purchaseYear) : undefined,
      estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
      notes: (notes || '').trim() || undefined,
      status,
      usageLevel,
      image: image || undefined
    };

    // Prepare optional string change event
    // Smart prefill date default if string details are filled but date was left empty
    const cleanStringBrand = (stringBrand || '').trim();
    const cleanStringType = (stringType || '').trim();
    const cleanStringGauge = (stringGauge || '').trim();
    const hasAnyStringData = cleanStringBrand || cleanStringType || cleanStringGauge;
    const finalStringChangeDate = lastStringChangeDate || (hasAnyStringData ? new Date().toISOString().split('T')[0] : '');

    const stringPayload = finalStringChangeDate ? {
      date: finalStringChangeDate,
      brand: cleanStringBrand || 'Unspecified',
      type: cleanStringType || '',
      gauge: cleanStringGauge || ''
    } : undefined;

    // Prepare optional setup event
    // Smart prefill date default if setup tasks are selected/added but date was left empty
    const cleanNewChipText = (newChipText || '').trim();
    const combinedSetupDetails = [
      ...(setupDetailChips || []),
      ...(cleanNewChipText ? [cleanNewChipText] : [])
    ];
    const hasAnySetupData = combinedSetupDetails.length > 0 || lastSetupDate;
    const finalSetupDate = lastSetupDate || (hasAnySetupData ? new Date().toISOString().split('T')[0] : '');

    const setupPayload = finalSetupDate ? {
      date: finalSetupDate,
      details: combinedSetupDetails.length > 0 
        ? combinedSetupDetails.join(', ') 
        : (settings.language === 'ko' ? '셋업 / 정비: 상세 미지정' : 'Setup / Maintenance: Details Unspecified')
    } : undefined;

    onSave(guitarPayload, stringPayload, setupPayload);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 pb-24" id="add-edit-guitar-container">
      {/* Navbar header */}
      <div className="px-5 pb-4 safe-pt bg-neutral-900 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="add-edit-back-btn"
            onClick={onBack}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold font-display tracking-tight text-white">
            {isEditing ? `${t.editSpecsHeader}: ${guitar?.name}` : t.catalogGuitarHeader}
          </h1>
        </div>
        
        <button
          type="button"
          id="add-edit-save-check-btn"
          onClick={handleSave}
          disabled={isSaving}
          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 disabled:text-neutral-600 transition-colors cursor-pointer"
          title={t.saveInstrument}
        >
          {isSaving ? (
            <div className="h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="h-6 w-6" />
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="p-5 space-y-6 max-w-lg mx-auto w-full">
        
        {/* Guitar Photo Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            {t.instrumentPhoto}
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              id="photo-picker-trigger"
              onClick={() => setPresetModalOpen(true)}
              className="flex-1 h-28 border border-dashed border-neutral-800 hover:border-emerald-500/50 bg-neutral-900/60 hover:bg-neutral-900 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
            >
              <Camera className="h-7 w-7 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-300">{t.presetImagesBtn}</span>
              <span className="text-[10px] text-neutral-500">{t.presetImagesSubtext}</span>
            </button>

            {image && (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 group">
                <img
                  src={image}
                  alt="Guitar preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  id="remove-photo-btn"
                  onClick={() => setImage('')}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-black text-white hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Basic Details Section */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 font-display uppercase tracking-wider">
            {t.basicDetails}
          </h3>

          <div className="space-y-4 text-xs">
            {/* Guitar Name */}
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5">
                {t.instrumentNickname} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="guitar-name-input"
                required
                placeholder="e.g. PRS S2, My Custom Strat"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setShowValidationErrors(false);
                }}
                className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none transition-colors ${
                  showValidationErrors && !name.trim() 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-neutral-800 focus:border-emerald-500/50'
                }`}
              />
              {showValidationErrors && !name.trim() && (
                <p className="mt-1.5 text-red-400 text-[11px] font-medium font-sans flex items-center gap-1 animate-fade-in">
                  <span>⚠</span> {settings.language === 'ko' ? '악기 별칭을 입력해주세요' : 'Please enter an instrument nickname'}
                </p>
              )}
            </div>

            {/* Brand & Model in same row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.brand}</label>
                <input
                  type="text"
                  id="guitar-brand-input"
                  placeholder="e.g. Fender, Gibson, PRS"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.model}</label>
                <input
                  type="text"
                  id="guitar-model-input"
                  placeholder="e.g. Stratocaster, Les Paul"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Type & Strings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.instrumentType}</label>
                <select
                  id="guitar-type-select"
                  value={guitarType}
                  onChange={e => setGuitarType(e.target.value as GuitarType)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="electric">{t.electric}</option>
                  <option value="acoustic">{t.acoustic}</option>
                  <option value="bass">{t.bass}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.stringsCount}</label>
                <select
                  id="guitar-strings-select"
                  value={numberOfStrings}
                  onChange={e => setNumberOfStrings(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value={4}>4 {settings.language === 'ko' ? '현' : 'Strings'}</option>
                  <option value={5}>5 {settings.language === 'ko' ? '현' : 'Strings'}</option>
                  <option value={6}>6 {settings.language === 'ko' ? '현' : 'Strings'}</option>
                  <option value={7}>7 {settings.language === 'ko' ? '현' : 'Strings'}</option>
                  <option value={8}>8 {settings.language === 'ko' ? '현' : 'Strings'}</option>
                  <option value={12}>12 {settings.language === 'ko' ? '현' : 'Strings'}</option>
                </select>
              </div>
            </div>

            {/* Tuning Selector */}
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5">{t.tuningLabel}</label>
              <select
                id="guitar-tuning-select"
                value={tuning}
                onChange={e => setTuning(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer mb-2"
              >
                {TUNING_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{getTuningLabel(opt)}</option>
                ))}
              </select>

              {tuning === 'Other / Custom' && (
                <div className="space-y-1 animate-fade-in">
                  <span className="text-[10px] text-neutral-500">{t.tuningSubtext}</span>
                  <input
                    type="text"
                    id="guitar-custom-tuning-input"
                    required
                    placeholder="e.g. C G C F A D"
                    value={customTuning}
                    onChange={e => setCustomTuning(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}
            </div>

            {/* Scale Length & Purchase Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.scaleLength}</label>
                <input
                  type="text"
                  id="guitar-scale-input"
                  placeholder='e.g. 25.5", 24.75"'
                  value={scaleLength}
                  onChange={e => setScaleLength(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.purchaseYear}</label>
                <input
                  type="number"
                  id="guitar-year-input"
                  placeholder="e.g. 2021"
                  min={1900}
                  max={2030}
                  value={purchaseYear}
                  onChange={e => setPurchaseYear(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Estimated Value & Usage Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.estimatedValue} ({currencySymbol})</label>
                <input
                  type="number"
                  id="guitar-value-input"
                  placeholder="e.g. 3500"
                  value={estimatedValue}
                  onChange={e => setEstimatedValue(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.usageLevel}</label>
                <select
                  id="guitar-usage-select"
                  value={usageLevel}
                  onChange={e => setUsageLevel(e.target.value as UsageLevel)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="light">{t.light}</option>
                  <option value="regular">{t.regular}</option>
                  <option value="heavy">{t.heavy}</option>
                </select>
              </div>
            </div>

            {/* Status (Archived, Active) */}
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5">{t.collectionStatusLabel}</label>
              <select
                id="guitar-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as GuitarStatus)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="active">{t.activeCollectionState}</option>
                <option value="archived">{t.archivedGuitarsState}</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5">{t.additionalNotes}</label>
              <textarea
                id="guitar-notes-textarea"
                rows={3}
                placeholder={t.additionalNotesPlaceholder}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Defaults Section (only for adding new instrument) */}
        {!isEditing && (
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-500 font-display uppercase tracking-wider">
                {t.prefillMaintenanceHeader}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {t.prefillMaintenanceSubtext}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Last String Change Date */}
              <div className="border-t border-neutral-850 pt-3.5 space-y-3">
                <span className="block text-xs font-bold text-white uppercase tracking-wider">{t.stringsLabel} Prefill</span>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">{t.lastStringChangeDateLabel}</label>
                  <input
                    type="date"
                    id="guitar-last-strings-date"
                    value={lastStringChangeDate}
                    onChange={e => setLastStringChangeDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  />
                </div>

                {lastStringChangeDate && (
                  <div className="grid grid-cols-3 gap-2 animate-fade-in">
                    <div>
                      <label className="block text-neutral-500 font-medium mb-1">{t.stringBrandLabel}</label>
                      <input
                        type="text"
                        id="guitar-string-brand-input"
                        placeholder="e.g. Elixir"
                        value={stringBrand}
                        onChange={e => setStringBrand(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-500 font-medium mb-1">{t.stringTypeLabel}</label>
                      <input
                        type="text"
                        id="guitar-string-type-input"
                        placeholder="e.g. Nanoweb"
                        value={stringType}
                        onChange={e => setStringType(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-500 font-medium mb-1">{t.stringGaugeLabel}</label>
                      <input
                        type="text"
                        id="guitar-string-gauge-input"
                        placeholder="e.g. 10-46"
                        value={stringGauge}
                        onChange={e => setStringGauge(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Last Setup Date */}
              <div className="border-t border-neutral-850 pt-3.5 space-y-3">
                <span className="block text-xs font-bold text-white uppercase tracking-wider">{t.setupLabel} Prefill</span>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">{t.lastSetupDateLabel}</label>
                  <input
                    type="date"
                    id="guitar-last-setup-date"
                    value={lastSetupDate}
                    onChange={e => setLastSetupDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  />
                </div>

                {lastSetupDate && (
                  <div className="space-y-3.5 animate-fade-in">
                    <label className="block text-neutral-400 font-medium">{t.setupTasksDetails}</label>
                    
                    <div className="grid grid-cols-2 gap-2 p-2 bg-neutral-950 border border-neutral-850 rounded-lg" id="setup-tasks-checkboxes">
                      {checklistCategories.map((item, index) => {
                        const translatedLabel = getSetupItemLabel(item);
                        const isChecked = setupDetailChips.includes(translatedLabel);
                        return (
                          <button
                            key={index}
                            type="button"
                            id={`setup-checkbox-btn-${index}`}
                            onClick={() => toggleSetupItem(item)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer border ${
                              isChecked 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/35 font-semibold' 
                                : 'bg-transparent text-neutral-400 border-transparent hover:bg-neutral-900'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-amber-500 border-amber-500' : 'border-neutral-700 bg-neutral-950'
                            }`}>
                              {isChecked && <Check className="h-2.5 w-2.5 text-neutral-950 stroke-[3]" />}
                            </div>
                            <span className="text-[10px] leading-tight truncate">{translatedLabel}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-medium mb-1.5">{settings.language === 'ko' ? '기타 / 추가 작업 내용' : 'Other / Special Custom Adjustments'}</label>
                      <input
                        type="text"
                        id="log-setup-custom-adjust"
                        placeholder={settings.language === 'ko' ? '예: 캐비티 쉴딩 작업, 콘덴서 교체 등' : 'e.g. Shielded cavities, replaced capacitors'}
                        value={newChipText}
                        onChange={e => setNewChipText(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete button (only when editing) */}
        {isEditing && onDelete && (
          <button
            type="button"
            id="delete-guitar-main-btn"
            onClick={() => {
              onDelete(guitarId);
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-600/10 hover:bg-red-600/20 active:bg-red-600/30 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t.deleteInstrument}</span>
          </button>
        )}

      </form>

      {/* Preset Pick Modal */}
      <ImagePresetsModal
        isOpen={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        onSelectImage={(url) => setImage(url)}
      />
    </div>
  );
}
