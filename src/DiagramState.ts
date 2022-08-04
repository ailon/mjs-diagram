import { ConnectorBaseState } from './ConnectorBaseState';
import { StencilBaseState } from './StencilBaseState';

export interface DiagramState {
  width: number,
  height: number,

  stencils: StencilBaseState[];
  connectors: ConnectorBaseState[];
}
