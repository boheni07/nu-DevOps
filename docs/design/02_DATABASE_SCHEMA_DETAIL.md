# 데이터베이스 스키마 상세 (Database Schema Detail)

> [!NOTE]
> 본 문서는 현재의 `localStorage` 기반 데이터 관리 시스템을 엔터프라이즈급 RDBMS(PostgreSQL/Supabase)로 전환하기 위한 **향후 데이터 모델 설계 로드맵**입니다.

## 1. ERD 개요 (핵심 테이블 설계안)

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
- `status`: ENUM ('active', 'planning', 'completed', 'on_hold')
- `manager_id`: UUID (Foreign Key to users)
- `pl_id`: UUID (Foreign Key to users, Optional)
- `start_date`: DATE
- `end_date`: DATE

### `tasks` (업무/WBS)
- `id`: UUID (Primary Key)
- `project_id`: VARCHAR(50) (Foreign Key)
- `parent_id`: UUID (Self-referencing Foreign Key)
- `title`: VARCHAR(255)
- `assignee_id`: UUID (Foreign Key to users)
- `status`: ENUM ('todo', 'in_progress', 'review', 'done', 'blocked', 'start_delayed', 'end_delayed')
- `priority`: ENUM ('high', 'medium', 'low')
- `progress`: INTEGER (0-100)
- `start_date`: DATE
- `end_date`: DATE

### `work_logs` (업무 일지)
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key)
- `date`: DATE
- `content`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

### `performance_reports` (성과 리포트)
- `id`: UUID (Primary Key)
- `project_id`: VARCHAR(50) (Foreign Key)
- `reporter_id`: UUID (Foreign Key to users)
- `type`: ENUM ('daily', 'weekly', 'monthly')
- `start_date`: DATE
- `end_date`: DATE
- `summary`: TEXT
- `status`: ENUM ('draft', 'submitted', 'approved')
- `generated_at`: TIMESTAMP WITH TIME ZONE

## 2. 성능 및 확장성 전략
- **인덱싱**: `project_id`, `assignee_id`, `parent_id` 등에 인덱스를 생성하여 조인 및 트리 구조 성능 최적화.
- **계층형 쿼리**: WBS 구조 조회를 위한 Recursive Query 최적화.
- **데이터 백업**: 현재의 클라이언트 사이드 백업(JSON) 시스템을 서버 사이드 자동 백업 시스템으로 전환 예정.

