import React from 'react';
import { AlertTriangle, Clock, Check } from 'lucide-react';
import { AppSettings } from '../types';
import { translations } from '../translations';

interface SummaryCardsProps {
  overdueCount: number;
  dueSoonCount: number;
  allGoodCount: number;
  activeFilter: 'all' | 'red' | 'yellow' | 'green';
  onFilterChange: (filter: 'all' | 'red' | 'yellow' | 'green') => void;
  settings?: AppSettings;
}

export default function SummaryCards({
  overdueCount,
  dueSoonCount,
  allGoodCount,
  activeFilter,
  onFilterChange,
  settings
}: SummaryCardsProps) {
  const t = translations[settings?.language || 'en'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full" id="summary-cards-container">
      {/* Overdue Card */}
      <button
        type="button"
        id="summary-card-overdue"
        onClick={() => onFilterChange(activeFilter === 'red' ? 'all' : 'red')}
        className={`flex flex-col items-start p-2.5 px-3 rounded-xl border text-left cursor-pointer transition-all ${
          activeFilter === 'red'
            ? 'bg-[#1A1A1A] border-l-4 border-red-500 border-y-white/10 border-r-white/10 shadow-2xl ring-1 ring-red-500/20'
            : 'bg-[#1A1A1A] border-white/5 border-l-4 border-neutral-800 hover:border-l-red-500/40 hover:bg-[#202020]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-xl font-bold font-display text-red-500">{overdueCount}</span>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">{t.overdue}</span>
      </button>

      {/* Due Soon Card */}
      <button
        type="button"
        id="summary-card-due-soon"
        onClick={() => onFilterChange(activeFilter === 'yellow' ? 'all' : 'yellow')}
        className={`flex flex-col items-start p-2.5 px-3 rounded-xl border text-left cursor-pointer transition-all ${
          activeFilter === 'yellow'
            ? 'bg-[#1A1A1A] border-l-4 border-amber-500 border-y-white/10 border-r-white/10 shadow-2xl ring-1 ring-amber-500/20'
            : 'bg-[#1A1A1A] border-white/5 border-l-4 border-neutral-800 hover:border-l-amber-500/40 hover:bg-[#202020]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-xl font-bold font-display text-amber-500">{dueSoonCount}</span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">{t.dueSoon}</span>
      </button>

      {/* All Good Card */}
      <button
        type="button"
        id="summary-card-all-good"
        onClick={() => onFilterChange(activeFilter === 'green' ? 'all' : 'green')}
        className={`flex flex-col items-start p-2.5 px-3 rounded-xl border text-left cursor-pointer transition-all ${
          activeFilter === 'green'
            ? 'bg-[#1A1A1A] border-l-4 border-green-500 border-y-white/10 border-r-white/10 shadow-2xl ring-1 ring-green-500/20'
            : 'bg-[#1A1A1A] border-white/5 border-l-4 border-neutral-800 hover:border-l-green-500/40 hover:bg-[#202020]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-xl font-bold font-display text-emerald-500">{allGoodCount}</span>
          <Check className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">{t.allGood}</span>
      </button>
    </div>
  );
}
