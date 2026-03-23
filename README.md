# FrameUI

> React용 Headless UI 컴포넌트 프레임워크

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📖 FrameUI는 무엇인가요?

FrameUI는 스타일이 포함되지 않은(unstyled) React 컴포넌트와 상태 로직을 제공합니다.
접근성(WAI-ARIA) 규칙과 상호작용 로직은 라이브러리가 처리하고, 마크업과 스타일은 사용자 코드에서 직접 정의합니다.

목표는 다음과 같습니다.

- 흔한 UI 패턴(모달, 드롭다운 등)을 적은 코드로 빠르게 구성할 수 있어야 합니다.
- 복잡한 디자인 요구사항이 있을 때는 컴포넌트를 분해해서 세밀하게 제어할 수 있어야 합니다.

FrameUI는 이 두 요구를 모두 만족하는 범용 Headless UI 레이어를 지향합니다.

## ✨ 핵심 특징 (Features)

- 점진적 컴포넌트 확장: 기본적으로는 단순한 API로 사용하고, 필요할 때만 트리거, 콘텐츠 등 하위 컴포넌트를 꺼내어 조합할 수 있습니다.
- Unstyled 구조: 어떤 스타일 시스템(CSS, Tailwind CSS, CSS-in-JS 등)과도 결합할 수 있도록 스타일을 포함하지 않습니다.
- `asChild` 지원: 라이브러리가 자체적으로 DOM 래퍼를 만들지 않고, 사용자가 제공한 컴포넌트에 접근성 및 이벤트 속성을 병합해 붙입니다.
- 접근성 기본 제공: 포커스 관리, 키보드 네비게이션, ARIA 속성 등 필수 접근성 기능을 기본으로 제공합니다.

## 🧱 현재 프로젝트 세팅

이 저장소는 다음처럼 분리되어 있습니다.

- 루트(`.`): FrameUI 라이브러리 소스 및 빌드(`tsdown`)
- `app/`: 라이브러리를 실제로 눈으로 확인하는 데모 앱(`Vite + React`)

pnpm workspace로 연결되어 있어, `app/`에서 루트 라이브러리를 `workspace:*`로 바로 참조합니다.

## 🚀 시작하기

### 1) 의존성 설치

```bash
pnpm install
```

### 2) 라이브러리 빌드

```bash
pnpm build
```

산출물은 `dist/`에 생성됩니다.

### 3) 단위 테스트 실행

```bash
pnpm test
```

watch 모드는 아래 명령을 사용합니다.

```bash
pnpm test:watch
```

현재 테스트 스택은 `Vitest + Testing Library + happy-dom`입니다.

### 4) 데모 앱 실행(시각 검증)

```bash
pnpm app:dev
```

브라우저에서 버튼 동작을 직접 확인할 수 있습니다.

데모 앱 production 빌드:

```bash
pnpm app:build
```

데모 앱 preview:

```bash
pnpm app:preview
```

## 🧪 권장 작업 순서

컴포넌트를 수정하거나 추가할 때 아래 순서를 권장합니다.

1. `src/`에서 컴포넌트/훅 구현
2. `src/**/*.test.tsx`에 테스트 추가 또는 수정
3. `pnpm test`로 회귀 확인
4. `pnpm build`로 라이브러리 빌드 확인
5. `pnpm app:dev`로 실제 상호작용/시각 결과 확인

## 📜 스크립트 요약

- `pnpm build`: 라이브러리 번들/타입 생성 (`tsdown`)
- `pnpm dev`: 라이브러리 watch 빌드
- `pnpm typecheck`: 타입 체크만 수행
- `pnpm clean`: `dist/` 삭제
- `pnpm test`: 테스트 1회 실행
- `pnpm test:watch`: 테스트 watch 실행
- `pnpm app:dev`: 데모 앱 개발 서버 실행
- `pnpm app:build`: 데모 앱 빌드
- `pnpm app:preview`: 데모 앱 빌드 결과 프리뷰
