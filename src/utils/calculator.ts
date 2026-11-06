/**
 * Precision 12-Digit Calculator Logic Engine
 * Complies with standard 12-digit desktop electronic calculator specifications.
 */

export type RoundingMode = 'UP' | '5/4' | 'CUT';
export type DecimalMode = 'F' | '4' | '3' | '2' | '0' | 'A';
export type Operator = '+' | '-' | '×' | '÷' | null;

export interface TapeEntry {
  id: string;
  timestamp: string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: string;
  result: string;
  type: 'calc' | 'tax' | 'percent' | 'memory' | 'clear' | 'sqrt';
  label?: string;
}

export const MAX_DIGITS = 12;

/**
 * Strips formatting (commas, spaces) to get raw numerical string
 */
export function cleanNumberString(val: string): string {
  return val.replace(/,/g, '').trim();
}

/**
 * Counts total numeric digits (ignoring sign and decimal point)
 */
export function countDigits(val: string): number {
  return val.replace(/[^0-9]/g, '').length;
}

/**
 * Formats a raw number or string to 12-digit display format with commas
 */
export function formatDisplayValue(
  val: string,
  decimalMode: DecimalMode = 'F',
  roundingMode: RoundingMode = '5/4',
  applyRounding: boolean = false
): { formatted: string; isError: boolean } {
  if (val === 'Error' || val === 'E' || val === '-Error') {
    return { formatted: 'Error', isError: true };
  }

  const isNegative = val.startsWith('-');
  const unsigned = isNegative ? val.slice(1) : val;

  // Split integer and decimal parts
  const parts = unsigned.split('.');
  let integerPart = parts[0] || '0';
  const hasDecimal = parts.length > 1;
  let decimalPart = parts[1] ?? '';

  // Check if value exceeds 12 integer digits
  if (integerPart.length > MAX_DIGITS) {
    return { formatted: 'E ' + integerPart.slice(0, MAX_DIGITS), isError: true };
  }

  // If applyRounding is true and not floating mode, apply fixed decimal rounding
  if (applyRounding && decimalMode !== 'F' && decimalMode !== 'A') {
    const decimals = parseInt(decimalMode, 10);
    const num = parseFloat(cleanNumberString(val));
    if (isNaN(num)) return { formatted: '0', isError: false };

    let roundedNum = num;
    const factor = Math.pow(10, decimals);

    if (roundingMode === 'UP') {
      roundedNum = Math.ceil(Math.abs(num) * factor) / factor * (num < 0 ? -1 : 1);
    } else if (roundingMode === 'CUT') {
      roundedNum = Math.trunc(Math.abs(num) * factor) / factor * (num < 0 ? -1 : 1);
    } else {
      // 5/4 Standard Rounding
      roundedNum = Math.round(Math.abs(num) * factor) / factor * (num < 0 ? -1 : 1);
    }

    const fixedStr = Math.abs(roundedNum).toFixed(decimals);
    const [fixedInt, fixedDec] = fixedStr.split('.');
    if (fixedInt.length > MAX_DIGITS) {
      return { formatted: 'E ' + fixedInt.slice(0, MAX_DIGITS), isError: true };
    }

    const formattedInt = Number(fixedInt).toLocaleString('en-US');
    const resultStr = (isNegative && roundedNum !== 0 ? '-' : '') + (decimals > 0 ? `${formattedInt}.${fixedDec}` : formattedInt);
    return { formatted: resultStr, isError: false };
  }

  // Add commas to integer part
  const formattedInteger = Number(integerPart).toLocaleString('en-US');

  // Limit total digits to 12
  const allowedDecimals = Math.max(0, MAX_DIGITS - integerPart.length);
  if (decimalPart.length > allowedDecimals) {
    decimalPart = decimalPart.slice(0, allowedDecimals);
  }

  let formatted = (isNegative ? '-' : '') + formattedInteger;
  if (hasDecimal) {
    formatted += '.' + decimalPart;
  }

  return { formatted, isError: false };
}

/**
 * Performs high-precision basic arithmetic clamped to 12 digits
 */
export function calculate(
  a: number,
  b: number,
  op: Operator,
  decimalMode: DecimalMode = 'F',
  roundingMode: RoundingMode = '5/4'
): { result: number; displayStr: string; isError: boolean } {
  let res = 0;

  switch (op) {
    case '+':
      res = a + b;
      break;
    case '-':
      res = a - b;
      break;
    case '×':
      res = a * b;
      break;
    case '÷':
      if (b === 0) {
        return { result: 0, displayStr: 'E 0', isError: true };
      }
      res = a / b;
      break;
    default:
      res = b;
  }

  // Floating point precision fix (e.g. 0.1 + 0.2 = 0.30000000000000004)
  res = Number(res.toPrecision(14));

  // Check 12-digit integer overflow
  const absRes = Math.abs(res);
  const intDigits = Math.floor(absRes).toString().length;

  if (intDigits > MAX_DIGITS) {
    return {
      result: res,
      displayStr: 'E ' + Math.floor(absRes).toString().slice(0, 12),
      isError: true,
    };
  }

  // Rounding application
  if (decimalMode !== 'F' && decimalMode !== 'A') {
    const decimals = parseInt(decimalMode, 10);
    const factor = Math.pow(10, decimals);
    if (roundingMode === 'UP') {
      res = Math.ceil(absRes * factor) / factor * (res < 0 ? -1 : 1);
    } else if (roundingMode === 'CUT') {
      res = Math.trunc(absRes * factor) / factor * (res < 0 ? -1 : 1);
    } else {
      res = Math.round(absRes * factor) / factor * (res < 0 ? -1 : 1);
    }
  }

  // Format result to string with max 12 total digits
  let str = res.toString();
  if (str.includes('e') || str.includes('E')) {
    // Scientific notation conversion
    str = res.toFixed(10).replace(/\.?0+$/, '');
  }

  // Clamp precision so total digits do not exceed 12
  const parts = str.split('.');
  const integerLen = parts[0].replace('-', '').length;
  if (parts.length > 1) {
    const maxDecimals = Math.max(0, MAX_DIGITS - integerLen);
    const trimmedDecimals = parts[1].slice(0, maxDecimals).replace(/0+$/, '');
    str = trimmedDecimals ? `${parts[0]}.${trimmedDecimals}` : parts[0];
  }

  return { result: res, displayStr: str, isError: false };
}
