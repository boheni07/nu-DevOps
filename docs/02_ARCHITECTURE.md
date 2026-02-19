# 02. 시스템 아키텍처 (System Architecture)

## 1. 개요
**nu-DevOps**는 소프트웨어 개발 프로젝트의 전 과정을 효율적으로 관리하고 협업을 촉진하기 위해 설계된 차세대 DevOps 플랫폼입니다. 프로젝트 계획부터 실행, 모니터링, 리소스 관리까지 통합된 환경을 제공하며, 특히 **Gemini AI**를 활용하여 프로젝트 인사이트와 리소스 최적화 제안을 실시간으로 제공합니다.

## AI 기반 혁신
-   **자동 상세 보고서**: 프로젝트 데이터를 분석하여 주요 성과와 리스크를 포함한 Executive Summary를 자동 생성합니다.
-   **지능형 리소스 최적화**: 팀원들의 업무 부하를 분석하고, 병목 현상을 해결하기 위한 최적의 업무 재배치 전략을 AI가 제안합니다.
nu-DevOps는 React 기반의 Single Page Application (SPA)으로 구성되어 있습니다. Vite를 빌드 도구로 사용하여 빠른 개발 경험과 최적화된 빌드 성능을 제공합니다. UI 컴포넌트 간의 상태 관리는 React Hooks (`useState`, `useMemo`, `useEffect`)를 주로 사용하며, 전역적인 데이터 흐름은 Prop Drilling을 최소화하는 구조로 설계되었습니다.

## 2. 디렉토리 구조

```
nu-DevOps/
├── public/              # 정적 자산 (favicon 등)
├── src/ (Root의 App.tsx 등 포함)
│   ├── components/      # 주요 기능별 UI 컴포넌트
│   ├── services/        # 외부 서비스 연동 (Gemini AI 등)
│   │   └── geminiService.ts # Google Gemini AI API 연동 로직
│   ├── constants.tsx    # 시스템 상수 및 초기 Mock Data
│   ├── types.ts         # TypeScript 인터페이스 및 공통 타입 정의
│   └── App.tsx          # 메인 엔트리 및 앱 라우팅
├── docs/                # 시스템 상세 문서
├── .env.local           # 환경 변수 (API Key 등)
├── index.html           # HTML 템플릿
├── package.json         # 의존성 및 스크립트 정의
├── tailwind.config.js   # Tailwind CSS 설정
├── tsconfig.json        # TypeScript 설정
└── vite.config.ts       # Vite 설정
```

## 3. 핵심 컴포넌트 구조

### AI Service (`geminiService.ts`)
- Google Generative AI SDK(`@google/genai`)를 사용하여 Gemini 2.0 Flash 모델과 통신합니다.
- 환경 변수(`GEMINI_API_KEY`)를 통해 인증을 수행하며, 키가 없을 경우 적절한 폴백(Fallback) 메시지를 제공합니다.

### App.tsx
- **라우팅 (Routing)**: `react-router-dom`을 사용하여 페이지 간 이동을 처리합니다.
- **레이아웃**:
    - 좌측 메뉴(Sidebar)의 너비를 고정하고 메인 콘텐츠 영역이 남은 공간을 채우도록 개선(`flex-1` 적용).
- **AI 서비스**:
    - `services/geminiService.ts` 추가 및 Gemini AI 연동.
    - 대시보드 및 리소스 최적화 화면에 AI 기반 인사이트 기능 추가.
- **상태 관리**:
    - `currentUser`: 현재 로그인한 사용자 정보
    - `currentProjectId`: 현재 선택된 프로젝트 ID
    - `tasks`, `projects`, `resources`: 주요 데이터 (초기 상태는 `constants.tsx` 등에서 로드)

### WBSManager.tsx (Work Breakdown Structure)
- `@dnd-kit` 라이브러리를 사용하여 업무의 순서 변경 및 계층 이동(Drag & Drop)을 구현했습니다.
- 업무 추가/수정/삭제 시 `recalculateHierarchy` 함수를 통해 상위 업무의 일정 및 진척률을 자동으로 재계산합니다.

### GanttChart.tsx
- `App.tsx`로부터 전달받은 `tasks` 데이터를 시간축에 따라 시각화합니다.
- **반응형 렌더링**: `ResizeObserver`를 사용하여 컨테이너 크기 변경 시 차트 셀 너비를 자동으로 다시 계산(`fitToWidth`)합니다.
- **2단 헤더**: 월 단위 그룹핑과 상세 날짜(일/주)를 2단으로 표시하여 가독성을 높였습니다.

## 4. 데이터 흐름
- 현재 버전은 로컬 상태와 `localStorage`를 사용하여 데이터를 관리합니다.
- 추후 백엔드 API 연동 시 `services/` 폴더 내에 API 호출 로직을 분리하고, React Query 등의 상태 관리 라이브러리 도입을 고려할 수 있습니다.
