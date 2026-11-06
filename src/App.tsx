import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TapeEntry,
  Operator,
  RoundingMode,
  DecimalMode,
  calculate,
  formatDisplayValue,
  countDigits,
  cleanNumberString,
  MAX_DIGITS,
} from './utils/calculator';
import { sounds } from './utils/audio';
import { Display } from './components/Display';
import { Keypad, KeyId } from './components/Keypad';
import { SelectorSwitches } from './components/SelectorSwitches';
import { PaperTape } from './components/PaperTape';
import { TaxSettingsModal } from './components/TaxSettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import {
  Volume2,
  VolumeX,
  Keyboard,
  Percent,
  ReceiptText,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // Calculator Core State
  const [display, setDisplay] = useState<string>('0');
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expressionPreview, setExpressionPreview] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  // Registers & Settings
  const [memory, setMemory] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [roundingMode, setRoundingMode] = useState<RoundingMode>('5/4');
  const [decimalMode, setDecimalMode] = useState<DecimalMode>('F');
  const [taxRate, setTaxRate] = useState<number>(10);
  const [taxModeNotice, setTaxModeNotice] = useState<'TAX+' | 'TAX-' | null>(null);

  // History & Tape
  const [tape, setTape] = useState<TapeEntry[]>([]);
  const [showTape, setShowTape] = useState<boolean>(true);

  // Modals & UI Controls
  const [isTaxModalOpen, setIsTaxModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<'graphite' | 'beige' | 'braun' | 'vfd'>('graphite');
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Synchronize sound system enabled state
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Synchronize document dark class for Tailwind
  useEffect(() => {
    if (theme === 'beige') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Formatted display value
  const formattedDisplay = useMemo(() => {
    if (isError) return 'Error';
    const res = formatDisplayValue(display, decimalMode, roundingMode, waitingForOperand);
    return res.formatted;
  }, [display, decimalMode, roundingMode, waitingForOperand, isError]);

  const currentDigitCount = useMemo(() => {
    return countDigits(display);
  }, [display]);

  // Push an entry to paper tape
  const addTapeEntry = useCallback(
    (
      entry: Omit<TapeEntry, 'id' | 'timestamp'>
    ) => {
      const newEntry: TapeEntry = {
        ...entry,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setTape((prev) => [...prev, newEntry]);
    },
    []
  );

  // Handler for all button inputs
  const handleInput = useCallback(
    (key: KeyId) => {
      setLastPressedKey(key);
      setTimeout(() => setLastPressedKey(null), 150);

      // Dismiss tax banner on new action
      if (key !== 'TAX+' && key !== 'TAX-') {
        setTaxModeNotice(null);
      }

      // If in Error state, only C or AC can reset
      if (isError && key !== 'C' && key !== 'AC') {
        sounds.playError();
        return;
      }

      // Number digits 0-9
      if (/^[0-9]$/.test(key)) {
        if (waitingForOperand) {
          setDisplay(key);
          setWaitingForOperand(false);
        } else {
          if (countDigits(display) >= MAX_DIGITS) {
            sounds.playError();
            return;
          }
          if (display === '0') {
            setDisplay(key);
          } else {
            setDisplay(display + key);
          }
        }
        return;
      }

      // Double zero '00'
      if (key === '00') {
        if (waitingForOperand) {
          setDisplay('0');
          setWaitingForOperand(false);
        } else {
          if (display === '0') return;
          const currentDigits = countDigits(display);
          if (currentDigits >= MAX_DIGITS) {
            sounds.playError();
            return;
          }
          if (currentDigits + 2 <= MAX_DIGITS) {
            setDisplay(display + '00');
          } else {
            setDisplay(display + '0');
          }
        }
        return;
      }

      // Decimal point '.'
      if (key === '.') {
        if (waitingForOperand) {
          setDisplay('0.');
          setWaitingForOperand(false);
        } else {
          if (!display.includes('.')) {
            setDisplay(display + '.');
          }
        }
        return;
      }

      // Backspace
      if (key === 'BACK') {
        if (waitingForOperand) return;
        if (display.length > 1) {
          const next = display.slice(0, -1);
          setDisplay(next === '-' ? '0' : next);
        } else {
          setDisplay('0');
        }
        return;
      }

      // Clear Entry (C)
      if (key === 'C') {
        setDisplay('0');
        setIsError(false);
        return;
      }

      // All Clear (AC)
      if (key === 'AC') {
        setDisplay('0');
        setAccumulator(null);
        setPendingOperator(null);
        setWaitingForOperand(false);
        setExpressionPreview('');
        setIsError(false);
        setTaxModeNotice(null);
        return;
      }

      // Sign toggle (+/-)
      if (key === '+/-') {
        if (display === '0') return;
        if (display.startsWith('-')) {
          setDisplay(display.slice(1));
        } else {
          setDisplay('-' + display);
        }
        return;
      }

      // Square Root
      if (key === 'SQRT') {
        const val = parseFloat(cleanNumberString(display));
        if (val < 0) {
          setIsError(true);
          sounds.playError();
          return;
        }
        const root = Math.sqrt(val);
        const { displayStr, isError: err } = calculate(root, 0, null, decimalMode, roundingMode);
        if (err) {
          setIsError(true);
          sounds.playError();
          return;
        }
        setDisplay(displayStr);
        setWaitingForOperand(true);
        addTapeEntry({
          type: 'sqrt',
          label: 'SQRT',
          leftOperand: `√(${val})`,
          result: displayStr,
        });
        return;
      }

      // Operators (+, -, ×, ÷)
      if (['+', '-', '×', '÷'].includes(key)) {
        const op = key as Operator;
        const currentVal = parseFloat(cleanNumberString(display));

        if (accumulator !== null && pendingOperator && !waitingForOperand) {
          // Chain operation: resolve previous calculation first
          const { result, displayStr, isError: err } = calculate(
            accumulator,
            currentVal,
            pendingOperator,
            decimalMode,
            roundingMode
          );

          if (err) {
            setIsError(true);
            sounds.playError();
            return;
          }

          addTapeEntry({
            type: 'calc',
            leftOperand: formatDisplayValue(accumulator.toString(), decimalMode, roundingMode).formatted,
            operator: pendingOperator,
            rightOperand: formatDisplayValue(currentVal.toString(), decimalMode, roundingMode).formatted,
            result: formatDisplayValue(displayStr, decimalMode, roundingMode).formatted,
          });

          setGrandTotal((gt) => gt + result);
          setAccumulator(result);
          setDisplay(displayStr);
          setExpressionPreview(`${displayStr} ${op}`);
        } else {
          setAccumulator(currentVal);
          setExpressionPreview(`${formatDisplayValue(display, decimalMode, roundingMode).formatted} ${op}`);
        }

        setPendingOperator(op);
        setWaitingForOperand(true);
        return;
      }

      // Percentage (%)
      if (key === '%') {
        const currentVal = parseFloat(cleanNumberString(display));
        if (accumulator !== null && pendingOperator) {
          let percentResult = 0;
          if (pendingOperator === '+' || pendingOperator === '-') {
            // Markup or discount: 100 + 10% = 110, 100 - 10% = 90
            const percentageAmount = (accumulator * currentVal) / 100;
            percentResult =
              pendingOperator === '+'
                ? accumulator + percentageAmount
                : accumulator - percentageAmount;

            const { displayStr, isError: err } = calculate(
              percentResult,
              0,
              null,
              decimalMode,
              roundingMode
            );
            if (err) {
              setIsError(true);
              sounds.playError();
              return;
            }

            addTapeEntry({
              type: 'percent',
              label: pendingOperator === '+' ? 'MARKUP %' : 'DISCOUNT %',
              leftOperand: `${accumulator} ${pendingOperator} (${currentVal}%)`,
              result: displayStr,
            });

            setDisplay(displayStr);
            setGrandTotal((gt) => gt + percentResult);
            setAccumulator(null);
            setPendingOperator(null);
            setWaitingForOperand(true);
            setExpressionPreview('');
          } else if (pendingOperator === '×') {
            // Multiplication percentage: 200 × 15% = 30
            const res = (accumulator * currentVal) / 100;
            const { displayStr } = calculate(res, 0, null, decimalMode, roundingMode);
            addTapeEntry({
              type: 'percent',
              leftOperand: `${accumulator} × ${currentVal}%`,
              result: displayStr,
            });
            setDisplay(displayStr);
            setAccumulator(null);
            setPendingOperator(null);
            setWaitingForOperand(true);
            setExpressionPreview('');
          } else if (pendingOperator === '÷') {
            // Ratio percentage: 30 ÷ 15% = 200
            if (currentVal === 0) {
              setIsError(true);
              sounds.playError();
              return;
            }
            const res = (accumulator / currentVal) * 100;
            const { displayStr } = calculate(res, 0, null, decimalMode, roundingMode);
            addTapeEntry({
              type: 'percent',
              leftOperand: `${accumulator} ÷ ${currentVal}%`,
              result: displayStr,
            });
            setDisplay(displayStr);
            setAccumulator(null);
            setPendingOperator(null);
            setWaitingForOperand(true);
            setExpressionPreview('');
          }
        } else {
          // Direct percentage: 50 % = 0.5
          const res = currentVal / 100;
          const { displayStr } = calculate(res, 0, null, decimalMode, roundingMode);
          addTapeEntry({
            type: 'percent',
            leftOperand: `${currentVal}%`,
            result: displayStr,
          });
          setDisplay(displayStr);
          setWaitingForOperand(true);
        }
        return;
      }

      // TAX+ and TAX-
      if (key === 'TAX+') {
        const val = parseFloat(cleanNumberString(display));
        const taxAmount = (val * taxRate) / 100;
        const total = val + taxAmount;
        const { displayStr, isError: err } = calculate(total, 0, null, decimalMode, roundingMode);
        if (err) {
          setIsError(true);
          sounds.playError();
          return;
        }
        setDisplay(displayStr);
        setTaxModeNotice('TAX+');
        setWaitingForOperand(true);
        addTapeEntry({
          type: 'tax',
          label: `TAX+ (${taxRate}%)`,
          leftOperand: `Pre-tax: ${val}`,
          operator: '+ Tax',
          rightOperand: taxAmount.toFixed(2),
          result: displayStr,
        });
        return;
      }

      if (key === 'TAX-') {
        const val = parseFloat(cleanNumberString(display));
        const preTax = val / (1 + taxRate / 100);
        const taxAmount = val - preTax;
        const { displayStr, isError: err } = calculate(preTax, 0, null, decimalMode, roundingMode);
        if (err) {
          setIsError(true);
          sounds.playError();
          return;
        }
        setDisplay(displayStr);
        setTaxModeNotice('TAX-');
        setWaitingForOperand(true);
        addTapeEntry({
          type: 'tax',
          label: `TAX− (${taxRate}%)`,
          leftOperand: `Total: ${val}`,
          operator: '- Tax',
          rightOperand: taxAmount.toFixed(2),
          result: displayStr,
        });
        return;
      }

      // Memory Functions (MC, MR, M-, M+)
      if (key === 'MC') {
        setMemory(0);
        addTapeEntry({
          type: 'memory',
          label: 'MC',
          result: '0.00',
        });
        return;
      }

      if (key === 'MR') {
        setDisplay(memory.toString());
        setWaitingForOperand(true);
        addTapeEntry({
          type: 'memory',
          label: 'MR',
          result: memory.toString(),
        });
        return;
      }

      if (key === 'M+') {
        const val = parseFloat(cleanNumberString(display));
        const newMem = memory + val;
        setMemory(newMem);
        setWaitingForOperand(true);
        addTapeEntry({
          type: 'memory',
          label: 'M+',
          leftOperand: `Mem + ${val}`,
          result: newMem.toString(),
        });
        return;
      }

      if (key === 'M-') {
        const val = parseFloat(cleanNumberString(display));
        const newMem = memory - val;
        setMemory(newMem);
        setWaitingForOperand(true);
        addTapeEntry({
          type: 'memory',
          label: 'M−',
          leftOperand: `Mem - ${val}`,
          result: newMem.toString(),
        });
        return;
      }

      // Grand Total (GT)
      if (key === 'GT') {
        setDisplay(grandTotal.toString());
        setWaitingForOperand(true);
        addTapeEntry({
          type: 'calc',
          label: 'GRAND TOTAL',
          result: grandTotal.toString(),
        });
        return;
      }

      // Equals (=)
      if (key === '=') {
        if (accumulator !== null && pendingOperator) {
          const currentVal = parseFloat(cleanNumberString(display));
          const { result, displayStr, isError: err } = calculate(
            accumulator,
            currentVal,
            pendingOperator,
            decimalMode,
            roundingMode
          );

          if (err) {
            setIsError(true);
            sounds.playError();
            return;
          }

          addTapeEntry({
            type: 'calc',
            leftOperand: formatDisplayValue(accumulator.toString(), decimalMode, roundingMode).formatted,
            operator: pendingOperator,
            rightOperand: formatDisplayValue(currentVal.toString(), decimalMode, roundingMode).formatted,
            result: formatDisplayValue(displayStr, decimalMode, roundingMode).formatted,
          });

          setGrandTotal((gt) => gt + result);
          setDisplay(displayStr);
          setAccumulator(null);
          setPendingOperator(null);
          setWaitingForOperand(true);
          setExpressionPreview('');
        }
        return;
      }
    },
    [
      isError,
      waitingForOperand,
      display,
      accumulator,
      pendingOperator,
      decimalMode,
      roundingMode,
      taxRate,
      memory,
      grandTotal,
      addTapeEntry,
    ]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input modal
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleInput(key as KeyId);
        return;
      }

      if (key === '.') {
        e.preventDefault();
        handleInput('.');
        return;
      }

      if (key === '+' || key === '-') {
        e.preventDefault();
        handleInput(key === '+' ? '+' : '-');
        return;
      }

      if (key === '*' || key === 'x' || key === 'X') {
        e.preventDefault();
        handleInput('×');
        return;
      }

      if (key === '/') {
        e.preventDefault();
        handleInput('÷');
        return;
      }

      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleInput('=');
        return;
      }

      if (key === 'Backspace') {
        e.preventDefault();
        handleInput('BACK');
        return;
      }

      if (key === 'Escape') {
        e.preventDefault();
        handleInput('AC');
        return;
      }

      if (key.toLowerCase() === 'c') {
        e.preventDefault();
        handleInput('C');
        return;
      }

      if (key === '%') {
        e.preventDefault();
        handleInput('%');
        return;
      }

      if (key.toLowerCase() === 's' || key.toLowerCase() === 'r') {
        e.preventDefault();
        handleInput('SQRT');
        return;
      }

      if (key === 'm') {
        e.preventDefault();
        handleInput('M+');
        return;
      }

      if (key === 'M') {
        e.preventDefault();
        handleInput('M-');
        return;
      }

      if (key.toLowerCase() === 'l') {
        e.preventDefault();
        handleInput('MR');
        return;
      }

      if (key === 't') {
        e.preventDefault();
        handleInput('TAX+');
        return;
      }

      if (key === 'T') {
        e.preventDefault();
        handleInput('TAX-');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  // Load a value back from paper tape
  const handleSelectTapeResult = (resultStr: string) => {
    const cleaned = cleanNumberString(resultStr);
    setDisplay(cleaned);
    setWaitingForOperand(true);
  };

  // Copy current display value
  const handleCopyCurrentValue = () => {
    sounds.playClick('action');
    navigator.clipboard.writeText(cleanNumberString(display));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Reset entire calculator & clear tape
  const handleResetAll = () => {
    sounds.playClick('action');
    setDisplay('0');
    setAccumulator(null);
    setPendingOperator(null);
    setWaitingForOperand(false);
    setExpressionPreview('');
    setIsError(false);
    setMemory(0);
    setGrandTotal(0);
    setTape([]);
  };

  // Theme-specific chassis background
  const getAppThemeStyle = () => {
    switch (theme) {
      case 'beige':
        return {
          pageBg: 'bg-[#e5e0d4] text-stone-900',
          deskChassis: 'bg-[#ece8dc] border-[#c8c3b4] shadow-[0_20px_50px_rgba(70,60,40,0.18)]',
          headerBorder: 'border-stone-300',
        };
      case 'braun':
        return {
          pageBg: 'bg-[#121212] text-stone-100',
          deskChassis: 'bg-[#1a1a1a] border-stone-800 shadow-[0_25px_60px_rgba(0,0,0,0.7)]',
          headerBorder: 'border-stone-800',
        };
      case 'vfd':
        return {
          pageBg: 'bg-[#020504] text-emerald-400',
          deskChassis: 'bg-[#060e0a] border-emerald-950/80 shadow-[0_0_50px_rgba(16,185,129,0.08)]',
          headerBorder: 'border-emerald-950',
        };
      default: // graphite
        return {
          pageBg: 'bg-slate-950 text-slate-100',
          deskChassis: 'bg-slate-900/95 border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.6)]',
          headerBorder: 'border-slate-800',
        };
    }
  };

  const appStyle = getAppThemeStyle();

  return (
    <div
      className={`min-h-screen flex flex-col ${appStyle.pageBg} transition-colors duration-200 antialiased`}
    >
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (1 Action CTA) */}
      <header
        className={`flex items-center justify-between gap-8 px-6 py-3.5 border-b ${appStyle.headerBorder} backdrop-blur-md sticky top-0 z-40 transition-colors`}
      >
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-xs">
            12
          </div>
          <span className="text-base font-bold tracking-tight whitespace-nowrap">
            12-Digit Desk Calculator
          </span>
        </div>

        {/* Zone 2: Nav / Utility controls (single-line, clean buttons) */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-medium whitespace-nowrap shrink-0">
          {/* Paper Tape Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick('action');
              setShowTape(!showTape);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              showTape
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-semibold'
                : 'border-current/20 hover:border-current/50 opacity-75'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Tape History</span>
          </button>

          {/* Tax Setting */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick('action');
              setIsTaxModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-current/20 hover:border-current/50 opacity-75 transition-colors"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Tax ({taxRate}%)</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick('action');
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Mute sound effects' : 'Enable key clicks'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-current/20 hover:border-current/50 opacity-75 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          {/* Theme Selector Segmented Control */}
          <div className="flex items-center p-0.5 rounded-lg border border-current/20 bg-black/5 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setTheme('graphite')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                theme === 'graphite' ? 'bg-amber-500 text-slate-950 font-bold' : 'opacity-60'
              }`}
            >
              Graphite
            </button>
            <button
              type="button"
              onClick={() => setTheme('beige')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                theme === 'beige' ? 'bg-stone-700 text-amber-200 font-bold' : 'opacity-60'
              }`}
            >
              Classic Beige
            </button>
            <button
              type="button"
              onClick={() => setTheme('braun')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                theme === 'braun' ? 'bg-stone-200 text-stone-900 font-bold' : 'opacity-60'
              }`}
            >
              Braun
            </button>
            <button
              type="button"
              onClick={() => setTheme('vfd')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                theme === 'vfd' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'opacity-60'
              }`}
            >
              VFD Neon
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-current/20 hover:border-current/50 opacity-75 transition-colors"
            title="View keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            title="Reset calculator and clear tape memory"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-current/20 hover:bg-rose-500/15 hover:border-rose-500/40 text-rose-400 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col justify-center">
        {/* Mobile controls toolbar */}
        <div className="flex md:hidden items-center justify-between pb-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowTape(!showTape)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-current/20 font-medium"
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>{showTape ? 'Hide Tape' : 'Show Tape'}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg border border-current/20"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsTaxModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-current/20 text-xs font-mono"
            >
              Tax: {taxRate}%
            </button>
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="p-1.5 rounded-lg border border-current/20"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Calculator Desk Unit + Paper Tape History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 12-Digit Desk Calculator Chassis (Spans 7 or 8 columns on desktop) */}
          <div
            className={`${
              showTape ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'
            } flex flex-col rounded-3xl border p-4 md:p-6 ${appStyle.deskChassis} transition-all relative overflow-hidden`}
          >
            {/* Calculator Brand & Model Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-current/10">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm md:text-base tracking-widest uppercase opacity-90">
                  CASIO-INSPIRED
                </span>
                <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded border border-current/20">
                  MODEL DL-1200
                </span>
              </div>

              {/* Quick Copy Display Button */}
              <button
                type="button"
                onClick={handleCopyCurrentValue}
                title="Copy current display number"
                className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md border border-current/20 hover:border-current/50 transition-colors opacity-80 hover:opacity-100"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Electronic Display Section */}
            <div className="pt-3 pb-2">
              <Display
                mainValue={formattedDisplay}
                expression={expressionPreview}
                activeOperator={pendingOperator}
                hasMemory={memory !== 0}
                hasGrandTotal={grandTotal !== 0}
                isError={isError}
                isTaxMode={taxModeNotice}
                theme={theme}
                digitCount={currentDigitCount}
              />
            </div>

            {/* Mechanical Slide Switches (Round & Decimal) */}
            <div className="my-1 border-y border-current/10">
              <SelectorSwitches
                roundingMode={roundingMode}
                decimalMode={decimalMode}
                onRoundingChange={setRoundingMode}
                onDecimalChange={setDecimalMode}
                theme={theme}
              />
            </div>

            {/* Tactile Keypad */}
            <div className="pt-2">
              <Keypad
                onKeyPress={handleInput}
                activeOperatorKey={pendingOperator}
                lastPressedKey={lastPressedKey}
                theme={theme}
                hasMemory={memory !== 0}
                taxRate={taxRate}
              />
            </div>

            {/* Subtle Rubber Desk Foot Pads & Grip Accent */}
            <div className="flex justify-between items-center px-4 pt-3 mt-2 border-t border-current/5 text-[10px] opacity-40 select-none">
              <span>HEAVY-DUTY DESKTOP UNIT</span>
              <span>12 DIGIT CAPACITY · DUAL POWER</span>
            </div>
          </div>

          {/* Right Column: Paper Audit Tape (Spans 5 columns on desktop) */}
          {showTape && (
            <div className="lg:col-span-5 h-[580px] lg:h-[680px]">
              <PaperTape
                entries={tape}
                onSelectResult={handleSelectTapeResult}
                onClearTape={() => setTape([])}
                isOpen={showTape}
                theme={theme}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <TaxSettingsModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        taxRate={taxRate}
        onSaveTaxRate={setTaxRate}
        theme={theme}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        theme={theme}
      />
    </div>
  );
}
