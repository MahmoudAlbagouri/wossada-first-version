import type { AsyncDataRequestStatus } from '#app';

/**
 * Client-only data (`server: false`) is `idle` in the server-rendered HTML;
 * treating that as loading shows skeletons instead of a flash of "empty".
 */
export const isFetching = (status: AsyncDataRequestStatus): boolean => status === 'idle' || status === 'pending';
