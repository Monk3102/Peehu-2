export type RecordType = 'openings' | 'universities' | 'supervisors';

export interface ResearchGroupSupervisor {
  name?: string;
  group?: string;
  summary?: string;
}

export interface ResearchWork {
  description?: string;
  summary?: string;
  researchAreas?: string[];
  groupsAndSupervisors?: ResearchGroupSupervisor[];
}

export interface University {
  id: string;
  name: string;
  city?: string;
  country: string;
  lat: number;
  lng: number;
  url?: string;
  phdProgramUrl?: string;
  programType?: string;
  funding?: string;
  deadlineNote?: string;
  subfields?: string[];
  uncertain?: boolean;
  _t?: 'universities';
  _hay?: string;
}

export interface Opening {
  id: string;
  title: string;
  name?: string;
  universityId: string;
  deadline?: string;
  deadlineNote?: string;
  funding?: string;
  programType?: string;
  subfields?: string[];
  applyUrl?: string;
  sourceUrl?: string;
  url?: string;
  description?: string;
  researchWork?: ResearchWork;
  group?: string;
  status?: string;
  uncertain?: boolean;
  _t?: 'openings';
  _hay?: string;
}

export interface Supervisor {
  id: string;
  name: string;
  title?: string;
  universityId: string;
  group?: string;
  takingStudents?: boolean;
  subfields?: string[];
  staffPageUrl?: string;
  sourceUrl?: string;
  url?: string;
  researchWork?: ResearchWork;
  funding?: string;
  uncertain?: boolean;
  _t?: 'supervisors';
  _hay?: string;
}

export type AnyRecord = University | Opening | Supervisor;

export interface RawDataset {
  subfieldDict: string[];
  universities: any[];
  openings: any[];
  supervisors: any[];
}

export interface Dataset {
  universities: University[];
  openings: Opening[];
  supervisors: Supervisor[];
  subfieldDict: string[];
}

export type StageKey = 'saved' | 'emailed' | 'replied' | 'interview' | 'offer' | 'declined';

export interface StageDefinition {
  key: StageKey;
  label: string;
  color: string;
}

export interface TrackerEntry {
  status: StageKey | 'none';
  updatedAt?: string;
  follow?: string;
  interviewDate?: string;
}

export type TrackerStore = Record<string, TrackerEntry>;

export interface FilterState {
  search: string;
  country: string;
  subfield: string;
  hideClosed: boolean;
  fundedOnly: boolean;
  takingStudents: boolean;
}

export type TabType = 'openings' | 'universities' | 'supervisors' | 'tracker';
