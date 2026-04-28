import { useState, type ReactNode } from "react";
import {
  Accordion,
  Button,
  Switch,
  Textarea,
  CheckboxCards,
  RadioCards,
  Tabs,
  Carousel,
  FileDropzone,
  Modal,
  Popup,
} from "FrameUI";
import "./App.css";

type ComponentCard = {
  name: string;
  year: string;
  gradient: string;
  preview: ReactNode;
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const components: ComponentCard[] = [
    { name: "Button", year: "2025", gradient: "card-gradient-1", preview: <ButtonPreview /> },
    { name: "Switch", year: "2025", gradient: "card-gradient-2", preview: <SwitchPreview /> },
    { name: "Textarea", year: "2025", gradient: "card-gradient-3", preview: <TextareaPreview /> },
    { name: "CheckboxCards", year: "2025", gradient: "card-gradient-4", preview: <CheckboxPreview /> },
    { name: "RadioCards", year: "2025", gradient: "card-gradient-5", preview: <RadioPreview /> },
    { name: "Tabs", year: "2025", gradient: "card-gradient-6", preview: <TabsPreview /> },
    { name: "Accordion", year: "2025", gradient: "card-gradient-7", preview: <AccordionPreview /> },
    { name: "Carousel", year: "2025", gradient: "card-gradient-8", preview: <CarouselPreview /> },
    { name: "FileDropzone", year: "2025", gradient: "card-gradient-9", preview: <FileDropzonePreview /> },
    {
      name: "Modal",
      year: "2025",
      gradient: "card-gradient-1",
      preview: <ModalPreview onOpen={() => setIsModalOpen(true)} />,
    },
    {
      name: "Popup",
      year: "2025",
      gradient: "card-gradient-2",
      preview: <PopupPreview onOpen={() => setIsPopupOpen(true)} />,
    },
  ];

  return (
    <div className="gallery">
      <main className="gallery-container">
        <header className="hero">
          <h1>Components</h1>
        </header>

        {chunk(components, 2).map((row, rowIndex) => (
          <section key={rowIndex} className="card-row">
            {row.map((card) => (
              <article key={card.name} className="card">
                <div className={`card-image ${card.gradient}`}>
                  <div className="preview-panel">{card.preview}</div>
                </div>
                <div className="card-text">
                  <h2>{card.name}</h2>
                  <span className="card-year">{card.year}</span>
                </div>
              </article>
            ))}
          </section>
        ))}

        <footer className="site-footer">
          <div className="about">
            <h2>Our design philosophy</h2>
            <p>
              Behind every portfolio is a point of view. A great project page
              gives that sense of perspective to offer a glimpse of the person
              behind the work. Is it a particular artistic movement? A way of
              experiencing the world? What drives all these things to be the
              way they are?
            </p>
          </div>
          <div className="contact">
            <h2>Reach out</h2>
            <nav className="social">
              <a href="#">Email</a>
              <a href="#">Instagram</a>
              <a href="#">Linkedin</a>
            </nav>
          </div>
        </footer>
      </main>

      <Modal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        title="상세 정보"
        description="이것은 모달의 상세 내용입니다."
        footerSlot={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button label="취소" onClick={() => setIsModalOpen(false)} />
            <Button label="확인" onClick={() => setIsModalOpen(false)} />
          </div>
        }
      >
        <p>모달 본문 내용이 여기에 들어갑니다.</p>
      </Modal>

      <Popup
        isOpen={isPopupOpen}
        onOpenChange={() => setIsPopupOpen(false)}
        message="성공적으로 처리되었습니다!"
        type="success"
      />
    </div>
  );
}

function ButtonPreview() {
  return (
    <div className="preview-buttons">
      <Button label="Label" />
      <Button label="Label" />
    </div>
  );
}

function SwitchPreview() {
  return (
    <div className="preview-switch">
      <div className="preview-switch-text">
        <span className="preview-switch-label">Label</span>
        <span className="preview-switch-description">Description</span>
      </div>
      <Switch defaultChecked aria-label="Preview switch" />
    </div>
  );
}

function TextareaPreview() {
  return (
    <Textarea
      placeholder="Leave a comment…"
      minRows={2}
      maxRows={3}
      actionSlot={<Button label="Send" />}
    />
  );
}

function CheckboxPreview() {
  return (
    <CheckboxCards
      defaultValue={["frontend"]}
      options={[
        { value: "design", label: "Design", description: "UI work" },
        { value: "frontend", label: "Frontend", description: "React" },
      ]}
    />
  );
}

function RadioPreview() {
  return (
    <RadioCards
      defaultValue="apple"
      name="preview-radio"
      options={[
        { value: "apple", label: "Apple", description: "crisp" },
        { value: "banana", label: "Banana", description: "tropical" },
      ]}
    />
  );
}

function TabsPreview() {
  return (
    <Tabs.Root defaultValue="one" className="preview-tabs">
      <Tabs.List className="preview-tabs-list">
        <Tabs.Trigger value="one" className="preview-tabs-trigger">Label</Tabs.Trigger>
        <Tabs.Trigger value="two" className="preview-tabs-trigger">Label</Tabs.Trigger>
        <Tabs.Trigger value="three" className="preview-tabs-trigger">Label</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}

function AccordionPreview() {
  return (
    <Accordion.Root type="multiple" defaultValue={["item-1"]} className="preview-accordion">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Accordion item one</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <p>Basic content preview for the first accordions item.</p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Accordion item two</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <p>Second item content preview to demonstrate multiple panels.</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

const PREVIEW_SLIDES = ["Spring", "Summer", "Autumn", "Winter"];

function CarouselPreview() {
  return (
    <Carousel defaultIndex={0} aria-label="Preview carousel" className="preview-carousel">
      <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
      <Carousel.Viewport>
        <Carousel.Track>
          {PREVIEW_SLIDES.map((label) => (
            <Carousel.Slide key={label}>{label}</Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.NextTrigger>›</Carousel.NextTrigger>
      <div className="carousel-indicators" role="tablist" aria-label="Slide select">
        {PREVIEW_SLIDES.map((label, i) => (
          <Carousel.Indicator key={label} index={i} aria-label={`Go to ${label}`} />
        ))}
      </div>
    </Carousel>
  );
}

function FileDropzonePreview() {
  return (
    <FileDropzone defaultFiles={[]} accept="image/*" className="preview-dropzone">
      <FileDropzone.Zone aria-label="Upload preview">
        <span>Drop files here</span>
        <span className="fdz-hint">or click to browse</span>
      </FileDropzone.Zone>
      <FileDropzone.Input />
    </FileDropzone>
  );
}

function ModalPreview({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="preview-buttons">
      <Button label="모달 열기" onClick={onOpen} />
    </div>
  );
}

function PopupPreview({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="preview-buttons">
      <Button label="팝업 띄우기" onClick={onOpen} />
    </div>
  );
}
