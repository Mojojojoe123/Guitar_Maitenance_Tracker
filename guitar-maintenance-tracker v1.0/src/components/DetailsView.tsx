import React, { useState } from 'react';
import { ArrowLeft, Edit2, Calendar, Hammer, Wrench, ShieldAlert, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Guitar, MaintenanceEvent, ThresholdSetting, AppSettings } from '../types';
import { getGuitarMaintenanceDetails, formatLongDuration, formatDateHuman, formatCurrency } from '../utils';
import CircularRing from './CircularRing';
import { translations } from '../translations';

interface DetailsViewProps {
  guitar: Guitar;
  events: MaintenanceEvent[];
  thresholds: ThresholdSetting[];
  settings: AppSettings;
  onBack: () => void;
  onEdit: (id: string) => void;
  onLogMaintenance: (id: string, initialType?: string) => void;
  onEditEvent?: (guitarId: string, eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function DetailsView({
  guitar,
  events,
  thresholds,
  settings,
  onBack,
  onEdit,
  onLogMaintenance,
  onEditEvent,
  onDeleteEvent,
  scrollRef
}: DetailsViewProps) {
  const t = translations[settings.language || 'en'];
  const [historyFilter, setHistoryFilter] = useState<string>('All');
  const [showFullSpecs, setShowFullSpecs] = useState<boolean>(false);

  const details = getGuitarMaintenanceDetails(guitar, events, thresholds);
  const guitarEvents = events
    .filter(e => e.guitarId === guitar.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // String change latest details
  const stringEvents = guitarEvents.filter(e => e.maintenanceType === 'String Change');
  const latestStringEvent = stringEvents[0] || null;

  // Setup latest details
  const setupEvents = guitarEvents.filter(e => e.maintenanceType === 'Setup / Service');
  const latestSetupEvent = setupEvents[0] || null;

  // Filter history timeline
  const filteredEvents = guitarEvents.filter(e => {
    if (historyFilter === 'All') return true;
    if (historyFilter === 'Strings') return e.maintenanceType === 'String Change';
    if (historyFilter === 'Setups') return e.maintenanceType === 'Setup / Service';
    // Match others
    return e.maintenanceType !== 'String Change' && e.maintenanceType !== 'Setup / Service';
  });

  const getStatusPill = (status: 'green' | 'yellow' | 'red') => {
    const config = {
      red: 'bg-red-500/10 text-red-500 border border-red-500/30 font-bold',
      yellow: 'bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold',
      green: 'bg-green-500/10 text-green-500 border border-green-500/30 font-bold'
    }[status];
    
    const label = {
      red: t.overdue,
      yellow: t.dueSoon,
      green: t.allGood
    }[status];

    return (
      <span className={`px-2.5 py-1 text-[10px] rounded-full tracking-wider font-display uppercase ${config}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]" id="details-view-container">
      {/* Sticky top action header */}
      <div className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-white/5 px-5 pb-3 safe-pt flex items-center justify-between">
        <button
          type="button"
          id="details-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.guitars}</span>
        </button>
        
        <span className="text-xs font-black font-display tracking-tight text-white uppercase max-w-[180px] truncate">
          {guitar.name}
        </span>

        <button
          type="button"
          id="details-edit-icon-btn"
          onClick={() => onEdit(guitar.id)}
          className="p-1.5 rounded-lg text-green-400 hover:text-green-300 transition-colors cursor-pointer"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable details wrapper */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Top Banner */}
        <div className="relative h-48 bg-[#111111] overflow-hidden border-b border-white/5">
          {guitar.image ? (
            <img
              src={guitar.image}
              alt={guitar.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.7] scale-100"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#111111] to-[#0A0A0A] text-neutral-600">
              <span className="text-4xl font-black font-display uppercase tracking-wider">{guitar.brand}</span>
            </div>
          )}
          {/* Soft dark overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0A0A0A]" />
          
          {/* Floating Guitar Name details */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-green-500 font-display tracking-widest uppercase">
                {guitar.brand}
              </span>
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight text-white mb-0.5">
              {guitar.name}
            </h1>
            <p className="text-sm text-neutral-350 font-medium truncate">
              {guitar.model}
            </p>
          </div>
        </div>

        {/* Main Container */}
        <div className="px-5 py-6 space-y-6">
        
        {/* Quick Log Buttons bar */}
        <div className="flex gap-3">
          <button
            type="button"
            id="details-quick-strings-btn"
            onClick={() => onLogMaintenance(guitar.id, 'String Change')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] active:bg-[#111111] border border-white/5 text-xs font-semibold text-green-500 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t.logStringChange}</span>
          </button>
          
          <button
            type="button"
            id="details-quick-setup-btn"
            onClick={() => onLogMaintenance(guitar.id, 'Setup / Service')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] active:bg-[#111111] border border-white/5 text-xs font-semibold text-amber-500 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t.logSetupService}</span>
          </button>
        </div>

        {/* 1. Strings Maintenance Card */}
        <div className="p-4 bg-[#111111] rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CircularRing status={details.stringStatus} size={48} />
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{t.stringsLabel}</h3>
                <p className="text-xs text-neutral-400">
                  {details.lastStringChangeDate 
                    ? (settings.language === 'ko' ? `${formatDateHuman(details.lastStringChangeDate)} 교체완료` : `Changed ${formatDateHuman(details.lastStringChangeDate)}`) 
                    : (settings.language === 'ko' ? '교체 기록 없음' : 'No string changes tracked')
                  }
                </p>
              </div>
            </div>
            {getStatusPill(details.stringStatus)}
          </div>

          <div className="border-t border-white/5 pt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            {latestStringEvent && (
              <>
                <div>
                  <span className="text-neutral-500 mr-1">{settings.language === 'ko' ? '브랜드:' : 'Brand:'}</span>
                  <span className="font-medium text-white">{latestStringEvent.stringBrand || (settings.language === 'ko' ? '미지정' : 'Unspecified')}</span>
                </div>
                <div>
                  <span className="text-neutral-500 mr-1">{settings.language === 'ko' ? '종류:' : 'Type:'}</span>
                  <span className="font-medium text-white">{latestStringEvent.stringType || (settings.language === 'ko' ? '미지정' : 'Unspecified')}</span>
                </div>
                <div>
                  <span className="text-neutral-500 mr-1">{settings.language === 'ko' ? '게이지:' : 'Gauge:'}</span>
                  <span className="font-medium text-white font-mono">{latestStringEvent.stringGauge || (settings.language === 'ko' ? '미지정' : 'Unspecified')}</span>
                </div>
              </>
            )}
            <div>
              <span className="text-neutral-500 mr-1">{settings.language === 'ko' ? '경과 시간:' : 'Time Elapsed:'}</span>
              <span className="font-semibold text-white font-mono">
                {details.lastStringChangeDate ? formatLongDuration(details.lastStringChangeDate) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Setup / Service Maintenance Card */}
        <div className="p-4 bg-[#111111] rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CircularRing status={details.setupStatus} size={48} />
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{t.setupLabel}</h3>
                <p className="text-xs text-neutral-400">
                  {details.lastSetupDate 
                    ? (settings.language === 'ko' ? `${formatDateHuman(details.lastSetupDate)} 정비완료` : `Serviced ${formatDateHuman(details.lastSetupDate)}`) 
                    : (settings.language === 'ko' ? '정비 기록 없음' : 'No service recorded')
                  }
                </p>
              </div>
            </div>
            {getStatusPill(details.setupStatus)}
          </div>

          <div className="border-t border-white/5 pt-3 space-y-2 text-xs">
            <div>
              <span className="text-neutral-500 mr-1">{settings.language === 'ko' ? '경과 시간:' : 'Time Elapsed:'}</span>
              <span className="font-semibold text-white font-mono">
                {details.lastSetupDate ? formatLongDuration(details.lastSetupDate) : 'N/A'}
              </span>
            </div>
            {latestSetupEvent && latestSetupEvent.details && (
              <div>
                <span className="text-neutral-500 mr-1">{settings.language === 'ko' ? '최근 작업 내역:' : 'Latest Scope:'}</span>
                <p className="text-neutral-300 font-medium leading-relaxed mt-1">
                  {latestSetupEvent.details}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Guitar Info Section (Specifications panel always fully expanded) */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white font-display tracking-tight uppercase">{t.guitarSpecifications}</h3>
          </div>

          <div className="px-4 pb-4 pt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.brand}</span>
              <span className="font-semibold text-white">{guitar.brand}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.model}</span>
              <span className="font-semibold text-white">{guitar.model}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{settings.language === 'ko' ? '악기 구분' : 'Type'}</span>
              <span className="font-semibold text-white capitalize">
                {guitar.guitarType === 'electric' ? t.electric : guitar.guitarType === 'acoustic' ? t.acoustic : guitar.guitarType === 'bass' ? t.bass : t.other}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.stringsCount}</span>
              <span className="font-semibold text-white">{guitar.numberOfStrings} {settings.language === 'ko' ? '현' : 'Strings'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.tuningLabel}</span>
              <span className="font-semibold text-white font-mono">{guitar.tuning}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.usageLevel}</span>
              <span className="font-semibold text-white capitalize">
                {guitar.usageLevel === 'light' ? t.light : guitar.usageLevel === 'regular' ? t.regular : t.heavy}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.scaleLength}</span>
              <span className="font-semibold text-white">{guitar.scaleLength || (settings.language === 'ko' ? '미지정' : 'Unspecified')}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.purchaseYear}</span>
              <span className="font-semibold text-white">{guitar.purchaseYear || (settings.language === 'ko' ? '미지정' : 'Unspecified')}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">{t.estimatedValue}</span>
              <span className="font-semibold text-green-500">
                {guitar.estimatedValue ? formatCurrency(guitar.estimatedValue, settings.currency) : (settings.language === 'ko' ? '미지정' : 'Unspecified')}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-neutral-500 block mb-1">{t.specsAndNotes}</span>
              <p className="text-neutral-300 leading-relaxed italic whitespace-pre-wrap bg-[#0A0A0A] p-2.5 rounded-lg border border-white/5">
                {guitar.notes || t.noCustomNotes}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Maintenance History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-tight">{t.maintenanceHistoryTimeline}</h3>
            <span className="text-xs text-neutral-500 font-mono">{t.allLogs} ({guitarEvents.length})</span>
          </div>

          {/* Timeline filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['All', 'Strings', 'Setups'].map((chip) => {
              const chipLabelMap = {
                'All': t.allLogs,
                'Strings': t.stringsLabel,
                'Setups': t.setupLabel
              };
              return (
                <button
                  key={chip}
                  type="button"
                  id={`history-chip-${chip}`}
                  onClick={() => setHistoryFilter(chip)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap border ${
                    historyFilter === chip
                      ? 'bg-green-500 text-black border-green-500'
                      : 'bg-[#1A1A1A] text-white/60 border-white/5 hover:border-white/10 hover:bg-[#202020]'
                  }`}
                >
                  {chipLabelMap[chip as keyof typeof chipLabelMap] || chip}
                </button>
              );
            })}
          </div>

          {/* Timeline content list */}
          {filteredEvents.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 border border-dashed border-white/5 rounded-xl">
              <p className="text-xs">{t.noLogsFound}</p>
            </div>
          ) : (
            <div className="space-y-3.5 relative pl-4 border-l border-white/5" id="history-timeline-list">
              {filteredEvents.map((event) => {
                const isStringChange = event.maintenanceType === 'String Change';
                const isSetup = event.maintenanceType === 'Setup / Service';
                
                return (
                  <div key={event.id} className="relative space-y-1.5 group/item">
                    {/* Circle marker on line */}
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[#0A0A0A] ${
                      isStringChange ? 'bg-green-500' : isSetup ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />

                    <div className="p-3.5 bg-[#111111] border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                            isStringChange ? 'bg-green-500/10 text-green-500' : isSetup ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {isStringChange ? t.stringsLabel : isSetup ? t.setupLabel : event.maintenanceType}
                          </span>
                          <span className="block text-xs font-semibold text-neutral-400 font-mono mt-1">
                            {formatDateHuman(event.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            id={`edit-event-btn-${event.id}`}
                            onClick={() => onEditEvent?.(guitar.id, event.id)}
                            className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                            title={settings.language === 'ko' ? '기록 수정' : 'Edit log'}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            id={`delete-event-btn-${event.id}`}
                            onClick={() => onDeleteEvent(event.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                            title={settings.language === 'ko' ? '기록 삭제' : 'Delete log'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-medium text-white leading-relaxed">
                        {event.details}
                      </p>

                      {event.notes && (
                        <p className="text-xs text-neutral-400 italic bg-[#0A0A0A] p-2 rounded-lg border border-white/5">
                          {event.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-[10px] text-neutral-400 border-t border-white/5 pt-2 font-mono">
                        {event.cost && (
                          <span>{settings.language === 'ko' ? '비용: ' : 'Cost: '}<strong className="text-white">{formatCurrency(event.cost, settings.currency)}</strong></span>
                        )}
                        {event.performedBy && (
                          <span>{settings.language === 'ko' ? '작업자: ' : 'By: '}<strong className="text-white">{event.performedBy}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      </div>
    </div>
  );
}
