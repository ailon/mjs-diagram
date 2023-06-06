/**
 * Represents state (configuration) of a stencil.
 * Used to save and restore stencils as well as for undo/redo operations.
 */
export interface StencilBaseState {
  /**
   * String representation of the stencil's type name.
   */
  typeName: string;
  /**
   * Internal stencil id. Used to refer to the stencil in connectors, etc.
   */
  iid: number;
  /**
   * Arbitrary string data that can be saved along with the stencil's state.
   */
  notes?: string;

  /**
   * Horizontal coordinate of the stencil.
   */
  left: number;
  /**
   * Vertical coordinate of the stencil.
   */
  top: number;
  /**
   * Stencil's width.
   */
  width?: number;
  /**
   * Stencil's height.
   */
  height?: number;

  /**
   * Fill color.
   */
  fillColor?: string;
  /**
   * Stroke color.
   */
  strokeColor?: string;
  /**
   * Stroke width in pixels.
   */
  strokeWidth?: number;
  /**
   * Stroke dash array.
   * @see MDN [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) 
   * docs for details.
   */
  strokeDasharray?: string;
}
