import { PortLocation } from './Port';

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