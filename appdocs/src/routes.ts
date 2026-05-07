import type { ComponentType } from "react";
import { ButtonPage } from "./pages/ButtonPage";
import { SwitchPage } from "./pages/SwitchPage";
import { SliderPage } from "./pages/SliderPage";
import { TextareaPage } from "./pages/TextareaPage";
import { CheckboxCardsPage } from "./pages/CheckboxCardsPage";
import { RadioCardsPage } from "./pages/RadioCardsPage";
import { TabsPage } from "./pages/TabsPage";
import { ModalPage } from "./pages/ModalPage";
import { PopupPage } from "./pages/PopupPage";
import { CarouselPage } from "./pages/CarouselPage";
import { FileDropzonePage } from "./pages/FileDropzonePage";
import { AccordionPage } from "./pages/AccordionPage";
import { IntroPage } from "./pages/IntroPage";

export type RouteDef = {
  slug: string;
  title: string;
  category: string;
  component: ComponentType;
};

export const routes: RouteDef[] = [
  { slug: "introduction", title: "Introduction", category: "Getting started", component: IntroPage },
  { slug: "button", title: "Button", category: "Forms", component: ButtonPage },
  { slug: "switch", title: "Switch", category: "Forms", component: SwitchPage },
  { slug: "slider", title: "Slider", category: "Forms", component: SliderPage },
  { slug: "textarea", title: "Textarea", category: "Forms", component: TextareaPage },
  { slug: "checkbox-cards", title: "CheckboxCards", category: "Forms", component: CheckboxCardsPage },
  { slug: "radio-cards", title: "RadioCards", category: "Forms", component: RadioCardsPage },
  { slug: "file-dropzone", title: "FileDropzone", category: "Forms", component: FileDropzonePage },
  { slug: "tabs", title: "Tabs", category: "Navigation", component: TabsPage },
  { slug: "accordion", title: "Accordion", category: "Disclosure", component: AccordionPage },
  { slug: "carousel", title: "Carousel", category: "Disclosure", component: CarouselPage },
  { slug: "modal", title: "Modal", category: "Overlays", component: ModalPage },
  { slug: "popup", title: "Popup", category: "Overlays", component: PopupPage },
];
