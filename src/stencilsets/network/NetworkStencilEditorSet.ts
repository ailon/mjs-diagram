import {
  AngledArrowConnector,
  ArrowConnector,
  CurvedArrowConnector,
  LabelStencil,
  RectangleTextStencil,
} from '../../core';
import {
  ImageStencilEditor,
  StencilEditorSet,
  TextStencilEditor,
} from '../../editor';
import { networkStencilSet } from './NetworkStencilSet';
import { CloudStencil } from './stencils/CloudStencil';
import { DatabaseStencil } from './stencils/DatabaseStencil';
import { DesktopStencil } from './stencils/DesktopStencil';
import { NotebookStencil } from './stencils/NotebookStencil';
import { PrinterStencil } from './stencils/PrinterStencil';
import { RouterStencil } from './stencils/RouterStencil';
import { ServerStencil } from './stencils/ServerStencil';
import { WiFiRouterStencil } from './stencils/WiFiRouterStencil';

const networkStencilEditorSet = new StencilEditorSet(
  'network',
  networkStencilSet
);
networkStencilEditorSet.displayName = 'Network Diagram';

networkStencilEditorSet.stencilEditorTypes.set(
  NotebookStencil,
  ImageStencilEditor
);
networkStencilEditorSet.stencilEditorTypes.set(
  DesktopStencil,
  ImageStencilEditor
);
networkStencilEditorSet.stencilEditorTypes.set(
  ServerStencil,
  ImageStencilEditor
);
networkStencilEditorSet.stencilEditorTypes.set(
  RouterStencil,
  ImageStencilEditor
);
networkStencilEditorSet.stencilEditorTypes.set(
  WiFiRouterStencil,
  ImageStencilEditor
);
networkStencilEditorSet.stencilEditorTypes.set(
  CloudStencil,
  ImageStencilEditor
);
networkStencilEditorSet.stencilEditorTypes.set(
  DatabaseStencil,
  ImageStencilEditor
);
networkStencilEditorSet.stencilEditorTypes.set(
  PrinterStencil,
  ImageStencilEditor
);

networkStencilEditorSet.stencilEditorTypes.set(LabelStencil, TextStencilEditor);
networkStencilEditorSet.stencilEditorTypes.set(RectangleTextStencil, TextStencilEditor);

networkStencilEditorSet.availableConnectorTypes = [
  ArrowConnector,
  CurvedArrowConnector,
  AngledArrowConnector,
];
networkStencilEditorSet.defaultConnectorType = ArrowConnector;

networkStencilEditorSet.newDocumentTemplate = {
  width: 640,
  height: 360,
  stencils: [],
  connectors: [],
};

export { networkStencilEditorSet };
