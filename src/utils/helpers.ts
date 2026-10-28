import { AnyRecord, University, Opening, Supervisor, FilterState } from '../types';

export function daysLeft(deadline: string): number {
  if (!deadline) return NaN;
  const t = new Date();
  const today = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((Date.parse(deadline) - today) / 86400000);
}

export function daysLeftText(deadline: string): string {
  const n = daysLeft(deadline);
  if (isNaN(n)) return '';
  if (n < 0) return 'closed';
  if (n === 0) return 'today';
  return n === 1 ? '1 day left' : `${n} days left`;
}

export function getUniversity(record: AnyRecord | null, uniById: Map<string, University>): University | null {
  if (!record) return null;
  if (record._t === 'universities') return record as University;
  return uniById.get((record as Opening | Supervisor).universityId) || null;
}

export function getRecordHaystack(r: AnyRecord, uniById: Map<string, University>): string {
  if (r._hay !== undefined) return r._hay;
  const uni = getUniversity(r, uniById);
  const title = (r as Opening).title || (r as Supervisor).name || '';
  const name = (r as Supervisor).name || '';
  const group = (r as Supervisor).group || '';
  const rwDesc = (r as Opening).researchWork?.description || '';
  const rwSum = (r as Opening).researchWork?.summary || '';
  const subfields = r.subfields || [];

  r._hay = [
    title,
    name,
    group,
    uni?.name,
    uni?.city,
    uni?.country,
    ...subfields,
    rwDesc,
    rwSum,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return r._hay;
}

export function filterRecords(
  records: AnyRecord[],
  tab: string,
  state: FilterState,
  uniById: Map<string, University>
): AnyRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  const sub = state.subfield.toLowerCase().trim();
  const search = state.search.toLowerCase().trim();

  return records.filter((r) => {
    const uni = getUniversity(r, uniById);

    if (state.country && uni?.country !== state.country) return false;

    if (tab === 'openings' && state.hideClosed) {
      const op = r as Opening;
      if (op.status === 'closed' || (op.deadline && op.deadline < today)) {
        return false;
      }
    }

    if (state.fundedOnly) {
      if (tab === 'openings') {
        const funding = ((r as Opening).funding || '').toLowerCase();
        if (!funding.includes('fully') && !funding.includes('funded')) return false;
      }
      if (tab === 'universities') {
        const funding = (r as University).funding || '';
        if (!/fully|funded|full funding/i.test(funding)) return false;
      }
    }

    if (tab === 'supervisors' && state.takingStudents && !(r as Supervisor).takingStudents) {
      return false;
    }

    if (sub) {
      const subs = r.subfields || uni?.subfields || [];
      if (!subs.some((x) => x.toLowerCase().includes(sub))) return false;
    }

    if (search && !getRecordHaystack(r, uniById).includes(search)) {
      return false;
    }

    return true;
  });
}
