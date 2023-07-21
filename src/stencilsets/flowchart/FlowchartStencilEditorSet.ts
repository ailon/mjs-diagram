import { flowchartStencilSet } from './FlowchartStencilSet';
import { ProcessStencil } from './stencils/ProcessStencil';
import { DecisionStencil } from './stencils/DecisionStencil';
import { IOStencil } from './stencils/IOStencil';
import { TerminalStencil } from './stencils/TerminalStencil';

import { ArrowConnector, LabelStencil } from '../../core';
import { CurvedArrowConnector } from '../../core';
import { TextStencilState } from '../../core';
import { AngledArrowConnector } from '../../core';

import { StencilEditorSet } from '../../editor';
import { TextStencilEditor } from '../../editor';
import { ConnectorBaseEditor } from '../../editor';

import en_flowchart_strings from './lang/en';
import { StringSet } from '../../editor';

/**
 * Editor set for editing Flowchart diagrams.
 */
const flowchartStencilEditorSet = new StencilEditorSet('flowchart', flowchartStencilSet);
flowchartStencilEditorSet.displayName = 'Flowchart';
flowchartStencilEditorSet.defaultStringSet = new StringSet(en_flowchart_strings);
flowchartStencilEditorSet.stencilEditorTypes.set(ProcessStencil, TextStencilEditor);
flowchartStencilEditorSet.stencilEditorTypes.set(DecisionStencil, TextStencilEditor);
flowchartStencilEditorSet.stencilEditorTypes.set(IOStencil, TextStencilEditor);
flowchartStencilEditorSet.stencilEditorTypes.set(TerminalStencil, TextStencilEditor);
flowchartStencilEditorSet.stencilEditorTypes.set(LabelStencil, TextStencilEditor);

flowchartStencilEditorSet.connectorEditorTypes.set(
  ArrowConnector,
  ConnectorBaseEditor
);

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
