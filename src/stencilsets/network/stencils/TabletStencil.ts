import { DiagramSettings, ImageStencil } from "../../../core";

/**
 * Tablet image stencil.
 */
export class TabletStencil extends ImageStencil {
  public static typeName = 'TabletStencil';

  public static title = 'Tablet';

  protected static DEFAULT_TEXT = 'Tablet';

  protected static svgString = '<path d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z" />';
  
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
