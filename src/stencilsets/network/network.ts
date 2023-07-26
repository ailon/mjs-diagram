/**
 * The `network` stencilset represents all the stencils, connectors, and editors
 * need to create and view Network Diagrams.
 * 
 * Import the module into your project like this:
 * 
 * ```ts
 * import * as network from "@markerjs/mjs-diagram/stencilsets/network/network";
 * ```
 * 
 * Then assign the {@link viewer!DiagramViewer.stencilSet | DiagramViewer.stencilSet} 
 * or {@link editor!DiagramEditor.stencilEditorSet | DiagramEditor.stencilEditorSet} like this:
 * 
 * ```ts
 * viewer.stencilSet = network.networkStencilSet;
 * editor.stencilEditorSet = network.networkStencilEditorSet;
 * ```
 * 
 * @module stencilsets/network
 */
export { CloudStencil } from './stencils/CloudStencil';
export { DatabaseStencil } from './stencils/DatabaseStencil';
export { DesktopStencil } from './stencils/DesktopStencil';
export { NotebookStencil } from './stencils/NotebookStencil';
export { PrinterStencil } from './stencils/PrinterStencil';
export { RouterStencil } from './stencils/RouterStencil';
export { ServerStencil } from './stencils/ServerStencil';
export { WiFiRouterStencil } from './stencils/WiFiRouterStencil';
export { CameraStencil } from './stencils/CameraStencil';
export { SmartphoneStencil } from './stencils/SmartphoneStencil';
export { TabletStencil } from './stencils/TabletStencil';
export { TVStencil } from './stencils/TVStencil';
export { UserStencil } from './stencils/UserStencil';

export { networkStencilSet } from './NetworkStencilSet';
export { networkStencilEditorSet } from './NetworkStencilEditorSet';