import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, Wrench, Calendar, DollarSign } from 'lucide-react';
import { Guitar, MaintenanceEvent, AppSettings } from '../types';
import { translations } from '../translations';

interface LogMaintenanceViewProps {
  guitarId: string;
  guitars: Guitar[];
  events: MaintenanceEvent[];
  customTypes: string[];
  settings: AppSettings;
  initialType?: string; // Preselected type (e.g., String Change)
  editEventId?: string; // Edit existing event ID
  onBack: () => void;
  onSave: (event: Omit<MaintenanceEvent, 'id'> & { id?: string }) => void;
}

export default function LogMaintenanceView({
  guitarId,
  guitars,
  events,
  customTypes,
  settings,
  initialType,
  editEventId,
  onBack,
  onSave
}: LogMaintenanceViewProps) {
  const t = translations[settings.language || 'en'];
  const guitar = guitars.find(g => g.id === guitarId);

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

  const eventToEdit = editEventId ? events.find(e => e.id === editEventId) : null;

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

  // Form States
  const maintenanceType = eventToEdit ? eventToEdit.maintenanceType : (initialType || 'Setup / Service');
  const [date, setDate] = useState(() => eventToEdit ? eventToEdit.date : new Date().toISOString().split('T')[0]); // Default to today
  const [notes, setNotes] = useState(() => eventToEdit ? eventToEdit.notes || '' : '');
  const [cost, setCost] = useState<number | ''>(() => eventToEdit && eventToEdit.cost !== undefined ? eventToEdit.cost : '');
  const [performedBy, setPerformedBy] = useState(() => {
    if (eventToEdit) return eventToEdit.performedBy || '';
    return settings.language === 'ko' ? '자가 정비' : 'Self';
  });

  // String Change specific states
  const [stringBrand, setStringBrand] = useState(() => eventToEdit ? eventToEdit.stringBrand || '' : '');
  const [stringType, setStringType] = useState(() => eventToEdit ? eventToEdit.stringType || '' : '');
  const [stringGauge, setStringGauge] = useState(() => eventToEdit ? eventToEdit.stringGauge || '' : '');

  // Setup / Service specific states (interactive checklists)
  const [checkedSetupItems, setCheckedSetupItems] = useState<string[]>([]);
  const [otherSetupDetails, setOtherSetupDetails] = useState('');

  // Initialize fields
  useEffect(() => {
    if (eventToEdit) {
      if (eventToEdit.maintenanceType !== 'String Change') {
        const details = eventToEdit.details || '';
        const items: string[] = [];
        const setupCategories = customTypes.filter(type => type !== 'String Change' && type !== 'Setup / Service');
        const splitDetails = details.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        setupCategories.forEach(item => {
          const itemLabel = getSetupItemLabel(item);
          if (splitDetails.some(d => d === item || d === itemLabel)) {
            items.push(item);
          }
        });
        setCheckedSetupItems(items);

        // Extract details not matching checkboxes to otherSetupDetails
        const unmatched = splitDetails.filter(d => {
          const isPlaceholder = [
            'Setup / Maintenance: Details Unspecified',
            'Setup & general adjustments',
            'General full service and relief setup',
            '셋업 / 정비: 상세 미지정',
            '종합 전체 셋업 및 조정'
          ].includes(d);
          if (isPlaceholder) return false;

          return !setupCategories.some(cat => {
            const catLabel = getSetupItemLabel(cat);
            return d === cat || d === catLabel;
          });
        });
        if (unmatched.length > 0) {
          setOtherSetupDetails(unmatched.join(', '));
        }
      }
    } else {
      const guitarEvents = events.filter(e => e.guitarId === guitarId);
      
      const prevStrings = guitarEvents
        .filter(e => e.maintenanceType === 'String Change')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (prevStrings && maintenanceType === 'String Change') {
        setStringBrand(prevStrings.stringBrand || '');
        setStringType(prevStrings.stringType || '');
        setStringGauge(prevStrings.stringGauge || '');
      }

      const lastEvent = guitarEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (lastEvent) {
        setPerformedBy(lastEvent.performedBy || (settings.language === 'ko' ? '자가 정비' : 'Self'));
      } else {
        setPerformedBy(settings.language === 'ko' ? '자가 정비' : 'Self');
      }
    }
  }, [guitarId, events, settings.language, maintenanceType, editEventId]);

  const toggleSetupItem = (item: string) => {
    if (checkedSetupItems.includes(item)) {
      setCheckedSetupItems(checkedSetupItems.filter(i => i !== item));
    } else {
      setCheckedSetupItems([...checkedSetupItems, item]);
    }
  };

  const getMaintTypeLabel = (type: string) => {
    if (type === 'String Change') return t.stringsLabel;
    if (type === 'Setup / Service') return t.setupLabel;
    return type;
  };

  const checklistCategories = customTypes.filter(type => type !== 'String Change' && type !== 'Setup / Service');

  const headerTitle = eventToEdit 
    ? (settings.language === 'ko' ? '정비 기록 수정' : 'Edit Maintenance Record')
    : (maintenanceType === 'String Change' 
      ? t.logStringChange 
      : (maintenanceType === 'Setup / Service' ? t.logSetupService : t.logCustomServiceHeader));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    let finalDetails = '';
    let stringDetailsPayload = {};
    const isKo = settings.language === 'ko';

    if (maintenanceType === 'String Change') {
      if (!stringBrand.trim() && !stringType.trim() && !stringGauge.trim()) {
        finalDetails = isKo ? '스트링 교체: 상세 미지정' : 'Changed strings: Details Unspecified';
      } else {
        const brandStr = stringBrand.trim() || (isKo ? '미지정' : 'Unspecified');
        const typeStr = stringType.trim() ? ` ${stringType.trim()}` : '';
        const gaugeStr = stringGauge.trim() ? ` (${stringGauge.trim()})` : ` (${isKo ? '미지정 게이지' : 'Unspecified Gauge'})`;
        finalDetails = isKo
          ? `스트링 교체완료: ${brandStr}${typeStr}${gaugeStr}`
          : `Changed strings: ${brandStr}${typeStr}${gaugeStr}`;
      }
      stringDetailsPayload = {
        stringBrand: stringBrand.trim() || (isKo ? '미지정' : 'Unspecified'),
        stringType: stringType.trim() || (isKo ? '미지정' : 'Unspecified'),
        stringGauge: stringGauge.trim() || (isKo ? '미지정' : 'Unspecified')
      };
    } else {
      const items = checkedSetupItems.map(getSetupItemLabel);
      if (otherSetupDetails.trim()) {
        items.push(otherSetupDetails.trim());
      }
      finalDetails = items.join(', ') || (isKo ? '셋업 / 정비: 상세 미지정' : 'Setup / Maintenance: Details Unspecified');
    }

    const eventPayload: Omit<MaintenanceEvent, 'id'> & { id?: string } = {
      ...(eventToEdit && { id: editEventId }),
      guitarId,
      date,
      maintenanceType,
      details: finalDetails,
      notes: notes.trim() || undefined,
      cost: cost ? Number(cost) : undefined,
      performedBy: performedBy.trim() || undefined,
      ...stringDetailsPayload
    };

    onSave(eventPayload);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 pb-24" id="log-maintenance-container">
      {/* Navbar Header */}
      <div className="px-5 pb-4 safe-pt bg-neutral-900 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="log-maint-back-btn"
            onClick={onBack}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold font-display tracking-tight text-white">{headerTitle}</h1>
            <p className="text-[10px] text-neutral-400 font-mono tracking-tight font-semibold uppercase">{guitar?.brand} {guitar?.model}</p>
          </div>
        </div>
        
        <button
          type="button"
          id="log-maint-save-check"
          onClick={handleSubmit}
          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          title={t.saveMaintenanceLog}
        >
          <Check className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5 max-w-lg mx-auto w-full text-xs">
        
        {/* Date Field */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
          <h3 className="text-[10px] font-bold text-emerald-400 font-display uppercase tracking-wider">
            {settings.language === 'ko' ? '기본 정비 사항' : 'Essential Details'}
          </h3>

          <div>
            <label className="block text-neutral-400 font-medium mb-1.5">
              {maintenanceType === 'String Change' 
                ? (settings.language === 'ko' ? '스트링 교체 날짜' : 'String change date') 
                : t.serviceDateLabel}
            </label>
            <input
              type="date"
              id="log-date-picker"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            />
          </div>
        </div>

        {/* Dynamic Fields: Setup Checklist vs String Change */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 font-display uppercase tracking-wider">
            <span>{settings.language === 'ko' ? '세부 정비 사양' : 'Action Specifications'}</span>
          </div>

          {maintenanceType === 'String Change' ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.stringBrandLabel}</label>
                <input
                  type="text"
                  id="log-string-brand"
                  placeholder="e.g. Elixir"
                  value={stringBrand}
                  onChange={e => setStringBrand(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">{t.stringTypeLabel}</label>
                  <input
                    type="text"
                    id="log-string-type"
                    placeholder="e.g. Nanoweb"
                    value={stringType}
                    onChange={e => setStringType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">{t.stringGaugeLabel}</label>
                  <input
                    type="text"
                    id="log-string-gauge"
                    placeholder="e.g. 10-46"
                    value={stringGauge}
                    onChange={e => setStringGauge(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 animate-fade-in">
              <label className="block text-neutral-400 font-medium">{t.setupTasksDetails}</label>
              
              <div className="grid grid-cols-2 gap-2 p-2 bg-neutral-950 border border-neutral-850 rounded-lg" id="setup-tasks-checkboxes">
                {checklistCategories.map((item, index) => {
                  const isChecked = checkedSetupItems.includes(item);
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
                      <span className="text-[10px] leading-tight truncate">{getSetupItemLabel(item)}</span>
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
                  value={otherSetupDetails}
                  onChange={e => setOtherSetupDetails(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Metadata section (cost, performer, general notes) */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
          <h3 className="text-[10px] font-bold text-neutral-400 font-display uppercase tracking-wider">
            {settings.language === 'ko' ? '정비 비용 및 작업자 정보' : 'Metadata & Logs'}
          </h3>

          <div className="space-y-4">
            {/* Cost & PerformedBy row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.serviceCostLabel} ({currencySymbol})</label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-neutral-500 font-semibold">{currencySymbol}</div>
                  <input
                    type="number"
                    id="log-cost-input"
                    placeholder="0.00"
                    min={0}
                    value={cost}
                    onChange={e => setCost(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg pr-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500/50 ${currencySymbol.length > 1 ? 'pl-11' : 'pl-6'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">{t.performedByLabel}</label>
                <input
                  type="text"
                  id="log-performer-input"
                  placeholder={settings.language === 'ko' ? '예: 자가 정비, 리페어 전문점' : 'e.g. Self, Auckland Luthier'}
                  value={performedBy}
                  onChange={e => setPerformedBy(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Event Notes */}
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5">{settings.language === 'ko' ? '추가 관찰 메모 및 특이사항 (선택사항)' : 'Additional Notes / Observations (Optional)'}</label>
              <textarea
                id="log-notes-textarea"
                rows={2}
                placeholder={settings.language === 'ko' ? '예: 목재가 건조했음, 넥 조정이 아주 조금 필요했음...' : 'e.g. Wood was dry, neck was bowed...'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500/50 leading-relaxed"
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
