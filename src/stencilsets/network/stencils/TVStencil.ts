import { DiagramSettings, ImageStencil } from "../../../core";

/**
 * TV image stencil.
 */
export class TVStencil extends ImageStencil {
  public static typeName = 'TVStencil';

  public static title = 'TV';

  protected static DEFAULT_TEXT = 'TV';

  protected static svgString = '<path d="M21,17H3V5H21M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z" />';
  
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
