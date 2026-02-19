# 데이터베이스 스키마 상세 (Database Schema Detail)

현재의 Mock 데이터를 실제 엔터프라이즈급 RDBMS(PostgreSQL/Supabase)로 전환하기 위한 상세 데이터 모델 설계입니다.

## 1. ERD 개요 (핵심 테이블)

### `organizations` (이용 기관)
- `id`: UUID (Primary Key)
- `name`: VARCHAR(100)
- `registration_number`: VARCHAR(20)
- `representative`: VARCHAR(50)
- `ci_logo_url`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

### `projects` (프로젝트)
- `id`: VARCHAR(50) (Primary Key)
- `org_id`: UUID (Foreign Key)
- `name`: VARCHAR(200)
- `description`: TEXT
- `start_date`: DATE
- `end_date`: DATE
- `status`: ENUM ('active', 'planning', 'completed', 'on_hold')
- `manager_id`: UUID (Foreign Key to users)

### `tasks` (업무/WBS)
- `id`: UUID (Primary Key)
- `project_id`: VARCHAR(50) (Foreign Key)
- `parent_id`: UUID (Self-referencing Foreign Key)
- `title`: VARCHAR(255)
- `assignee_id`: UUID (Foreign Key to users)
- `status`: ENUM ('todo', 'in_progress', 'done', 'blocked')
- `progress`: INTEGER (0-100)
- `start_date`: DATE
- `end_date`: DATE

## 2. 성능 최적화 전략
- **인덱싱**: `project_id` 및 `assignee_id`에 인덱스를 생성하여 조인 성능 최적화.
- **계층형 쿼리**: WBS 구조 조회를 위해 `WITH RECURSIVE` 구문 활용 권장.
- **감사 로그(Audit Log)**: 모든 데이터 수정 이력에 담당자와 시간을 기록하는 트리거 구현.
