import axios from 'axios';

/** Human-readable message for a failed API call: the server's `detail`, else the fallback. */
export const errorFrom = (err: unknown, fallback = 'Something went wrong.'): string => {
  const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
  return typeof detail === 'string' && detail ? detail : fallback;
};
