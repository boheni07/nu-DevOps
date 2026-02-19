# 04. 데이터 모델 (Data Models)

nu-DevOps에서 사용하는 주요 데이터 타입(`types.ts`) 정의입니다.

## 1. Project (프로젝트)
프로젝트의 기본 정보를 담고 있습니다.
```typescript
interface Project {
  id: string;          // 고유 ID (예: 'PRJ-2024-ERP')
  name: string;        // 프로젝트명
  description: string; // 설명
  startDate: string;   // 시작일 (YYYY-MM-DD)
  endDate: string;     // 종료일 (YYYY-MM-DD)
  status: 'Active' | 'Planning' | 'Completed' | 'On Hold';
  clientId: string;    // 발주처 담당자 ID
  managerId: string;   // 프로젝트 관리자(PM) ID
  plId: string;        // 프로젝트 리더(PL) ID
  notes?: string;      // 비고
}
```

## 2. Task (업무)
WBS의 각 항목을 구성하는 단위입니다.
```typescript
interface Task {
  id: string;          // 고유 ID
  projectId: string;   // 소속 프로젝트 ID
  title: string;       // 업무명
  parentId?: string;   // 상위 업무 ID (계층 구조)
  assigneeId: string;  // 담당자 ID ('unassigned' 가능)
  status: 'To Do' | 'In Progress' | 'Done' | 'Blocked' | 'Start Delayed' | 'End Delayed';
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;   // 계획 시작일
  endDate: string;     // 계획 종료일
  actualStartDate?: string; // 실제 시작일
  actualEndDate?: string;   // 실제 종료일
  workingDays: number; // 소요 공수 (일 단위)
  progress: number;    // 진척률 (0~100)
  description?: string;// 상세 설명
}
```

## 3. Resource (리소스/사용자)
프로젝트에 참여하는 인력입니다.
```typescript
interface Resource {
  id: string;          // 고유 사용자 ID
  loginId: string;     // 로그인 ID
  password: string;    // 비밀번호
  name: string;        // 이름 (예: '김철수')
  organizationName: string; // 소속 기관명
  role: string;        // 역할 (예: '시스템 아키텍트')
  department: string;  // 부서명
  email: string;       // 이메일
  status: 'Active' | 'Inactive';
  classification: 'Admin' | 'Employee' | 'Client'; // 사용자 권한 분류
  joinDate: string;    // 입사일/등록일
  capacity: number;    // 가용 공수 (Max Capacity)
  avatar: string;      // 프로필 이미지 URL
}
```

## 4. UserOrganization (이용 기관)
시스템을 사용하는 회사나 부서 정보입니다.
```typescript
interface UserOrganization {
  id: string;
  name: string;        // 기관명
  businessRegistrationNumber: string; // 사업자등록번호
  representativeName: string; // 대표자명
  phone: string;       // 연락처
  zipCode: string;     // 우편번호
  address: string;     // 주소
  ciLogo?: string;     // CI/로고 이미지 URL
  systemAdminId: string; // 시스템 관리자 ID
}
```
