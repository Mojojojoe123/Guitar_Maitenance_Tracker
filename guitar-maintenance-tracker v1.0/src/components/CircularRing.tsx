import React from 'react';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import { MaintenanceStatus } from '../types';

interface CircularRingProps {
  status: MaintenanceStatus;
  size?: number;
  strokeWidth?: number;
}

export default function CircularRing({ status, size = 56, strokeWidth = 4 }: CircularRingProps) {
  // Configs based on status
  const config = {
    green: {
      color: '#10b981', // emerald-500
      glow: 'rgba(16, 185, 129, 0.25)',
      Icon: Check,
    },
    yellow: {
      color: '#f59e0b', // amber-500
      glow: 'rgba(245, 158, 11, 0.25)',
      Icon: Clock,
    },
    red: {
      color: '#ef4444', // red-500
      glow: 'rgba(239, 68, 68, 0.25)',
      Icon: AlertTriangle,
    }
  }[status];

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ width: size, height: size }}
      id={`circular-ring-${status}`}
    >
      {/* Outer SVG circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1f2937" // gray-800
          strokeWidth={strokeWidth}
        />
        {/* Colored progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={config.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={0} // solid full ring
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${config.glow})`,
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      
      {/* Absolute Icon in center */}
      <div className="absolute flex items-center justify-center">
        <config.Icon 
          className="h-5 w-5" 
          style={{ color: config.color }} 
        />
      </div>
    </div>
  );
}
