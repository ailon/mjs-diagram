import { DiagramEditor } from './DiagramEditor';

export { DiagramEditor } from './DiagramEditor';
export { DiagramState } from './core/DiagramState';

export { StencilBaseEditor } from './editor/StencilBaseEditor';
export { ConnectorBaseEditor } from './editor/ConnectorBaseEditor';
export { TextStencilEditor } from './editor/TextStencilEditor';

export { StencilEditorSet } from './editor/StencilEditorSet';
export { basicStencilEditorSet } from './editor/BasicStencilEditorSet';
export { flowchartStencilEditorSet } from './stencilsets/flowchart/FlowchartStencilEditorSet';
export { mindMapStencilEditorSet } from './stencilsets/mindmap/MindMapStencilEditorSet';

if (
  window &&
  window.customElements &&
  window.customElements.get('mjs-diagram-editor') === undefined
) {
  window.customElements.define('mjs-diagram-editor', DiagramEditor);
}
