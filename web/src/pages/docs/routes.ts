import type { ComponentType } from "react";
import { AccordionPage } from "./AccordionPage";
import { ButtonPage } from "./ButtonPage";
import { CarouselPage } from "./CarouselPage";
import { CheckboxCardsPage } from "./CheckboxCardsPage";
import { DatePickerPage } from "./DatePickerPage";
import { FileDropzonePage } from "./FileDropzonePage";
import { IntroPage } from "./IntroPage";
import { ModalPage } from "./ModalPage";
import { PaginationPage } from "./PaginationPage";
import { PopupPage } from "./PopupPage";
import { RadioCardsPage } from "./RadioCardsPage";
import { SliderPage } from "./SliderPage";
import { SwitchPage } from "./SwitchPage";
import { TabsPage } from "./TabsPage";
import { TextareaPage } from "./TextareaPage";
import { ToastPage } from "./ToastPage";

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
  { slug: "date-picker", title: "DatePicker", category: "Forms", component: DatePickerPage },
  { slug: "tabs", title: "Tabs", category: "Navigation", component: TabsPage },
  { slug: "pagination", title: "Pagination", category: "Navigation", component: PaginationPage },
  { slug: "accordion", title: "Accordion", category: "Disclosure", component: AccordionPage },
  { slug: "carousel", title: "Carousel", category: "Disclosure", component: CarouselPage },
  { slug: "modal", title: "Modal", category: "Overlays", component: ModalPage },
  { slug: "popup", title: "Popup", category: "Overlays", component: PopupPage },
  { slug: "toast", title: "Toast", category: "Overlays", component: ToastPage },
];
