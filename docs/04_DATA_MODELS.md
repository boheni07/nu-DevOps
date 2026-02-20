# 04. 데이터 모델 (Data Models)

nu-DevOps에서 사용하는 주요 데이터 타입(`types.ts`) 정의입니다.

## 1. Project (프로젝트)
프로젝트의 기본 정보를 담고 있습니다.
```typescript
interface Project {
  id: string;          // 고유 ID
  name: string;        // 프로젝트명
  description: string; // 설명
  startDate: string;   // 시작일 (YYYY-MM-DD)
  endDate: string;     // 종료일 (YYYY-MM-DD)
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  clientId: string;    // 발주처 담당자 ID
  managerId: string;   // 프로젝트 관리자(PM) ID
  plId?: string;       // 프로젝트 리더(PL) ID
  notes?: string;      // 비고
}
```

## 2. Task (업무)
WBS의 각 항목을 구성하는 단위이며, 하위에 `WorkLog`를 포함할 수 있습니다.
```typescript
interface Task {
  id: string;          // 고유 ID
  projectId: string;   // 소속 프로젝트 ID
  title: string;       // 업무명
  assigneeId: string;  // 담당자 ID
  status: 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Blocked' | 'Start Delayed' | 'End Delayed';
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;   // 계획 시작일
  endDate: string;     // 계획 종료일
  actualStartDate?: string;
  actualEndDate?: string;
  workingDays: number; // 소요 공수
  progress: number;    // 진척률 (0~100)
  parentId?: string;   // 상위 업무 ID (계층 구조)
  description?: string;
  workLogs?: WorkLog[]; // 업무 수행 기록 리스트
}
```

## 3. WorkLog (업무 일지)
개별 업무에 대한 상세 수행 기록입니다.
```typescript
interface WorkLog {
  id: string;
  date: string;        // 기록 날짜
  content: string;     // 수행 내용
}
```

## 4. PerformanceReport (성과 리포트)
성과 측정 및 업무 보고를 위한 데이터 모델입니다.
```typescript
interface PerformanceReport {
  id: string;
  projectId: string;   // 대상 프로젝트
  type: '일간' | '주간' | '월간';
  startDate: string;   // 집계 시작일
  endDate: string;     // 집계 종료일
  generatedAt: string; // 생성 일시
  summary: string;     // 종합 의견 및 업무보고 내용
  tasks: Task[];       // 관련 업무 리스트
  logs: { task: Task; log: WorkLog }[]; // 상세 로그 매핑 데이터
  status: 'Draft' | 'Submitted' | 'Approved'; // 리포트 상태
  reporterId: string;  // 작성자 ID
}
```

## 5. Resource (리소스/사용자)
```typescript
interface Resource {
  id: string;
  loginId: string;
  name: string;
  organizationName: string; // 소속 기관명
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive';
  classification: 'Admin' | 'Client' | 'Employee';
  joinDate: string;
  capacity: number;
  avatar: string;
}
```
