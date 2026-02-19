# 01. 프로젝트 개요 (Introduction)

## nu-DevOps (Next-Gen SW Collaboration Platform)

**nu-DevOps**는 소프트웨어 개발 프로젝트의 전 과정을 효율적으로 관리하고 협업을 촉진하기 위해 설계된 차세대 DevOps 플랫폼입니다. 프로젝트 계획부터 실행, 모니터링, 리소스 관리까지 통합된 환경을 제공합니다.

## 주요 기능

1.  **Project Hub**
    *   **Dashboard**: 프로젝트의 전체적인 진행 상황을 한눈에 파악할 수 있는 대시보드입니다.
    *   **WBS (Work Breakdown Structure)**: 업무를 계층적으로 구조화하고 관리합니다. 드래그 앤 드롭으로 업무 순서를 변경하거나 계층을 조정할 수 있습니다.
    *   **Gantt Chart**: 시간 흐름에 따른 프로젝트 일정을 시각화합니다. 주간 보기를 지원하며 화면 크기에 맞춰 자동으로 최적화됩니다.

2.  **Workspace**
    *   **My Tasks (Kanban Board)**: 개인에게 할당된 업무를 칸반 보드 형태로 관리합니다.
    *   **Progress Reporting**: 프로젝트별, 개인별 성과 리포트를 제공합니다.

3.  **Management**
    *   **Project Manager**: 신규 프로젝트 생성 및 관리 기능을 제공합니다.
    *   **Resource Optimizer**: 팀원들의 업무 부하를 분석하고 최적화합니다.
    *   **Member Manager**: 시스템 사용자 및 구성원을 관리합니다.

4.  **System Administration**
    *   **Organization Manager**: 이용 기관 및 부서 정보를 관리합니다.
    *   **Data Management**: 시스템 데이터를 관리합니다.

## 기술 스택
- **Frontend**: React (Vite), TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts
- **Icons**: Lucide React

## 시작하기 (Getting Started)

### 사전 요구사항
*   Node.js (v18 이상 권장)
*   npm

### 설치 및 실행

1.  저장소 클론
    ```bash
    git clone https://github.com/boheni07/nu-DevOps.git
    cd nu-DevOps
    ```

2.  의존성 설치
    ```bash
    npm install
    ```

3.  개발 서버 실행
    ```bash
    npm run dev
    ```
    브라우저에서 `http://localhost:3000`으로 접속합니다.
