import { Port, PortLocation } from './Port';
import { StencilBase } from './StencilBase';

export interface ConnectorBaseState {
  typeName: string;
  iid: number;

  startStencilId?: number;
  startPortLocation?: PortLocation;

  endStencilId?: number;
  endPortLocation?: PortLocation;

  strokeColor: string;
  strokeWidth: number;
  strokeDasharray: string;
}

export interface ConnectorEndPoints {
  startStencil: StencilBase;
  startPort: Port;
  endStencil: StencilBase;
  endPort: Port;
}
