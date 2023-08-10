import {
  basicStencilSet,
  RectangleTextStencil,
  CurvedConnector,
  ConnectorBase,
  EllipseStencil,
  DiamondStencil,
  TextStencilState,
  AngledConnector,
  LightbulbIconStencil,
  LabelStencil,
} from '../core';

import { StencilEditorSet } from './StencilEditorSet';
import { TextStencilEditor } from './TextStencilEditor';
import { ConnectorBaseEditor } from './ConnectorBaseEditor';
import { ImageStencilEditor } from './ImageStencilEditor';

/**
 * Basic stencil editor set sets up editing capabilities for creating
 * diagrams with the {@link core!basicStencilSet}.
 */
const basicStencilEditorSet = new StencilEditorSet('core', basicStencilSet);
basicStencilEditorSet.displayName = 'Basic stencil set';
basicStencilEditorSet.defaultStencilEditor = TextStencilEditor;
basicStencilEditorSet.stencilEditorTypes.set(
  RectangleTextStencil,
  TextStencilEditor
);
basicStencilEditorSet.addStencilEditor(ImageStencilEditor, LightbulbIconStencil);

basicStencilEditorSet.availableConnectorTypes = [
  ConnectorBase,
  CurvedConnector,
  AngledConnector,
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
