import { flowchartStencilSet } from './FlowchartStencilSet';
import { StencilEditorSet, TextStencilEditor, ConnectorBaseEditor, TextStencilState, ArrowConnector, CurvedArrowConnector } from '../../index';
import { ProcessStencil } from './stencils/ProcessStencil';
import { DecisionStencil } from './stencils/DecisionStencil';
import { IOStencil } from './stencils/IOStencil';
import { TerminalStencil } from './stencils/TerminalStencil';

const flowchartStencilEditorSet = new StencilEditorSet(flowchartStencilSet);
flowchartStencilEditorSet.stencilEditorTypes.set(ProcessStencil, TextStencilEditor);
flowchartStencilEditorSet.stencilEditorTypes.set(DecisionStencil, TextStencilEditor);
flowchartStencilEditorSet.stencilEditorTypes.set(IOStencil, TextStencilEditor);
flowchartStencilEditorSet.stencilEditorTypes.set(TerminalStencil, TextStencilEditor);

flowchartStencilEditorSet.connectorEditorTypes.set(
  ArrowConnector,
  ConnectorBaseEditor
);

flowchartStencilEditorSet.availableConnectorTypes = [
  ArrowConnector, CurvedArrowConnector
];
flowchartStencilEditorSet.defaultConnectorType = ArrowConnector;

flowchartStencilEditorSet.newDocumentTemplate = {
  width: 872,
  height: 752,
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
