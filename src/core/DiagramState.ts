import { ConnectorBaseState } from './ConnectorBaseState';
import { StencilBaseState } from './StencilBaseState';

/**
 * Represents diagram's state (configuration) used to save and restore
 * diagrams. It can also be used to construct diagrams from code.
 */
export interface DiagramState {
  /**
   * Diagram document width.
   */
  width?: number,
  /**
   * Diagram document height.
   */
  height?: number,

  /**
   * Page background color.
   */
  backgroundColor?: string,

  /**
   * A collection of stencils.
   */
  stencils?: StencilBaseState[];
  /**
   * A collection of connectors.
   */
  connectors?: ConnectorBaseState[];
}
