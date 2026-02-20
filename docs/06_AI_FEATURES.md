# 06. AI 기능 안내 (AI Features)

nu-DevOps는 Google의 **Gemini AI**를 활용하여 단순한 관리를 넘어, 지능적인 프로젝트 통찰력을 제공합니다.

## 1. 핵심 AI 기능

### 📊 AI 진행 보고서 (Progress Report Integration)
- **위치**: Dashboard > 'AI 브리핑' 버튼 / Workspace > 성과 리포트
- **기능**: 현재 프로젝트의 모든 업무(Task)와 자원(Resource) 데이터를 분석하여 마크다운 및 텍스트 기반의 보고서 요약을 자동 생성합니다.
- **포함 내용**: Executive Summary, 주요 성과 지표, 리스크 분석, 향후 업무 권장 사항. 성과 리포트의 '종합 의견' 작성 시 AI 인사이트를 활용할 수 있습니다.

### ⚙️ 지능형 리소스 최적화 (Resource Optimizer)
- **위치**: Management > 리소스 최적화
- **기능**: 팀원들의 업무 할당 상태를 분석하여 과부하 또는 유휴 상태를 식별합니다. 마감 기한 준수를 위한 구체적인 업무 재배치 전략을 제안합니다.

## 2. 설정 방법 (Configuration)

AI 기능을 사용하기 위해서는 **Gemini API Key**가 필요합니다.

1. [Google AI Studio](https://aistudio.google.com/)에서 API 키를 발급받습니다.
2. 프로젝트 루트 폴더의 `.env` 파일에 발급받은 키를 입력합니다.
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. 어플리케이션을 재시작합니다 (`npm run dev`).

## 3. 보안 및 주의사항
- **데이터 활용**: AI 분석을 위해 일감 제목, 상태, 담당자 이름 등의 메타데이터가 API를 통해 전송됩니다. 민감한 개인정보나 기밀 사항이 일감 제목에 포함되지 않도록 주의하세요.
- **정확성**: AI가 생성한 제안은 참고용입니다. 최종 의사결정은 항상 프로젝트 매니저(PM)가 수행해야 합니다.
- **모델 정보**: 현재 `gemini-2.0-flash` 모델을 사용하여 빠르고 정확한 응답을 보장합니다.
