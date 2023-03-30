import { StencilBase } from "../core/StencilBase";
import { EditorSettings } from "./EditorSettings";
import { Language } from "./Language";

export interface StencilEditorProperties {
  iid: number,
  container: SVGGElement,
  overlayContainer: HTMLDivElement,
  settings: EditorSettings,
  language: Language,
  stencilType: typeof StencilBase,
  stencil?: StencilBase  
}
