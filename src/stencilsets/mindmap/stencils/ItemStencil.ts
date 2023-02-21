import { RectangleTextStencil } from "../../../core/RectangleTextStencil";

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

  constructor(iid: number, container: SVGGElement) {
    super(iid, container);
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
