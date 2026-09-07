const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  // Clamp both ends: sub-byte values would otherwise index the array with -1.
  let exponent = Math.min(
    Math.max(Math.floor(Math.log(bytes) / Math.log(1024)), 0),
    BYTE_UNITS.length - 1,
  );

  // The exponent is picked before rounding, so the top sliver of each unit
  // would render as "1024.0 KB" instead of "1.0 MB". Promote it instead.
  const render = (exp: number): number => {
    const value = bytes / 1024 ** exp;
    return exp === 0 ? Math.round(value) : Number(value.toFixed(1));
  };

  if (render(exponent) >= 1024 && exponent < BYTE_UNITS.length - 1) {
    exponent += 1;
  }

  // Raw byte counts are whole numbers; everything else reads better rounded.
  return exponent === 0
    ? `${render(exponent)} ${BYTE_UNITS[exponent]}`
    : `${(bytes / 1024 ** exponent).toFixed(1)} ${BYTE_UNITS[exponent]}`;
};

export const formatHours = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0 h';
  }

  const hours = seconds / 3600;
  // A real but tiny amount must not render as "0.0 h", which reads as nothing.
  return hours < 0.1 ? '<0.1 h' : `${hours.toFixed(1)} h`;
};

// Fixed locale so the output does not depend on the viewer's machine.
export const formatCount = (value: number): string =>
  Number.isFinite(value) ? value.toLocaleString('en-US') : '0';

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600 * 1000],
  ['month', 30 * 24 * 3600 * 1000],
  ['day', 24 * 3600 * 1000],
  ['hour', 3600 * 1000],
  ['minute', 60 * 1000],
];

// "in 12 days" / "3 hours ago" / "just now". Fixed locale, like formatCount.
export const formatRelative = (iso: string, now: number = Date.now()): string => {
  const delta = new Date(iso).getTime() - now;
  if (!Number.isFinite(delta)) {
    return '';
  }
  const formatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(delta) >= size) {
      return formatter.format(Math.round(delta / size), unit);
    }
  }
  return 'just now';
};

// Exact instant in the viewer's zone, e.g. "Dec 1, 2026, 10:30 AM".
export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};
