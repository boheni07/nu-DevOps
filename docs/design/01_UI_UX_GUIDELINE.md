# UI/UX 가이드라인 (UI/UX Guideline)

nu-DevOps의 모든 컴포넌트와 인터페이스는 일관된 사용자 경험(UX)과 시각적 정체성을 유지해야 합니다.

## 1. 디자인 원칙
- **Clarity (명확성)**: 정보는 직관적이어야 하며, 중요한 데이터가 즉시 눈에 띄어야 합니다.
- **Efficiency (효율성)**: 최소한의 클릭으로 업무를 수행할 수 있는 컴팩트한 레이아웃을 지향합니다.
- **Responsiveness (반응성)**: 다양한 화면 크기에서도 정보 누락 없이 최적화된 보기 환경을 제공합니다.

## 2. 컬러 시스템 (Color Palette)
Tailwind CSS 표준 컬러를 기반으로 하며, 의미에 따라 다음 색상을 사용합니다.

- **Primary**: `indigo-600` (핵심 액션, 활성화 상태)
- **Success**: `emerald-500` (완료 상태, 긍정적 지표)
- **Warning**: `amber-500` (지연 임박, 주의 필요)
- **Danger**: `rose-500` (지연 발생, 리스크 감지)
- **Neutral**: `slate-500`, `slate-800` (텍스트, 일반 배경)

## 3. 타이포그래피 (Typography)
- **Base Font**: 'Inter' 또는 시스템 기본 샌드세리프 폰트.
- **Heading**: `font-black` 또는 `font-bold`를 사용하여 정보의 위계를 명확히 표현합니다.
- **Data Labels**: `text-[10px]` 또는 `text-xs`, `tracking-widest`, `uppercase`를 조합하여 전문적인 대시보드 느낌을 구현합니다.

## 4. 컴포넌트 표준
- **Cards**: `bg-white`, `border-slate-200`, `rounded-xl`, `shadow-sm` 설정을 기본으로 합니다.
- **Buttons**: 액션의 중요도에 따라 Solid, Outline, Ghost 스타일을 구분하여 적용합니다.
- **Modals**: 사용자 작업 흐름을 방해하지 않도록 명확한 배경 오버레이와 간결한 입력 폼을 유지합니다.
- **Reporting Tables**: 정보 밀도를 높이기 위해 패딩을 최소화하고 리스트 항목 간 경계선(`divide-y`)을 선명하게 유지합니다.
- **Status Badges**: `Approved`(Emerald), `Submitted`(Indigo), `Draft`(Slate) 등 리포트 및 업무 상태에 따른 고정된 색상 테마를 적용합니다.
