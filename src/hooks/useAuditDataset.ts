import { useEffect, useMemo, useState } from 'react';
import { loadAuditDataset } from '../services/auditDataService';
import { loadAuditPeriods } from '../services/audit-period-service';
import type { AuditDataset, DatasetMeta } from '../types/audit';

interface AuditDatasetState {
  dataset: AuditDataset | null;
  periods: DatasetMeta[];
  selectedPeriod: DatasetMeta | null;
  selectedPeriodId: string;
  setSelectedPeriodId: (periodId: string) => void;
  isLoading: boolean;
  isLoadingPeriods: boolean;
  error: string | null;
  periodsError: string | null;
}

export const useAuditDataset = (): AuditDatasetState => {
  const [periods, setPeriods] = useState<DatasetMeta[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [dataset, setDataset] = useState<AuditDataset | null>(null);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const [periodsError, setPeriodsError] = useState<string | null>(null);
  const [datasetError, setDatasetError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingPeriods(true);
    setPeriodsError(null);

    loadAuditPeriods()
      .then((loadedPeriods) => {
        if (cancelled) return;
        setPeriods(loadedPeriods);
        setSelectedPeriodId((current) => current || loadedPeriods[0]?.id || '');
      })
      .catch((error: Error) => {
        if (!cancelled) setPeriodsError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPeriods(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPeriod = useMemo(() => periods.find((period) => period.id === selectedPeriodId) ?? null, [periods, selectedPeriodId]);

  useEffect(() => {
    if (!selectedPeriod) return;

    let cancelled = false;
    setIsLoadingDataset(true);
    setDatasetError(null);

    loadAuditDataset(selectedPeriod)
      .then((loadedDataset) => {
        if (!cancelled) setDataset(loadedDataset);
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setDataset(null);
          setDatasetError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDataset(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPeriod]);

  return {
    dataset,
    periods,
    selectedPeriod,
    selectedPeriodId,
    setSelectedPeriodId,
    isLoading: isLoadingPeriods || isLoadingDataset,
    isLoadingPeriods,
    error: periodsError ?? datasetError,
    periodsError,
  };
};
