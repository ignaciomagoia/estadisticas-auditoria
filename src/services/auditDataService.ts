import { parseAuditWorkbook } from '../data/auditParser';
import type { AuditDataset, DatasetMeta } from '../types/audit';

const datasetCache = new Map<string, AuditDataset>();

export const loadAuditDataset = async (meta: DatasetMeta): Promise<AuditDataset> => {
  const cacheKey = meta.id || meta.sourcePath;
  const cachedDataset = datasetCache.get(cacheKey);
  if (cachedDataset) return cachedDataset;

  const response = await fetch(meta.sourcePath);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el archivo ${meta.sourcePath}.`);
  }

  const buffer = await response.arrayBuffer();
  const dataset = parseAuditWorkbook(buffer, meta);
  datasetCache.set(cacheKey, dataset);
  return dataset;
};
