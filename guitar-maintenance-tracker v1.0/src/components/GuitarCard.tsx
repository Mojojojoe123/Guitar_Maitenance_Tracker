import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Calendar, Hammer, Eye, Edit2, Archive, ShieldAlert, Sparkles } from 'lucide-react';
import { Guitar, MaintenanceEvent, ThresholdSetting, AppSettings } from '../types';
import { getGuitarMaintenanceDetails, formatCompactDuration } from '../utils';
import { translations } from '../translations';

interface GuitarCardProps {
  key?: any;
  guitar: Guitar;
  events: MaintenanceEvent[];
  thresholds: ThresholdSetting[];
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onLogMaintenance: (id: string, initialType?: string) => void;
  onQuickLogStrings: (id: string) => void;
  onQuickLogSetup: (id: string) => void;
  onArchiveToggle: (id: string) => void;
  settings?: AppSettings;
}

export default function GuitarCard({
  guitar,
  events,
  thresholds,
  onViewDetails,
  onEdit,
  onLogMaintenance,
  onQuickLogStrings,
  onQuickLogSetup,
  onArchiveToggle,
  settings
}: GuitarCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[settings?.language || 'en'];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const details = getGuitarMaintenanceDetails(guitar, events, thresholds);

  // Styling based on overall status
  const statusConfig = {
    red: {
      borderColor: 'border-red-500/30',
      shadowColor: 'shadow-[0_4px_20px_rgba(239,68,68,0.06)]',
      bgGlow: 'bg-[#1A1A1A]',
      dotColor: 'bg-red-500',
      badge: 'RED'
    },
    yellow: {
      borderColor: 'border-amber-500/25',
      shadowColor: 'shadow-[0_4px_20px_rgba(245,158,11,0.04)]',
      bgGlow: 'bg-[#1A1A1A]',
      dotColor: 'bg-amber-500',
      badge: 'YELLOW'
    },
    green: {
      borderColor: 'border-white/5',
      shadowColor: 'shadow-none',
      bgGlow: 'bg-[#1A1A1A]',
      dotColor: 'bg-green-500',
      badge: 'GREEN'
    }
  }[details.overallStatus];

  const stringDotColor = {
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    green: 'bg-green-500'
  }[details.stringStatus];

  const setupDotColor = {
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    green: 'bg-green-500'
  }[details.setupStatus];

  return (
    <div
      id={`guitar-card-${guitar.id}`}
      onClick={() => onViewDetails(guitar.id)}
      className={`relative flex items-center p-1.5 rounded-2xl border ${statusConfig.borderColor} ${statusConfig.shadowColor} bg-[#1A1A1A] hover:bg-[#202020] transition-all duration-300 group cursor-pointer`}
    >
      {/* Highest Priority Indicator Ribbon or Line */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-2xl ${
        details.overallStatus === 'red' ? 'bg-red-500' : details.overallStatus === 'yellow' ? 'bg-amber-500' : 'bg-green-500'
      }`} />

      {/* Left Thumbnail Container - LARGER & FLUSH */}
      <div 
        className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden relative bg-[#111111] border border-white/5 ml-1"
      >
        {guitar.image ? (
          <img
            src={guitar.image}
            alt={guitar.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#111111] text-neutral-500">
            <span className="text-2xl font-bold font-display uppercase">{guitar.brand.substring(0,2) || 'G'}</span>
          </div>
        )}
      </div>

      {/* Right Content Section */}
      <div className="flex-1 min-w-0 pl-3.5 flex flex-col justify-between self-stretch py-1">
        {/* Title / Model */}
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-white tracking-tight break-words pr-2">
              {guitar.name}
            </h3>
            {guitar.status !== 'active' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 uppercase tracking-wider shrink-0">
                {guitar.status}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 break-words mt-0.5 pr-2">{guitar.brand} {guitar.model}</p>
        </div>

        {/* Maintenance Indicators Grid */}
        <div className="grid grid-cols-5 gap-3 mt-2 w-full pr-2">
          {/* Strings Column */}
          <div className="col-span-2 min-w-0">
            <span className="text-[9px] font-semibold text-neutral-500 block uppercase tracking-wide truncate">{t.stringsLabel}</span>
            <span className={`text-xs font-bold font-mono block mt-0.5 truncate ${
              details.stringStatus === 'red' ? 'text-red-500' : details.stringStatus === 'yellow' ? 'text-amber-500' : 'text-green-500'
            }`}>
              {details.lastStringChangeDate ? formatCompactDuration(details.lastStringChangeDate) : t.never}
            </span>
          </div>

          {/* Setup Column */}
          <div className="col-span-3 min-w-0">
            <span className="text-[9px] font-semibold text-neutral-500 block uppercase tracking-wide truncate">{t.setupLabel}</span>
            <span className={`text-xs font-bold font-mono block mt-0.5 truncate ${
              details.setupStatus === 'red' ? 'text-red-500' : details.setupStatus === 'yellow' ? 'text-amber-500' : 'text-green-500'
            }`}>
              {details.lastSetupDate ? formatCompactDuration(details.lastSetupDate) : t.never}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
