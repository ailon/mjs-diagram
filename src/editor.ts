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

export { TextBlockEditor, TextChangedHandler } from './editor/TextBlockEditor';
export { ResizeGrip, GripLocation } from './editor/ResizeGrip';
export { PortConnector } from './editor/PortConnector';

export { PropertyPanelBase } from './editor/panels/PropertyPanelBase';
export { TextPropertiesPanel, TextPropertiesPanelProperties } from './editor/panels/TextPropertiesPanel';
export {
  ColorPickerPanel,
  ColorChangeHandler,
} from './editor/panels/ColorPickerPanel';
export {
  FontPanel,
  FontSizeChangeHandler,
  FontFamilyChangeHandler,
} from './editor/panels/FontPanel';

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
