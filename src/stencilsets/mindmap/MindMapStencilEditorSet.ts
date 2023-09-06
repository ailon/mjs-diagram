import { CustomImageStencilEditor, StencilEditorSet, TextStencilEditor } from '../../editor';
import { BitmapImageStencil, TextStencilState } from '../../core';

import { mindMapStencilSet } from './MindMapStencilSet';
import { MindMapConnector } from './connectors/MindMapConnector';

/**
 * Mind Map editor set.
 */
const mindMapStencilEditorSet = new StencilEditorSet('mindmap', mindMapStencilSet);
mindMapStencilEditorSet.displayName = 'Mind map';
mindMapStencilEditorSet.defaultStencilEditor = TextStencilEditor;
mindMapStencilEditorSet.addStencilEditor(CustomImageStencilEditor, BitmapImageStencil);

mindMapStencilEditorSet.availableConnectorTypes = [
  MindMapConnector,
];
mindMapStencilEditorSet.defaultConnectorType = MindMapConnector;

mindMapStencilEditorSet.newDocumentTemplate = {
  width: 640,
  height: 360,
  stencils: [
    <TextStencilState>{
      color: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      padding: 5,
      text: 'Central topic',
      typeName: 'CentralTopicStencil',
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

export { mindMapStencilEditorSet };
