# ADR 0002: FrameUI 강점과 OSS 채택 전략 (Strengths & Go-to-Market)

> 선행 문서: [`ADR 0001 — 비전 및 포지셔닝`](./0001-project-vision-and-positioning.md)
>
> 0001이 "우리가 지향하는 것"(Vision)을 정의했다면, 이 문서는 "그것을 어떻게 외부에 전달하고 채택으로 이을 것인가"(Strategy)를 정의한다.

## 1. 배경 (Context)

ADR 0001에서 FrameUI는 Radix UI와 Tailwind Headless UI 사이의 **Sweet Spot**을 선언했다. 비전 문장으로서는 선명하다. 그러나 React 생태계에는 이미 성숙한 headless UI 라이브러리가 다수 존재하며, 다음 질문은 비전이 아니라 채택의 문제다.

> **"왜 개발자가 기존 라이브러리를 떠나 FrameUI를 선택해야 하는가?"**

이 질문에 답하려면:

1. FrameUI가 실제로 보유한 강점을 **증거(코드 경로, commit)와 함께** 식별하고,
2. 비전 수준의 주장과 실제 구현 사이의 **갭을 정직하게 드러내며**,
3. 각 강점을 외부 개발자가 30초 안에 체감할 수 있는 **자산(비교표, 데모, 뱃지)** 으로 전환하는 계획이 필요하다.

이 ADR은 그 계획을 정의한다. 우선 축으로 (A) **점진적 제어권 이양 (Progressive Disclosure)**, (B) **스펙·ADR 주도 개발 프로세스** 두 가지를 선택한다. 두 축 각각이 아니라 **두 축의 결합**이 FrameUI만의 포지션을 만든다고 본다(§3).

## 2. 강점 재정의 (Strength Inventory)

차별성과 증명 가능성을 기준으로 3계층으로 분류한다.

### 2.1 Tier 1 — 독점적 차별점

**T1-1. 한 컴포넌트 안에서 "Prop 모드 ↔ Compound 모드"가 공존한다.**

대부분의 headless 라이브러리는 한 가지 API 철학만 채택한다. Radix는 compound-only에 가깝고, Tailwind Headless UI는 prop-oriented에 가깝다. FrameUI는 **동일한 심볼에서 두 API 수준을 모두 제공**한다.

```tsx
// 1단계: prop 모드 — 1줄 선언
<CheckboxCards options={options} onValueChange={setSelected} />

// 2단계: compound 모드 — 필요할 때만 분해
<CheckboxCards.Root onValueChange={setSelected}>
  <CheckboxCards.Item value="a">
    <CheckboxCards.Indicator />
    <CheckboxCards.Label>A</CheckboxCards.Label>
    <CheckboxCards.Description>...</CheckboxCards.Description>
  </CheckboxCards.Item>
</CheckboxCards.Root>
```

증거: [`src/components/CheckboxCards.tsx:197-226`](../src/components/CheckboxCards.tsx) — `options` prop 존재 여부로 내부 모드 분기. 동일 패턴이 `RadioCards`, `Tabs`에도 일관 적용. 최근 commit `3a5e517`에서 compound 패턴이 전 컴포넌트에 정규화됨.

**T1-2. 공개 스펙(`spec/`) + ADR(`Adr/`) 주도 개발 프로세스.**

컴포넌트가 코드 이전에 문제 정의·필수 기능을 명시한 스펙에서 출발하고, 아키텍처 결정은 ADR에 남는다. 이는 내부 위생이 아니라 **외부에 공개되는 품질 서사**다. 이 수준의 문서화를 지속적으로 공개하는 headless UI 라이브러리는 드물다.

증거: [`spec/`](../spec/) 전체, [`README.md`](../README.md)의 "권장 작업 순서" 섹션 (컴포넌트 구현 전에 스펙 작성을 권고).

### 2.2 Tier 2 — 탄탄한 기술적 기반 (경쟁력 있음, 유일하진 않음)

- **T2-1. `data-ui` + `data-state` 속성 표준화.** 클래스 없이 상태 선택자만으로 CSS 작성 가능. commit `3a5e517`에서 전 컴포넌트 정규화.
- **T2-2. React 19+ 전용, `forwardRef` 없는 깨끗한 API.** `ref`를 일반 prop으로 받음 — 예: [`src/components/Tabs.tsx:52`](../src/components/Tabs.tsx).
- **T2-3. 전 컴포넌트 controlled/uncontrolled 동시 지원**이 동일 패턴으로 일관됨.
- **T2-4. Vitest + Testing Library + happy-dom** 기반 컴포넌트별 테스트.

### 2.3 Tier 3 — 주장 대비 미이행 (리스크이자 최우선 기회)

- **T3-1. `asChild` / Slot 패턴 미구현.** ADR 0001의 §3, §4.3에서 핵심 기능으로 제시되었으나 코드에는 없음. OSS 공개 시점에 "약속 불이행"으로 신뢰 타격 가능 — 최우선 구현 대상.
- **T3-2. Dialog 컴포넌트 부재.** ADR 0001 §4.2가 FrameUI의 **플래그십 예제**로 Dialog를 든다. 이 컴포넌트 없이 Sweet Spot 주장을 증명하기 어렵다.
- **T3-3. 스펙 깊이 불균일.** 예: [`spec/checkbox_cards.md`](../spec/checkbox_cards.md)는 실제 구현의 `Item / Indicator / Label / Description` 분해를 반영하지 못한 얕은 상태. T1-2의 신뢰도와 직결됨.

## 3. 핵심 포지셔닝 — 두 축의 결합

각 강점을 따로 홍보하지 않는다. 두 축을 한 문장으로 묶는다.

> **FrameUI는 설계 근거가 공개된 Progressive Disclosure 라이브러리다.**
>
> 왜 이 컴포넌트가 이 prop들을 갖는지, 왜 compound 분해 경계가 여기에 그어지는지 — 모든 API 선택이 spec과 ADR로 추적 가능하다.

이 문장이 **다른 headless 라이브러리가 주장하기 어려운 독점적 포지션**을 만든다.

| 라이브러리 | 핵심 메시지 |
|-----------|-------------|
| Radix UI | "우리가 접근성의 권위다" (정확성) |
| Tailwind Headless UI | "Tailwind가 뒤에 있다" (생태계) |
| shadcn/ui | "복붙해서 네 것으로 만들어라" (소유권) |
| **FrameUI** | **"결정 근거가 투명하다 + API 수준을 점진적으로 선택한다"** |

## 4. 강점별 실행 방안

### 4.1 Progressive Disclosure(T1-1)를 증명 가능한 슬로건으로

**(a) 실측 비교표.** 동일 UI(Dialog, Tabs, CheckboxCards)를 Radix / Headless UI / FrameUI로 구현하고 아래 지표를 공개한다.
  - import 문 수
  - JSX 라인 수 (단순 사용 / 커스텀 사용)
  - 최소 bundle 기여분
  표는 README 상단 + docs 사이트 랜딩에 배치. 수치가 말하게 한다.

**(b) 플래그십 데모.** ADR 0001 §4.2–§4.3의 Dialog 예제를 실제 구현하고, 동일 컴포넌트가 prop 모드와 compound 모드 **양쪽 모두** 동작하는 모습을 데모에서 나란히 보여준다. 현재 [`app/src/App.tsx`](../app/src/App.tsx)는 개별 컴포넌트 쇼케이스 중심이며, "동일 컴포넌트, 두 수준의 API" 대비 섹션을 최상단에 신설할 것.

**(c) 네이밍 컨벤션을 공개 계약으로.** `Root / List / Trigger / Content / Item / Indicator / Label / Description` — 현재 실질적으로 지켜지는 이 접미사 집합을 공식 컨벤션으로 문서화한다. 서브 컴포넌트 이름을 **외우지 않고 추측할 수 있게 만드는 것**이 Progressive Disclosure DX의 숨은 자산이다.

**(d) `asChild` 구현 (T3-1 해소).** 포지셔닝 신뢰와 직결되므로 최우선. 별도 ADR과 별도 구현 PR로 진행한다.

### 4.2 Spec/ADR 프로세스(T1-2)를 외부 신뢰 자산으로

**(a) 원칙 선언.** README 상단에 *"Every component ships with a public spec and, where it affects architecture, an ADR"* 문구를 뱃지로 노출. 이 주장을 공개적으로 하는 메이저 UI 라이브러리는 실질적으로 없다.

**(b) 스펙 깊이 정규화 (T3-3 해소).** [`spec/template.md`](../spec/template.md)를 다음 섹션을 포함하도록 확장한다.
  - 문제 정의 / 필수 기능 (기존)
  - **Compound 분해 경계** — 어떤 서브 컴포넌트가 왜 존재하는가
  - **접근성 요구사항 (WAI-ARIA 포인트)**
  - **Prop 모드 ↔ Compound 모드 매핑표**
  - **테스트 체크리스트**
  확장된 템플릿으로 기존 스펙을 역보강한다.

**(c) ADR 운영 확립.** `Adr/README.md`를 추가해 ADR 목차를 관리한다. 다음 ADR 후보:
  - ADR 0003 — `asChild` 병합 원칙
  - ADR 0004 — 왜 `data-ui` 네이밍인가
  - ADR 0005 — 왜 `forwardRef` 없이 가는가
  - ADR 0006 — 왜 로우레벨 훅을 노출하지 않는가

**(d) 기여 프로세스 공개.** `CONTRIBUTING.md`에 "새 컴포넌트는 spec PR 먼저, 아키텍처 영향이 있으면 ADR PR 병행, 그 다음 구현 PR"을 명문화. 이는 장벽이 아니라 **품질 서사**로 제시한다.

**(e) 프로세스 자체를 콘텐츠로.** "우리는 UI 컴포넌트를 스펙으로부터 만든다"는 프로세스 이야기가 기술 주장보다 개발자 커뮤니티에서 빠르게 확산된다. 블로그/발표 트랙으로 기획.

### 4.3 OSS 채택 전환을 위한 보조 작업 (우선순위 순)

1. **`asChild` 구현** — T3-1 해소, 신뢰 갭 제거.
2. **Dialog 구현** — T3-2 해소, 플래그십 데모 재료 확보.
3. **Docs 사이트** — 비교표 + 라이브 플레이그라운드 + 각 컴포넌트의 spec/ADR 링크. `app/`을 docs 앱으로 확장하는 것으로 시작.
4. **접근성 자동 검증** — `jest-axe` 또는 `@axe-core/react`. 결과를 README 뱃지로.
5. **Bundle size 뱃지** — `size-limit`이나 bundlejs 링크. headless의 가치 명제인 만큼 수치 공개가 필수.
6. **컴포넌트 로드맵 공개** — `Dialog → Popover → Select → Menu → Tooltip` 순서만 공개해도 진정성 시그널.
7. **마이그레이션 가이드** — "From Radix UI", "From Headless UI". 채택을 가장 직접적으로 유도.
8. **Starter CSS** — `data-ui[data-state="..."]` 패턴 기반 순수 CSS 및 Tailwind 샘플. T2-1을 체감시키는 자산.

## 5. 의도적으로 하지 않을 것 (Non-Goals)

선택과 집중 없이 강점은 서지 않는다.

- **사전 스타일링된 컴포넌트 제공 금지** — Sweet Spot 포지셔닝과 충돌.
- **Radix 수준의 컴포넌트 개수 추격 금지** — 인력상 불가능하며 차별점도 아니다. 핵심 10개를 제대로 만든다.
- **CSS-in-JS 의존 금지** — `data-ui` 기반 CSS 스토리와 충돌.
- **`useXxx()` 로우레벨 훅 노출 금지** — Progressive Disclosure 철학이 훅 노출을 **대체하기 위해** 존재한다. 훅을 뚫어주는 순간 서사가 흐려진다. (별도 ADR로 근거 상세화 예정.)

## 6. 로드맵과 후속 ADR

이 ADR은 전략 문서다. 실제 작업은 별도 PR로 분할한다.

| 단계 | 산출물 | 담당 문서 |
|------|--------|-----------|
| 1 | `asChild` 구현 | 구현 PR + ADR 0003 |
| 2 | `Dialog` 구현 (flagship) | spec → 구현 PR |
| 3 | 스펙 템플릿 확장 + 기존 스펙 역보강 | `spec/template.md` 편집 |
| 4 | README 재배치 (포지셔닝 문장 + 비교표 + 두 모드 코드 스니펫) | README PR |
| 5 | `Adr/README.md`, `CONTRIBUTING.md` 추가 | 문서 PR |
| 6 | docs 사이트 (app 확장) | 장기 |

## 7. 이 ADR의 검증 기준

외부에 공개되기 전 아래를 통과해야 한다.

- [ ] §3의 포지셔닝 문장이 Radix / Headless UI / shadcn 중 어느 쪽도 쉽게 주장할 수 없는 문장인가?
- [ ] 각 Tier 1 강점에 **외부인이 열어 확인할 수 있는 파일 경로 또는 commit**이 명시돼 있는가?
- [ ] Tier 3(미이행 항목, 특히 `asChild`)이 숨겨지지 않고 §2.3과 §6 로드맵에 정직하게 드러나는가?
- [ ] §5 Non-Goals가 있어 선택과 집중을 명확히 하는가?
- [ ] §4의 실행 방안이 **문서뿐 아니라 비교표·데모·뱃지 같은 시각 자산**으로 이어지는가?
