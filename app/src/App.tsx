import { useState } from "react";
import {
  Button,
  Switch,
  Textarea,
  CheckboxCards,
  Tabs,
  RadioCards,
  Carousel,
  FileDropzone,
  FRAME_UI_VERSION,
  type FileDropzoneRejection,
} from "FrameUI";
import "./App.css";

const SLIDE_LABELS = ["Spring", "Summer", "Autumn", "Winter"];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function App() {
  const [count, setCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["frontend"]);
  const [selectedFruit, setSelectedFruit] = useState("apple");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [rejections, setRejections] = useState<FileDropzoneRejection[]>([]);

  return (
    <main className="page">
      <section className="card">
        <h1>FrameUI Demo</h1>
        <p>라이브러리 버전: {FRAME_UI_VERSION}</p>

        <hr />

        {/* Button 예시 */}
        <div className="component-section">
          <h2>Button Component</h2>
          <p>버튼 클릭 수: {count}</p>
          <Button
            label="클릭해보기"
            onClick={() => setCount((value) => value + 1)}
          />
        </div>

        <hr />

        {/* Switch 예시 */}
        <div className="component-section">
          <h2>Switch Component</h2>

          <div className="switch-example">
            <label>다크모드</label>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              aria-label="다크모드 토글"
            />
            <span className="status">{isDarkMode ? "🌙 ON" : "☀️ OFF"}</span>
          </div>

          <div className="switch-example">
            <label>알림 활성화</label>
            <Switch
              checked={isNotificationEnabled}
              onCheckedChange={setIsNotificationEnabled}
              aria-label="알림 토글"
            />
            <span className="status">
              {isNotificationEnabled ? "🔔 ON" : "🔕 OFF"}
            </span>
          </div>

          <div className="switch-example">
            <label>비활성화된 스위치</label>
            <Switch defaultChecked={true} disabled aria-label="비활성화 예시" />
            <span className="status">비활성화됨</span>
          </div>
        </div>

        <hr />

        {/* Textarea 예시 */}
        <div className="component-section">
          <h2>Textarea Component</h2>

          <div className="component-example" style={{ marginBottom: "24px" }}>
            <h3>1. 단축형(Shorthand) 사용</h3>
            <Textarea
              placeholder="댓글을 남겨주세요..."
              minRows={2}
              maxRows={4}
              actionSlot={<Button label="작성" />}
            />
          </div>

          <div className="component-example">
            <h3>2. Compound 패턴 사용 (유연한 구조)</h3>
            <Textarea.Root>
              <Textarea.Input placeholder="상세 내용을 입력하세요." minRows={4} />
              <Textarea.Action>
                <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end" }}>
                  <Button label="임시저장" />
                  <Button label="확인" />
                </div>
              </Textarea.Action>
            </Textarea.Root>
          </div>
        </div>

        <hr />

        {/* CheckboxCards 예시 */}
        <div className="component-section">
          <h2>CheckboxCards Component</h2>

          <div className="component-example">
            <h3>1. Controlled</h3>
            <CheckboxCards
              value={selectedRoles}
              onValueChange={setSelectedRoles}
              options={[
                { value: "design", label: "Design", description: "UI 작업" },
                { value: "frontend", label: "Frontend", description: "React 개발" },
                { value: "backend", label: "Backend", description: "API 개발" },
              ]}
            />
            <div className="status">
              선택된 값: {selectedRoles.join(", ") || "없음"}
            </div>
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>2. Uncontrolled</h3>
            <CheckboxCards
              defaultValue={["basic"]}
              options={[
                { value: "basic", label: "Basic" },
                { value: "pro", label: "Pro" },
                { value: "team", label: "Team" },
              ]}
            />
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>3. Disabled</h3>
            <CheckboxCards
              disabled
              defaultValue={["design"]}
              options={[
                { value: "design", label: "Disabled option" },
              ]}
            />
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>4. Compound 패턴</h3>
            <CheckboxCards defaultValue={["custom"]}>
              <CheckboxCards.Item value="custom">
                <CheckboxCards.Indicator />
                <div>
                  <CheckboxCards.Label>Custom Layout</CheckboxCards.Label>
                  <CheckboxCards.Description>자유로운 구조로 작성</CheckboxCards.Description>
                </div>
              </CheckboxCards.Item>
            </CheckboxCards>
          </div>
        </div>

        <hr />
        
        {/* Tabs 예시 */}
        <div className="component-section">
          <h2>Tabs Component</h2>
          
          <Tabs.Root defaultValue="account" className="tabs-root">
            <Tabs.List className="tabs-list">
              <Tabs.Trigger value="account" className="tabs-trigger">계정 관리</Tabs.Trigger>
              <Tabs.Trigger value="password" className="tabs-trigger">보안 및 비밀번호</Tabs.Trigger>
              <Tabs.Trigger value="billing" className="tabs-trigger" disabled>결제 (준비중)</Tabs.Trigger>
            </Tabs.List>
            
            <Tabs.Content value="account" className="tabs-content">
              <h3>개인 정보</h3>
              <p style={{ marginBottom: "16px" }}>계정의 기본 프로필 정보를 업데이트하세요.</p>
              <Textarea
                placeholder="간단한 자기소개를 작성해주세요." 
                minRows={2} 
                maxRows={4} 
              />
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <Button label="변경 사항 저장" />
              </div>
            </Tabs.Content>

            <Tabs.Content value="password" className="tabs-content">
              <h3>로그인 및 보안</h3>
              <p style={{ marginBottom: "16px" }}>마지막 비밀번호 변경일: 최근 (2026.04.01)</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button label="비밀번호 변경" />
                <Button label="2단계 인증 로그아웃" style={{ background: "#ef4444" }} />
              </div>
            </Tabs.Content>

            <Tabs.Content value="billing" className="tabs-content">
              {/* Disabled tab contents normally won't be accessed, but strictly valid structure */}
              <h3>결제 수단 관리</h3>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <hr />

        {/* RadioCards 예시 */}
        <div className="component-section">
          <h2>RadioCards Component</h2>

          <div className="component-example">
            <h3>1. Controlled</h3>
            <RadioCards
              value={selectedFruit}
              onValueChange={setSelectedFruit}
              name="fruit"
              options={[
                { value: "apple", label: "Apple", description: "crisp and sweet" },
                { value: "banana", label: "Banana", description: "tropical yellow" },
                { value: "grape", label: "Grape", description: "small and juicy" },
              ]}
            />
            <div className="status">선택된 값: {selectedFruit}</div>
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>2. Uncontrolled</h3>
            <RadioCards
              defaultValue="banana"
              name="fruit-uncontrolled"
              options={[
                { value: "apple", label: "Apple" },
                { value: "banana", label: "Banana" },
                { value: "grape", label: "Grape" },
              ]}
            />
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>3. Disabled (root)</h3>
            <RadioCards
              disabled
              defaultValue="apple"
              name="fruit-disabled"
              options={[
                { value: "apple", label: "Apple" },
                { value: "banana", label: "Banana" },
              ]}
            />
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>4. Disabled item</h3>
            <RadioCards
              defaultValue="apple"
              name="fruit-disabled-item"
              options={[
                { value: "apple", label: "Apple" },
                { value: "banana", label: "Banana", disabled: true },
              ]}
            />
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>5. Compound 패턴</h3>
            <RadioCards defaultValue="apple" name="fruit-compound">
              <RadioCards.Item value="apple">
                <RadioCards.Indicator />
                <div>
                  <RadioCards.Label>Apple</RadioCards.Label>
                  <RadioCards.Description>crisp and sweet</RadioCards.Description>
                </div>
              </RadioCards.Item>
              <RadioCards.Item value="banana">
                <RadioCards.Indicator />
                <div>
                  <RadioCards.Label>Banana</RadioCards.Label>
                  <RadioCards.Description>tropical yellow</RadioCards.Description>
                </div>
              </RadioCards.Item>
            </RadioCards>
          </div>
        </div>

        <hr />

        {/* Carousel 예시 */}
        <div className="component-section">
          <h2>Carousel Component</h2>

          <div className="component-example">
            <h3>1. 기본 (좌우 핸들 + Indicator + 키보드 Arrow)</h3>
            <Carousel defaultIndex={0} aria-label="계절 배너">
              <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
              <Carousel.Viewport>
                <Carousel.Track>
                  {SLIDE_LABELS.map((label) => (
                    <Carousel.Slide key={label}>{label}</Carousel.Slide>
                  ))}
                </Carousel.Track>
              </Carousel.Viewport>
              <Carousel.NextTrigger>›</Carousel.NextTrigger>
              <div className="carousel-indicators" role="tablist" aria-label="슬라이드 선택">
                {SLIDE_LABELS.map((label, i) => (
                  <Carousel.Indicator key={label} index={i} aria-label={`${label}로 이동`} />
                ))}
              </div>
            </Carousel>
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>2. Controlled + Loop + Autoplay</h3>
            <Carousel
              index={carouselIndex}
              onIndexChange={setCarouselIndex}
              loop
              autoplay={{ interval: 3500 }}
              pauseOnHover
              aria-label="자동 재생 배너"
            >
              <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
              <Carousel.Viewport>
                <Carousel.Track>
                  {SLIDE_LABELS.map((label) => (
                    <Carousel.Slide key={label}>{label}</Carousel.Slide>
                  ))}
                </Carousel.Track>
              </Carousel.Viewport>
              <Carousel.NextTrigger>›</Carousel.NextTrigger>
              <div className="carousel-indicators" role="tablist" aria-label="슬라이드 선택">
                {SLIDE_LABELS.map((label, i) => (
                  <Carousel.Indicator key={label} index={i} aria-label={`${label}로 이동`} />
                ))}
              </div>
            </Carousel>
            <div className="status">현재 인덱스: {carouselIndex + 1} / {SLIDE_LABELS.length}</div>
          </div>
        </div>

        <hr />

        {/* FileDropzone 예시 */}
        <div className="component-section">
          <h2>FileDropzone Component</h2>

          <div className="component-example">
            <h3>1. Controlled (이미지 · 최대 3개 · 개당 2MB)</h3>
            <FileDropzone
              files={files}
              onFilesChange={setFiles}
              onReject={(r) => setRejections(r)}
              accept="image/*"
              multiple
              maxFiles={3}
              maxSize={2 * 1024 * 1024}
            >
              <FileDropzone.Zone aria-label="이미지를 드래그하거나 클릭해 업로드">
                <span>여기에 이미지를 드롭하거나 클릭/탭 하세요</span>
                <span className="fdz-hint">PNG · JPG · 최대 2MB · 최대 3개</span>
              </FileDropzone.Zone>
              <FileDropzone.Input />
              <FileDropzone.FileList>
                {files.map((file) => (
                  <FileDropzone.FileItem key={`${file.name}-${file.lastModified}`} file={file}>
                    <span className="fdz-name">{file.name}</span>
                    <span className="fdz-size">{formatBytes(file.size)}</span>
                    <FileDropzone.Remove file={file} aria-label={`${file.name} 제거`}>
                      ×
                    </FileDropzone.Remove>
                  </FileDropzone.FileItem>
                ))}
              </FileDropzone.FileList>
              {rejections.length > 0 && (
                <div className="fdz-rejections" role="alert">
                  {rejections.length}개 파일 거부됨:{" "}
                  {rejections
                    .map((r) => `${r.file.name} (${r.reason})`)
                    .join(", ")}
                </div>
              )}
            </FileDropzone>
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>2. Trigger 버튼 + 모바일 카메라 (capture)</h3>
            <FileDropzone defaultFiles={[]} accept="image/*" multiple>
              <FileDropzone.Zone aria-label="사진 업로드">
                <span>사진을 드롭하거나 아래 버튼을 누르세요</span>
                <span className="fdz-hint">
                  모바일에서는 &quot;촬영&quot; 탭 시 후면 카메라가 즉시 열립니다
                </span>
              </FileDropzone.Zone>
              <FileDropzone.Trigger>촬영 또는 선택</FileDropzone.Trigger>
              {/* capture는 힌트. 모바일만 카메라가 열리고, 데스크톱은 일반 파일 선택. */}
              <FileDropzone.Input capture="environment" />
              <FileDropzone.FileList />
            </FileDropzone>
          </div>

          <div className="component-example" style={{ marginTop: "24px" }}>
            <h3>3. Disabled</h3>
            <FileDropzone disabled>
              <FileDropzone.Zone aria-label="비활성 드롭존">
                <span>현재 업로드를 받지 않습니다</span>
              </FileDropzone.Zone>
              <FileDropzone.Input />
            </FileDropzone>
          </div>
        </div>
      </section>
    </main>
  );
}
