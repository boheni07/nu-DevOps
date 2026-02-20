# 코딩 스탠다드 (Coding Standard)

nu-DevOps 팀의 지속 가능한 코드 품질을 위한 개발 규약입니다.

## 1. 언어 및 프레임워크
- **TypeScript**: 모든 변수와 함수에는 명확한 타입을 정의해야 하며, `any` 사용은 극히 제한합니다.
- **React**: 상태 관리 시 가급적 구조가 복잡해지기 전까지는 React 내장 Hooks를 선호합니다.

## 2. 명명 규칙 (Naming Convention)
- **컴포넌트**: `PascalCase` (예: `ProjectCard.tsx`)
- **변수/필드/함수**: `camelCase` (예: `handleTaskUpdate`)
- **인터페이스/Type**: `PascalCase` (예: `TaskInterface`)
- **상수(Constants)**: `UPPER_SNAKE_CASE` (예: `MAX_CAPACITY`)

## 3. 파일 및 아키텍처
- 컴포넌트 파일 하나에 하나의 주요 컴포넌트만 포함하는 것을 원칙으로 합니다.
- 비즈니스 로직과 UI 로직은 적절히 분리하며, 복잡한 로직은 별도의 `hooks/` 또는 `utils/` 폴더로 분리합니다.

## 4. Git 및 커밋 규약
- **Commit Type**:
    - `feat`: 신규 기능 추가
    - `fix`: 버그 수정
    - `docs`: 문서 수정
    - `refactor`: 코드 리팩토링
    - `style`: 디자인 요소 수정 (로직 변경 없음)
- **Branch Strategy**: `main` (안정 버전), `develop` (병합용), `feature/관련기능` 형태를 사용합니다.

## 5. 문서화 (Documentation)
- **코드 내 주석**: 복잡한 비즈니스 로직이나 유틸리티 함수에는 JSDoc 스타일의 주석을 작성합니다.
- **프로젝트 문서**: 모든 핵심 기능 구현 시 `/docs` 내 관련 문서를 즉시 최신화하여 기술 부채를 방지합니다.
- **마크다운 활용**: 문서 작성 시 가독성을 위해 표준 마크다운 문법과 다이어그램(Mermaid 등)을 적극 활용합니다.
