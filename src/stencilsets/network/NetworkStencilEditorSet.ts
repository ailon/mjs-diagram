import {
  AngledArrowConnector,
  ArrowConnector,
  BitmapImageStencil,
  CurvedArrowConnector,
  LabelStencil,
  RectangleTextStencil,
} from '../../core';
import {
  CustomImageStencilEditor,
  ImageStencilEditor,
  StencilEditorSet,
  TextStencilEditor,
} from '../../editor';
import { networkStencilSet } from './NetworkStencilSet';

/**
 * Network diagram editor set.
 */
const networkStencilEditorSet = new StencilEditorSet(
  'network',
  networkStencilSet
);
networkStencilEditorSet.displayName = 'Network Diagram';
networkStencilEditorSet.defaultStencilEditor = ImageStencilEditor;
networkStencilEditorSet.addStencilEditor(TextStencilEditor, LabelStencil, RectangleTextStencil);
networkStencilEditorSet.addStencilEditor(CustomImageStencilEditor, BitmapImageStencil);

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
