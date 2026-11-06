import React from 'react';
import { Operator } from '../utils/calculator';

interface DisplayProps {
  mainValue: string;
  expression: string;
  activeOperator: Operator;
  hasMemory: boolean;
  hasGrandTotal: boolean;
  isError: boolean;
  isTaxMode?: 'TAX+' | 'TAX-' | null;
  theme: 'graphite' | 'beige' | 'braun' | 'vfd';
  digitCount: number;
}

export const Display: React.FC<DisplayProps> = ({
  mainValue,
  expression,
  activeOperator,
  hasMemory,
  hasGrandTotal,
  isError,
  isTaxMode,
  theme,
  digitCount,
}) => {
  // Determine screen styling based on theme
  const getScreenStyles = () => {
    switch (theme) {
      case 'beige':
        return {
          bezel: 'bg-[#b8b3a4] border-t-2 border-l-2 border-[#948f80] border-b-2 border-r-2 border-[#d5cfc2]',
          screenBg: 'bg-[#cad3c4]',
          screenInnerShadow: 'shadow-[inset_2px_2px_6px_rgba(0,0,0,0.25),inset_-1px_-1px_3px_rgba(255,255,255,0.4)]',
          textColor: 'text-[#1c221a]',
          fadedColor: 'text-[#1c221a]/15',
          activeIndicator: 'text-[#1c221a] font-bold',
          solarBezel: 'bg-[#3b3832]',
          solarCell: 'bg-[#564e43] border-[#312c24]',
        };
      case 'braun':
        return {
          bezel: 'bg-[#181818] border-t border-l border-white/5 border-b border-r border-black/40',
          screenBg: 'bg-[#111311]',
          screenInnerShadow: 'shadow-[inset_1px_1px_5px_rgba(0,0,0,0.8)]',
          textColor: 'text-[#96a894]',
          fadedColor: 'text-[#96a894]/12',
          activeIndicator: 'text-[#c8dec5] font-bold',
          solarBezel: 'bg-[#0f0f0f]',
          solarCell: 'bg-[#1e1c19] border-[#0a0a0a]',
        };
      case 'vfd':
        return {
          bezel: 'bg-[#0a0f0d] border border-emerald-950/60',
          screenBg: 'bg-[#030a06]',
          screenInnerShadow: 'shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]',
          textColor: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          fadedColor: 'text-emerald-950/40',
          activeIndicator: 'text-emerald-300 font-bold drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]',
          solarBezel: 'bg-[#060a08]',
          solarCell: 'bg-[#0b1611] border-[#040806]',
        };
      default: // graphite
        return {
          bezel: 'bg-slate-900/90 border border-slate-700/60',
          screenBg: 'bg-[#0e161a]',
          screenInnerShadow: 'shadow-[inset_2px_2px_8px_rgba(0,0,0,0.6)]',
          textColor: 'text-amber-100',
          fadedColor: 'text-slate-700/30',
          activeIndicator: 'text-amber-400 font-bold',
          solarBezel: 'bg-slate-950',
          solarCell: 'bg-[#2a221b] border-[#18130e]',
        };
    }
  };

  const style = getScreenStyles();
  const isNegative = mainValue.startsWith('-');
  const displayNum = isNegative ? mainValue.slice(1) : mainValue;

  return (
    <div className="w-full select-none">
      {/* Top Solar Panel strip & Brand badge */}
      <div className="flex items-center justify-between px-3 py-1 mb-1.5 opacity-90">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono tracking-widest uppercase font-semibold opacity-70">
            12-DIGIT
          </span>
          <span className="text-[9px] tracking-wider px-1.5 py-0.2 rounded border border-current opacity-40 font-mono">
            TWO WAY POWER
          </span>
        </div>

        {/* Photovoltaic Solar Cells (Iconic desk calculator feature) */}
        <div className={`flex items-center gap-1 p-1 rounded ${style.solarBezel} border border-black/30`}>
          <div className={`w-3.5 h-3.5 rounded-[1px] border ${style.solarCell}`} />
          <div className={`w-3.5 h-3.5 rounded-[1px] border ${style.solarCell}`} />
          <div className={`w-3.5 h-3.5 rounded-[1px] border ${style.solarCell}`} />
          <div className={`w-3.5 h-3.5 rounded-[1px] border ${style.solarCell}`} />
        </div>
      </div>

      {/* Angled Display Glass Enclosure */}
      <div className={`p-2.5 rounded-xl ${style.bezel} transition-colors`}>
        <div
          className={`relative p-3.5 md:p-4 rounded-lg ${style.screenBg} ${style.screenInnerShadow} transition-colors overflow-hidden`}
        >
          {/* Annunciator Header Bar */}
          <div className="flex items-center justify-between text-[11px] font-digital tracking-wider mb-1">
            <div className="flex items-center gap-2.5">
              {/* Memory Indicator */}
              <span
                className={`transition-opacity duration-150 ${
                  hasMemory ? style.activeIndicator : style.fadedColor
                }`}
                title={hasMemory ? 'Memory Loaded (MR/MC)' : 'Memory Clear'}
              >
                M
              </span>

              {/* Minus Sign Indicator */}
              <span
                className={`transition-opacity duration-150 ${
                  isNegative ? style.activeIndicator : style.fadedColor
                }`}
              >
                −
              </span>

              {/* Error Indicator */}
              <span
                className={`transition-opacity duration-150 ${
                  isError ? 'text-rose-500 font-extrabold animate-pulse' : style.fadedColor
                }`}
              >
                E
              </span>

              {/* Grand Total Indicator */}
              <span
                className={`transition-opacity duration-150 ${
                  hasGrandTotal ? style.activeIndicator : style.fadedColor
                }`}
              >
                GT
              </span>

              {/* Tax Mode Indicator */}
              {isTaxMode && (
                <span className={`${style.activeIndicator} text-[10px] uppercase font-bold`}>
                  {isTaxMode}
                </span>
              )}
            </div>

            {/* Expression or Active Operator */}
            <div className="flex items-center gap-1.5 text-right font-digital text-xs max-w-[65%] truncate">
              <span className="opacity-70 truncate">{expression}</span>
              {activeOperator && (
                <span className={`px-1 rounded text-xs ${style.activeIndicator}`}>
                  {activeOperator}
                </span>
              )}
            </div>
          </div>

          {/* Main 12-Digit Readout */}
          <div className="flex items-baseline justify-end overflow-hidden pt-1 pb-1">
            <span
              className={`font-digital font-bold tracking-tight text-right transition-all tabular-nums ${style.textColor} ${
                displayNum.length > 13
                  ? 'text-2xl md:text-3xl'
                  : displayNum.length > 10
                  ? 'text-3xl md:text-4xl'
                  : 'text-4xl md:text-5xl'
              }`}
            >
              {isNegative && '−'}
              {displayNum}
            </span>
          </div>

          {/* Bottom 12-Digit Position Slot Guide */}
          <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[9px] font-digital opacity-40">
            <span className="tracking-widest">DIGITS</span>
            <div className="flex items-center gap-1">
              <span className={digitCount > 0 ? 'opacity-90 font-semibold' : 'opacity-40'}>
                {digitCount}/12
              </span>
              <span className="tracking-tight">
                · · · · · · · · · · · ·
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
