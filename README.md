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
