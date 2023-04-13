import { DiagramViewer } from './DiagramViewer';

export { DiagramViewer } from './DiagramViewer';
export { DiagramState } from './core/DiagramState';

export { StencilBase } from './core/StencilBase';
export { StencilBaseState } from './core/StencilBaseState';
export { TextStencil } from './core/TextStencil';
export { RectangleTextStencil } from './core/RectangleTextStencil';
export { TextStencilState } from './core/TextStencilState';
export { EllipseStencil } from './core/EllipseStencil';
export { DiamondStencil } from './core/DiamondStencil';

export { ConnectorBase } from './core/ConnectorBase';
export { ConnectorBaseState } from './core/ConnectorBaseState';
export { CurvedConnector } from './core/CurvedConnector';
export { AngledConnector } from './core/AngledConnector';
export { ArrowConnector } from './core/ArrowConnector';
export { CurvedArrowConnector } from './core/CurvedArrowConnector';
export { AngledArrowConnector } from './core/AngledArrowConnector';

export { TextBlock } from './core/TextBlock';

export { StencilSet } from './core/StencilSet';
export { basicStencilSet } from './core/BasicStencilSet';
export { flowchartStencilSet } from './stencilsets/flowchart/FlowchartStencilSet';
export { mindMapStencilSet } from './stencilsets/mindmap/MindMapStencilSet';

export { SvgHelper } from './core/SvgHelper';

export { Activator } from './core/Activator';

if (
  window &&
  window.customElements &&
  window.customElements.get('mjs-diagram-viewer') === undefined
) {
  window.customElements.define('mjs-diagram-viewer', DiagramViewer);
}
