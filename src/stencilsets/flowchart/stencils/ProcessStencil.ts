import { DiagramSettings } from "../../../core";
import { RectangleTextStencil } from "../../../core";

/**
 * Process Flowchart stencil.
 */
export class ProcessStencil extends RectangleTextStencil {
  public static typeName = 'ProcessStencil';

  /**
   * {@inheritDoc core!RectangleTextStencil.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);
    this.disablePorts(
      'topleft',
      'topright',
      'bottomleft',
      'bottomright'
    );
  }
}
