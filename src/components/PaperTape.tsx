import React, { useRef, useEffect } from 'react';
import { TapeEntry } from '../utils/calculator';
import { Copy, Trash2, Download, ArrowDownToLine, ReceiptText } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PaperTapeProps {
  entries: TapeEntry[];
  onSelectResult: (val: string) => void;
  onClearTape: () => void;
  isOpen: boolean;
  onClose?: () => void;
  theme: 'graphite' | 'beige' | 'braun' | 'vfd';
}

export const PaperTape: React.FC<PaperTapeProps> = ({
  entries,
  onSelectResult,
  onClearTape,
  isOpen,
  theme,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Auto-scroll to bottom of tape on new entries
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playClick('action');
    if (entries.length === 0) return;

    const text = entries
      .map((e) => {
        if (e.leftOperand && e.operator && e.rightOperand) {
          return `${e.leftOperand} ${e.operator} ${e.rightOperand} = ${e.result}`;
        }
        if (e.operator && e.rightOperand) {
          return `${e.operator} ${e.rightOperand} = ${e.result}`;
        }
        return `${e.label ? `[${e.label}] ` : ''}${e.result}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sounds.playClick('action');
    if (entries.length === 0) return;

    const dateStr = new Date().toLocaleDateString();
    const header = `=================================\n  12-DIGIT DESK CALCULATOR TAPE\n  Date: ${dateStr}\n=================================\n\n`;
    const body = entries
      .map((e, idx) => {
        const time = e.timestamp;
        const line = e.leftOperand && e.operator
          ? `${e.leftOperand} ${e.operator} ${e.rightOperand || ''} = ${e.result}`
          : `${e.label || ''} ${e.result}`;
        return `[${time}] #${String(idx + 1).padStart(3, '0')} : ${line}`;
      })
      .join('\n');

    const blob = new Blob([header + body + '\n\n=================================\n'], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator-tape-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Styling based on theme
  const getTapeStyle = () => {
    switch (theme) {
      case 'beige':
        return {
          wrapper: 'bg-[#f7f5ef] border-[#d8d3c5] text-stone-800',
          paper: 'bg-[#fbfaf6] shadow-sm text-stone-800',
          borderDotted: 'border-stone-300',
          lineHover: 'hover:bg-amber-100/60',
          stampColor: 'text-amber-800',
        };
      case 'vfd':
        return {
          wrapper: 'bg-[#060c09] border-emerald-950 text-emerald-400',
          paper: 'bg-[#030705] text-emerald-300',
          borderDotted: 'border-emerald-950',
          lineHover: 'hover:bg-emerald-950/40',
          stampColor: 'text-emerald-500',
        };
      case 'braun':
        return {
          wrapper: 'bg-[#181818] border-stone-800 text-stone-300',
          paper: 'bg-[#1e1e1e] text-stone-200',
          borderDotted: 'border-stone-800',
          lineHover: 'hover:bg-stone-800/80',
          stampColor: 'text-amber-400',
        };
      default:
        return {
          wrapper: 'bg-slate-900 border-slate-800 text-slate-200',
          paper: 'bg-slate-950/70 text-slate-100',
          borderDotted: 'border-slate-800',
          lineHover: 'hover:bg-slate-800/80',
          stampColor: 'text-amber-400',
        };
    }
  };

  const style = getTapeStyle();

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border p-4 shadow-xl ${style.wrapper} transition-colors`}
    >
      {/* Tape Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-current/10">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 opacity-75" />
          <h2 className="text-sm font-semibold tracking-wide">Paper Audit Tape</h2>
          <span className="text-[10px] font-mono opacity-50">
            ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={entries.length === 0}
            title="Copy tape to clipboard"
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={entries.length === 0}
            title="Export tape as text file"
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick('action');
              onClearTape();
            }}
            disabled={entries.length === 0}
            title="Tear off / Clear tape"
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {copied && (
        <div className="my-2 py-1 px-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs rounded-md text-center">
          Tape copied to clipboard!
        </div>
      )}

      {/* Tape Receipt Body */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto custom-scrollbar my-2 p-3 rounded-xl font-digital text-xs leading-relaxed ${style.paper} select-text`}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-8 select-none">
            <ArrowDownToLine className="w-6 h-6 mb-2" />
            <p className="text-xs">Tape roll is clean.</p>
            <p className="text-[10px] mt-0.5">Calculations will be printed here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] opacity-40 text-center tracking-widest border-b border-dashed border-current/20 pb-1">
              * * * TAPE START * * *
            </div>

            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => {
                  sounds.playClick('num');
                  onSelectResult(entry.result);
                }}
                title="Click to load this value into calculator"
                className={`group cursor-pointer p-2 rounded-lg transition-colors border border-transparent hover:border-current/15 ${style.lineHover}`}
              >
                {/* Meta line */}
                <div className="flex items-center justify-between text-[10px] opacity-40 font-mono mb-0.5">
                  <span>{entry.timestamp}</span>
                  {entry.label && (
                    <span className="uppercase font-semibold tracking-wider text-[9px]">
                      [{entry.label}]
                    </span>
                  )}
                </div>

                {/* Calculation row */}
                {entry.leftOperand && entry.operator ? (
                  <div className="flex flex-col text-right">
                    <div className="opacity-75">
                      {entry.leftOperand}
                    </div>
                    <div className="flex items-center justify-between text-right opacity-90">
                      <span className="font-bold opacity-60">{entry.operator}</span>
                      <span>{entry.rightOperand}</span>
                    </div>
                    <div className="border-t border-dashed border-current/25 my-1" />
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span className="opacity-40 text-xs">=</span>
                      <span className={style.stampColor}>{entry.result}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span className="opacity-50 text-xs">RESULT</span>
                    <span className={style.stampColor}>{entry.result}</span>
                  </div>
                )}
              </div>
            ))}

            <div className="text-[10px] opacity-40 text-center tracking-widest border-t border-dashed border-current/20 pt-1">
              * * * FEED END * * *
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 text-center text-[10px] opacity-40 select-none">
        Tip: Click any printed total to recall it into the display
      </div>
    </div>
  );
};
