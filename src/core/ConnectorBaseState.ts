import { ArrowType } from './ConnectorBase';
import { Port, PortLocation } from './Port';
import { StencilBase } from './StencilBase';

export interface ConnectorBaseState {
  typeName: string;
  iid: number;

  startStencilId?: number;
  startPortLocation?: PortLocation;

  endStencilId?: number;
  endPortLocation?: PortLocation;

  labelOffsetX: number;
  labelOffsetY: number;

  strokeColor: string;
  strokeWidth: number;
  strokeDasharray: string;

  arrowType?: ArrowType;
}

export interface ConnectorEndPoints {
  startStencil: StencilBase;
  startPort: Port;
  endStencil: StencilBase;
  endPort: Port;
}
