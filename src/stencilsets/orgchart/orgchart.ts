/**
 * The `orgchart` stencilset represents all the stencils, connectors, and editors
 * need to create and view Organizational Charts.
 * 
 * Import the module into your project like this:
 * 
 * ```ts
 * import * as orgchart from "@markerjs/mjs-diagram/stencilsets/orgchart/orgchart";
 * ```
 * 
 * Then assign the {@link viewer!DiagramViewer.stencilSet | DiagramViewer.stencilSet} 
 * or {@link editor!DiagramEditor.stencilEditorSet | DiagramEditor.stencilEditorSet} like this:
 * 
 * ```ts
 * viewer.stencilSet = orgchart.orgchartStencilSet;
 * editor.stencilEditorSet = orgchart.orgchartStencilEditorSet;
 * ```
 * 
 * @module stencilsets/orgchart
 */
export { OrganizationStencil } from './stencils/OrganizationStencil';
export { TeamStencil } from './stencils/TeamStencil';
export { PersonStencil } from './stencils/PersonStencil';

export { orgchartStencilSet } from './OrgchartStencilSet';
export { orgchartStencilEditorSet } from './OrgchartStencilEditorSet';
