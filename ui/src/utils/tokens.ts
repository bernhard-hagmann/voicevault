import { PATStatus, PersonalAccessToken } from '../types';
import { parseApiDate } from './format';

// Revoked wins over expired: a revoked token stays revoked even once its date passes.
// The expiry drives which controls the row offers, so it is parsed as the UTC the
// API stores rather than as the reader's local time.
export const statusOf = (pat: PersonalAccessToken, now: number = Date.now()): PATStatus => {
  if (pat.revoked_at) return 'revoked';
  if (pat.expires_at && parseApiDate(pat.expires_at).getTime() <= now) return 'expired';
  return 'active';
};
