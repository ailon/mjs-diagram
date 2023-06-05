import { ArrowType } from './ConnectorBase';
import { Port, PortLocation } from './Port';
import { StencilBase } from './StencilBase';

/**
 * Represents a state (configuration) of a connector.
 * Used when storing and restoring connector state externally and for undo/redo operations.
 */
export interface ConnectorBaseState {
  /**
   * Text representation of connector's type name.
   */
  typeName: string;
  /**
   * Internal connector identifier.
   */
  iid: number;

  /**
   * Identifier of the stencil at the start tip of the connector.
   */
  startStencilId?: number;
  /**
   * Location of the stencil connector port on the start tip of the connector.
   */
  startPortLocation?: PortLocation;

  /**
   * Identifier of the stencil at the end tip of the connector.
   */
  endStencilId?: number;
  /**
   * Location of the stencil connector port on the end tip of the connector.
   */
  endPortLocation?: PortLocation;

  /**
   * Horizontal offset of the connector's text label (as measured from the automatic position).
   */
  labelOffsetX?: number;
  /**
   * Vertical offset of the connector's text label (as measured from the automatic position).
   */
  labelOffsetY?: number;

  /**
   * Color of the connector line.
   */
  strokeColor?: string;
  /**
   * Width of the connector line (in pixels).
   */
  strokeWidth?: number;
  /**
   * Dash array for the connector line.
   * 
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   */
  strokeDasharray?: string;

  /**
   * Describes which tips of the connector end in arrows.
   */
  arrowType?: ArrowType;

  /**
   * Text of the connector's label.
   */
  labelText?: string;
}

/**
 * Describes connector's end point properties.
 */
export interface ConnectorEndPoints {
  /**
   * Stencil at the start tip of the connector.
   */
  startStencil: StencilBase;
  /**
   * Port at the start tip of the connector.
   */
  startPort: Port;
  /**
   * Stencil at the end tip of the connector.
   */
  endStencil: StencilBase;
  /**
   * Port at the end tip of the connector.
   */
  endPort: Port;
}
