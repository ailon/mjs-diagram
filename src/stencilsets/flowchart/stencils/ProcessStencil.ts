import { DiagramSettings } from "../../../core";
import { RectangleTextStencil } from "../../../core";

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
