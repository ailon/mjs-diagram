import { basicStencilSet } from '../core/BasicStencilSet';
import { StencilEditorSet } from './StencilEditorSet';
import { RectangleTextStencil } from '../core/RectangleTextStencil';
import { TextStencilEditor } from './TextStencilEditor';
import { CurvedConnector } from '../core/CurvedConnector';
import { ConnectorBaseEditor } from './ConnectorBaseEditor';
import { ConnectorBase } from '../core/ConnectorBase';
import { EllipseStencil } from '../core/EllipseStencil';
import { DiamondStencil } from '../core/DiamondStencil';
import { TextStencilState } from '../core/TextStencilState';
import { AngledConnector } from '../core/AngledConnector';

const basicStencilEditorSet = new StencilEditorSet('core', basicStencilSet);
basicStencilEditorSet.stencilEditorTypes.set(RectangleTextStencil, TextStencilEditor);
basicStencilEditorSet.stencilEditorTypes.set(EllipseStencil, TextStencilEditor);
basicStencilEditorSet.stencilEditorTypes.set(DiamondStencil, TextStencilEditor);

basicStencilEditorSet.connectorEditorTypes.set(
  CurvedConnector,
  ConnectorBaseEditor
);
basicStencilEditorSet.connectorEditorTypes.set(
  AngledConnector,
  ConnectorBaseEditor
);

basicStencilEditorSet.availableConnectorTypes = [
  ConnectorBase,
  CurvedConnector,
  AngledConnector
];
basicStencilEditorSet.defaultConnectorType = AngledConnector;

basicStencilEditorSet.newDocumentTemplate = {
  width: 640,
  height: 360,
  stencils: [
    <TextStencilState>{
      color: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      padding: 5,
      text: 'Welcome!',
      typeName: 'RectangleTextStencil',
      iid: 1,
      left: 234.53121948242188,
      top: 137.66664123535156,
      width: 179.33331298828125,
      height: 94.66671752929688,
      fillColor: '#eeeeee',
      strokeColor: 'black',
      strokeWidth: 1,
      strokeDasharray: '',
    },
  ],
  connectors: [],
};

export { basicStencilEditorSet };
