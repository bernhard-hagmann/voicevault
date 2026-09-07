import { PATStatus, PersonalAccessToken } from '../types';

// Revoked wins over expired: a revoked token stays revoked even once its date passes.
export const statusOf = (pat: PersonalAccessToken, now: number = Date.now()): PATStatus => {
  if (pat.revoked_at) return 'revoked';
  if (pat.expires_at && new Date(pat.expires_at).getTime() <= now) return 'expired';
  return 'active';
};
