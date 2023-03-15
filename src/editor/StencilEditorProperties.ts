import { StencilBase } from "../core/StencilBase";
import { EditorSettings } from "./EditorSettings";

export interface StencilEditorProperties {
  iid: number,
  container: SVGGElement,
  overlayContainer: HTMLDivElement,
  settings: EditorSettings,
  stencilType: typeof StencilBase,
  stencil?: StencilBase  
}
