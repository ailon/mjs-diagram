import { ConnectorBase } from './ConnectorBase';
import { StencilBase } from './StencilBase';

/**
 * Stencil type descriptor containing stencil type and its display name.
 */
export interface IStencilProperties {
  /**
   * Stencil type.
   */
  stencilType: typeof StencilBase;
  /**
   * Stencil type's display name (if different from the original/default).
   */
  displayName?: string;
}

/**
 * Connector type descriptor.
 */
export interface IConnectorProperties {
  /**
   * Connector type.
   */
  connectorType: typeof ConnectorBase;
  /**
   * Contextual connector type display name (if different from the original/default).
   */
  displayName?: string;
}

/**
 * Stencil set descriptor.
 */
export interface IStencilSet {
  /**
   * Stencil set identifier
   */
  id: string;
  /**
   * Stencil set display name
   */
  displayName: string;
  /**
   * Stencil types available in the stencil set.
   */
  stencilTypes: IStencilProperties[];
  /**
   * Connector types available in the stencil set.
   */
  connectorTypes: IConnectorProperties[];
  /**
   * Returns contextual properties for the supplied stencil type within a stencil set.
   * @param stencilType stencil type
   */
  getStencilProperties(stencilType: typeof StencilBase | string): IStencilProperties | undefined;
  /**
   * Returns contextual connector type properties for the supplied connecter type within a stencil set.
   * @param connectorType connector type
   */
  getConnectorProperties(connectorType: typeof ConnectorBase | string): IConnectorProperties | undefined;
}

/**
 * Represents a collection of stencils and connectors defining a particular diagram type.
 * 
 * To define some diagram type you would create a `StencilSet` containing stencil and connector types
 * that make sense in the context of a particular diagram type.
 */
export class StencilSet implements IStencilSet {
  public id: string;
  public displayName: string;
  public stencilTypes: IStencilProperties[];
  public connectorTypes: IConnectorProperties[];

  /**
   * Creates a new `StencilSet`.
   */
  constructor(id: string, displayName?: string) {
    this.id = id;
    this.displayName = displayName ?? id;
    
    this.stencilTypes = [];
    this.connectorTypes = []

    this.getStencilProperties = this.getStencilProperties.bind(this);
    this.getConnectorProperties = this.getConnectorProperties.bind(this);
  }
  
  public getStencilProperties(stencilType: typeof StencilBase | string): IStencilProperties | undefined {
    let sType: IStencilProperties | undefined;
    
    if (typeof stencilType === 'string') {
      sType = this.stencilTypes.find(
        (st) => st.stencilType.typeName === stencilType
      );
    } else {
      sType = this.stencilTypes.find(
        (st) => st.stencilType === stencilType
      );
    }
    
    return sType;
  }

  public getConnectorProperties(connectorType: typeof ConnectorBase | string): IConnectorProperties | undefined {
    let cType: IConnectorProperties | undefined;
    
    if (typeof connectorType === 'string') {
      cType = this.connectorTypes.find(
        (ct) => ct.connectorType.typeName === connectorType
      );
    } else {
      cType = this.connectorTypes.find(
        (ct) => ct.connectorType === connectorType
      );
    }
    
    return cType;
  }
}
