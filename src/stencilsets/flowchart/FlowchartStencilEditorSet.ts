import { flowchartStencilSet } from './FlowchartStencilSet';

import { ArrowConnector, BitmapImageStencil } from '../../core';
import { CurvedArrowConnector } from '../../core';
import { TextStencilState } from '../../core';
import { AngledArrowConnector } from '../../core';

import { CustomImageStencilEditor, StencilEditorSet } from '../../editor';
import { TextStencilEditor } from '../../editor';
import { ConnectorBaseEditor } from '../../editor';

import en_flowchart_strings from './lang/en';
import { StringSet } from '../../editor';

/**
 * Editor set for editing Flowchart diagrams.
 */
const flowchartStencilEditorSet = new StencilEditorSet('flowchart', flowchartStencilSet);
flowchartStencilEditorSet.displayName = 'Flowchart';
flowchartStencilEditorSet.defaultStencilEditor = TextStencilEditor;
flowchartStencilEditorSet.addStencilEditor(CustomImageStencilEditor, BitmapImageStencil);

flowchartStencilEditorSet.defaultConnectorEditor = ConnectorBaseEditor;
flowchartStencilEditorSet.defaultStringSet = new StringSet(en_flowchart_strings);
flowchartStencilEditorSet.availableConnectorTypes = [
  AngledArrowConnector, ArrowConnector, CurvedArrowConnector
];
flowchartStencilEditorSet.defaultConnectorType = AngledArrowConnector;

flowchartStencilEditorSet.newDocumentTemplate = {
  width: 640,
  height: 360,
  stencils: [
    <TextStencilState>{
      color: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      padding: 5,
      text: 'Start',
      typeName: 'TerminalStencil',
      iid: 1,
      left: 234.53121948242188,
      top: 10,
      width: 150,
      height: 50,
      fillColor: '#eeeeee',
      strokeColor: 'black',
      strokeWidth: 1,
      strokeDasharray: '',
    },
  ],
  connectors: [],
};

export { flowchartStencilEditorSet };
