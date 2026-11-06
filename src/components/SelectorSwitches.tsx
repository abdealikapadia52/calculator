import React from 'react';
import { DecimalMode, RoundingMode } from '../utils/calculator';
import { sounds } from '../utils/audio';

interface SelectorSwitchesProps {
  roundingMode: RoundingMode;
  decimalMode: DecimalMode;
  onRoundingChange: (mode: RoundingMode) => void;
  onDecimalChange: (mode: DecimalMode) => void;
  theme: 'graphite' | 'beige' | 'braun' | 'vfd';
}

export const SelectorSwitches: React.FC<SelectorSwitchesProps> = ({
  roundingMode,
  decimalMode,
  onRoundingChange,
  onDecimalChange,
  theme,
}) => {
  const roundingOptions: RoundingMode[] = ['UP', '5/4', 'CUT'];
  const decimalOptions: DecimalMode[] = ['F', '4', '3', '2', '0', 'A'];

  const getSliderBg = () => {
    switch (theme) {
      case 'beige':
        return 'bg-[#d8d2c4] border-[#bcbaa9] text-stone-700';
      case 'braun':
        return 'bg-[#1e1e1e] border-stone-800 text-stone-400';
      case 'vfd':
        return 'bg-stone-900 border-emerald-950 text-emerald-400/80';
      default:
        return 'bg-slate-800/90 border-slate-700 text-slate-300';
    }
  };

  const getActiveTab = () => {
    switch (theme) {
      case 'beige':
        return 'bg-[#4a4843] text-amber-200 shadow-sm';
      case 'braun':
        return 'bg-stone-200 text-stone-900 shadow-sm';
      case 'vfd':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm';
      default:
        return 'bg-amber-500 text-slate-950 font-semibold shadow-sm';
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs font-mono select-none">
      {/* Rounding Mode Slider */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] tracking-wider uppercase opacity-60 font-sans font-semibold">
          Round
        </span>
        <div className={`flex items-center p-0.5 rounded border ${getSliderBg()}`}>
          {roundingOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                sounds.playClick('action');
                onRoundingChange(opt);
              }}
              title={
                opt === '5/4'
                  ? 'Round half up (Standard)'
                  : opt === 'CUT'
                  ? 'Truncate / Cut off'
                  : 'Round up'
              }
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                roundingMode === opt ? getActiveTab() : 'hover:opacity-100 opacity-60'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Decimal Mode Slider */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] tracking-wider uppercase opacity-60 font-sans font-semibold">
          Dec
        </span>
        <div className={`flex items-center p-0.5 rounded border ${getSliderBg()}`}>
          {decimalOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                sounds.playClick('action');
                onDecimalChange(opt);
              }}
              title={
                opt === 'F'
                  ? 'Floating decimal'
                  : opt === 'A'
                  ? 'Add mode: automatic 2 decimal places'
                  : `Fixed ${opt} decimal places`
              }
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                decimalMode === opt ? getActiveTab() : 'hover:opacity-100 opacity-60'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
