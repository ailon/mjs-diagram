/**
 * The `editor` module contains everything pertaining to diagram editing.
 *
 * The core class here is {@link DiagramEditor}. It represents the editor web component.
 *
 * @example
 * Here's a basic scenario for adding a Flowchart editor on your page.
 *
 * In the markup part add the diagram editor web component:
 * ```html
 * <mjs-diagram-editor id="mjsDiaEditor"></mjs-diagram-editor>
 * ```
 *
 * Then in your code configure it to use the flowchart stencil editor set:
 *
 * ```ts
 * import * as mjsde from "@markerjs/mjs-diagram/editor";
 * import * as flowchart from "@markerjs/mjs-diagram/stencilsets/flowchart/flowchart";
 * ...
 * const editor = document.getElementById("mjsDiaEditor");
 * editor.stencilEditorSet = flowchart.flowchartStencilEditorSet;
 * editor.addEventListener("saveclick", (ev) => {
 *   // process the created diagram
 *   // the diagram state (configuration) is in ev.detail.state
 * });
 * ```
 *
 * @module editor
 */
import { DiagramEditor } from './DiagramEditor';

export {
  DiagramEditor,
  DiagramEditorEventMap,
  ConnectorEditorEventData,
  DiagramEditorEventData,
  DiagramEditorMode,
  RenderEventData,
  StencilEditorEventData,
} from './DiagramEditor';

export { EditorSettings } from './editor/EditorSettings';

export {
  StencilBaseEditor,
  StencilEditorState,
} from './editor/StencilBaseEditor';
export {
  ConnectorBaseEditor,
  ConnectorState,
} from './editor/ConnectorBaseEditor';
export { StencilEditorProperties } from './editor/StencilEditorProperties';
export { ConnectorEditorProperties } from './editor/ConnectorEditorProperties';
export { TextStencilEditor } from './editor/TextStencilEditor';
export { ImageStencilEditor } from './editor/ImageStencilEditor';
export { CustomImageStencilEditor } from './editor/CustomImageStencilEditor';

export { TextBlockEditor, TextChangedHandler } from './editor/TextBlockEditor';
export { ResizeGrip, GripLocation } from './editor/ResizeGrip';
export { PortConnector } from './editor/PortConnector';

export { PropertyPanelBase } from './editor/panels/PropertyPanelBase';
export {
  TextPropertiesPanel,
  TextPropertiesPanelProperties,
} from './editor/panels/TextPropertiesPanel';
export {
  ColorPickerPanel,
  ColorChangeHandler,
} from './editor/panels/ColorPickerPanel';
export {
  FontPanel,
  FontSizeChangeHandler,
  FontFamilyChangeHandler,
} from './editor/panels/FontPanel';

export {
  AlignPanel,
  HorizontalAlignment,
  VerticalAlignment,
  HorizontalAlignmentClickHandler,
  VerticalAlignmentClickHandler,
} from './editor/panels/AlignPanel';
export {
  ArrangePanel,
  ArrangementType,
  ArrangeClickHandler,
} from './editor/panels/ArrangePanel';
export {
  ArrowTypePanel,
  ArrowTypeChangeHandler,
} from './editor/panels/ArrowTypePanel';
export {
  ConnectorTypePanel,
  ConnectorTypeChangeHandler,
} from './editor/panels/ConnectorTypePanel';
export {
  DimensionsPanel,
  DimensionsChangeHandler,
} from './editor/panels/DimensionsPanel';
export {
  LineStylePanel,
  LineStyleChangeHandler,
} from './editor/panels/LineStylePanel';
export {
  NewStencilPanel,
  CreateNewStencilHandler,
} from './editor/panels/NewStencilPanel';
export {
  ShapePropertiesPanel,
  ShapePropertiesPanelProperties,
} from './editor/panels/ShapePropertiesPanel';

export { StencilEditorSet, IStencilEditorSet } from './editor/StencilEditorSet';
export { basicStencilEditorSet } from './editor/BasicStencilEditorSet';

export {
  StringSet,
  LangStringSet,
  ModuleStringSet,
  Language,
} from './editor/Language';

export { Color } from './editor/Color';
export { ColorSet } from './editor/ColorSet';
export { FontFamily } from './editor/FontFamily';

if (
  window &&
  window.customElements &&
  window.customElements.get('mjs-diagram-editor') === undefined
) {
  window.customElements.define('mjs-diagram-editor', DiagramEditor);
}
