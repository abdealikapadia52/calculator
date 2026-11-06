import React from 'react';
import { Delete } from 'lucide-react';
import { sounds } from '../utils/audio';

export type KeyId =
  | '0'
  | '00'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '.'
  | '+'
  | '-'
  | '×'
  | '÷'
  | '='
  | 'AC'
  | 'C'
  | 'BACK'
  | '+/-'
  | '%'
  | 'SQRT'
  | 'MC'
  | 'MR'
  | 'M-'
  | 'M+'
  | 'GT'
  | 'TAX+'
  | 'TAX-';

interface KeypadProps {
  onKeyPress: (key: KeyId) => void;
  activeOperatorKey: string | null;
  lastPressedKey: string | null;
  theme: 'graphite' | 'beige' | 'braun' | 'vfd';
  hasMemory: boolean;
  taxRate: number;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  activeOperatorKey,
  lastPressedKey,
  theme,
  hasMemory,
  taxRate,
}) => {
  const handleClick = (key: KeyId) => {
    // Sound & haptic triggers
    if (['+', '-', '×', '÷', '='].includes(key)) {
      sounds.playClick('op');
    } else if (['AC', 'C', 'MC', 'MR', 'M+', 'M-'].includes(key)) {
      sounds.playClick('action');
    } else {
      sounds.playClick('num');
    }
    sounds.vibrate();

    onKeyPress(key);
  };

  // Theme-based key styling
  const getKeyStyles = (type: 'num' | 'op' | 'func' | 'clear' | 'equals' | 'memory') => {
    const isBraun = theme === 'braun';
    const isBeige = theme === 'beige';
    const isVfd = theme === 'vfd';

    // Base button shapes
    const shape = isBraun ? 'rounded-full aspect-square' : 'rounded-lg';

    if (type === 'equals') {
      if (isBraun) {
        return `${shape} bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 font-bold shadow-[0_3px_0_#b45309,0_5px_8px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[2px]`;
      }
      if (isBeige) {
        return `${shape} bg-[#3b423d] hover:bg-[#2c332e] text-emerald-300 font-bold shadow-[0_3px_0_#1e2420,0_4px_6px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[2px]`;
      }
      if (isVfd) {
        return `${shape} bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)] active:translate-y-[2px]`;
      }
      // Graphite default
      return `${shape} bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-[0_3px_0_#b45309,0_5px_10px_rgba(245,158,11,0.25)] active:shadow-none active:translate-y-[2px]`;
    }

    if (type === 'clear') {
      if (isBraun) {
        return `${shape} bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold shadow-[0_3px_0_#7f1d1d] active:shadow-none active:translate-y-[2px]`;
      }
      if (isBeige) {
        return `${shape} bg-[#d9534f] hover:bg-[#c9302c] text-white font-semibold shadow-[0_3px_0_#ac2925] active:shadow-none active:translate-y-[2px]`;
      }
      if (isVfd) {
        return `${shape} bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-semibold shadow-[0_0_8px_rgba(244,63,94,0.2)] active:translate-y-[2px]`;
      }
      return `${shape} bg-rose-600/90 hover:bg-rose-500 text-white font-semibold shadow-[0_3px_0_#9f1239,0_4px_6px_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-[2px]`;
    }

    if (type === 'op') {
      if (isBraun) {
        return `${shape} bg-[#292929] hover:bg-[#333333] text-stone-200 font-semibold shadow-[0_3px_0_#171717] active:shadow-none active:translate-y-[2px]`;
      }
      if (isBeige) {
        return `${shape} bg-[#45423c] hover:bg-[#383530] text-[#f7f5ed] font-semibold shadow-[0_3px_0_#2b2925] active:shadow-none active:translate-y-[2px]`;
      }
      if (isVfd) {
        return `${shape} bg-stone-900/90 hover:bg-stone-800 text-emerald-400 border border-emerald-950 font-semibold shadow-[0_0_6px_rgba(16,185,129,0.1)] active:translate-y-[2px]`;
      }
      return `${shape} bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold shadow-[0_3px_0_#0f172a,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[2px]`;
    }

    if (type === 'memory' || type === 'func') {
      if (isBraun) {
        return `${shape} bg-[#212121] hover:bg-[#2c2c2c] text-stone-300 text-xs font-medium shadow-[0_2px_0_#141414] active:shadow-none active:translate-y-[1px]`;
      }
      if (isBeige) {
        return `${shape} bg-[#d8d3c5] hover:bg-[#cbcaa9] text-stone-800 text-xs font-semibold shadow-[0_2px_0_#aaa699] active:shadow-none active:translate-y-[1px]`;
      }
      if (isVfd) {
        return `${shape} bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400/90 border border-emerald-900/40 text-xs active:translate-y-[1px]`;
      }
      return `${shape} bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium shadow-[0_2px_0_#0f172a] active:shadow-none active:translate-y-[1px]`;
    }

    // Number keys
    if (isBraun) {
      return `${shape} bg-[#383838] hover:bg-[#424242] text-stone-100 font-medium text-lg shadow-[0_3px_0_#222222,0_4px_6px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[2px]`;
    }
    if (isBeige) {
      return `${shape} bg-[#f5f2e8] hover:bg-[#ece7d8] text-stone-800 font-semibold text-lg shadow-[0_3px_0_#c7c2b4,0_3px_5px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[2px]`;
    }
    if (isVfd) {
      return `${shape} bg-stone-900/80 hover:bg-stone-800 text-emerald-300 border border-emerald-900/50 font-medium text-lg shadow-[0_0_6px_rgba(16,185,129,0.15)] active:translate-y-[2px]`;
    }
    return `${shape} bg-slate-700/90 hover:bg-slate-600/90 text-white font-medium text-lg shadow-[0_3px_0_#1e293b,0_4px_6px_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-[2px]`;
  };

  const isBraun = theme === 'braun';

  const renderKey = (
    keyId: KeyId,
    label: React.ReactNode,
    type: 'num' | 'op' | 'func' | 'clear' | 'equals' | 'memory',
    customClass: string = '',
    title?: string
  ) => {
    const isOperatorActive = activeOperatorKey === keyId;
    const isCurrentlyPressed = lastPressedKey === keyId;

    return (
      <button
        type="button"
        onClick={() => handleClick(keyId)}
        title={title}
        className={`relative flex items-center justify-center transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[48px] md:min-h-[52px] ${getKeyStyles(
          type
        )} ${customClass} ${
          isOperatorActive
            ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 !translate-y-[2px] !shadow-none'
            : ''
        } ${
          isCurrentlyPressed ? 'ring-2 ring-white/50 !translate-y-[2px] !shadow-none' : ''
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={`grid grid-cols-5 gap-2 md:gap-2.5 p-2 ${isBraun ? 'max-w-[420px] mx-auto' : ''}`}>
      {/* Row 1: Memory Functions */}
      {renderKey('MC', 'MC', 'memory', hasMemory ? '!text-amber-400' : '', 'Memory Clear')}
      {renderKey('MR', 'MR', 'memory', hasMemory ? '!text-amber-400' : '', 'Memory Recall')}
      {renderKey('M-', 'M−', 'memory', '', 'Memory Subtract')}
      {renderKey('M+', 'M+', 'memory', '', 'Memory Add')}
      {renderKey('BACK', <Delete className="w-4 h-4" />, 'func', '', 'Backspace / Delete digit')}

      {/* Row 2: Tax, Grand Total, Functions */}
      {renderKey(
        'TAX+',
        <span className="flex flex-col items-center leading-none">
          <span className="text-[11px] font-bold">TAX+</span>
          <span className="text-[8px] opacity-75">{taxRate}%</span>
        </span>,
        'func',
        '',
        `Calculate Price with ${taxRate}% Tax`
      )}
      {renderKey(
        'TAX-',
        <span className="flex flex-col items-center leading-none">
          <span className="text-[11px] font-bold">TAX−</span>
          <span className="text-[8px] opacity-75">pre-tax</span>
        </span>,
        'func',
        '',
        `Calculate Pre-Tax Price (-${taxRate}%)`
      )}
      {renderKey('GT', 'GT', 'func', '', 'Grand Total accumulator')}
      {renderKey('SQRT', '√', 'func', '', 'Square root')}
      {renderKey('÷', '÷', 'op', 'text-xl', 'Divide')}

      {/* Row 3: 7 8 9 % × */}
      {renderKey('7', '7', 'num')}
      {renderKey('8', '8', 'num')}
      {renderKey('9', '9', 'num')}
      {renderKey('%', '%', 'func', 'text-sm font-semibold', 'Percent')}
      {renderKey('×', '×', 'op', 'text-xl', 'Multiply')}

      {/* Row 4: 4 5 6 +/- − */}
      {renderKey('4', '4', 'num')}
      {renderKey('5', '5', 'num')}
      {renderKey('6', '6', 'num')}
      {renderKey('+/-', '±', 'func', 'text-lg', 'Change sign')}
      {renderKey('-', '−', 'op', 'text-xl', 'Subtract')}

      {/* Row 5: 1 2 3 C + */}
      {renderKey('1', '1', 'num')}
      {renderKey('2', '2', 'num')}
      {renderKey('3', '3', 'num')}
      {renderKey('C', 'C', 'clear', 'text-base', 'Clear current entry')}
      {renderKey('+', '+', 'op', 'text-xl', 'Add')}

      {/* Row 6: 0 00 . AC = */}
      {renderKey('0', '0', 'num')}
      {renderKey('00', '00', 'num', 'font-normal tracking-tight', 'Double Zero')}
      {renderKey('.', '·', 'num', 'text-2xl font-bold', 'Decimal point')}
      {renderKey('AC', 'AC', 'clear', 'text-base font-bold', 'All Clear')}
      {renderKey('=', '=', 'equals', 'text-2xl', 'Equals / Calculate')}
    </div>
  );
};
