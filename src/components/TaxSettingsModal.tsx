import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TaxSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxRate: number;
  onSaveTaxRate: (rate: number) => void;
  theme: 'graphite' | 'beige' | 'braun' | 'vfd';
}

export const TaxSettingsModal: React.FC<TaxSettingsModalProps> = ({
  isOpen,
  onClose,
  taxRate,
  onSaveTaxRate,
  theme,
}) => {
  const [val, setVal] = useState(taxRate.toString());

  if (!isOpen) return null;

  const presets = [5, 7.5, 8.25, 10, 13, 15, 20];

  const handleSave = (newRate: number) => {
    sounds.playClick('action');
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
      onSaveTaxRate(newRate);
      onClose();
    }
  };

  const getThemeClass = () => {
    if (theme === 'beige') return 'bg-[#f7f5ef] text-stone-800 border-stone-300';
    if (theme === 'vfd') return 'bg-stone-950 text-emerald-300 border-emerald-900';
    if (theme === 'braun') return 'bg-stone-900 text-stone-100 border-stone-800';
    return 'bg-slate-900 text-slate-100 border-slate-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${getThemeClass()} transition-colors`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-current/10">
          <h3 className="text-sm font-semibold tracking-wide">Sales Tax / VAT Rate</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium opacity-70 mb-1.5">
              Enter Tax Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(parseFloat(val));
                }}
                className="w-full px-3 py-2 text-base font-digital rounded-lg border border-current/20 bg-black/10 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              <span className="absolute right-3 top-2.5 text-sm opacity-50 font-bold">%</span>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium opacity-60 mb-1.5">Quick Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setVal(p.toString());
                    handleSave(p);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md border border-current/20 hover:border-current/50 transition-colors ${
                    parseFloat(val) === p ? 'bg-amber-400/20 font-bold' : ''
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-current/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg opacity-70 hover:opacity-100 transition-opacity"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(parseFloat(val))}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Save Rate
          </button>
        </div>
      </div>
    </div>
  );
};
