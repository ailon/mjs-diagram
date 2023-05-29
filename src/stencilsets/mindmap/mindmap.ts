/**
 * The `mindmap` stencilset represents all the stencils, connectors, and editors
 * need to create and view Mind Maps.
 * 
 * Import the module into your project like this:
 * 
 * ```ts
 * import * as mindmap from "@markerjs/mjs-diagram/stencilsets/mindmap/mindmap";
 * ```
 * 
 * Then assign the {@link viewer!DiagramViewer.stencilSet | DiagramViewer.stencilSet} 
 * or {@link editor!DiagramEditor.stencilEditorSet | DiagramEditor.stencilEditorSet} like this:
 * 
 * ```ts
 * viewer.stencilSet = mindmap.mindMapStencilSet;
 * editor.stencilEditorSet = mindmap.mindMapStencilEditorSet;
 * ```
 * 
 * @module stencilsets/mindmap
 */
export { mindMapStencilSet } from './MindMapStencilSet';
export { mindMapStencilEditorSet } from './MindMapStencilEditorSet';

export { CentralTopicStencil } from './stencils/CentralTopicStencil';
export { ItemStencil } from './stencils/ItemStencil';
export { SubTopicStencil } from './stencils/SubTopicStencil';

export { MindMapConnector } from './connectors/MindMapConnector';
