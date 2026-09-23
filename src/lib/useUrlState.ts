import { useEffect, useState } from 'react';
import type { AssetStatus, AssetQuery } from '@/lib/types';

const DEFAULT_Q = '';
const DEFAULT_STATUS: AssetStatus[] = [];
const DEFAULT_SORT: AssetQuery['sort'] = 'updatedAt:desc';

const VALID_STATUSES: AssetStatus[] = [
  'draft',
  'in_review',
  'approved',
  'archived',
];

const VALID_SORTS: AssetQuery['sort'][] = [
  'updatedAt:desc',
  'updatedAt:asc',
  'name:asc',
  'name:desc',
  'sizeBytes:desc',
  'createdAt:desc'
];

type UrlState = {
  q: string;
  status: AssetStatus[];
  sort: AssetQuery['sort'];
};

function readUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);

  const q = params.get('q') ?? DEFAULT_Q;

  const statusParam = params.get('status');
  const status = statusParam
    ? statusParam
        .split(',')
        .filter((value): value is AssetStatus =>
          VALID_STATUSES.includes(value as AssetStatus),
        )
    : DEFAULT_STATUS;

  const sortParam = params.get('sort');
  const sort: AssetQuery['sort'] = sortParam && VALID_SORTS.includes(sortParam as AssetQuery['sort'])
    ? (sortParam as AssetQuery['sort'])
    : DEFAULT_SORT;

  return { q, status, sort };
}

export function useUrlState(): [
  UrlState,
  React.Dispatch<React.SetStateAction<UrlState>>,
] {
  const [state, setState] = useState<UrlState>(readUrlState);

  useEffect(() => {
    const params = new URLSearchParams();

    if (state.q) {
      params.set('q', state.q);
    }

    if (state.status.length > 0) {
      params.set('status', state.status.join(','));
    }

    if (state.sort !== DEFAULT_SORT) {
      params.set('sort', state.sort);
    }

    const search = params.toString();
    const url = search
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;

    window.history.replaceState(null, '', url);
  }, [state]);

  useEffect(() => {
    const handlePopState = () => {
      setState(readUrlState());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return [state, setState];
}