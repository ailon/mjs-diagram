import { ConnectorBase } from '../core';
import { IStencilSet, StencilSet } from '../core';
import { DiagramState } from '../core';
import { StencilBase } from '../core';

import { ConnectorBaseEditor } from './ConnectorBaseEditor';
import { StencilBaseEditor } from './StencilBaseEditor';
import { StringSet } from './Language';

/**
 * Stencil editor set descriptor.
 */
export interface IStencilEditorSet {
  /**
   * Editor set identifier.
   */
  id: string;
  /**
   * {@link core!StencilSet} covered by the editor set.
   */
  stencilSet: StencilSet;
  /**
   * Display name for the editor set.
   */
  displayName?: string;
  /**
   * Localization strings.
   */
  defaultStringSet?: StringSet;
  /**
   * A mapping collection of stencils and corresponding editors.
   */
  stencilEditorTypes: Map<typeof StencilBase, typeof StencilBaseEditor>;
  /**
   * A mapping collection of connectors and corresponding editors.
   */
  connectorEditorTypes: Map<typeof ConnectorBase, typeof ConnectorBaseEditor>;

  /**
   * Connector types available in this stencil editor set.
   */
  availableConnectorTypes: typeof ConnectorBase[];
  /**
   * The default selected connector type.
   */
  defaultConnectorType: typeof ConnectorBase; 

  /**
   * Returns the editor type for the supplied stencil type.
   * @param stencilType stencil type for editing.
   */
  getStencilEditor(stencilType: typeof StencilBase): typeof StencilBaseEditor;
  /**
   * Returns the connector editor type for the supplied connector type.
   * @param connectorType connector type for editing.
   */
  getConnectorEditor(connectorType: typeof ConnectorBase): typeof ConnectorBaseEditor;
}

/**
 * Represents a collection of stencil and connector types and respective editors
 * for a specific diagram type creation and editing.
 */
export class StencilEditorSet implements IStencilEditorSet {
  public id: string;
  public stencilSet: IStencilSet;
  public displayName?: string;
  public defaultStringSet?: StringSet;
  public defaultStencilEditor: typeof StencilBaseEditor = StencilBaseEditor;
  public defaultConnectorEditor: typeof ConnectorBaseEditor = ConnectorBaseEditor;

  public stencilEditorTypes: Map<typeof StencilBase, typeof StencilBaseEditor>;
  public connectorEditorTypes: Map<typeof ConnectorBase, typeof ConnectorBaseEditor>;

  public availableConnectorTypes: typeof ConnectorBase[] = [ConnectorBase];
  public defaultConnectorType: typeof ConnectorBase = ConnectorBase; 

  /**
   * The default document to load when creating a new diagram for this set.
   */
  public newDocumentTemplate?: DiagramState;

  /**
   * Creates a new stencil editor set.
   * @param id editor set identifier.
   * @param stencilSet stencil set.
   */
  constructor(id: string, stencilSet: IStencilSet) {
    this.id = id;
    this.stencilSet = stencilSet;

    this.getStencilEditor = this.getStencilEditor.bind(this);
    this.getConnectorEditor = this.getConnectorEditor.bind(this);
    this.addStencilEditor = this.addStencilEditor.bind(this);
    this.addConnectorEditor = this.addConnectorEditor.bind(this);
    
    this.stencilEditorTypes = new Map<typeof StencilBase, typeof StencilBaseEditor>();
    this.connectorEditorTypes = new Map<typeof ConnectorBase, typeof ConnectorBaseEditor>();
  }

  /**
   * Returns an editor type for the provided stencil type.
   * @param stencilType stencil type.
   * @returns if specified returns a custom editor type for the supplied stencil type, 
   * otherwise returns the default editor type for this stencil editor set.
   */
  public getStencilEditor(stencilType: typeof StencilBase): typeof StencilBaseEditor {
    return this.stencilEditorTypes.get(stencilType) ?? this.defaultStencilEditor;
  }

  /**
   * Returns an editor type for the provided connector type.
   * @param connectorType connector type.
   * @returns if specified returns a custom editor type for the supplied connector type, 
   * otherwise returns the default editor type for this stencil editor set.
   */
  public getConnectorEditor(connectorType: typeof ConnectorBase): typeof ConnectorBaseEditor {
    return this.connectorEditorTypes.get(connectorType) ?? this.defaultConnectorEditor;
  }

  /**
   * Adds an editor type for one or more stencil types.
   * @param editorType editor type.
   * @param stencilTypes list of stencil types to be edited by this editor.
   */
  public addStencilEditor(editorType: typeof StencilBaseEditor, ...stencilTypes: (typeof StencilBase)[]) {
    stencilTypes.forEach(st => {
      this.stencilEditorTypes.set(st, editorType);
    });
  }

  /**
   * Adds an editor type for one or more connector types.
   * @param editorType editor type.
   * @param connectorTypes list of connector types to be edited by this editor.
   */
  public addConnectorEditor(editorType: typeof ConnectorBaseEditor, ...connectorTypes: (typeof ConnectorBase)[]) {
    connectorTypes.forEach(ct => {
      this.connectorEditorTypes.set(ct, editorType);
    });
  }
}
