import { DiagramSettings } from "../../../core";
import { RectangleTextStencil } from "../../../core";

/**
 * I/O Flowchart stencil.
 */
export class IOStencil extends RectangleTextStencil {
  public static typeName = 'IOStencil';

  public static title = 'Input/Output';

  protected static getPathD(width: number, height: number): string {
    const result = `M${width * 0.2},0 L${width},0 L${width * 0.8},${height} L0,${height} Z`;
    return result;
  }

  /**
   * {@inheritDoc core!RectangleTextStencil.constructor}
   */
  constructor(iid: number, container: SVGGElement, settings: DiagramSettings) {
    super(iid, container, settings);

    this.textBoundingBox = new DOMRect();

    this.defaultSize = { width: 150, height: 70 };

    this.disablePorts('bottomleft', 'topleft', 'bottomright', 'topright', 'leftcenter', 'rightcenter');
  }

  protected setTextBoundingBox() {
    super.setTextBoundingBox();

    const rectWidth = this.width * 0.8;
    const rectHeight = this.height;

    this.textBoundingBox.x = (this.width - rectWidth) / 2 + this.padding;
    this.textBoundingBox.y = (this.height - rectHeight) / 2 + this.padding;
    this.textBoundingBox.width = rectWidth - this.padding * 2;
    this.textBoundingBox.height = rectHeight - this.padding * 2;
  }
}
