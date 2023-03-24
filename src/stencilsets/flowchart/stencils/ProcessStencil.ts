import { DiagramSettings } from "../../../core/DiagramSettings";
import { RectangleTextStencil } from "../../../core/RectangleTextStencil";

export class ProcessStencil extends RectangleTextStencil {
  public static typeName = 'ProcessStencil';

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
