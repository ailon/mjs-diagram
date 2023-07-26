import { DiagramSettings, ImageStencil } from "../../../core";

/**
 * Camera image stencil.
 */
export class CameraStencil extends ImageStencil {
  public static typeName = 'CameraStencil';

  public static title = 'Camera';

  protected static DEFAULT_TEXT = 'Camera';

  protected static svgString = '<path d="M12,2A7,7 0 0,1 19,9A7,7 0 0,1 12,16A7,7 0 0,1 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9A5,5 0 0,0 12,14A5,5 0 0,0 17,9A5,5 0 0,0 12,4M12,6A3,3 0 0,1 15,9A3,3 0 0,1 12,12A3,3 0 0,1 9,9A3,3 0 0,1 12,6M6,22A2,2 0 0,1 4,20C4,19.62 4.1,19.27 4.29,18.97L6.11,15.81C7.69,17.17 9.75,18 12,18C14.25,18 16.31,17.17 17.89,15.81L19.71,18.97C19.9,19.27 20,19.62 20,20A2,2 0 0,1 18,22H6Z" />';
  
  /**
   * {@inheritDoc core!ImageStencil.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.defaultSize = { width: 80, height: 80 };

    this.strokeEditable = false;
    this.setStrokeWidth(0);
  }
}
