import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'graphite' | 'beige' | 'braun' | 'vfd';
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 – 9', desc: 'Number keys' },
    { key: '.', desc: 'Decimal point' },
    { key: '+  −  *  /', desc: 'Basic arithmetic operators' },
    { key: 'Enter or =', desc: 'Calculate result / Equals' },
    { key: 'Backspace', desc: 'Delete last digit (Backspace)' },
    { key: 'Escape', desc: 'All Clear (AC)' },
    { key: 'c', desc: 'Clear entry (C / CE)' },
    { key: '%', desc: 'Percentage calculation' },
    { key: 's or r', desc: 'Square root (√)' },
    { key: 'm', desc: 'Memory Add (M+)' },
    { key: 'Shift + M', desc: 'Memory Subtract (M-)' },
    { key: 'l', desc: 'Memory Recall (MR)' },
    { key: 't', desc: 'TAX+ (Add sales tax)' },
    { key: 'Shift + T', desc: 'TAX− (Pre-tax price)' },
  ];

  const getThemeClass = () => {
    if (theme === 'beige') return 'bg-[#f7f5ef] text-stone-800 border-stone-300';
    if (theme === 'vfd') return 'bg-stone-950 text-emerald-300 border-emerald-900';
    if (theme === 'braun') return 'bg-stone-900 text-stone-100 border-stone-800';
    return 'bg-slate-900 text-slate-100 border-slate-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${getThemeClass()} transition-colors`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-current/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 opacity-75" />
            <h3 className="text-sm font-semibold tracking-wide">Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-current/5 text-xs"
            >
              <kbd className="px-2 py-1 font-mono text-[11px] font-semibold rounded bg-current/10 border border-current/15 shadow-xs">
                {sc.key}
              </kbd>
              <span className="opacity-70 text-right">{sc.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-current/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
