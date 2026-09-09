import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  formatBytes,
  formatCount,
  formatDateTime,
  formatHours,
  formatRelative,
  parseApiDate,
} from './format';

describe('formatBytes', () => {
  it('renders zero and negatives as 0 B', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
  });

  it('renders raw bytes without decimals', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('steps up through binary units', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 ** 2)).toBe('1.0 MB');
    expect(formatBytes(1024 ** 3)).toBe('1.0 GB');
    expect(formatBytes(1024 ** 4)).toBe('1.0 TB');
  });

  it('rolls over to the next unit when rounding would reach 1024', () => {
    expect(formatBytes(1048575)).toBe('1.0 MB');
    expect(formatBytes(1024 ** 3 - 1)).toBe('1.0 GB');
    expect(formatBytes(1024 ** 4 - 1)).toBe('1.0 TB');
  });

  it('keeps values below the rounding boundary in their own unit', () => {
    expect(formatBytes(1023)).toBe('1023 B');
    expect(formatBytes(1047961)).toBe('1023.4 KB');
  });

  it('does not fall off the bottom of the unit list', () => {
    expect(formatBytes(0.5)).toBe('1 B');
    expect(formatBytes(0.4)).toBe('0 B');
  });

  it('clamps at the largest known unit', () => {
    expect(formatBytes(1024 ** 6)).toBe('1024.0 PB');
  });
});

describe('formatHours', () => {
  it('renders zero as 0 h', () => {
    expect(formatHours(0)).toBe('0 h');
  });

  it('converts seconds to one decimal of hours', () => {
    expect(formatHours(3600)).toBe('1.0 h');
    expect(formatHours(5400)).toBe('1.5 h');
  });

  it('does not hide sub-hour material as zero', () => {
    expect(formatHours(60)).toBe('<0.1 h');
  });
});

describe('formatCount', () => {
  it('groups thousands', () => {
    expect(formatCount(1234567)).toBe('1,234,567');
    expect(formatCount(0)).toBe('0');
  });
});

describe('parseApiDate', () => {
  // The bug only shows away from UTC, which is where the suite otherwise runs.
  beforeAll(() => {
    vi.stubEnv('TZ', 'Europe/Berlin'); // UTC+2 on the dates below
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('reads a zone-less timestamp as UTC rather than as local time', () => {
    expect(parseApiDate('2026-10-04T12:00:00').toISOString()).toBe('2026-10-04T12:00:00.000Z');
    expect(parseApiDate('2026-10-04T12:00:00.123456').toISOString()).toBe(
      '2026-10-04T12:00:00.123Z',
    );
  });

  it('leaves an explicit zone alone', () => {
    expect(parseApiDate('2026-10-04T12:00:00Z').toISOString()).toBe('2026-10-04T12:00:00.000Z');
    expect(parseApiDate('2026-10-04T14:00:00+02:00').toISOString()).toBe(
      '2026-10-04T12:00:00.000Z',
    );
  });

  it('stays invalid for garbage instead of inventing an instant', () => {
    expect(Number.isNaN(parseApiDate('not a date').getTime())).toBe(true);
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-09-07T12:00:00Z').getTime();

  it('describes future and past instants', () => {
    expect(formatRelative('2026-09-19T12:00:00Z', now)).toBe('in 12 days');
    expect(formatRelative('2026-09-07T09:00:00Z', now)).toBe('3 hours ago');
    expect(formatRelative('2027-09-07T12:00:00Z', now)).toBe('next year');
  });

  it('collapses sub-minute differences and rejects garbage', () => {
    expect(formatRelative('2026-09-07T12:00:30Z', now)).toBe('just now');
    expect(formatRelative('not a date', now)).toBe('');
  });
});

describe('formatDateTime', () => {
  it('matches the medium date / short time locale rendering', () => {
    const iso = '2026-12-01T10:30:00Z';
    expect(formatDateTime(iso)).toBe(
      new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    );
  });

  it('renders garbage as an empty string', () => {
    expect(formatDateTime('nope')).toBe('');
  });
});
