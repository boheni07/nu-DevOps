# 02. 시스템 아키텍처 (System Architecture)

## 1. 개요
nu-DevOps는 React 기반의 Single Page Application (SPA)으로 구성되어 있습니다. Vite를 빌드 도구로 사용하여 빠른 개발 경험과 최적화된 빌드 성능을 제공합니다. UI 컴포넌트 간의 상태 관리는 React Hooks (`useState`, `useMemo`, `useEffect`)를 주로 사용하며, 전역적인 데이터 흐름은 Prop Drilling을 최소화하는 구조로 설계되었습니다.

## 2. 디렉토리 구조

```
nu-DevOps/
├── public/              # 정적 자산 (favicon 등)
├── src/
│   ├── components/      # 주요 기능별 컴포넌트
│   │   ├── Dashboard.tsx        # 메인 대시보드
│   │   ├── WBSManager.tsx       # WBS 관리
│   │   ├── GanttChart.tsx       # 간트 차트
│   │   ├── MyTasks.tsx          # 칸반 보드
│   │   ├── ...
│   ├── constants.tsx    # 상수 데이터 (Mock Data, 설정값)
│   ├── types.ts         # TypeScript 인터페이스 및 타입 정의
│   ├── App.tsx          # 메인 앱 컴포넌트 및 라우팅 설정
│   └── main.tsx         # 진입점 (Entry Point)
├── docs/                # 프로젝트 문서
├── .env.local           # 환경 변수 (API Key 등)
├── index.html           # HTML 템플릿
├── package.json         # 의존성 및 스크립트 정의
├── tailwind.config.js   # Tailwind CSS 설정
├── tsconfig.json        # TypeScript 설정
└── vite.config.ts       # Vite 설정
```

## 3. 핵심 컴포넌트 구조

### App.tsx
- **라우팅 (Routing)**: `react-router-dom`을 사용하여 페이지 간 이동을 처리합니다.
- **레이아웃 (Layout)**:
    - **Sidebar**: 좌측 고정 내비게이션 메뉴. `flex-shrink-0` 및 고정 너비(`w-52`)를 가집니다.
    - **Header**: 상단 검색바 및 프로젝트 선택 드롭다운.
    - **Main Content**: `flex-1`을 사용하여 남은 공간을 차지하며, 라우트에 따라 변경되는 콘텐츠 영역입니다.
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
