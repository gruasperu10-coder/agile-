export type Status = 'Backlog' | 'Sprint Backlog' | 'In Progress' | 'Done';

export interface UserStory {
  id: string;
  title: string;
  description: string; // As a... I need... So that...
  acceptanceCriteria: string; // Given... When... Then...
  status: Status;
  estimate: number;
  labels: string[];
  assignee: string;
  sprintId?: string;
  isTechnicalDebt?: boolean;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
}

export interface BurndownData {
  day: string;
  remainingPoints: number;
}
