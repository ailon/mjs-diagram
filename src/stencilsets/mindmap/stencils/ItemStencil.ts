import { DiagramSettings, RectangleTextStencil } from "../../../core";

/**
 * Mind Map leaf item stencil.
 */
export class ItemStencil extends RectangleTextStencil {
  public static typeName = 'ItemStencil';

  protected static getPathD(width: number, height: number): string {
    const result = `M0,${height} L${width},${height}`;
    return result;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getThumbnail(width: number, height: number): SVGSVGElement {
    return super.getThumbnail(width, width / 5);
  }

  /**
   * {@inheritDoc core!RectangleTextStencil.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);
    
    this.defaultSize.height = 30;

    this.disablePorts('topleft', 'topcenter', 'topright', 'leftcenter', 'rightcenter', 'bottomcenter');
  }

  public getSelectorPathD(width: number, height: number): string {
    const result = `M 0 0 
      H ${width} 
      V ${height} 
      H 0 
      V 0`;

    return result;
  }
}
