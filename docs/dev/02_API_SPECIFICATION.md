# API 명세 가이드 (API Specification)

프론트엔드와 백엔드 간의 효율적인 데이터 통신을 위한 표준 명세 가이드입니다.

## 1. API 원칙
- **RESTful**: 리소스 중심으로 엔드포인트를 구성합니다.
- **Versioning**: `/api/v1/...` 처럼 경로에 버전을 명시하여 변경 관리를 수행합니다.
- **Response Format**: 모든 응답은 고정된 JSON 형식을 유지합니다.
  ```json
  {
    "status": "success",
    "data": { ... },
    "error": null
  }
  ```

## 2. 주요 엔드포인트 제안

### Projects
- `GET /api/v1/projects`: 프로젝트 목록 조회
- `POST /api/v1/projects`: 신규 프로젝트 생성
- `GET /api/v1/projects/{id}`: 특정 프로젝트 상세 정보 및 WBS 조회

### Tasks
- `PATCH /api/v1/tasks/{id}`: 업무 상태 및 진행률 업데이트
- `DELETE /api/v1/tasks/{id}`: 업무 삭제

### Performance Reports
- `GET /api/v1/reports`: 본인 또는 소속 프로젝트의 리포트 목록 조회
- `POST /api/v1/reports`: 신규 리포트 생성 및 실적 집계
- `PATCH /api/v1/reports/{id}`: 리포트 수정, 제출(Submit) 또는 승인(Approve) 처리

### Work Logs
- `POST /api/v1/tasks/{taskId}/logs`: 특정 업무에 대한 수행 로그 기록
- `GET /api/v1/tasks/{taskId}/logs`: 업무별 로그 히스토리 조회

## 3. 인증 및 보안
- **JWT (JSON Web Token)**: 헤더의 `Authorization: Bearer <token>`을 통해 사용자 인증을 수행합니다.
- **RBAC (Role-Based Access Control)**: 사용자 권한(Admin, Employee, Client)에 따른 엔드포인트 접근 권한을 서버 측에서 철저히 검증합니다.
