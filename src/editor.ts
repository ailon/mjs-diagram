import { DiagramEditor } from './DiagramEditor';

export { DiagramEditor } from './DiagramEditor';

export { StencilBaseEditor } from './editor/StencilBaseEditor';
export { ConnectorBaseEditor } from './editor/ConnectorBaseEditor';
export { TextStencilEditor } from './editor/TextStencilEditor';
export { ImageStencilEditor } from './editor/ImageStencilEditor';

export { TextBlockEditor } from './editor/TextBlockEditor';

export { StencilEditorSet } from './editor/StencilEditorSet';
export { basicStencilEditorSet } from './editor/BasicStencilEditorSet';

export {
  StringSet,
  LangStringSet,
  ModuleStringSet,
  Language,
} from './editor/Language';

if (
  window &&
  window.customElements &&
  window.customElements.get('mjs-diagram-editor') === undefined
) {
  window.customElements.define('mjs-diagram-editor', DiagramEditor);
}
