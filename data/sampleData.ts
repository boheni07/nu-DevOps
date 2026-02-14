import { Project, Task, Resource } from '../types';

export const SAMPLE_RESOURCES: Resource[] = [
    // 1. 관리자 (Admin)
    { id: 'admin', loginId: 'admin', password: '0000', name: '시스템 관리자', organizationName: '(주)넥서스 테크놀로지', role: 'Chief Administrator', department: 'IT 거버넌스', email: 'admin@nexus.dev', status: 'Active', classification: 'Admin', joinDate: '2024-01-01', capacity: 999, avatar: 'https://picsum.photos/seed/admin/100/100' },

    // 2. 임직원 (Employees - 5명)
    { id: 'emp1', loginId: 'chulsoo', password: '0000', name: '김철수', organizationName: '(주)넥서스 테크놀로지', role: '수석 아키텍트', department: '플랫폼본부', email: 'chulsoo@nexus.dev', status: 'Active', classification: 'Employee', joinDate: '2023-01-01', capacity: 100, avatar: 'https://picsum.photos/seed/alex/100/100' },
    { id: 'emp2', loginId: 'younghee', password: '0000', name: '이영희', organizationName: '(주)넥서스 테크놀로지', role: 'PM / PL', department: '솔루션사업부', email: 'younghee@nexus.dev', status: 'Active', classification: 'Employee', joinDate: '2023-03-15', capacity: 100, avatar: 'https://picsum.photos/seed/sarah/100/100' },
    { id: 'emp3', loginId: 'minsoo', password: '0000', name: '박민수', organizationName: '(주)넥서스 테크놀로지', role: '시니어 개발자', department: '개발1팀', email: 'minsoo@nexus.dev', status: 'Active', classification: 'Employee', joinDate: '2023-06-01', capacity: 100, avatar: 'https://picsum.photos/seed/david/100/100' },
    { id: 'emp4', loginId: 'jieun', password: '0000', name: '최지은', organizationName: '(주)넥서스 테크놀로지', role: 'UI/UX 디자이너', department: '디자인팀', email: 'jieun@nexus.dev', status: 'Active', classification: 'Employee', joinDate: '2023-07-20', capacity: 100, avatar: 'https://picsum.photos/seed/lisa/100/100' },
    { id: 'emp5', loginId: 'dongwook', password: '0000', name: '강동욱', organizationName: '(주)넥서스 테크놀로지', role: '백엔드 개발자', department: '개발2팀', email: 'dongwook@nexus.dev', status: 'Active', classification: 'Employee', joinDate: '2023-09-01', capacity: 100, avatar: 'https://picsum.photos/seed/sam/100/100' },

    // 3. 고객 (Clients - 2명)
    { id: 'client1', loginId: 'client1', password: '0000', name: '최고객', organizationName: '대한금융', role: 'IT 기획 팀장', department: 'IT 기획팀', email: 'client1@finance.com', status: 'Active', classification: 'Client', joinDate: '2024-01-01', capacity: 0, avatar: 'https://picsum.photos/seed/client1/100/100' },
    { id: 'client2', loginId: 'client2', password: '0000', name: '박담당', organizationName: '대한금융', role: '현업 담당자', department: '디지털혁신팀', email: 'client2@finance.com', status: 'Active', classification: 'Client', joinDate: '2024-02-01', capacity: 0, avatar: 'https://picsum.photos/seed/client2/100/100' },
];

export const SAMPLE_PROJECTS: Project[] = [
    {
        id: 'PRJ-SAMPLE-01',
        name: '차세대 모바일 뱅킹 구축',
        description: '기존 뱅킹 앱을 클라우드 네이티브 환경으로 전환하고 UX/UI를 전면 개편합니다.',
        startDate: '2024-04-01',
        endDate: '2024-11-30',
        status: 'Active',
        clientId: 'client1',
        managerId: 'emp2', // 이영희 (PM)
        plId: 'emp1', // 김철수 (PL/Architect)
        notes: '금융보안원 가이드라인 준수 필수'
    },
    {
        id: 'PRJ-SAMPLE-02',
        name: '사내 업무포털 고도화',
        description: '임직원 생산성 향상을 위한 협업 도구 및 결재 시스템 통합',
        startDate: '2024-05-15',
        endDate: '2024-09-30',
        status: 'Planning',
        clientId: 'client2',
        managerId: 'emp2',
        plId: 'emp3',
        notes: '모바일 오피스 지원 포함'
    },
    {
        id: 'PRJ-SAMPLE-03',
        name: 'AI 기반 챗봇 상담 시스템',
        description: '고객 응대 효율화를 위한 LLM 기반 챗봇 구축',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        status: 'Active',
        clientId: 'client1',
        managerId: 'emp1',
        notes: 'FAQ 데이터 10만건 학습 필요'
    }
];

export const SAMPLE_TASKS: Task[] = [
    // ==========================================
    // Project 1: 차세대 모바일 뱅킹 구축 (Total: 15 Tasks)
    // ==========================================

    // Phase 1: 분석 (3 tasks)
    { id: 'p1-ph1', projectId: 'PRJ-SAMPLE-01', title: '분석 단계', assigneeId: 'emp2', status: 'Done', priority: 'High', startDate: '2024-04-01', endDate: '2024-04-30', workingDays: 30, progress: 100 },
    { id: 'p1-t01', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph1', title: '현행 시스템 분석', assigneeId: 'emp1', status: 'Done', priority: 'Medium', startDate: '2024-04-01', endDate: '2024-04-10', workingDays: 10, progress: 100 },
    { id: 'p1-t02', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph1', title: '요구사항 정의', assigneeId: 'emp2', status: 'Done', priority: 'High', startDate: '2024-04-11', endDate: '2024-04-20', workingDays: 10, progress: 100 },

    // Phase 2: 설계 (3 tasks)
    { id: 'p1-ph2', projectId: 'PRJ-SAMPLE-01', title: '설계 단계', assigneeId: 'emp1', status: 'Done', priority: 'High', startDate: '2024-05-01', endDate: '2024-06-15', workingDays: 45, progress: 100 },
    { id: 'p1-t04', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph2', title: '시스템 아키텍처 설계', assigneeId: 'emp1', status: 'Done', priority: 'High', startDate: '2024-05-01', endDate: '2024-05-15', workingDays: 15, progress: 100 },
    { id: 'p1-t05', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph2', title: 'UI/UX 디자인', assigneeId: 'emp4', status: 'Done', priority: 'High', startDate: '2024-05-01', endDate: '2024-05-31', workingDays: 31, progress: 100 },

    // Phase 3: 구현 (4 tasks)
    { id: 'p1-ph3', projectId: 'PRJ-SAMPLE-01', title: '구현 단계', assigneeId: 'emp1', status: 'In Progress', priority: 'High', startDate: '2024-06-16', endDate: '2024-09-30', workingDays: 107, progress: 45 },
    { id: 'p1-t08', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph3', title: '개발 환경 구성', assigneeId: 'emp5', status: 'Done', priority: 'Medium', startDate: '2024-06-16', endDate: '2024-06-20', workingDays: 5, progress: 100 },
    { id: 'p1-t09', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph3', title: '공통 프레임워크 개발', assigneeId: 'emp1', status: 'Done', priority: 'High', startDate: '2024-06-21', endDate: '2024-07-10', workingDays: 20, progress: 100 },
    { id: 'p1-t10', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph3', title: '핵심 서비스 개발', assigneeId: 'emp3', status: 'In Progress', priority: 'High', startDate: '2024-07-11', endDate: '2024-08-31', workingDays: 52, progress: 70 },

    // Phase 4: 테스트 (3 tasks)
    { id: 'p1-ph4', projectId: 'PRJ-SAMPLE-01', title: '테스트 단계', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-10-01', endDate: '2024-11-15', workingDays: 46, progress: 0 },
    { id: 'p1-t13', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph4', title: '통합 테스트', assigneeId: 'emp1', status: 'To Do', priority: 'High', startDate: '2024-10-16', endDate: '2024-10-31', workingDays: 16, progress: 0 },
    { id: 'p1-t16', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph4', title: '사용자 인수 테스트(UAT)', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-11-11', endDate: '2024-11-15', workingDays: 5, progress: 0 },

    // Phase 5: 전개 (2 tasks)
    { id: 'p1-ph5', projectId: 'PRJ-SAMPLE-01', title: '전개 단계', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-11-16', endDate: '2024-11-30', workingDays: 15, progress: 0 },
    { id: 'p1-t18', projectId: 'PRJ-SAMPLE-01', parentId: 'p1-ph5', title: '서비스 오픈', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-11-21', endDate: '2024-11-21', workingDays: 1, progress: 0 },


    // ==========================================
    // Project 2: 사내 업무포털 고도화 (Total: 15 Tasks)
    // ==========================================

    // Phase 1: 분석 (3 tasks)
    { id: 'p2-ph1', projectId: 'PRJ-SAMPLE-02', title: '분석 단계', assigneeId: 'emp2', status: 'Done', priority: 'Medium', startDate: '2024-05-15', endDate: '2024-05-31', workingDays: 17, progress: 100 },
    { id: 'p2-t01', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph1', title: '사용자 요구사항 수집', assigneeId: 'emp2', status: 'Done', priority: 'High', startDate: '2024-05-15', endDate: '2024-05-20', workingDays: 6, progress: 100 },
    { id: 'p2-t03', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph1', title: 'WBS 상세 수립', assigneeId: 'emp2', status: 'Done', priority: 'High', startDate: '2024-05-26', endDate: '2024-05-31', workingDays: 6, progress: 100 },

    // Phase 2: 설계 (3 tasks)
    { id: 'p2-ph2', projectId: 'PRJ-SAMPLE-02', title: '설계 단계', assigneeId: 'emp3', status: 'In Progress', priority: 'High', startDate: '2024-06-01', endDate: '2024-06-30', workingDays: 30, progress: 80 },
    { id: 'p2-t04', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph2', title: '화면 UI 설계', assigneeId: 'emp4', status: 'Done', priority: 'Medium', startDate: '2024-06-01', endDate: '2024-06-20', workingDays: 20, progress: 100 },
    { id: 'p2-t05', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph2', title: '프로세스 정의', assigneeId: 'emp3', status: 'In Progress', priority: 'High', startDate: '2024-06-15', endDate: '2024-06-30', workingDays: 16, progress: 50 },

    // Phase 3: 구현 (4 tasks)
    { id: 'p2-ph3', projectId: 'PRJ-SAMPLE-02', title: '구현 단계', assigneeId: 'emp5', status: 'In Progress', priority: 'High', startDate: '2024-07-01', endDate: '2024-08-31', workingDays: 62, progress: 20 },
    { id: 'p2-t06', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph3', title: '포털 프레임워크 구축', assigneeId: 'emp5', status: 'In Progress', priority: 'High', startDate: '2024-07-01', endDate: '2024-07-15', workingDays: 15, progress: 60 },
    { id: 'p2-t07', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph3', title: '게시판/일정관리 개발', assigneeId: 'emp3', status: 'To Do', priority: 'Medium', startDate: '2024-07-16', endDate: '2024-08-10', workingDays: 26, progress: 0 },
    { id: 'p2-t08', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph3', title: '전자결재 개발', assigneeId: 'emp5', status: 'To Do', priority: 'High', startDate: '2024-08-01', endDate: '2024-08-31', workingDays: 31, progress: 0 },

    // Phase 4: 테스트 (3 tasks)
    { id: 'p2-ph4', projectId: 'PRJ-SAMPLE-02', title: '테스트 단계', assigneeId: 'emp1', status: 'To Do', priority: 'High', startDate: '2024-09-01', endDate: '2024-09-20', workingDays: 20, progress: 0 },
    { id: 'p2-t09', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph4', title: '통합 테스트', assigneeId: 'emp3', status: 'To Do', priority: 'Medium', startDate: '2024-09-01', endDate: '2024-09-15', workingDays: 15, progress: 0 },
    { id: 'p2-t10', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph4', title: '결함 조치', assigneeId: 'emp5', status: 'To Do', priority: 'High', startDate: '2024-09-16', endDate: '2024-09-20', workingDays: 5, progress: 0 },

    // Phase 5: 전개 (2 tasks)
    { id: 'p2-ph5', projectId: 'PRJ-SAMPLE-02', title: '전개 단계', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-09-21', endDate: '2024-09-30', workingDays: 10, progress: 0 },
    { id: 'p2-t12', projectId: 'PRJ-SAMPLE-02', parentId: 'p2-ph5', title: '서비스 오픈', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-09-30', endDate: '2024-09-30', workingDays: 1, progress: 0 },


    // ==========================================
    // Project 3: AI 기반 챗봇 상담 시스템 (Total: 15 Tasks)
    // ==========================================

    // Phase 1: 분석 (3 tasks)
    { id: 'p3-ph1', projectId: 'PRJ-SAMPLE-03', title: '분석 단계', assigneeId: 'emp1', status: 'Done', priority: 'High', startDate: '2024-06-01', endDate: '2024-06-30', workingDays: 30, progress: 100 },
    { id: 'p3-t01', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph1', title: 'AI 도입 타당성 검토', assigneeId: 'emp1', status: 'Done', priority: 'High', startDate: '2024-06-01', endDate: '2024-06-15', workingDays: 15, progress: 100 },
    { id: 'p3-t02', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph1', title: 'LLM 솔루션 선정', assigneeId: 'emp1', status: 'Done', priority: 'High', startDate: '2024-06-16', endDate: '2024-06-30', workingDays: 15, progress: 100 },

    // Phase 2: 설계 (3 tasks)
    { id: 'p3-ph2', projectId: 'PRJ-SAMPLE-03', title: '설계 단계', assigneeId: 'emp1', status: 'In Progress', priority: 'High', startDate: '2024-07-01', endDate: '2024-08-15', workingDays: 46, progress: 80 },
    { id: 'p3-t03', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph2', title: 'RAG 아키텍처 설계', assigneeId: 'emp1', status: 'Done', priority: 'High', startDate: '2024-07-01', endDate: '2024-07-15', workingDays: 15, progress: 100 },
    { id: 'p3-t04', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph2', title: '데이터 파이프라인 설계', assigneeId: 'emp5', status: 'In Progress', priority: 'High', startDate: '2024-07-16', endDate: '2024-07-31', workingDays: 16, progress: 60 },

    // Phase 3: 구현 (4 tasks)
    { id: 'p3-ph3', projectId: 'PRJ-SAMPLE-03', title: '구현 단계', assigneeId: 'emp5', status: 'To Do', priority: 'High', startDate: '2024-08-16', endDate: '2024-10-31', workingDays: 77, progress: 0 },
    { id: 'p3-t06', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph3', title: '데이터 수집 및 정제', assigneeId: 'emp5', status: 'In Progress', priority: 'High', startDate: '2024-08-16', endDate: '2024-09-15', workingDays: 31, progress: 30 },
    { id: 'p3-t07', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph3', title: '벡터 DB 구축', assigneeId: 'emp5', status: 'To Do', priority: 'High', startDate: '2024-09-16', endDate: '2024-09-30', workingDays: 15, progress: 0 },
    { id: 'p3-t09', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph3', title: '챗봇 클라이언트 개발', assigneeId: 'emp3', status: 'To Do', priority: 'Medium', startDate: '2024-10-16', endDate: '2024-10-31', workingDays: 16, progress: 0 },

    // Phase 4: 테스트 (3 tasks)
    { id: 'p3-ph4', projectId: 'PRJ-SAMPLE-03', title: '테스트 단계', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-11-01', endDate: '2024-12-10', workingDays: 40, progress: 0 },
    { id: 'p3-t10', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph4', title: '정확도 평가', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-11-01', endDate: '2024-11-20', workingDays: 20, progress: 0 },
    { id: 'p3-t12', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph4', title: '시범 운영', assigneeId: 'emp2', status: 'To Do', priority: 'Medium', startDate: '2024-12-01', endDate: '2024-12-10', workingDays: 10, progress: 0 },

    // Phase 5: 전개 (2 tasks)
    { id: 'p3-ph5', projectId: 'PRJ-SAMPLE-03', title: '전개 단계', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-12-11', endDate: '2024-12-31', workingDays: 21, progress: 0 },
    { id: 'p3-t15', projectId: 'PRJ-SAMPLE-03', parentId: 'p3-ph5', title: '그랜드 오픈', assigneeId: 'emp2', status: 'To Do', priority: 'High', startDate: '2024-12-31', endDate: '2024-12-31', workingDays: 1, progress: 0 },
];
