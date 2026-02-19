# CI/CD 파이프라인 가이드 (CI/CD Pipeline)

개발 생산성을 극대화하기 위한 배포 자동화 및 지속적 통합 가이드입니다.

## 1. 워크플로우 도구
- **GitHub Actions**: 코드 병합 및 배포 자동화의 메인 도구로 사용합니다.
- **Docker**: 서비스의 동일한 실행 환경을 보장하기 위해 컨테이너화합니다.

## 2. 파이프라인 단계 (Stages)

### [Build & Test]
- 코드가 `PR` 또는 `Merge` 될 때 자동으로 `npm install` 및 `npm test`를 수행합니다.
- Lint 체크 및 TypeScript 빌드 성공 여부를 확인합니다.

### [Staging Deployment]
- `develop` 브랜치 병합 시 테스트 환경에 즉시 배포되어 검증 과정을 거칩니다.

### [Production Deployment]
- `main` 브랜치 병합 또는 `Release Tag` 생성 시 실제 운영 서버에 안전하게 배포합니다.
- 무중단 배포(Blue-Green 또는 Canary) 전략을 사용하여 가동 중지 시간을 제로화합니다.

## 3. 환경 변수 관리
- **Secret Store**: API 키와 같은 민감한 정보는 GitHub Secrets에 안전하게 저장하고 배포 시점에 주입받습니다.
