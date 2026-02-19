# 인프라 아키텍처 설계 (Infrastructure Design)

재개발된 nu-DevOps 시스템의 클라우드 네이티브 환경을 구축하기 위한 인프라 설계도입니다.

## 1. 클라우드 아키텍처 구성
- **Static Frontend**: Vercel 또는 AWS S3 + CloudFront를 통한 글로벌 엣지 배포.
- **Backend Services**: AWS Lambda (Serverless) 또는 AWS ECS (Container) 기반의 자동 확장 구조.
- **Database**: Supabase (PostgreSQL) 또는 AWS RDS를 사용하여 관리형 데이터베이스 환경 구축.
- **Storage**: 사용자 업로드 파일 및 로그 저장을 위한 AWS S3 활용.

## 2. 네트워크 및 보안
- **VPC (Virtual Private Cloud)**: DB 및 내부 서비스는 외부 접근이 차단된 Private Subnet에 배치.
- **WAF (Web Application Firewall)**: SQL Injection, XSS 등 외부 공격으로부터 보호.
- **SSL/TLS**: 모든 통신은 `https`를 통해 암호화되어 전송됩니다.

## 3. 확장성 전략
- **Auto Scaling**: 트래픽 증가 시 인스턴스 또는 컨테이너가 자동으로 증설되도록 설정.
- **Caching**: Redis 또는 CloudFront 엣지 캐싱을 도입하여 중복 조회 부하 감소.
