import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { errorFrom } from './errors';

const axiosError = (data: unknown) =>
  new AxiosError('failed', '400', undefined, undefined, {
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  });

describe('errorFrom', () => {
  it('prefers the server detail', () => {
    expect(errorFrom(axiosError({ detail: 'Token expired' }), 'fallback')).toBe('Token expired');
  });

  it('falls back when the detail is missing or not a string', () => {
    expect(errorFrom(axiosError({}), 'fallback')).toBe('fallback');
    expect(errorFrom(axiosError({ detail: [{ msg: 'x' }] }), 'fallback')).toBe('fallback');
  });

  it('falls back for non-axios errors and has a default fallback', () => {
    expect(errorFrom(new Error('boom'), 'fallback')).toBe('fallback');
    expect(errorFrom(new Error('boom'))).toBe('Something went wrong.');
  });
});
