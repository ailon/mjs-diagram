import { ConnectorBase } from '../core/ConnectorBase';
import { ConnectorBaseEditor } from './ConnectorBaseEditor';
import { StencilBase } from '../core/StencilBase';
import { StencilBaseEditor } from './StencilBaseEditor';
import { IStencilSet, StencilSet } from '../core/StencilSet';
import { DiagramState } from '../core/DiagramState';
import { StringSet } from './Language';

export interface IStencilEditorSet {
  id: string;
  stencilSet: StencilSet;
  displayName?: string;
  defaultStringSet?: StringSet;
  stencilEditorTypes: Map<typeof StencilBase, typeof StencilBaseEditor>;
  connectorEditorTypes: Map<typeof ConnectorBase, typeof ConnectorBaseEditor>;

  availableConnectorTypes: typeof ConnectorBase[];
  defaultConnectorType: typeof ConnectorBase; 

  getStencilEditor(stencilType: typeof StencilBase): typeof StencilBaseEditor;
  getConnectorEditor(connectorType: typeof ConnectorBase): typeof ConnectorBaseEditor;
}

export class StencilEditorSet implements IStencilEditorSet {
  public id: string;
  public stencilSet: IStencilSet;
  public displayName?: string;
  public defaultStringSet?: StringSet;

  public stencilEditorTypes: Map<typeof StencilBase, typeof StencilBaseEditor>;
  public connectorEditorTypes: Map<typeof ConnectorBase, typeof ConnectorBaseEditor>;

  public availableConnectorTypes: typeof ConnectorBase[] = [ConnectorBase];
  public defaultConnectorType: typeof ConnectorBase = ConnectorBase; 

  public newDocumentTemplate?: DiagramState;

  constructor(id: string, stencilSet: IStencilSet) {
    this.id = id;
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
