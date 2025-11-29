export interface Candidate {
  id: string;
  department: string;
  name: string;
  className: string;
  votes: number;
}

export type AppState = 'setup' | 'voting' | 'results';

export interface DepartmentGroup {
  name: string;
  candidates: Candidate[];
}

export interface Winner {
  department: string;
  candidates: Candidate[];
  maxVotes: number;
}