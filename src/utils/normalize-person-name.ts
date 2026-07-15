export const getPersonNameTokens = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);

export const normalizePersonName = (name: string) => getPersonNameTokens(name).sort((a, b) => a.localeCompare(b, 'es')).join(' ');

export const getSortedPersonNameKey = normalizePersonName;

export const areNameTokenSetsEqual = (left: string, right: string) => getSortedPersonNameKey(left) === getSortedPersonNameKey(right);

export const areShortNameTokensContained = (shortName: string, longName: string) => {
  const shortTokens = getPersonNameTokens(shortName);
  const longTokens = new Set(getPersonNameTokens(longName));
  return shortTokens.length >= 2 && shortTokens.every((token) => longTokens.has(token));
};
