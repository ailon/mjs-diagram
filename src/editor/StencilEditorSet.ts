import { ConnectorBase } from '../core/ConnectorBase';
import { ConnectorBaseEditor } from './ConnectorBaseEditor';
import { StencilBase } from '../core/StencilBase';
import { StencilBaseEditor } from './StencilBaseEditor';
import { IStencilSet, StencilSet } from '../core/StencilSet';

export interface IStencilEditorSet {
  stencilSet: StencilSet;
  stencilEditorTypes: Map<typeof StencilBase, typeof StencilBaseEditor>;
  connectorEditorTypes: Map<typeof ConnectorBase, typeof ConnectorBaseEditor>;

  getStencilEditor(stencilType: typeof StencilBase): typeof StencilBaseEditor;
  getConnectorEditor(connectorType: typeof ConnectorBase): typeof ConnectorBaseEditor;
}

export class StencilEditorSet implements StencilEditorSet {
  public stencilSet: IStencilSet;
  public stencilEditorTypes: Map<typeof StencilBase, typeof StencilBaseEditor>;
  public connectorEditorTypes: Map<typeof ConnectorBase, typeof ConnectorBaseEditor>;

  constructor(stencilSet: IStencilSet) {
    this.stencilSet = stencilSet;

    this.getStencilEditor = this.getStencilEditor.bind(this);
    this.getConnectorEditor = this.getConnectorEditor.bind(this);
    
    this.stencilEditorTypes = new Map<typeof StencilBase, typeof StencilBaseEditor>();
    this.connectorEditorTypes = new Map<typeof ConnectorBase, typeof ConnectorBaseEditor>();
  }

  public getStencilEditor(stencilType: typeof StencilBase): typeof StencilBaseEditor {
    return this.stencilEditorTypes.get(stencilType) ?? StencilBaseEditor;
  }

  public getConnectorEditor(connectorType: typeof ConnectorBase): typeof ConnectorBaseEditor {
    return this.connectorEditorTypes.get(connectorType) ?? ConnectorBaseEditor;
  }
}
