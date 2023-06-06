import { TextStencil } from './TextStencil';

/**
 * Rectangle text stencil is a common stencil type displaying a text string inside a rectangle.
 */
export class RectangleTextStencil extends TextStencil {
  public static typeName = 'RectangleTextStencil';

  public static title = 'Rectangle Text stencil';

  protected static getPathD(width: number, height: number): string {
    const result = `M 0 0 
      H ${width} 
      V ${height} 
      H 0 
      V 0`;

    return result;
  }

  public static getThumbnail(width: number, height: number): SVGSVGElement {
    return super.getThumbnail(width, height);
  }
}
