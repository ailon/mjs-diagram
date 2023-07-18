import { StencilBase } from "../core";
import { EditorSettings } from "./EditorSettings";
import { Language } from "./Language";

/**
 * Describes the properties object passed to the {@link StencilBaseEditor} constructor.
 */
export interface StencilEditorProperties {
  /**
   * Internal identifier for the stencil.
   */
  iid: number,
  /**
   * SVG container for the stencil and editor elements.
   */
  container: SVGGElement,
  /**
   * HTML overlay container for editor's HTML elements (such as label text editor).
   */
  overlayContainer: HTMLDivElement,
  /**
   * Settings for the editor.
   */
  settings: EditorSettings,
  /**
   * Language (localization) subsystem.
   */
  language: Language,
  /**
   * Type of stencil to create.
   */
  stencilType: typeof StencilBase,
  /**
   * Previously created stencil to edit.
   */
  stencil?: StencilBase  
}
