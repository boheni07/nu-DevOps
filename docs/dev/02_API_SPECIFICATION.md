# API 명세 가이드 (API Specification)

> [!NOTE]
> 본 문서는 현재의 클라이언트 사이드 데이터 관리 방식에서 **향후 백엔드 서비스 도입 시 적용될 표준 API 명세 제안서**입니다.

## 1. API 디자인 원칙
- **RESTful API**: 리소스 중심의 일관된 엔드포인트 구조 지향.
- **JSON Standard**: 모든 응답은 표준 JSON 포맷을 사용하며, 메타데이터와 결과 데이터를 분리하여 제공.
- **인증 및 보안**: JWT 기반 인증 보완 및 RBAC(Role-Based Access Control) 적용.

## 2. 주요 엔드포인트 제안 (Key Endpoints)

### Projects & WBS
- `GET /api/v1/projects`: 프로젝트 목록 및 기본 정보 조회.
- `GET /api/v1/projects/{id}/tasks`: 특정 프로젝트의 전체 WBS 트리 조회.
- `POST /api/v1/projects`: 신규 프로젝트 생성 (PM 권한).

### Tasks & Work Logs
- `PATCH /api/v1/tasks/{id}`: 업무 상태, 진척률, 담당자 업데이트.
- `POST /api/v1/tasks/{id}/logs`: 실시간 업무 수행 로그 기록 및 히스토리 관리.

### Performance Reports
- `POST /api/v1/reports`: 업무 로그를 기반으로 한 성과 리포트 자동 생성 요청.
- `PATCH /api/v1/reports/{id}/submit`: 리포트 제출 및 수정 제한 활성화.
- `PATCH /api/v1/reports/{id}/approve`: PM 승인 및 실적 확정.

## 3. 향후 아키텍처 확장 계획
- **API Gateway**: 트래픽 관리 및 통합 인증 처리를 위한 에지 서버 도입.
- **WebSocket**: WBS 편집 시 실시간 동기화를 위한 양방향 통신 지원 검토.
- **AI Integration**: API 서버 측에서의 Gemini AI 모델 직접 호출 및 분석 결과 제공.

