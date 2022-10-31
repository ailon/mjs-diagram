import { DiagramEditor } from './DiagramEditor';
import { DiagramViewer } from './DiagramViewer';

export { DiagramEditor } from './DiagramEditor';
export { DiagramViewer } from './DiagramViewer';
export { DiagramState } from './core/DiagramState';

customElements.define('mjs-diagram-editor', DiagramEditor);
customElements.define('mjs-diagram-viewer', DiagramViewer);
