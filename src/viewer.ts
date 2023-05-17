import { DiagramViewer } from './DiagramViewer';

export {
  DiagramViewer,
  DiagramViewerEventMap,
  ConnectorEventData,
  DiagramViewerEventData,
  StencilEventData,
} from './DiagramViewer';

if (
  window &&
  window.customElements &&
  window.customElements.get('mjs-diagram-viewer') === undefined
) {
  window.customElements.define('mjs-diagram-viewer', DiagramViewer);
}
