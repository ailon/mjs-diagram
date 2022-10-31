import { ConnectorBase } from './ConnectorBase';
import { StencilBase } from './StencilBase';

export interface IStencilProperties {
  stencilType: typeof StencilBase;
  displayName?: string;
}

export interface IConnectorProperties {
  connectorType: typeof ConnectorBase;
  displayName?: string;
}

export interface IStencilSet {
  stencilTypes: IStencilProperties[];
  connectorTypes: IConnectorProperties[];
  getStencilProperties(stencilType: typeof StencilBase | string): IStencilProperties | undefined;
  getConnectorProperties(connectorType: typeof ConnectorBase | string): IConnectorProperties | undefined;
}

export class StencilSet implements IStencilSet {
  public stencilTypes: IStencilProperties[];
  public connectorTypes: IConnectorProperties[];

  constructor() {
    this.stencilTypes = [
      {
        stencilType: StencilBase,
        displayName: 'Basic rectangle'
      }
    ];
    this.connectorTypes = [
      {
        connectorType: ConnectorBase,
        displayName: 'Basic connector'
      }
    ]

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
