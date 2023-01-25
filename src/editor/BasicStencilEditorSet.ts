import { basicStencilSet } from '../core/BasicStencilSet';
import { StencilEditorSet } from './StencilEditorSet';
import { TextStencil } from '../core/TextStencil';
import { TextStencilEditor } from './TextStencilEditor';
import { CurvedConnector } from '../core/CurvedConnector';
import { ConnectorBaseEditor } from './ConnectorBaseEditor';
import { ConnectorBase } from '../core/ConnectorBase';

const basicStencilEditorSet = new StencilEditorSet(basicStencilSet);
basicStencilEditorSet.stencilEditorTypes.set(TextStencil, TextStencilEditor);
basicStencilEditorSet.connectorEditorTypes.set(CurvedConnector, ConnectorBaseEditor);

basicStencilEditorSet.availableConnectorTypes = [ConnectorBase, CurvedConnector];
basicStencilEditorSet.defaultConnectorType = ConnectorBase;

export { basicStencilEditorSet }
