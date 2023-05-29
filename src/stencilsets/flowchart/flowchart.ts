/**
 * The `flowchart` stencilset represents all the stencils, connectors, and editors
 * need to create and view Flowcharts.
 * 
 * Import the module into your project like this:
 * 
 * ```ts
 * import * as flowchart from "@markerjs/mjs-diagram/stencilsets/flowchart/flowchart";
 * ```
 * 
 * Then assign the {@link viewer!DiagramViewer.stencilSet | DiagramViewer.stencilSet} 
 * or {@link editor!DiagramEditor.stencilEditorSet | DiagramEditor.stencilEditorSet} like this:
 * 
 * ```ts
 * viewer.stencilSet = flowchart.flowchartStencilSet;
 * editor.stencilEditorSet = flowchart.flowchartStencilEditorSet;
 * ```
 * 
 * @module stencilsets/flowchart
 */
export { flowchartStencilSet } from './FlowchartStencilSet';
export { flowchartStencilEditorSet } from './FlowchartStencilEditorSet';

export { DecisionStencil } from './stencils/DecisionStencil';
export { IOStencil } from './stencils/IOStencil';
export { ProcessStencil } from './stencils/ProcessStencil';
export { TerminalStencil } from './stencils/TerminalStencil';
