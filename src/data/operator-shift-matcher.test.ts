import { afterEach, describe, expect, it } from 'vitest';
import { OPERATOR_NAME_ALIASES } from '../config/operator-name-aliases';
import type { ShiftMember } from '../domain/shift-types';
import type { AuditRecord } from '../types/audit';
import { matchOperatorsToShifts } from './operator-shift-matcher';
import { normalizePersonName } from '../utils/normalize-person-name';

const auditRecord = (operator: string): AuditRecord => ({
  date: new Date('2026-06-01'),
  auditor: 'Auditor Test',
  eventId: `${operator}-1`,
  sourceMedium: null,
  operator,
  delaySae: null,
  action: 'Validado',
  affectedSystem: null,
  correctionReason: null,
  additionalNotes: null,
});

const member = (originalName: string): ShiftMember => ({
  originalName,
  normalizedName: normalizePersonName(originalName),
  shift: 'A',
});

describe('operator shift matching', () => {
  afterEach(() => {
    Object.keys(OPERATOR_NAME_ALIASES).forEach((key) => delete OPERATOR_NAME_ALIASES[key]);
  });

  it('matches exact normalized word sets regardless of order', () => {
    const report = matchOperatorsToShifts([auditRecord('Valeria Marquez')], [member('MARQUEZ VALERIA')]);

    expect(report.matches).toHaveLength(1);
    expect(report.matches[0].matchLevel).toBe('exactMatch');
  });

  it('matches a shorter audited name contained in a longer roster name', () => {
    const report = matchOperatorsToShifts([auditRecord('Florencia Ojeda')], [member('OJEDA FLORENCIA MICAELA')]);

    expect(report.matches).toHaveLength(1);
    expect(report.matches[0].matchLevel).toBe('containedWordsMatch');
  });

  it('matches contained words only when the candidate is unique', () => {
    const report = matchOperatorsToShifts([auditRecord('Agostina Ledezma')], [member('LEDEZMA LOPEZ AGOSTINA')]);

    expect(report.matches).toHaveLength(1);
    expect(report.matches[0].matchLevel).toBe('containedWordsMatch');
  });

  it('marks contained word matches as ambiguous when multiple candidates exist', () => {
    const report = matchOperatorsToShifts([auditRecord('Juan Perez')], [member('JUAN CARLOS PEREZ'), member('JUAN PABLO PEREZ')]);

    expect(report.matches).toHaveLength(0);
    expect(report.ambiguousMatches).toHaveLength(1);
  });

  it('marks a missing roster name as unmatched', () => {
    const report = matchOperatorsToShifts([auditRecord('Nombre Inexistente')], [member('MARQUEZ VALERIA')]);

    expect(report.matches).toHaveLength(0);
    expect(report.unmatchedOperators).toHaveLength(1);
  });

  it('resolves a name through a manual alias', () => {
    OPERATOR_NAME_ALIASES[normalizePersonName('Pepe Sanchez')] = normalizePersonName('JOSE SANCHEZ');

    const report = matchOperatorsToShifts([auditRecord('Pepe Sanchez')], [member('JOSE SANCHEZ')]);

    expect(report.matches).toHaveLength(1);
    expect(report.matches[0].matchLevel).toBe('aliasMatch');
  });
});
