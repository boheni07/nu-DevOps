# 02. 시스템 아키텍처 (System Architecture)

## 1. 개요
**nu-DevOps**는 소프트웨어 개발 프로젝트의 전 과정을 효율적으로 관리하고 협업을 촉진하기 위해 설계된 차세대 DevOps 플랫폼입니다. 프로젝트 계획부터 실행, 모니터링, 리소스 관리까지 통합된 환경을 제공하며, 특히 **Gemini AI**를 활용하여 프로젝트 인사이트와 리소스 최적화 제안을 실시간으로 제공합니다.

## AI 기반 혁신
-   **자동 상세 보고서**: 프로젝트 데이터를 분석하여 주요 성과와 리스크를 포함한 Executive Summary를 자동 생성합니다.
-   **지능형 리소스 최적화**: 팀원들의 업무 부하를 분석하고, 병목 현상을 해결하기 위한 최적의 업무 재배치 전략을 AI가 제안합니다.

nu-DevOps는 React 기반의 Single Page Application (SPA)으로 구성되어 있습니다. Vite를 빌드 도구로 사용하여 빠른 개발 경험과 최적화된 빌드 성능을 제공합니다. UI 컴포넌트 간의 상태 관리는 React Hooks (`useState`, `useMemo`, `useEffect`)를 주로 사용합니다.

## 2. 디렉토리 구조 (Current)

```
nu-DevOps/
├── components/          # 주요 기능별 UI 컴포넌트
├── data/                # 샘플 데이터 및 초기화 파일
├── services/            # 외부 서비스 연동 (Gemini AI 등)
├── docs/                # 시스템 상세 문서
├── App.tsx              # 메인 엔트리 및 앱 라우팅
├── constants.tsx        # 시스템 상수 및 초기 Mock Data
├── types.ts             # TypeScript 인터페이스 및 공통 타입 정의
├── index.html           # HTML 템플릿
├── package.json         # 의존성 및 스크립트 정의
├── tailwind.config.js   # Tailwind CSS 설정
├── tsconfig.json        # TypeScript 설정
└── vite.config.ts       # Vite 설정
```

## 3. 핵심 컴포넌트 구조

### AI Service (`services/geminiService.ts`)
- Google Generative AI SDK(`@google/genai`)를 사용하여 Gemini 2.0 Flash 모델과 통신합니다.
- 환경 변수(`GEMINI_API_KEY`)를 통해 인증을 수행하며, 키가 없을 경우 적절한 폴백(Fallback) 메시지를 제공합니다.

### App.tsx
- **라우팅 (Routing)**: `react-router-dom` (HashRouter)을 사용하여 페이지 간 이동을 처리합니다.
- **레이아웃**: 사이드바 기반의 반응형 레이아웃을 제공하며, 현재 선택된 프로젝트 정보를 전역적으로 관리합니다.
- **상태 관리**: `useState`를 통해 `projects`, `tasks`, `resources`, `organizations` 등을 관리하며, 데이터 영속성을 위해 `localStorage`를 활용합니다.

### 주요 컴포넌트
- **WBSManager**: 업무의 계층 구조 관리 및 드래그 앤 드롭 기능을 제공합니다.
- **GanttChart**: 업무 일정을 타임라인 기반으로 시각화합니다.
- **ProgressReporting**: 일간/주간/월간 보고서 생성 및 승인 워크플로우를 담당합니다.
- **ProjectManager/MemberManager**: 프로젝트와 사용자 정보를 관리합니다.
- **DataManagement**: 시스템 데이터의 백업, 복원 및 샘플 데이터 로딩 기능을 제공합니다.

## 4. 데이터 관리 방식
- **Current**: 현재 버전은 브라우저의 `localStorage`를 주 저장소로 사용하며, 초기 로딩 시 `constants.tsx` 또는 `data/sampleData.ts`에서 데이터를 로드합니다.
- **Future Plan**: 향후 엔터프라이즈 확장을 위해 Supabase(PostgreSQL) 연동 및 중앙 집중식 데이터 관리를 계획하고 있습니다.

