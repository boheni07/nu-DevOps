# 05. 변경 이력 (Changelog)

## [Unreleased]

### Added
- **문서화**: `/docs` 폴더 생성 및 주요 문서(`INTRODUCTION`, `ARCHITECTURE`, `USER_GUIDE` 등) 작성.
- **간트 차트**:
    - 주간 보기(Weekly View) 모드 추가.
    - 화면 크기에 따른 셀 너비 자동 조절(Fit-to-Width) 기능 구현.
    - 2단 날짜 헤더(Top: Year.Month, Bottom: Day/Week) 적용.
- **레이아웃**:
    - 좌측 메뉴(Sidebar)의 너비를 고정하고 메인 콘텐츠 영역이 남은 공간을 채우도록 개선(`flex-1` 적용).
- **Gemini AI 연동**:
    - `gemini-2.0-flash` 모델을 사용하여 프로젝트 진행 보고서 자동 생성 기능 구현.
    - AI 기반 리소스 최적화 및 업무 재배치 제안 기능 추가.
    - **Gemini AI**를 활용한 데이터 기반 의사결정 지원 기능 강화.

### Changed
- **WBS**:
    - Assignee(담당자) 및 Schedule(일정) 열의 텍스트 굵기를 `font-black`에서 보통(`font-normal` 또는 기본값)으로 변경하여 가독성 개선.
- **UI/UX**:
    - 전반적인 레이아웃의 반응형 동작 최적화.

### Fixed
- **레이아웃**: 브라우저 창 크기 변경 시 콘텐츠 영역이 부자연스럽게 잘리거나 여백이 남는 문제 해결.
