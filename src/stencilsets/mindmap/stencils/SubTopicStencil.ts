import { DiagramSettings } from "../../../core/DiagramSettings";
import { RectangleTextStencil } from "../../../core/RectangleTextStencil";

export class SubTopicStencil extends RectangleTextStencil {
  public static typeName = 'SubTopicStencil';

  protected static getPathD(width: number, height: number): string {
    const r = 10;

    const result = `M ${r} 0 
      H ${width - r} 
      A ${r} ${r} 0 0 1 ${width} ${r} 
      V ${height - r} 
      A ${r} ${r} 0 0 1 ${width - r} ${height} 
      H ${r} 
      A ${r} ${r} 0 0 1 0 ${height - r} 
      V ${r} 
      A ${r} ${r} 0 0 1 ${r} 0 
      Z`;

    return result;
  }  

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getThumbnail(width: number, height: number): SVGSVGElement {
    return super.getThumbnail(width, width / 4);
  }

  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.defaultSize.height = 40;

    this.disablePorts(
      'topleft',
      'topcenter',
      'topright',
      'bottomcenter',
      'bottomleft',
      'bottomright'
    );
  }
}
