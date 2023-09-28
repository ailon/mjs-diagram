/**
 * The `viewer` module contains everything you need to display interactive diagrams created with either
 * {@link editor!DiagramEditor} or in code.
 * 
 * The core class here is {@link DiagramViewer}. It represents the viewer web component.
 * 
 * @example
 * Here's a basic scenario for adding a Flowchart viewer on your page.
 * 
 * In the markup part add the diagram viewer web component:
 * ```html
 * <mjs-diagram-viewer id="mjsDiaViewer"></mjs-diagram-viewer>
 * ```
 * 
 * Then in your code configure it to use the flowchart stencil set and pass the previously created diagram
 * to the {@link DiagramViewer.show} method:
 * 
 * ```ts
 * import * as mjsdv from "@markerjs/mjs-diagram/viewer";
 * import * as flowchart from "@markerjs/mjs-diagram/stencilsets/flowchart/flowchart";
 * 
 * const viewer = document.getElementById("mjsDiaViewer");
 * viewer.stencilSet = flowchart.flowchartStencilSet;
 * viewer.show(diagram);
 * ```
 * 
 * @module viewer
 */

import { DiagramViewer } from './DiagramViewer';

export {
  DiagramViewer,
  DiagramViewerEventMap,
  ConnectorEventData,
  DiagramViewerEventData,
  StencilEventData,
  AutoScaleDirection,
} from './DiagramViewer';

if (
  window &&
  window.customElements &&
  window.customElements.get('mjs-diagram-viewer') === undefined
) {
  window.customElements.define('mjs-diagram-viewer', DiagramViewer);
}
