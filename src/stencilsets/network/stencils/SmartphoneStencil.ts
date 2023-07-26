import { DiagramSettings, ImageStencil } from "../../../core";

/**
 * Smartphone image stencil.
 */
export class SmartphoneStencil extends ImageStencil {
  public static typeName = 'SmartphoneStencil';

  public static title = 'Smartphone';

  protected static DEFAULT_TEXT = 'Phone';

  protected static svgString = '<path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />';
  
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
