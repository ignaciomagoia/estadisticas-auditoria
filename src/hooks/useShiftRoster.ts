import { useEffect, useState } from 'react';
import type { ShiftRoster } from '../domain/shift-types';
import { loadShiftRoster } from '../services/shiftRosterService';
import type { DatasetMeta } from '../types/audit';

interface ShiftRosterState {
  roster: ShiftRoster | null;
  isLoading: boolean;
  error: string | null;
}

export const useShiftRoster = (period: DatasetMeta | null) => {
  const [state, setState] = useState<ShiftRosterState>({ roster: null, isLoading: true, error: null });

  useEffect(() => {
    if (!period) {
      setState({ roster: null, isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ roster: null, isLoading: true, error: null });

    loadShiftRoster(period)
      .then((roster) => {
        if (!cancelled) setState({ roster, isLoading: false, error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ roster: null, isLoading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  return state;
};
