
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Blocked' | 'Start Delayed' | 'End Delayed';
export type MemberStatus = 'Active' | 'Inactive';
export type ResourceClassification = 'Admin' | 'Client' | 'Employee';

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';

export interface WorkLog {
  id: string;
  date: string;
  content: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assigneeId: string;
  status: Status;
  priority: Priority;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  workingDays: number;
  progress: number;
  parentId?: string;
  description?: string;
  workLogs?: WorkLog[];
}

export interface Resource {
  id: string;
  loginId: string;
  password?: string;
  name: string;
  organizationName: string; // 소속기관명 추가
  role: string;
  department: string;
  email: string;
  phone?: string;
  status: MemberStatus;
  classification: ResourceClassification;
  joinDate: string;
  capacity: number;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  clientId: string; // 회원에서 선택 (고객사/담당자)
  managerId: string; // PM
  plId?: string; // PL (선택사항)
  notes?: string; // 참고사항
}

export interface UserOrganization {
  id: string;
  name: string;
  businessRegistrationNumber: string;
  representativeName: string;
  phone: string;
  zipCode: string;
  address: string;
  systemAdminId: string;
  systemAdminPassword?: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  atRiskTasks: number;
  overallProgress: number;
  resourceUtilization: number;
}

export interface PerformanceReport {
  id: string;
  projectId: string;
  type: '일간' | '주간' | '월간';
  startDate: string;
  endDate: string;
  generatedAt: string;
  summary: string;
  tasks: Task[];
  logs: { task: Task; log: WorkLog }[];
  status: 'Draft' | 'Submitted' | 'Approved';
  reporterId: string;
}
