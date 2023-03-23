import { ConnectorBaseState } from './ConnectorBaseState';
import { StencilBaseState } from './StencilBaseState';

export interface DiagramState {
  width?: number,
  height?: number,

  backgroundColor?: string,

  stencils?: StencilBaseState[];
  connectors?: ConnectorBaseState[];
}
