import { RectangleTextStencil } from "../../../core/RectangleTextStencil";

export class ProcessStencil extends RectangleTextStencil {
  public static typeName = 'ProcessStencil';

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);
    this.disablePorts(
      'topleft',
      'topright',
      'bottomleft',
      'bottomright'
    );
  }
}
